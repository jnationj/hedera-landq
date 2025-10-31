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

const VERIFIER_CONTRACT =
  process.env.LANDVERIFIER_CONTRACT_ID ??
  process.env.LANDVERIFIER_EVM_ADDRESS!;

// --- fix: handle EVM or 0.0.x contract id ---
function getContractIdFromEnv(envValue: string): ContractId {
  if (envValue.startsWith("0x")) {
    return ContractId.fromEvmAddress(0, 0, envValue);
  } else {
    return ContractId.fromString(envValue);
  }
}

async function requestVerification(tokenId: number) {
  const tx = await new ContractExecuteTransaction()
    .setContractId(getContractIdFromEnv(VERIFIER_CONTRACT))
    .setGas(200_000)
    .setFunction("requestVerification", new ContractFunctionParameters().addUint256(tokenId))
    .execute(client);

  const receipt = await tx.getReceipt(client);
  console.log(`📨 Requested verification for token ${tokenId} (${receipt.status.toString()})`);
}

async function verifyLand(tokenId: number, value: number, notes: string) {
  const params = new ContractFunctionParameters()
    .addUint256(tokenId)
    .addUint256(value)
    .addString(notes);

  const tx = await new ContractExecuteTransaction()
    .setContractId(getContractIdFromEnv(VERIFIER_CONTRACT))
    .setGas(250_000)
    .setFunction("verifyLand", params)
    .execute(client);

  const receipt = await tx.getReceipt(client);
  console.log(`✅ Token ${tokenId} verified (status: ${receipt.status.toString()})`);
}

async function main() {
  const tokenId = 1; // adjust for your LandNFT token
  await requestVerification(tokenId);
  await verifyLand(tokenId, 150_000, "Appraised & verified by regional office");
}

main().catch(console.error);
