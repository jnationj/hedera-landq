// lib/landVerifier.ts
import { writeContract, readContract } from '@wagmi/core'
import abi from '@/abi/LandVerifier_ABI.json'
import { config } from '../app/wagmi'

const LAND_VERIFIER_ADDRESS = process.env.NEXT_PUBLIC_LAND_VERIFIER_ADDRESS as `0x${string}`

// ------------------- HELPERS -------------------
export function toBytes32(text: string) {
  return `0x${Buffer.from(text.padEnd(32, '\0')).toString('hex')}` as `0x${string}`
}

// ------------------- WRITE FUNCTIONS -------------------

// Assign a verifier to a region
export async function assignVerifier(region: string, verifier: `0x${string}`) {
  return writeContract(config, {
    address: LAND_VERIFIER_ADDRESS,
    abi,
    functionName: 'assignVerifier',
    args: [toBytes32(region), verifier],
  })
}

// Remove verifier
export async function removeVerifier(region: string) {
  return writeContract(config, {
    address: LAND_VERIFIER_ADDRESS,
    abi,
    functionName: 'removeVerifier',
    args: [toBytes32(region)],
  })
}

// Land owner requests verification
export async function requestVerification(tokenId: bigint) {
  return writeContract(config, {
    address: LAND_VERIFIER_ADDRESS,
    abi,
    functionName: 'requestVerification',
    args: [tokenId],
  })
}

// Regional verifier verifies & appraises
export async function verifyLand(tokenId: bigint, appraisedValueUSD: bigint, notes: string) {
  return writeContract(config, {
    address: LAND_VERIFIER_ADDRESS,
    abi,
    functionName: 'verifyLand',
    args: [tokenId, appraisedValueUSD, notes],
  })
}

// Regional verifier rejects verification
export async function rejectLand(tokenId: bigint, reason: string) {
  return writeContract(config, {
    address: LAND_VERIFIER_ADDRESS,
    abi,
    functionName: 'rejectLand',
    args: [tokenId, reason],
  })
}

// ------------------- READ FUNCTIONS -------------------

// Fetch verification record
// Fetch verification record
export async function getVerification(tokenId: bigint) {
  const result = await readContract(config, {
    address: LAND_VERIFIER_ADDRESS,
    abi,
    functionName: 'getVerification',
    args: [tokenId],
  }) as [
    boolean,        // isVerified
    boolean,        // isRejected
    `0x${string}`,  // verifier
    bigint,         // verifiedAt (timestamp)
    string,         // notes
    bigint          // appraisedValueUSD
  ]

  return {
    isVerified: result[0],
    isRejected: result[1],
    verifier: result[2],
    verifiedAt: Number(result[3]),
    notes: result[4],
    appraisedValueUSD: Number(result[5]),
  }
}


// Get verifier for a region
export async function getRegionVerifier(region: string) {
  return readContract(config, {
    address: LAND_VERIFIER_ADDRESS,
    abi,
    functionName: 'getRegionVerifier',
    args: [toBytes32(region)],
  }) as Promise<`0x${string}`>
}

// Get appraised value in USD
export async function getAppraisedPrice(tokenId: bigint) {
  return readContract(config, {
    address: LAND_VERIFIER_ADDRESS,
    abi,
    functionName: 'getAppraisedPrice',
    args: [tokenId],
  }) as Promise<bigint>
}
