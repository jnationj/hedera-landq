# 🌍 Land-Chain Frontend

> A decentralized dApp frontend for tokenizing real-world land ownership using IPFS, Hedera, and HTS NFTs.

---

## 📦 Tech Stack

* **Framework**: [Next.js 15 (App Router)](https://nextjs.org/docs)
* **Wallet & Web3**: `ethers.js`, `wagmi`, or `RainbowKit` (configurable)
* **Storage**: IPFS via [Pinata](https://www.pinata.cloud/)


---

## 🧱 Project Structure

```bash
frontend/
├── abi/                        # ABI files 
├── components/                # Reusable components (form, preview, mint button)
├── pages/                     # Pages directory (e.g., index.tsx, mint.tsx)
├── public/                    # Static assets
├── styles/                    # Global CSS
├── utils/                     # Helper functions (e.g., wallet utils)
├── .env.local                 # Environment variables
├── README.md                  # This file
└── package.json
```

---

## 🛠️ Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/your-username/land-chain-frontend.git
cd land-chain-frontend
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Create Environment Variables

Create a `.env.local` file in the root and add the following:

```env


```

> Replace values with actual deployed contract addresses and backend endpoint.

---

## 🚀 Running the App

```bash
npm install
```

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Features

### ✅ Upload Land Details

* Input name, description, price
* Draw/paste 4 geo-coordinates
* Upload land document (PDF/Image)
* App Router generates snapshot map + metadata on IPFS

### 🔎 Preview Metadata

* View the generated metadata object and gateway URL before minting

### 🪙 Mint NFT

* Connect wallet (MetaMask or injected)


---

## 📁 Important Files

* `components/UploadForm.tsx`: Form to collect land data
* `components/MintButton.tsx`: Button to mint NFT using Issuer contract
* `components/MetadataPreview.tsx`: Optional, shows metadata URL content
* `abi/`: ABI from your hardhat build
* `pages/index.tsx`: Home page
* `pages/mint.tsx`: Minting logic

---

## 🌐 Networks

Ensure you are connected to:

* Avalanche Fuji Testnet (default)
* Update `wagmi` config to support other networks if needed.

---

## 🧱 Contracts
| **Contract Name**          | **Purpose**                                                                                                     | **Key Functions**                                                                                                                                                                                                                                                   | **Hedera Integration**                                                                                                                            |
| -------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LandNFT.sol**            | Represents parcels of land as **HTS-compatible NFTs**, each containing verifiable metadata.                     | - `mintLandNFT()` → Mints new land NFTs with metadata (GPS, region, price, images on IPFS).<br>- `transferLandNFT()` → Allows secondary ownership transfer.<br>- `getLandMetadata()` → Fetches land details stored off-chain (IPFS hash).                           | Uses **Hedera Token Service (HTS)** for NFT minting and metadata linkage.                                                                         |
| **LandVerifier.sol**       | Manages **on-chain land verification requests** and approvals. Connects with approved verification authorities. | - `requestVerification(tokenId)` → Owner requests verification for their NFT.<br>- `approveVerification(tokenId)` / `rejectVerification(tokenId)` → Authority updates verification status.<br>- `getVerification(tokenId)` → Returns immutable verification result. | Uses **Hedera Smart Contract Service (HSCS)** for logic execution and verification tracking. Verification results are public and immutable.       |
| **LandLending.sol**        | Enables **land-backed lending** using verified NFTs as collateral.                                              | - `createLoan(tokenId, amount, duration)` → Creates a loan against a verified NFT.<br>- `repayLoan(loanId)` → Repays in stablecoin (e.g., USDT).<br>- `liquidateDefaultedLoan(loanId)` → Liquidates collateral if unpaid after due date.                            | Integrates with **Hedera Token Service (HTS)** for tokenized lending and repayments (USDT, USDC). Supports transparent loan lifecycle management. |
| **PriceOracle (optional)** | Provides **real-time land valuation** data (future integration).                                                | - `updatePrice(tokenId, price)` → Updates estimated land value.<br>- `getPrice(tokenId)` → Fetches last recorded valuation.                                                                                                                                         | Can use **Hedera Consensus Service (HCS)** for secure and auditable oracle data feeds.                                                            |

🔗 How They Work Together

LandNFT → Mints land ownership as NFTs (proof of ownership).

LandVerifier → Handles verification with approved authorities (proof of authenticity).

LandLending → Uses verified NFTs as collateral for DeFi loans.

PriceOracle → (Future) Enables dynamic land valuation to support lending decisions.
---


---
