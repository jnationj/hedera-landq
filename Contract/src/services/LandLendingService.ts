import {
  AccountId,
  Client,
  PrivateKey,
  ContractId,
  ContractCreateFlow,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractCallQuery,
  Hbar,
} from "@hashgraph/sdk";
import * as fs from "fs";
import * as path from "path";

export interface LoanDetails {
  borrower: string;
  token: string;
  serial: number;
  paymentToken: string;
  principal: number;
  interestRate: number;
  duration: number;
  startTime: number;
  repayAmount: number;
  isActive: boolean;
  isRepaid: boolean;
  isDefaulted: boolean;
}

export class LandLendingService {
  private client: Client;
  private contractId!: ContractId;
  private operatorId: AccountId;
  private operatorKey: PrivateKey;

  constructor(client: Client, operatorId: AccountId, operatorKey: PrivateKey) {
    this.client = client;
    this.operatorId = operatorId;
    this.operatorKey = operatorKey;
  }

  // --------------------------------------------------------
  // Deploy the LandLendinga contract
  // --------------------------------------------------------
  async deployLendingContract(landNftContractAddress: string): Promise<ContractId> {
    try {
      const bytecode = fs
        .readFileSync(
          path.join(process.cwd(), "contracts/build/contracts_LandLendinga_sol_LandLendinga.bin")
        )
        .toString();

      const createContract = new ContractCreateFlow()
        .setGas(8_000_000)
        .setBytecode(bytecode)
        .setConstructorParameters(new ContractFunctionParameters().addAddress(landNftContractAddress));

      const tx = await createContract.execute(this.client);
      const receipt = await tx.getReceipt(this.client);

      if (!receipt.contractId) throw new Error("Failed to deploy LandLendinga contract");
      this.contractId = receipt.contractId;

      return this.contractId;
    } catch (error) {
      console.error("❌ Error deploying LandLendinga:", error);
      throw error;
    }
  }

  // --------------------------------------------------------
  // Request a loan
  // --------------------------------------------------------
  async requestLoan(
    tokenAddress: string,
    serial: number,
    principal: number,
    interestRate: number,
    duration: number,
    paymentToken: string
  ): Promise<number> {
    if (!this.contractId) throw new Error("Contract not deployed");

    const tx = new ContractExecuteTransaction()
      .setContractId(this.contractId)
      .setGas(2_000_000)
      .setPayableAmount(new Hbar(0)) // For HBAR loans, you might adjust this
      .setFunction(
        "requestLoan",
        new ContractFunctionParameters()
          .addAddress(tokenAddress)
          .addInt64(serial)
          .addUint256(principal)
          .addUint256(interestRate)
          .addUint256(duration)
          .addAddress(paymentToken)
      );

    const response = await tx.execute(this.client);
    const record = await response.getRecord(this.client);
    if (!record.contractFunctionResult) throw new Error("Loan request failed");
    const loanId = record.contractFunctionResult.getUint256(0);
    console.log("✅ Loan created with ID:", loanId.toString());
    return loanId.toNumber();
  }

  // --------------------------------------------------------
  // Repay loan
  // --------------------------------------------------------
  async repayLoan(loanId: number, repayAmount: number): Promise<void> {
    const tx = new ContractExecuteTransaction()
      .setContractId(this.contractId)
      .setGas(1_000_000)
      .setPayableAmount(new Hbar(repayAmount))
      .setFunction("repayLoan", new ContractFunctionParameters().addUint256(loanId));

    await tx.execute(this.client);
    console.log(`✅ Loan ${loanId} repaid successfully`);
  }

  // --------------------------------------------------------
  // Mark loan as defaulted
  // --------------------------------------------------------
  async markDefault(loanId: number): Promise<void> {
    const tx = new ContractExecuteTransaction()
      .setContractId(this.contractId)
      .setGas(800_000)
      .setFunction("markDefault", new ContractFunctionParameters().addUint256(loanId));

    await tx.execute(this.client);
    console.log(`⚠️ Loan ${loanId} marked as defaulted`);
  }

  // --------------------------------------------------------
  // Get loan details
  // --------------------------------------------------------
// --------------------------------------------------------
// Get loan details
// --------------------------------------------------------
  async getLoan(loanId: number): Promise<LoanDetails> {
    const query = new ContractCallQuery()
        .setContractId(this.contractId)
        .setGas(200_000)
        .setFunction("getLoan", new ContractFunctionParameters().addUint256(loanId));

    const result = await query.execute(this.client);

    return {
        borrower: result.getAddress(0),
        token: result.getAddress(1),
        serial: Number(result.getInt64(2).toString()), // Convert safely to JS number
        paymentToken: result.getAddress(3),
        principal: Number(result.getUint256(4).toString()),
        interestRate: Number(result.getUint256(5).toString()),
        duration: Number(result.getUint256(6).toString()),
        startTime: Number(result.getUint256(7).toString()),
        repayAmount: Number(result.getUint256(8).toString()),
        isActive: result.getBool(9),
        isRepaid: result.getBool(10),
        isDefaulted: result.getBool(11),
    };
  }

}
