import {
  Client,
  AccountId,
  PrivateKey,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractId
} from "@hashgraph/sdk";
import dotenv from "dotenv";
dotenv.config();

const operatorId = AccountId.fromString(process.env.OPERATOR_ID!);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY!);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

// Prefer the contract ID (0.0.xxxxxx) but allow an EVM address fallback
const CONTRACT_ID =
  process.env.LANDVERIFIER_CONTRACT_ID ??
  process.env.LANDVERIFIER_EVM_ADDRESS!;

// --- helper: detect & parse either type of contract reference ---
function getContractIdFromEnv(envValue: string): ContractId {
  if (envValue.startsWith("0x")) {
    // create ContractId from EVM address
    return ContractId.fromEvmAddress(0, 0, envValue);
  } else {
    // standard Hedera entity id
    return ContractId.fromString(envValue);
  }
}

// --- helper: encode string → bytes32 ---
function stringToBytes32(str: string): Uint8Array {
  const buf = Buffer.alloc(32);
  buf.write(str);
  return buf;
}

async function assignVerifier(region: string, verifierAddress: string) {
  const params = new ContractFunctionParameters()
    .addBytes32(stringToBytes32(region))
    .addAddress(verifierAddress);

  const tx = await new ContractExecuteTransaction()
    .setContractId(getContractIdFromEnv(CONTRACT_ID))
    .setGas(150_000)
    .setFunction("assignVerifier", params)
    .execute(client);

  const receipt = await tx.getReceipt(client);
  console.log(`✅ Region ${region} assigned to ${verifierAddress}`);
  console.log(`   Status: ${receipt.status.toString()}`);
}

async function main() {
  const regions = [
    // examples
    // { name: "NAIROBI", verifier: "0x00000000000000000000000000000000004ed14e" },
    // { name: "ACCRA", verifier: "0x00000000000000000000000000000000004ed14e" },
    { name: "Lagos State", verifier: "0x00000000000000000000000000000000006d49c8" }
  ];

  for (const { name, verifier } of regions) {
    await assignVerifier(name, verifier);
  }
}

main().catch(console.error);
