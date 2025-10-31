import {
  Client,
  AccountId,
  PrivateKey,
  ContractCreateFlow,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractCallQuery,
  Hbar,
  ContractId,
} from "@hashgraph/sdk";
import * as fs from "fs";
import * as path from "path";

/**
 * LandService
 * ------------
 * HederaLandQ version of HederaAirbnb's NFTService.
 * Handles deployment and interaction with LandNFT.sol.
 */

export class LandService {
  private client: Client;
  private operatorId: AccountId;
  private operatorKey: PrivateKey;

  private landNFTId?: ContractId;

  constructor(client: Client, operatorId: AccountId, operatorKey: PrivateKey) {
    this.client = client;
    this.operatorId = operatorId;
    this.operatorKey = operatorKey;
  }

  // ──────────────────────────────────────────────
  // 1️⃣ DEPLOY LAND NFT CONTRACT
  // ──────────────────────────────────────────────

  async deployLandNFT(): Promise<ContractId> {
    console.log("🚀 Deploying LandNFT contract...");

    const bytecodePath = path.join(
      process.cwd(),
      "contracts/build/contracts_LandNFT_sol_LandNFT.bin"
    );
    const bytecode = fs.readFileSync(bytecodePath);

    const contractTx = new ContractCreateFlow()
      .setGas(6_000_000)
      .setBytecode(bytecode)
      .setConstructorParameters(
        new ContractFunctionParameters()
          .addAddress(this.operatorId.toSolidityAddress()) // admin
          .addUint256(100_000_000) // default mint fee: 1 HBAR (8 decimals)
      );

    const response = await contractTx.execute(this.client);
    const receipt = await response.getReceipt(this.client);
    const newContractId = receipt.contractId;

    if (!newContractId) throw new Error("❌ LandNFT deployment failed");
    console.log("✅ LandNFT deployed at:", newContractId.toString());

    this.landNFTId = newContractId;
    return newContractId;
  }

  // ──────────────────────────────────────────────
  // 2️⃣ LAND MINTING
  // ──────────────────────────────────────────────

  async mintLand(metadataURI: string, coordinates: number[], price: number): Promise<void> {
  if (!this.landNFTId) throw new Error("❌ LandNFT contract not deployed");

  console.log("🌍 Minting new Land NFT...");

  const tx = new ContractExecuteTransaction()
    .setContractId(this.landNFTId)
    .setGas(3_000_000)
    .setFunction(
      "mintLand",
      new ContractFunctionParameters()
        .addString(metadataURI)
        .addUint256Array(coordinates)
        .addUint256(price)
    )
    .setPayableAmount(new Hbar(1));

  try {
    const res = await tx.execute(this.client);
    const rec = await res.getRecord(this.client);

    const tokenId = rec.contractFunctionResult?.getUint256(0)?.toNumber();
    console.log("✅ Land NFT minted with ID:", tokenId);
  } catch (err: any) {
    console.error("❌ Mint failed:", err);
    if (err.transactionReceipt) {
      console.error("Receipt status:", err.transactionReceipt.status.toString());
    }
    // 🔍 try get revert message
    const query = new ContractCallQuery()
      .setContractId(this.landNFTId)
      .setGas(300_000)
      .setFunction(
        "mintLand",
        new ContractFunctionParameters()
          .addString(metadataURI)
          .addUint256Array(coordinates)
          .addUint256(price)
      )
      .setPayment(new Hbar(1));
    try {
      const result = await query.execute(this.client);
      console.log("Function call output:", result);
    } catch (innerErr: any) {
      console.error("Inner error:", innerErr.message);
    }
    throw err;
  }
}


  // ──────────────────────────────────────────────
  // 3️⃣ GET LAND INFO
  // ──────────────────────────────────────────────

  async getLandDetails(tokenId: number): Promise<void> {
    if (!this.landNFTId) throw new Error("❌ LandNFT contract not deployed");

    const query = new ContractCallQuery()
      .setContractId(this.landNFTId)
      .setGas(300_000)
      .setFunction(
        "getLandDetails",
        new ContractFunctionParameters().addUint256(tokenId)
      );

    const result = await query.execute(this.client);
    const owner = result.getAddress(0);
    const price = result.getUint256(1);
    const verified = result.getBool(2);

    console.log(`🏠 Land ${tokenId}: Owner=${owner}, Price=${price}, Verified=${verified}`);
  }
}
