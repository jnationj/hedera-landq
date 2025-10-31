"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getVerification, requestVerification } from "@/lib/landVerifier";

interface NFT {
  tokenId: string;
  serial: number;
  name: string;
  image?: string | null;
  verified: boolean;
}

interface VerificationData {
  isVerified: boolean;
  isRejected: boolean;
  verifier: string;
  verifiedAt: number;
  notes: string;
  appraisedValueUSD: number;
}

export default function MyNFTsPage() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifications, setVerifications] = useState<Record<string, VerificationData | null>>({});
  const [verifying, setVerifying] = useState<string | null>(null);

  useEffect(() => {
    const accountId = "0.0.7160113"; // Replace later with connected wallet ID
    fetch(`/api/my-nfts?accountId=${accountId}`)
      .then((res) => res.json())
      .then(async (data) => {
        const nftList: NFT[] = data.nfts || [];
        setNfts(nftList);

        // Fetch verification info for each NFT
        const verifications: Record<string, VerificationData | null> = {};
        for (const nft of nftList) {
          try {
            const v = await getVerification(BigInt(nft.serial));
            verifications[nft.serial] = v;
          } catch (e) {
            console.warn("Verification fetch failed:", e);
            verifications[nft.serial] = null;
          }
        }
        setVerifications(verifications);
      })
      .catch((err) => console.error("Fetch NFTs error:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleRequestVerification = async (serial: number) => {
    try {
      setVerifying(serial.toString());
      await requestVerification(BigInt(serial)); // Calls LandVerifier.requestVerification()
      alert("✅ Verification request successfully sent!");

      // Refresh verification status
      const updated = await getVerification(BigInt(serial));
      setVerifications((prev) => ({ ...prev, [serial]: updated }));
    } catch (err: any) {
      // Detect MetaMask cancellation and handle silently
      if (
        err.code === 4001 ||
        err.message?.includes("User denied") ||
        err.name === "UserRejectedRequestError"
      ) {
        console.log("⛔ User cancelled MetaMask signature — skipping.");
        return;
      }

      console.error("Request verification error:", err);
      alert("⚠️ Verification failed. Please try again.");
    } finally {
      setVerifying(null);
    }
  };



  if (loading) return <p className="text-center mt-6">Loading NFTs...</p>;
  if (nfts.length === 0) return <p className="text-center mt-6">No NFTs found.</p>;

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {nfts.map((nft) => {
        const v = verifications[nft.serial];
        const status = v
          ? v.isVerified
            ? "✅ Verified"
            : v.isRejected
            ? "❌ Rejected"
            : "⏳ Pending"
          : "❌ Not Verified";

        return (
          <div
            key={nft.serial}
            className="border rounded-xl p-4 shadow-md hover:shadow-lg hover:scale-[1.02] transition-transform duration-200"
          >
            <Link href={`/my-nfts/${nft.tokenId}/${nft.serial}`}>
              <img
                src={nft.image || "/placeholder.png"}
                alt={nft.name}
                className="w-full h-56 object-cover rounded-lg"
              />
              <h2 className="mt-2 font-semibold text-lg">{nft.name}</h2>
              <p className="text-sm text-gray-500">Token ID: {nft.tokenId}</p>
              <p className="text-sm text-gray-500">Serial: {nft.serial}</p>
              <p className="mt-1 text-xs text-green-600">{status}</p>
            </Link>

            {!v?.isVerified && (
              <button
                onClick={() => handleRequestVerification(nft.serial)}
                disabled={verifying === nft.serial.toString()}
                className={`mt-3 w-full py-2 rounded-lg text-white font-medium ${
                  verifying === nft.serial.toString()
                    ? "bg-gray-400"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {verifying === nft.serial.toString()
                  ? "Requesting..."
                  : "Get Verified"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
