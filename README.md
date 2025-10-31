# 🏡 **LandQ: Decentralized Land Ownership, Verification & Lending on Hedera**

**LandQ** is a decentralized platform that transforms **physical land ownership into NFTs**, provides **on-chain verification**, and enables **land-backed lending** through DeFi — all built on **Hedera Hashgraph**.

It combines:

* Smart contracts for **Land NFT minting, verification, and lending**
* **Hedera HTS and HSCS** for low-cost, transparent operations
* A **React/Next.js frontend** for user interaction
* An **AI Land Intelligence Agent** for on-chain data analysis and real-world land insights

---

## 🌍 Why Hedera for LandQ

LandQ builds on **Hedera Hashgraph** because it uniquely combines **public transparency** with **enterprise-grade governance** — essential for real-world, government-integrated systems like land registries.

| Feature                                     | Why It Matters for LandQ                                                                                                                                                                                                |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🏛️ **Government-Friendly Governance**      | Hedera’s Governing Council includes global enterprises and universities, providing regulatory confidence for government adoption — critical since **LandVerifiers** are often **state agencies or licensed surveyors**. |
| 💰 **Predictable, Low Fees**                | Transactions cost a fraction of a cent — ideal for large-scale public registry operations and citizen access.                                                                                                           |
| ⚡ **ABFT Finality**                         | Transactions are final in seconds, eliminating land title disputes and fraud.                                                                                                                                           |
| 🌱 **Carbon-Negative Network**              | Complies with ESG frameworks; attractive for sustainable development agencies and green registries.                                                                                                                     |
| 🧩 **HTS (Hedera Token Service)**           | Enables native NFT minting for land parcels without external gas fees or bridges.                                                                                                                                       |
| 🔐 **HSCS (Hedera Smart Contract Service)** | EVM-compatible contracts handle land verification and lending logic securely.                                                                                                                                           |
| 🌐 **Public Transparency via Mirror Nodes** | Governments and the public can audit transactions in real time, supporting accountability and anti-corruption goals.                                                                                                    |
| 🤝 **Built-In Trust Layer**                 | Hedera’s permissionless yet enterprise-governed model bridges public and private stakeholders seamlessly.                                                                                                               |

> 🏗️ **In essence:** Hedera is the ideal blockchain for *LandQ* because it blends the *efficiency of enterprise systems* with the *transparency of decentralized ledgers* — making it a credible foundation for national land governance.



### 🚀 Track: Onchain Finance & Real-World Assets (RWA)

**Hedera Africa Hackathon 2025 Submission**

Core Hedera integration lives in:

* **Smart Contracts** — deployed on **Hedera Testnet**
* **Frontend (Next.js)** — interacts with contracts via **viem/wagmi**
* **AI Agent** — adds intelligence layer using **LLMs and geospatial APIs**

---

## 🌍 **Overview**

**LandQ** transforms physical land ownership into verifiable digital NFTs on Hedera.
It integrates *on-chain verification*, *lending protocols*, and *AI-powered land intelligence* to build Africa’s first **trustless property rights ecosystem**.

---

## ⚙️ **Hedera Integration Summary**

| Hedera Service                    | Usage                                                                                   | Justification                                           |
| --------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **HTS (Hedera Token Service)**    | Each parcel of land is represented as an HTS NFT storing region & GPS metadata on IPFS. | Immutable, low-cost ownership tokenization.             |
| **HSCS (Smart Contract Service)** | Smart contracts for minting, verification, and lending.                                 | EVM-compatible deployment, leveraging predictable fees. |
| **Mirror Node API**               | Fetches live NFT & verification data.                                                   | Enables transparent public verification & audit trails. |

---

## 💡 **Architecture Diagram**

*(added as `architecture-diagram.png` in repo)*

Frontend (Next.js + MetaMask) → Contracts (HTS + HSCS) → Hedera Network → Mirror Node → Land Intelligence AI Agent (Mastra + Ollama)

---

## 🔗 **Deployed Hedera IDs (Testnet)**

