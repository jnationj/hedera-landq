// app/api/nft-uri/route.ts
import { NextResponse } from "next/server";

const MIRROR_NODE_URL = "https://testnet.mirrornode.hedera.com/api/v1";

/**
 * Fetch NFT metadata URI and decoded content
 * Example: /api/nft-uri?tokenId=0.0.7159071&serial=4
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tokenId = searchParams.get("tokenId");
    const serial = searchParams.get("serial");

    if (!tokenId || !serial) {
      return NextResponse.json({ error: "Missing tokenId or serial" }, { status: 400 });
    }

    // ✅ 1. Query the specific NFT from Mirror Node
    const res = await fetch(`${MIRROR_NODE_URL}/tokens/${tokenId}/nfts/${serial}`);
    const data = await res.json();

    if (!data || data._status?.toString().includes("404")) {
      return NextResponse.json({ error: "NFT not found" }, { status: 404 });
    }

    // ✅ 2. Decode metadata (base64) → string
    let metadata = "";
    if (data.metadata) {
      metadata = Buffer.from(data.metadata, "base64").toString("utf-8");
    }

    // ✅ 3. Extract or normalize IPFS URI
    let ipfsUrl = "";
    try {
      const metaObj = JSON.parse(metadata);
      const uri = metaObj.image || metaObj.uri || metaObj.ipfs || metaObj.metadata;
      if (uri) {
        ipfsUrl = uri.replace(/^ipfs:\/\//, "https://gateway.pinata.cloud/ipfs/");
      }
    } catch {
      // sometimes metadata is already a URI
      if (metadata.startsWith("ipfs://")) {
        ipfsUrl = metadata.replace(/^ipfs:\/\//, "https://gateway.pinata.cloud/ipfs/");
      }
    }

    return NextResponse.json({
      tokenId,
      serial,
      metadata,
      ipfsUrl,
    });
  } catch (err: any) {
    console.error("NFT URI fetch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
