import {
  Client,
  AccountId,
  PrivateKey,
  ContractCallQuery,
  ContractFunctionParameters,
  ContractId
} from "@hashgraph/sdk";
import dotenv from "dotenv";
dotenv.config();

const operatorId = AccountId.fromString(process.env.OPERATOR_ID!);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY!);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

const CONTRACT_ID =
  process.env.LANDVERIFIER_CONTRACT_ID ??
  process.env.LANDVERIFIER_EVM_ADDRESS!;

// --- fix: detect EVM vs Hedera contract id ---
function getContractIdFromEnv(envValue: string): ContractId {
  if (envValue.startsWith("0x")) {
    return ContractId.fromEvmAddress(0, 0, envValue);
  } else {
    return ContractId.fromString(envValue);
  }
}

function stringToBytes32(str: string): Uint8Array {
  const buf = Buffer.alloc(32);
  buf.write(str);
  return buf;
}

async function getVerifier(region: string) {
  const query = new ContractCallQuery()
    .setContractId(getContractIdFromEnv(CONTRACT_ID))
    .setGas(150_000)
    .setFunction(
      "getRegionVerifier",
      new ContractFunctionParameters().addBytes32(stringToBytes32(region))
    );

  const result = await query.execute(client);
  const verifier = result.getAddress(0);
  console.log(`🌍 ${region} verifier: ${verifier}`);
}

async function main() {
  for (const region of ["NAIROBI", "ACCRA", "Lagos State"]) {
    await getVerifier(region);
  }
}

main().catch(console.error);
