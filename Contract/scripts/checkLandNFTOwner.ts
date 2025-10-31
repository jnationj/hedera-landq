import {
    Client,
    AccountId,
    PrivateKey,
    ContractCallQuery,
    ContractId
} from "@hashgraph/sdk";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
    try {
        console.log("🔍 Checking LandNFT owner...\n");

        const operatorId = process.env.OPERATOR_ID;
        const operatorKey = process.env.OPERATOR_KEY;
        const landNftContractId = process.env.LANDNFT_CONTRACT_ID;

        if (!operatorId || !operatorKey || !landNftContractId)
            throw new Error("❌ Missing .env values (OPERATOR_ID, OPERATOR_KEY, LANDNFT_CONTRACT_ID)");

        // Create client
        const client = Client.forTestnet();
        const accountId = AccountId.fromString(operatorId);
        const privateKey = PrivateKey.fromString(operatorKey);
        client.setOperator(accountId, privateKey);

        // Convert to EVM address for comparison
        const operatorEvm = accountId.toSolidityAddress();

        console.log(`Operator Account: ${operatorId}`);
        console.log(`Operator EVM Address: 0x${operatorEvm}\n`);

        // Query contract
        const query = new ContractCallQuery()
            .setContractId(ContractId.fromString(landNftContractId))
            .setGas(100_000)
            .setFunction("owner");

        const result = await query.execute(client);
        const ownerEvm = result.getAddress(0);

        console.log(`📄 LandNFT Contract ID: ${landNftContractId}`);
        console.log(`🧠 On-Chain Owner (EVM): 0x${ownerEvm}`);

        if (ownerEvm.toLowerCase() === operatorEvm.toLowerCase()) {
            console.log("\n✅ MATCH: Your operator is the LandNFT owner!");
        } else {
            console.log("\n⚠️  MISMATCH: Your operator is NOT the LandNFT owner!");
            console.log("   ➤ You must deploy or link using the owner’s account, or");
            console.log("   ➤ Use `transferOwnership(newOwner)` to transfer ownership.");
        }

    } catch (error) {
        console.error("❌ Error checking LandNFT owner:", error);
        process.exit(1);
    }
}

main();
