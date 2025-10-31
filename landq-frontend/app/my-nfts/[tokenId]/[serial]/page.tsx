"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface NFTDetail {
  tokenId: string;
  serial: string;
  image?: string;
  name: string;
  description: string;
  attributes?: { trait_type: string; value: string }[];
}

export default function NFTDetailPage() {
  // useParams() may return null temporarily during hydration
  const params = useParams<{ tokenId: string; serial: string }>() ?? { tokenId: "", serial: "" };
  const tokenId = params?.tokenId || "";
  const serial = params?.serial || "";

  const [nft, setNft] = useState<NFTDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNFT() {
      try {
        const res = await fetch(
          `https://testnet.mirrornode.hedera.com/api/v1/tokens/${tokenId}/nfts/${serial}`
        );
        const data = await res.json();

        const decoded = atob(data.metadata);
        let metadata = null;

        if (decoded.startsWith("http")) {
          const metaRes = await fetch(decoded);
          metadata = await metaRes.json();
        }

        setNft({
          tokenId,
          serial,
          image: metadata?.image || decoded,
          name: metadata?.name || `Land #${serial}`,
          description: metadata?.description || "No description available.",
          attributes: metadata?.attributes || [],
        });
      } catch (err) {
        console.error("Error fetching NFT detail:", err);
      } finally {
        setLoading(false);
      }
    }

    if (tokenId && serial) fetchNFT();
  }, [tokenId, serial]);

  if (loading) return <p className="text-center mt-6">Loading NFT details...</p>;
  if (!nft) return <p className="text-center mt-6">NFT not found.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <img
        src={nft.image || "/placeholder.png"}
        alt={nft.name}
        className="w-full rounded-xl shadow-lg mb-4"
      />
      <h1 className="text-2xl font-bold mb-2">{nft.name}</h1>
      <p className="text-gray-600 mb-4">{nft.description}</p>

      <div className="bg-gray-50 border rounded-lg p-4 shadow-sm">
        <p>
          <strong>Token ID:</strong> {nft.tokenId}
        </p>
        <p>
          <strong>Serial:</strong> {nft.serial}
        </p>
      </div>

      {nft.attributes?.length ? (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Attributes</h3>
          <div className="grid grid-cols-2 gap-3">
            {nft.attributes.map((attr, i) => (
              <div
                key={i}
                className="border rounded-lg p-2 bg-white text-sm shadow-sm"
              >
                <p className="font-medium">{attr.trait_type}</p>
                <p className="text-gray-600">{attr.value}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-4 text-gray-500 text-sm">No attributes available.</p>
      )}
    </div>
  );
}
