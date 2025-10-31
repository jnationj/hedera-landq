import {
  Client,
  AccountId,
  PrivateKey,
  Hbar,
  TokenId,
} from "@hashgraph/sdk";
import * as dotenv from "dotenv";
import * as fs from "fs";
import { LandNFTService } from "../src/services/LandNFTService";

dotenv.config();

async function main() {
  console.log("\n🚀 Starting LandNFT Flow Test...");

  // --------------------------------------------------------
  // Setup operator credentials
  // --------------------------------------------------------
  const operatorId = process.env.OPERATOR_ID;
  const operatorKey = process.env.OPERATOR_KEY;

  if (!operatorId || !operatorKey) {
    throw new Error("Missing OPERATOR_ID or OPERATOR_KEY in .env");
  }

  const client = Client.forTestnet();
  client.setOperator(AccountId.fromString(operatorId), PrivateKey.fromString(operatorKey));

  const operatorAccount = AccountId.fromString(operatorId);
  const operatorPrivateKey = PrivateKey.fromString(operatorKey);

  console.log(`Operator: ${operatorAccount.toString()}`);

  // --------------------------------------------------------
  // Initialize LandNFT service
  // --------------------------------------------------------
  const landNFTService = new LandNFTService(client, operatorAccount, operatorPrivateKey);

  // --------------------------------------------------------
  // Step 1: Deploy LandNFTa Contract
  // --------------------------------------------------------
  console.log("\n📦 Deploying LandNFTa contract...");
  const nftContractId = await landNFTService.deployLandNFTContract();
  console.log("✅ LandNFTa deployed at:", nftContractId.toString());

  // --------------------------------------------------------
  // Step 2: Create Land NFT Collection
  // --------------------------------------------------------
  const collectionName = "Hedera Land";
  const collectionSymbol = "LAND";
  const memo = "Hedera Land Registry NFT";
  const maxSupply = 100;
  const autoRenew = 7776000; // 90 days

  console.log("\n🏗️  Creating Land NFT Collection...");
  const tokenAddress = await landNFTService.createLandCollection(
    collectionName,
    collectionSymbol,
    memo,
    maxSupply,
    autoRenew
  );

  console.log("✅ Land NFT Collection created at address:", tokenAddress);
  const tokenId = TokenId.fromSolidityAddress(tokenAddress);
  console.log("🆔 Token ID:", tokenId.toString());

  // --------------------------------------------------------
  // Step 3: Mint Land NFT
  // --------------------------------------------------------
  const metadata = [Buffer.from("ipfs://bafkreibsnfa2o7dcgatqvfh4aalsle77oiqvqdu2ogald6e6lvvfhpyhfy")];
  const region = "Nairobi"; // or any other location string
  const serialNumber = await landNFTService.mintLandNFT(tokenAddress, metadata, region);

  console.log("✅ Land NFT minted with serial number:", serialNumber.toString());

  // --------------------------------------------------------
  // Step 4: Verify Land (optional, if verifier linked)
  // --------------------------------------------------------
  try {
    console.log("\n🔍 Verifying Land NFT...");
    const isVerified = await landNFTService.verifyLand(tokenAddress, serialNumber.toNumber());
    console.log("✅ Land NFT verified:", isVerified);
  } catch (err) {
    console.warn("⚠️ Land verification skipped (no verifier linked or optional).");
  }

  // --------------------------------------------------------
  // Step 5: Save Deployment Info
  // --------------------------------------------------------
  const deploymentInfo = {
    contractId: nftContractId.toString(),
    tokenAddress: tokenAddress,
    tokenId: tokenId.toString(),
    serialNumber: serialNumber.toNumber(),
    owner: operatorAccount.toString(),
  };

  fs.writeFileSync(
    "deployment-landnfta-test.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n📝 Deployment details saved to deployment-landnfta-test.json");
  console.log("\n🎉 LandNFT Flow Test Completed Successfully!");
}

main().catch((error) => {
  console.error("\n❌ Error in LandNFT flow test:", error);
  process.exit(1);
});
