import { NextResponse } from "next/server";

function resolveMetadataUrl(url: string) {
  if (!url) return null;

  // Decode base64 if needed
  if (!url.startsWith("http")) {
    try {
      url = Buffer.from(url, "base64").toString("utf8");
    } catch {
      return null;
    }
  }

  // Handle ipfs:// or baf... URIs
  if (url.startsWith("ipfs://")) {
    return url.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
  }

  // Handle raw CID (bafy... or bafkrei...)
  if (url.match(/^baf/)) {
    return `https://gateway.pinata.cloud/ipfs/${url}`;
  }

  // Already valid HTTP/HTTPS
  if (url.startsWith("http")) return url;

  return null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");

    if (!accountId) {
      return NextResponse.json({ error: "Missing accountId" }, { status: 400 });
    }

    // Fetch NFTs for the account
    const res = await fetch(
      `https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}/nfts`
    );
    if (!res.ok) throw new Error(`Mirror Node error ${res.status}`);
    const data = await res.json();

    // Process each NFT
    const nfts = await Promise.all(
      (data.nfts || []).map(async (nft: any) => {
        try {
          const rawMetadata = nft.metadata;
          const metadataUrl = resolveMetadataUrl(rawMetadata);
          let meta: any = {};

          if (metadataUrl) {
            const metaRes = await fetch(metadataUrl);
            if (metaRes.ok) meta = await metaRes.json();
          }

          // Fix image link if IPFS
          let image = meta.image || meta.image_url || "";
          if (image?.startsWith("ipfs://")) {
            image = image.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
          } else if (image?.match(/^baf/)) {
            image = `https://gateway.pinata.cloud/ipfs/${image}`;
          }

          return {
            tokenId: nft.token_id,
            serial: nft.serial_number,
            name: meta.name || `Land NFT #${nft.serial_number}`,
            image: image || "/fallback.png",
            description: meta.description || "",
            attributes: meta.attributes || [],
          };
        } catch (err) {
          console.warn("Metadata parse failed for", nft.serial_number, err);
          return {
            tokenId: nft.token_id,
            serial: nft.serial_number,
            name: `Land NFT #${nft.serial_number}`,
            image: "/fallback.png",
          };
        }
      })
    );

    return NextResponse.json({ nfts });
  } catch (err: any) {
    console.error("NFT fetch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
