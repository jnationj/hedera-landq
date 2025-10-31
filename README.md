# 🏡 **LandQ: Decentralized Land Ownership, Verification & Lending on Hedera**

### 🚀 Track: Onchain Finance & Real-World Assets (RWA)

**Hedera Africa Hackathon 2025 Submission**

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

## 🧩 **Smart Contracts Summary**

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

## 🧭 **Roadmap**

**Phase 1 – Contracts & Testnet (✅ Done)**
**Phase 2 – DApp MVP (✅ Done)**
**Phase 3 – Marketplace & Lending Pools (1–2 Months)**
**Phase 4 – Regional Expansion (3–4 Months)**
**Phase 5 – DAO & Cross-chain (5+ Months)**

---

## 📦 **Setup Instructions**

### Backend + Frontend

```bash
git clone https://github.com/yourname/landq-hedera.git
cd landq-hedera
npm install
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_CONTRACT_ID=0.0.7160113
NEXT_PUBLIC_VERIFIER_ID=0.0.xxxxxxx
NEXT_PUBLIC_MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com/api/v1
```

### AI Agent (optional)

```bash
cd ai-agent
docker build -t jnationj/agent-challenge:latest .
docker run --env-file .env.docker -p 8080:8080 jnationj/agent-challenge:latest
```

Then open [http://localhost:8080](http://localhost:8080).

---

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

| Milestone | Description                              | Status      |
| --------- | ---------------------------------------- | ----------- |
| M1        | Working MVP DApp with mint, verify, loan | ✅ Completed |
| M2        | Marketplace & Lending Pools              | ⏳ Next      |
| M3        | Regional Registry Integrations           | 🚧 Planned  |

---

## 👥 **Team LandQ**

| Name            | Role                    | Contribution |
| --------------- | ----------------------- | ------------ |
| [Your Name]     | Lead Developer          | 50%          |
| [Teammate Name] | Smart Contract Engineer | 25%          |
| [Teammate Name] | Designer / Research     | 25%          |

Hedera Certified ✅
Contact: [your email / LinkedIn]

---

## 🧾 **License**

MIT License © 2025 LandQ

---

## ✅ **Compliance Checklist**

✅ Public GitHub Repo
✅ Functional DApp w/ live Hedera transaction
✅ README w/ setup + architecture
✅ 3-min Demo Video + Pitch Deck
✅ Team registered on DoraHacks

---

If you confirm I can proceed to:

1. 🧱 Format this into a ready-to-push `README.md`
2. 🧾 Write the **DoraHacks BUIDL page submission text**
3. 🎤 Prepare your **Pitch Deck (Google Slides / PDF)** from this summary

Can you please confirm the following before I finalize?

* ✅ Your deployed **LandVerifier** and **LandLending** contract IDs
* ✅ Your **GitHub repo URL** (or “create new public repo”)
* ✅ Your **YouTube/Vimeo video link**
