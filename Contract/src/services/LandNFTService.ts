import {
    AccountId,
    ContractCreateFlow,
    ContractExecuteTransaction,
    ContractFunctionParameters,
    ContractCallQuery,
    ContractId,
    Hbar,
    Client,
    PrivateKey,
} from "@hashgraph/sdk";
import * as fs from "fs";
import * as path from "path";
import { BigNumber } from "bignumber.js";

/**
 * @title LandNFTService
 * @notice Service layer to deploy and interact with LandNFTa smart contract
 * @dev Mirrors NFTService from HederaAirbnb, but adapted for LandQ
 */
export class LandNFTService {
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
    //  Deploy Contract
    // --------------------------------------------------------
    async deployLandNFTContract(): Promise<ContractId> {
        try {
            const bytecode = fs
                .readFileSync(
                    path.join(process.cwd(), "contracts/build/contracts_LandNFTa_sol_LandNFT.bin")
                )
                .toString();

            const contractCreate = new ContractCreateFlow()
                .setGas(8_000_000)
                .setBytecode(bytecode);

            const tx = await contractCreate.execute(this.client);
            const receipt = await tx.getReceipt(this.client);

            if (!receipt.contractId) throw new Error("Failed to deploy LandNFTa contract");
            this.contractId = receipt.contractId;

            console.log("✅ LandNFTa deployed at:", this.contractId.toString());
            return this.contractId;
        } catch (error) {
            console.error("❌ Error deploying LandNFTa contract:", error);
            throw error;
        }
    }


        // --------------------------------------------------------
    //  NEW: Get Created Token Address (for updated LandNFT)
    // --------------------------------------------------------
    /**
     * Reads the landCollectionToken address from the deployed LandNFT contract.
     * This works after createLandCollection() has been successfully called.
     */
    async getCreatedTokenAddress(): Promise<string> {
        try {
            if (!this.contractId) throw new Error("Contract not deployed");

            const query = new ContractCallQuery()
                .setContractId(this.contractId)
                .setGas(200_000)
                .setFunction("landCollectionToken");

            const result = await query.execute(this.client);
            const tokenAddress = result.getAddress(0);

            if (!tokenAddress || tokenAddress === "0x0000000000000000000000000000000000000000") {
                throw new Error("Land collection token not set or invalid");
            }

            console.log("📘 Retrieved Land Collection Token Address:", tokenAddress);
            return tokenAddress;
        } catch (error) {
            console.error("❌ Error reading created token address:", error);
            throw error;
        }
    }


    // --------------------------------------------------------
    //  NEW: Link Verifier Contract
    // --------------------------------------------------------
    async setVerifierContract(verifierContract: string): Promise<void> {
        try {
            if (!this.contractId) throw new Error("Contract not deployed");

            const tx = new ContractExecuteTransaction()
                .setContractId(this.contractId)
                .setGas(300_000)
                .setFunction(
                    "setVerifierContract",
                    new ContractFunctionParameters().addAddress(verifierContract)
                );

            await tx.execute(this.client);
            console.log(`✅ Linked verifier contract: ${verifierContract}`);
        } catch (error) {
            console.error("❌ Error setting verifier contract:", error);
            throw error;
        }
    }

    // --------------------------------------------------------
    //  Create Land Collection
    // --------------------------------------------------------
    async createLandCollection(
        name: string,
        symbol: string,
        memo: string,
        maxSupply: number,
        autoRenewPeriod: number
    ): Promise<string> {
        try {
            if (!this.contractId) throw new Error("Contract not deployed");

            const tx = new ContractExecuteTransaction()
                .setContractId(this.contractId)
                .setGas(1_000_000)
                .setFunction(
                    "createLandCollection",
                    new ContractFunctionParameters()
                        .addString(name)
                        .addString(symbol)
                        .addString(memo)
                        .addInt64(maxSupply)
                        .addUint32(autoRenewPeriod)
                )
                .setPayableAmount(new Hbar(10));

            const response = await tx.execute(this.client);
            const record = await response.getRecord(this.client);

            if (!record.contractFunctionResult)
                throw new Error("Failed to create Land collection");

            const tokenAddress = record.contractFunctionResult.getAddress(0);
            return tokenAddress;
        } catch (error) {
            console.error("❌ Error creating Land Collection:", error);
            throw error;
        }
    }

