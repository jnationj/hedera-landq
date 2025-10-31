"use client";

import { defineChain, createPublicClient, http } from "viem";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

// ----------------------
// ☘️ Hedera Testnet
// ----------------------
export const HederaTestnet = defineChain({
  id: 296,
  name: "Hedera Testnet",
  network: "hedera-testnet",
  nativeCurrency: {
    decimals: 8,
    name: "HBAR",
    symbol: "HBAR",
  },
  rpcUrls: {
    default: { http: ["https://testnet.hashio.io/api"] },
  },
  blockExplorers: {
    default: {
      name: "HashScan",
      url: "https://hashscan.io/testnet",
    },
  },
  testnet: true,
});

// ----------------------
// 🌍 Hedera Mainnet
// ----------------------
export const HederaMainnet = defineChain({
  id: 295,
  name: "Hedera Mainnet",
  network: "hedera-mainnet",
  nativeCurrency: {
    decimals: 8,
    name: "HBAR",
    symbol: "HBAR",
  },
  rpcUrls: {
    default: { http: ["https://mainnet.hashio.io/api"] },
  },
  blockExplorers: {
    default: {
      name: "HashScan",
      url: "https://hashscan.io/mainnet",
    },
  },
  testnet: false,
});

// ----------------------
// 🧩 RainbowKit + Wagmi Config
// ----------------------
export const config = getDefaultConfig({
  appName: "LandNFT",
  projectId: "505f3f0ffe9fc46644eb8977fe3e43df", // WalletConnect Project ID
  chains: [HederaTestnet, HederaMainnet],
  ssr: true,
});

// ----------------------
// 🪄 Public Client for API/server reads
// ----------------------
export const publicClient = createPublicClient({
  chain: HederaTestnet, // 👈 switch to HederaMainnet for production
  transport: http(HederaTestnet.rpcUrls.default.http[0]!),
});

// ----------------------
// 🧱 Contract Addresses
// ----------------------
export const LAND_NFT_ADDRESS = process.env.NEXT_PUBLIC_LAND_NFT_ADDRESS as `0x${string}`;
