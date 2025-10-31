import {
    Client,
    AccountId,
    PrivateKey,
    ContractFunctionParameters,
    ContractCreateFlow,
} from "@hashgraph/sdk";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

async function main() {
    try {
        console.log("🚀 Starting LandLendingb deployment...\n");

        // --------------------------------------------------------
        // 1️⃣ Load environment variables
        // --------------------------------------------------------
        const operatorId = process.env.OPERATOR_ID;
        const operatorKey = process.env.OPERATOR_KEY;
        const landNftEvmAddress = process.env.LANDNFT_EVM_ADDRESS;
        const landVerifierEvmAddress = process.env.LANDVERIFIER_EVM_ADDRESS;

        if (!operatorId || !operatorKey)
            throw new Error("❌ OPERATOR_ID or OPERATOR_KEY missing from .env");

        if (!landNftEvmAddress || !landVerifierEvmAddress)
            throw new Error("❌ Missing LANDNFT_EVM_ADDRESS or LANDVERIFIER_EVM_ADDRESS in .env");

        // --------------------------------------------------------
        // 2️⃣ Configure Hedera client
        // --------------------------------------------------------
        const client = Client.forTestnet();
        const accountId = AccountId.fromString(operatorId);
        const privateKey = PrivateKey.fromString(operatorKey);
        client.setOperator(accountId, privateKey);

        console.log(`Connected as: ${accountId.toString()}`);
        console.log(`Using LandNFT (EVM): ${landNftEvmAddress}`);
        console.log(`Using LandVerifier (EVM): ${landVerifierEvmAddress}\n`);

        // --------------------------------------------------------
        // 3️⃣ Read compiled contract bytecode
        // --------------------------------------------------------
        const bytecodePath = path.join(
            process.cwd(),
            "contracts/build/contracts_LandLendingb_sol_LandLending.bin"
        );

        if (!fs.existsSync(bytecodePath)) throw new Error("❌ LandLendingb bytecode not found");
        const bytecode = fs.readFileSync(bytecodePath).toString();

        // --------------------------------------------------------
        // 4️⃣ Deploy contract with constructor arguments
        // --------------------------------------------------------
        console.log("⏳ Deploying LandLendingb...");

        const createTx = new ContractCreateFlow()
            .setGas(10_000_000)
            .setBytecode(bytecode)
            .setConstructorParameters(
                new ContractFunctionParameters()
                    .addAddress(landNftEvmAddress)
                    .addAddress(landVerifierEvmAddress)
            );

        const txResponse = await createTx.execute(client);
        const receipt = await txResponse.getReceipt(client);

        if (!receipt.contractId)
            throw new Error("❌ Failed to deploy LandLendingb contract");

        const landLendingContractId = receipt.contractId;
        const landLendingEvmAddress = landLendingContractId.toSolidityAddress();

        console.log(`✅ LandLendingb deployed successfully!`);
        console.log(`📄 Contract ID: ${landLendingContractId.toString()}`);
        console.log(`🔗 EVM Address: ${landLendingEvmAddress}`);

        // --------------------------------------------------------
        // 5️⃣ Save deployment info to file
        // --------------------------------------------------------
        const deploymentInfo = {
            network: "Testnet",
            deployedBy: operatorId,
            landNftEvmAddress,
            landVerifierEvmAddress,
            landLendingContractId: landLendingContractId.toString(),
            landLendingEvmAddress,
            timestamp: new Date().toISOString(),
        };

        fs.writeFileSync(
            "deployment-landlendingb.json",
            JSON.stringify(deploymentInfo, null, 2)
        );

        console.log("\n📝 Deployment info saved to deployment-landlendingb.json");
        console.log("🎉 LandLendingb Deployment Flow Completed Successfully!");
    } catch (error) {
        console.error("❌ Error deploying LandLendingb:", error);
        process.exit(1);
    }
}

main();
