import {
  Client,
  AccountId,
  PrivateKey,
  ContractExecuteTransaction,
  ContractFunctionParameters
} from "@hashgraph/sdk";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const operatorId = process.env.OPERATOR_ID!;
  const operatorKey = process.env.OPERATOR_KEY!;
  const landNftContractId = process.env.LANDNFT_CONTRACT_ID!;
  const landLendingEvmAddress = process.env.LANDLENDING_EVM_ADDRESS;

  if (!landLendingEvmAddress)
    throw new Error("❌ LANDLENDING_EVM_ADDRESS is missing in .env");

  const client = Client.forTestnet();
  client.setOperator(AccountId.fromString(operatorId), PrivateKey.fromString(operatorKey));

  console.log(`🔗 Linking LandLending (${landLendingEvmAddress}) to LandNFT (${landNftContractId})...`);

  const tx = await new ContractExecuteTransaction()
    .setContractId(landNftContractId)
    .setGas(1_000_000)
    .setFunction(
      "setLendingContract",
      new ContractFunctionParameters().addAddress(landLendingEvmAddress)
    )
    .execute(client);

  const receipt = await tx.getReceipt(client);
  console.log(`✅ Linked successfully! Status: ${receipt.status.toString()}`);
}

main();
