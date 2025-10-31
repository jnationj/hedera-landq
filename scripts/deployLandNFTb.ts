import {
  Client,
  AccountId,
  PrivateKey,
  TokenAssociateTransaction,
  TokenId,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractCreateFlow,
  Hbar
} from "@hashgraph/sdk";
import { LandNFTService } from "../src/services/LandNFTService";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

/**
 * Convert EVM-style address (0x...) → Hedera TokenId
 */
function getTokenIdFromEvmAddress(evmAddress: string): TokenId {
  return TokenId.fromSolidityAddress(evmAddress);
}

async function main() {
  try {
    // --------------------------------------------------------
    // 1️⃣ Load environment variables
    // --------------------------------------------------------
    dotenv.config();

    const operatorId = process.env.OPERATOR_ID;
    const operatorKey = process.env.OPERATOR_KEY;
    const receiverAddress = process.env.RECEIVER_ADDRESS;

    if (!operatorId || !operatorKey)
      throw new Error("Missing OPERATOR_ID or OPERATOR_KEY in .env");
    if (!receiverAddress)
      throw new Error("Missing RECEIVER_ADDRESS in .env");

    // --------------------------------------------------------
    // 2️⃣ Configure Hedera Client
    // --------------------------------------------------------
    const client = Client.forTestnet();
    const accountId = AccountId.fromString(operatorId);
    const privateKey = PrivateKey.fromString(operatorKey);
    client.setOperator(accountId, privateKey);

    console.log(`✅ Connected to Hedera Testnet as ${accountId.toString()}`);

    // --------------------------------------------------------
    // 3️⃣ Deploy LandNFT Contract
    // --------------------------------------------------------
    // --------------------------------------------------------
    // 3️⃣ Deploy LandNFT Contract
    // --------------------------------------------------------
      console.log("\n🚀 Deploying LandNFT contract...");
      const landNftService = new LandNFTService(client, accountId, privateKey);

      const landNftBytecode = fs
        .readFileSync(
          path.join(process.cwd(), "contracts/build/contracts_LandNFTb_sol_LandNFT.bin")
        )
        .toString();

      const landNftDeployTx = new ContractCreateFlow()
        .setGas(8_000_000)
        .setBytecode(landNftBytecode);

      const landNftDeployResponse = await landNftDeployTx.execute(client);
      const landNftDeployReceipt = await landNftDeployResponse.getReceipt(client);

      if (!landNftDeployReceipt.contractId)
        throw new Error("LandNFT contract deployment failed");

      const landNftContractId = landNftDeployReceipt.contractId;
      console.log("✅ LandNFT contract deployed at:", landNftContractId.toString());

      // 🩵 NEW LINE: tell the service which contract to interact with
      landNftService["contractId"] = landNftContractId;


    // --------------------------------------------------------
    // 4️⃣ Create Land NFT Collection (via HTS)
    // --------------------------------------------------------
    console.log("\n📦 Creating Land NFT Collection...");
    const createTx = new ContractExecuteTransaction()
      .setContractId(landNftContractId)
      .setGas(6_000_000)
      .setFunction(
        "createLandCollection",
        new ContractFunctionParameters()
          .addString("LandQ Registry")
          .addString("LNDQ")
          .addString("LandQ Verified Land NFT Collection")
          .addInt64(5000)
          .addUint32(7776000)
          
      )
      .setPayableAmount(new Hbar(10)); // ✅ This line should already exist;

    const createResponse = await createTx.execute(client);
    const createRecord = await createResponse.getRecord(client);

    if (createRecord.contractFunctionResult?.errorMessage) {
      console.error("🔍 HTS revert reason:", createRecord.contractFunctionResult.errorMessage);
    }
    
    // Extract created token address from logs (via LandNFTService helper)
    const landTokenAddress = await landNftService.getCreatedTokenAddress();

    console.log("📘 Land NFT Collection address:", landTokenAddress);

    const landTokenId = getTokenIdFromEvmAddress(landTokenAddress);

    // --------------------------------------------------------
    // 5️⃣ Mint First Land NFT
    // --------------------------------------------------------
    // --------------------------------------------------------
    // 5️⃣ Mint First Land NFT
    // --------------------------------------------------------
    console.log("\n🪙 Minting first Land NFT...");

    const metadataURI = "ipfs://sample-land-metadata-uri";
    const region = "LAGOS";
    const purchasePriceUSD = 1000;

    // 🩵 Convert the receiver address to EVM format (important!)
    const receiverEvmAddress = AccountId.fromString(receiverAddress).toSolidityAddress();

    const mintTx = new ContractExecuteTransaction()
      .setContractId(landNftContractId)
      .setGas(4_000_000)
      .setPayableAmount(new Hbar(0.001)) // ✅ must wrap in Hbar()
      .setFunction(
        "mintLand",
        new ContractFunctionParameters()
          .addAddress(receiverEvmAddress) // ✅ must be EVM-style 0x address
          .addString(metadataURI)
          .addUint256(1) // amount
          .addBytes32(Buffer.from(region.padEnd(32, "\0")))
          .addUint256(purchasePriceUSD)
      );

    // 🚀 Execute the mint transaction
    const mintSubmit = await mintTx.execute(client);

    // 🧩 Get record so we can see if revert message exists
    const mintRecord = await mintSubmit.getRecord(client);
    if (mintRecord.contractFunctionResult?.errorMessage) {
      console.error("🔍 Revert reason:", mintRecord.contractFunctionResult.errorMessage);
    }

    // ✅ Wait for the receipt
    const mintReceipt = await mintSubmit.getReceipt(client);
    console.log("✅ Land NFT mint transaction status:", mintReceipt.status.toString());


    // --------------------------------------------------------
    // 6️⃣ Associate NFT Collection with receiver
    // --------------------------------------------------------
    console.log("\n🔗 Associating NFT collection with receiver account...");
    const associateTx = await new TokenAssociateTransaction()
      .setAccountId(AccountId.fromString(operatorId))
      .setTokenIds([landTokenId])
      .freezeWith(client)
      .sign(privateKey);

    const associateSubmit = await associateTx.execute(client);
    const associateReceipt = await associateSubmit.getReceipt(client);
    console.log("✅ Token association status:", associateReceipt.status.toString());

    // --------------------------------------------------------
    // 7️⃣ Save deployment info
    // --------------------------------------------------------
    const deploymentInfo = {
      landNftContractId: landNftContractId.toString(),
      landTokenAddress,
      landTokenId: landTokenId.toString(),
      receiverAddress,
    };

    fs.writeFileSync(
      "deployment-landnft.json",
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n📝 Deployment info saved to deployment-landnftb.json");
    console.log("\n🎉 LandNFT Deployment Completed Successfully!");
  } catch (error) {
    console.error("❌ Deployment script failed:", error);
    process.exit(1);
  }
}

main();