| Component                | Hedera ID            |
| ------------------------ | -------------------- |
| LandNFT Token ID         | `0.0.7160113`        |
| LandVerifier Contract ID | `[Add from testnet]` |
| LandLending Contract ID  | `[Add from testnet]` |
| Test Wallet              | `0.0.6493289`        |

---

## 🧱 Smart Contracts Overview

| **Contract Name**    | **Purpose**                                                    | **Key Functions**                                                     | **Hedera Integration**                                                   |
| -------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **LandNFT.sol**      | Represents parcels of land as **HTS NFTs** with IPFS metadata. | `mintLandNFT()`, `transferLandNFT()`, `getLandMetadata()`             | Uses **HTS** for NFT minting and metadata linkage.                       |
| **LandVerifier.sol** | Manages **on-chain verification requests**.                    | `requestVerification()`, `approveVerification()`, `getVerification()` | Uses **HSCS** for logic execution; verification is immutable and public. |
| **LandLending.sol**  | Enables **land-backed DeFi lending**.                          | `createLoan()`, `repayLoan()`, `liquidateDefaultedLoan()`             | Integrates **HTS** for tokenized lending and repayments in USDT.         |

---

## 🧠 Land Intelligence AI Agent

**Purpose:**
Enhances decision-making for landowners, buyers, and lenders by providing **AI-driven insights** on tokenized land parcels.

| **Capability**               | **Description**                                                  |
| ---------------------------- | ---------------------------------------------------------------- |
| Geospatial Overlap Detection | Detects if new land NFTs overlap existing ones on-chain.         |
| Amenities Lookup             | Fetches nearby roads, schools, hospitals via OpenStreetMap.      |
| Land Use Suggestion          | Suggests best land utilization (estate, commercial, farm, etc.). |
| AI Report Generation         | Uses LLM (Qwen2.5) via Ollama for readable analysis reports.     |
| Itinerary Builder            | Suggests on-site inspection routes based on key POIs.            |


### **LandNFT**

* Mints land parcels as NFTs.
* Metadata: GPS, image, price (stored on IPFS).
* Supports fractional ownership.

### **LandVerifier**

* Handles verification requests.
* Assigns regional verifiers.
* Publishes immutable verification status.

### **LandLending**

* Enables land-backed lending.
* Integrates stablecoins (USDT, USDC).
* Enforces smart-contract repayment logic.

---

## 🧠 **Land Intelligence AI Agent**

**Purpose:**
Analyzes tokenized land NFTs using LLMs and geospatial APIs to generate actionable insights for buyers, lenders, and verifiers.

**Functions:**
✅ Detect land overlaps via on-chain data
✅ Retrieve nearby infrastructure via OpenStreetMap
✅ Suggest optimal land usage
✅ Generate human-readable investment reports

**Stack:**

* Mastra Agent Framework
* Ollama (Qwen2.5 LLM)
* Node.js + Docker
* OpenStreetMap Overpass API

