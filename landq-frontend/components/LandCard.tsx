import React from "react";

interface LandCardProps {
  nft: {
    id?: string | number;
    name: string;
    imageUrl?: string;
    coordinates?: string[];
    tokenId?: number;
    metadataUri?: string;
    openseaUrl?: string;
    verified?: boolean;
  };
  onClick: () => void;
  onVerify: () => void;
}

export default function LandCard({ nft, onClick, onVerify }: LandCardProps) {
  return (
    <div
      className="border rounded-xl p-4 shadow-md hover:shadow-xl transition cursor-pointer bg-white"
      onClick={onClick}
    >
      <img
        src={nft.imageUrl || "/placeholder.png"}
        alt={nft.name || "Land NFT"}
        className="w-full h-52 object-cover rounded-lg"
      />

      <h3 className="text-lg font-semibold mt-3">{nft.name}</h3>

      {nft.coordinates && nft.coordinates.length > 0 && (
        <p className="text-sm text-gray-600 mt-1">
          <strong>Coords:</strong>{" "}
          {nft.coordinates.slice(0, 2).join(", ")} {/* show first 2 */}
          {nft.coordinates.length > 2 && " ..."}
        </p>
      )}

      {nft.tokenId !== undefined && (
        <p className="text-sm text-gray-700 mt-1">
          <strong>Token ID:</strong> #{nft.tokenId}
        </p>
      )}

      {nft.openseaUrl && (
        <a
          href={nft.openseaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 text-sm underline mt-1 inline-block"
          onClick={(e) => e.stopPropagation()}
        >
          View on HashScan
        </a>
      )}

      <p className="mt-2 text-sm">
        <strong>Status:</strong>{" "}
        {nft.verified ? (
          <span className="text-green-600 font-medium">✅ Verified</span>
        ) : (
          <span className="text-red-500 font-medium">❌ Unverified</span>
        )}
      </p>

      {!nft.verified && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onVerify();
          }}
          className="mt-3 w-full bg-green-600 text-white py-1.5 rounded hover:bg-green-700 transition"
        >
          Verify NFT
        </button>
      )}
    </div>
  );
}