    // --------------------------------------------------------
    //  Mint Land NFT
    // --------------------------------------------------------
    async mintLandNFT(
        tokenAddress: string,
        metadata: Uint8Array[],
        region: string
    ): Promise<BigNumber> {
        try {
            if (!this.contractId) throw new Error("Contract not deployed");

            const tx = new ContractExecuteTransaction()
                .setContractId(this.contractId)
                .setGas(1_000_000)
                .setFunction(
                    "mintLandNFT",
                    new ContractFunctionParameters()
                        .addAddress(tokenAddress)
                        .addBytesArray(metadata)
                        .addString(region)
                );

            const response = await tx.execute(this.client);
            const record = await response.getRecord(this.client);

            if (!record.contractFunctionResult)
                throw new Error("Failed to mint Land NFT");

            const serialNumber = record.contractFunctionResult.getInt64(0);
            return serialNumber;
        } catch (error) {
            console.error("❌ Error minting Land NFT:", error);
            throw error;
        }
    }

    // --------------------------------------------------------
    //  Transfer NFT
    // --------------------------------------------------------
    async transferNft(
        tokenAddress: string,
        receiver: string,
        serialNumber: number
    ): Promise<void> {
        try {
            if (!this.contractId) throw new Error("Contract not deployed");

            const tx = new ContractExecuteTransaction()
                .setContractId(this.contractId)
                .setGas(1_000_000)
                .setFunction(
                    "transferNft",
                    new ContractFunctionParameters()
                        .addAddress(tokenAddress)
                        .addAddress(receiver)
                        .addInt64(serialNumber)
                );

            await tx.execute(this.client);
        } catch (error) {
            console.error("❌ Error transferring Land NFT:", error);
            throw error;
        }
    }

    // --------------------------------------------------------
    //  Verifier Management
    // --------------------------------------------------------
    async addVerifier(verifier: string): Promise<void> {
        try {
            const tx = new ContractExecuteTransaction()
                .setContractId(this.contractId)
                .setGas(300_000)
                .setFunction("addVerifier", new ContractFunctionParameters().addAddress(verifier));

            await tx.execute(this.client);
            console.log("✅ Verifier added:", verifier);
        } catch (error) {
            console.error("❌ Error adding verifier:", error);
            throw error;
        }
    }

    async removeVerifier(verifier: string): Promise<void> {
        try {
            const tx = new ContractExecuteTransaction()
                .setContractId(this.contractId)
                .setGas(300_000)
                .setFunction("removeVerifier", new ContractFunctionParameters().addAddress(verifier));

            await tx.execute(this.client);
            console.log("✅ Verifier removed:", verifier);
        } catch (error) {
            console.error("❌ Error removing verifier:", error);
            throw error;
        }
    }

    async verifyLand(tokenAddress: string, serialNumber: number): Promise<void> {
        try {
            const tx = new ContractExecuteTransaction()
                .setContractId(this.contractId)
                .setGas(300_000)
                .setFunction(
                    "verifyLand",
                    new ContractFunctionParameters()
                        .addAddress(tokenAddress)
                        .addInt64(serialNumber)
                );

            await tx.execute(this.client);
            console.log(`✅ Land verified (Token: ${tokenAddress}, Serial: ${serialNumber})`);
        } catch (error) {
            console.error("❌ Error verifying land:", error);
            throw error;
        }
    }

    // --------------------------------------------------------
    //  View Functions
    // --------------------------------------------------------
    async isLandVerified(tokenAddress: string, serialNumber: number): Promise<boolean> {
        try {
            const query = new ContractCallQuery()
                .setContractId(this.contractId)
                .setGas(100_000)
                .setFunction(
                    "isLandVerified",
                    new ContractFunctionParameters()
                        .addAddress(tokenAddress)
                        .addInt64(serialNumber)
                );

            const result = await query.execute(this.client);
            return result.getBool(0);
        } catch (error) {
            console.error("❌ Error checking land verification:", error);
            throw error;
        }
    }

    async isLandInLending(tokenAddress: string, serialNumber: number): Promise<boolean> {
        try {
            const query = new ContractCallQuery()
                .setContractId(this.contractId)
                .setGas(100_000)
                .setFunction(
                    "isLandInLending",
                    new ContractFunctionParameters()
                        .addAddress(tokenAddress)
                        .addInt64(serialNumber)
                );

            const result = await query.execute(this.client);
            return result.getBool(0);
        } catch (error) {
            console.error("❌ Error checking land lending status:", error);
            throw error;
        }
    }

    async setLendingStatus(tokenAddress: string, serialNumber: number, isLent: boolean): Promise<void> {
        try {
            const tx = new ContractExecuteTransaction()
                .setContractId(this.contractId)
                .setGas(300_000)
                .setFunction(
                    "setLendingStatus",
                    new ContractFunctionParameters()
                        .addAddress(tokenAddress)
                        .addInt64(serialNumber)
                        .addBool(isLent)
                );

            await tx.execute(this.client);
            console.log(`✅ Lending status updated for serial ${serialNumber}: ${isLent}`);
        } catch (error) {
            console.error("❌ Error setting lending status:", error);
            throw error;
        }
    }
}
