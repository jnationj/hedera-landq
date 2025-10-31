import {
  Client,
  AccountId,
  PrivateKey,
  Hbar,
} from "@hashgraph/sdk";
import { LandNFTService } from "../src/services/LandNFTService";
import { LandLendingService } from "../src/services/LandLendingService";
import * as dotenv from "dotenv";
import * as fs from "fs";

// 🧩 Utility functions
async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function logSection(title: string) {
  console.log(`\n=== ${title.toUpperCase()} ===`);
}

async function main() {
  try {
    dotenv.config();

    const operatorId = process.env.OPERATOR_ID;
    const operatorKey = process.env.OPERATOR_KEY;
    if (!operatorId || !operatorKey) throw new Error("Missing operator credentials in .env");

    // Connect to Hedera
    const client = Client.forTestnet();
    const accountId = AccountId.fromString(operatorId);
    const privateKey = PrivateKey.fromString(operatorKey);
    client.setOperator(accountId, privateKey);

    console.log(`\nConnected as: ${accountId.toString()}`);

    // 🔹 Load deployed contract info
    const nftDeployment = JSON.parse(fs.readFileSync("deployment-landnfta.json", "utf8"));
    const lendingDeployment = JSON.parse(fs.readFileSync("deployment-landlendinga.json", "utf8"));

    const landNftContractId = nftDeployment.landNftContractId;
    const tokenAddress = nftDeployment.landTokenAddress;
    const serial = parseInt(nftDeployment.mintedSerial);
    const lendingContractId = lendingDeployment.landLendingContractId || lendingDeployment.contractId;
    const receiverAddress = nftDeployment.receiverAddress;

    console.log("\nLoaded deployment info:");
    console.log("LandNFT Contract:", landNftContractId);
    console.log("Land Token Address:", tokenAddress);
    console.log("Land NFT Serial:", serial);
    console.log("LandLending Contract:", lendingContractId);

    // Initialize services
    const nftService = new LandNFTService(client, accountId, privateKey);
    const lendingService = new LandLendingService(client, accountId, privateKey);

    // Set the contract manually (since it’s already deployed)
    (lendingService as any).contractId = lendingDeployment.contractId
      ? lendingDeployment.contractId
      : lendingDeployment.landLendingContractId;

    logSection("VERIFY LAND STATUS");
    const isVerified = await nftService.isLandVerified(tokenAddress, serial);
    console.log(`Land #${serial} verified status:`, isVerified ? "✅ Verified" : "❌ Not Verified");

    if (!isVerified) {
      console.log("⚠️  This land NFT must be verified in LandVerifiera before it can be used as collateral.");
      console.log("Please verify the NFT first and re-run this test.");
      return;
    }

    // ------------------------------------------------------------
    // 1️⃣ Request Loan
    // ------------------------------------------------------------
    logSection("REQUEST LOAN");

    const principal = 10; // 10 HBAR
    const interestRate = 5; // 5%
    const duration = 7 * 24 * 60 * 60; // 7 days
    const paymentToken = "0x0000000000000000000000000000000000000000"; // HBAR

    console.log(`Requesting loan for Land NFT #${serial}...`);
    console.log(`Principal: ${principal} HBAR`);
    console.log(`Interest: ${interestRate}%`);
    console.log(`Duration: ${duration / (24 * 60 * 60)} days`);

    const loanId = await lendingService.requestLoan(
      tokenAddress,
      serial,
      principal * 1_000_000_000, // convert to tinybars
      interestRate,
      duration,
      paymentToken
    );

    console.log(`✅ Loan requested successfully. Loan ID: ${loanId}`);

    // ------------------------------------------------------------
    // 2️⃣ Fetch Loan Details
    // ------------------------------------------------------------
    logSection("LOAN DETAILS");
    const loanDetails = await lendingService.getLoan(loanId);
    console.table(loanDetails);

    // ------------------------------------------------------------
    // 3️⃣ Repay Loan
    // ------------------------------------------------------------
    logSection("REPAY LOAN");
    const repayAmount = loanDetails.repayAmount / 1_000_000_000; // convert back to HBAR
    console.log(`Repaying ${repayAmount} HBAR...`);

    await lendingService.repayLoan(loanId, repayAmount);
    console.log(`✅ Loan #${loanId} repaid successfully.`);

    await delay(2000); // small pause

    // ------------------------------------------------------------
    // 4️⃣ Verify Loan Closed
    // ------------------------------------------------------------
    logSection("VERIFY REPAYMENT STATUS");
    const repaidLoan = await lendingService.getLoan(loanId);
    console.table(repaidLoan);

    if (repaidLoan.isRepaid && !repaidLoan.isActive) {
      console.log(`🎉 Land NFT #${serial} successfully released from lending escrow.`);
    } else {
      console.log("⚠️ Loan repayment state inconsistent — check contract logs.");
    }

    // ------------------------------------------------------------
    // 5️⃣ Save Test Info
    // ------------------------------------------------------------
    const result = {
      loanId,
      borrower: loanDetails.borrower,
      principal,
      repayAmount,
      duration,
      interestRate,
      token: tokenAddress,
      serial,
      repaid: repaidLoan.isRepaid,
    };

    fs.writeFileSync("lending-test-info.json", JSON.stringify(result, null, 2));
    console.log("\n📝 Test results saved to lending-test-info.json");
    console.log("\n✅ LandLendinga flow test completed successfully!");

  } catch (error) {
    console.error("❌ Error in LandLending test:", error);
    process.exit(1);
  }
}

main();