🧱 Docker Hub: [jnationj/agent-challenge](https://hub.docker.com/r/jnationj/agent-challenge)

---


## 📦 **Setup Instructions**

### 1️⃣ Frontend Setup

```bash
git clone https://github.com/yourname/landq-hedera.git
cd landq-frontend
npm install
npm run dev
```

Runs locally at **[http://localhost:3000](http://localhost:3000)**

### Environment Variables

Edit `.env` with:

```env
NEXT_PUBLIC_LANDNFT_CONTRACT='0x00000000000000000000000000000000006d49c8'
NEXT_PUBLIC_LAND_COLLECTION_ID=0.0.7162313

# === FIREBASE CLIENT CONFIG ===
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
# === FIREBASE ADMIN SDK CONFIG ===
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

PINATA_JWT=
```

### 2️⃣ Smart Contract Setup

```bash
cd Contract
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network hedera
```

Ensure environment variables for Hedera EVM wallet are set.

```env
OPERATOR_ID=0.0.5165390
OPERATOR_KEY=3030020100300706052b8104000a042204xxxxx
RECEIVER_ADDRESS=0x00000000000000000000000000000000004ed14e
LANDNFT_CONTRACT_ADDRESS=0x00000000000000000000000000000000006d622a
LANDVERIFIER_CONTRACT_ADDRESS=0x00000000000000000000000000000000006d625d
LANDNFT_EVM_ADDRESS=0x00000000000000000000000000000000006d622a
LANDVERIFIER_EVM_ADDRESS=0x00000000000000000000000000000000006d625d
LANDNFT_CONTRACT_ID=0.0.7168554
LANDLENDING_EVM_ADDRESS=00000000000000000000000000000000006d6282
```

Scripts for compiling and deploying you can find in package.json file


### AI Agent (optional)

```bash
cd LandQ-ai-agent
pnpm install
pnpm run dev
```

Then open [http://localhost:8080](http://localhost:8080).

---

## 🪙 Hedera Feature Highlights in LandQ

* HTS NFT minting for land ownership
* HSCS smart contract execution for verification & lending
* Mirror Node queries for transaction proof and transparency
* IPFS integration for off-chain land metadata
* Stablecoin (USDT) lending on Hedera


## 🧪 **Example Usage**

* Mint new land NFT from DApp.
* Request verification via Hedera smart contract.
* Verifier approves → live on-chain record appears on Mirror Node.
* Land owner uses verified NFT as loan collateral.
* AI Agent suggests value and nearby amenities.

---

## 🧠 **Technology Stack**

| Layer           | Technology                         |
| --------------- | ---------------------------------- |
| Blockchain      | Hedera (HTS + HSCS)                |
| Smart Contracts | Solidity                           |
| Frontend        | React / Next.js                    |
| Storage         | IPFS via Pinata                    |
| AI              | Ollama (Qwen2.5), Mastra Framework |
| Container       | Docker                             |
| Stablecoins     | USDT, USDC (HTS)                   |

---

## 🧩 **Milestones for Hedera Africa Hackathon**


## 🧭 **Roadmap**

| **Phase**                                          | **Timeline** | **Description**                                                                                                                                                                          | **Status** |
| -------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| **Phase 1 – Smart Contracts & Testnet Deployment** | ✅ Completed  | Developed and deployed `LandNFT`, `LandVerifier`, and `LandLending` contracts on Hedera Testnet. Integrated IPFS for metadata storage.                                                   | ✅ Done     |
| **Phase 2 – DApp MVP (Core Features)**             | ✅ Completed  | Built functional frontend with MetaMask integration, NFT minting, ownership dashboard, and on-chain verification flow. Live Hedera interactions via Mirror Node.                         | ✅ Done     |
| **Phase 3 – Marketplace & Lending Pools**          | 1–2 Months   | Launch peer-to-peer land NFT marketplace and liquidity pools for verified land-backed lending. Add real-time price oracles and integrate HBAR-Fi staking.                                | ⏳ Upcoming |
| **Phase 4 – Regional Expansion & Partnerships**    | 3–4 Months   | Partner with government land registries and verification agencies across African regions. Recruit certified verifiers and expand language/localization support.                          | 🔜 Planned |
| **Phase 5 – DAO Governance & Cross-Chain Launch**  | 5+ Months    | Establish the LandQ DAO for decentralized governance. Enable multi-chain interoperability (EVM chains) with Hedera as the settlement hub. Incentivize liquidity providers and verifiers. | 🚀 Future  |




---

## 👥 **Team Awesome**

| Name            | Role                    | 
| --------------- | ----------------------- | 
| [Joseph]        | Lead Developer          | 
| [Charity]       | Marketing Social/Media  | 
| [Blessing]      | Designer / Research     | 

Hedera Certified ✅

LINK: https://drive.google.com/drive/folders/1sHvEe1kYWRNpWfMAeg8BjY0wnsr1VOPE?usp=sharing

---

### 📬 Contact

For collaboration, partnerships, or inquiries:
**Name:** [Your Full Name or Team Name]
**Email:** [0xlandq@gmail.com](mailto:0xlandq@gmail.com)]
**X:** [[https://x.com/0xLandQ](https://x.com/0xLandQ)]

---

## 🧾 **License**

MIT License © 2025 LandQ
