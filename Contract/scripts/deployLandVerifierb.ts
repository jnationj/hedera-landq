import {
    Client,
    AccountId,
    PrivateKey,
    ContractCreateFlow,
    ContractFunctionParameters,
} from "@hashgraph/sdk";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
    try {
        console.log("🚀 Starting LandVerifiera deployment...\n");

        // --------------------------------------------------------
        // 1️⃣ Load environment variables
        // --------------------------------------------------------
        const operatorId = process.env.OPERATOR_ID;
        const operatorKey = process.env.OPERATOR_KEY;
        const landNftContractAddress = process.env.LANDNFT_CONTRACT_ADDRESS; // from previous deploy

        if (!operatorId || !operatorKey)
            throw new Error("Missing OPERATOR_ID or OPERATOR_KEY in .env");

        if (!landNftContractAddress)
            throw new Error("Missing LANDNFT_CONTRACT_ADDRESS in .env");

        // --------------------------------------------------------
        // 2️⃣ Configure Hedera Client
        // --------------------------------------------------------
        const client = Client.forTestnet();
        const accountId = AccountId.fromString(operatorId);
        const privateKey = PrivateKey.fromString(operatorKey);
        client.setOperator(accountId, privateKey);

        console.log(`Connected as: ${accountId.toString()}`);
        console.log(`Using LandNFT contract: ${landNftContractAddress}\n`);

        // --------------------------------------------------------
        // 3️⃣ Read compiled bytecode
        // --------------------------------------------------------
        const bytecode = fs
            .readFileSync(
                path.join(process.cwd(), "contracts/build/contracts_LandVerifierb_sol_LandVerifier.bin")
            )
            .toString();

        // --------------------------------------------------------
        // 4️⃣ Deploy Contract with Constructor Argument
        // --------------------------------------------------------
        const contractCreate = new ContractCreateFlow()
            .setGas(8_000_000)
            .setBytecode(bytecode)
            .setConstructorParameters(
                new ContractFunctionParameters().addAddress(landNftContractAddress)
            );

        console.log("⏳ Deploying LandVerifiera...");
        const txResponse = await contractCreate.execute(client);
        const receipt = await txResponse.getReceipt(client);
        if (!receipt.contractId) throw new Error("Failed to deploy LandVerifiera contract");

        const landVerifierContractId = receipt.contractId;
        console.log(`✅ LandVerifiera deployed at: ${landVerifierContractId.toString()}`);

        // --------------------------------------------------------
        // 5️⃣ Save deployment info
        // --------------------------------------------------------
        const deploymentInfo = {
            landVerifierContractId: landVerifierContractId.toString(),
            linkedLandNFTContract: landNftContractAddress,
            network: "Testnet",
            deployedBy: operatorId,
        };

        fs.writeFileSync("deployment-landverifiera.json", JSON.stringify(deploymentInfo, null, 2));
        console.log("\n📝 Deployment info saved to deployment-landverifierb.json");

        // --------------------------------------------------------
        // 6️⃣ (Optional) Add a test verifier
        // --------------------------------------------------------
        // If you want to test addVerifier(), uncomment below lines:
        /*
        import { ContractExecuteTransaction } from "@hashgraph/sdk";

        const addVerifierTx = await new ContractExecuteTransaction()
            .setContractId(landVerifierContractId)
            .setGas(500_000)
            .setFunction(
                "addVerifier",
                new ContractFunctionParameters()
                    .addAddress(accountId.toSolidityAddress()) // your operator acts as verifier
                    .addBytes32(Buffer.from("LAGOS".padEnd(32, '\0')))
            )
            .execute(client);

        const addVerifierReceipt = await addVerifierTx.getReceipt(client);
        console.log("✅ Verifier added for region: LAGOS, Status:", addVerifierReceipt.status.toString());
        */

        console.log("\n🎉 LandVerifiera deployment completed successfully!");
    } catch (error) {
        console.error("❌ Error deploying LandVerifiera:", error);
        process.exit(1);
    }
}

main();
