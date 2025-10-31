// lib/hederaUtils.ts

// Convert Hedera-style ID (0.0.x) → EVM hex address (0x... padded)
export function hederaToEvm(hederaId: string): `0x${string}` {
  const parts = hederaId.split(".");
  const num = BigInt(parts[2]);
  const hex = num.toString(16).padStart(40, "0");
  return `0x${hex}` as `0x${string}`;
}
