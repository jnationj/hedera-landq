import { NextResponse } from "next/server";
import { publicClient, LAND_NFT_ADDRESS } from "@/app/wagmi";
import { landNFTAbi } from "@/lib/abi/landNFT";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const account = searchParams.get("account");
    const tokenId = searchParams.get("tokenId");

    if (!account || !tokenId)
      return NextResponse.json({ error: "Missing account or tokenId" }, { status: 400 });

    const balance = (await publicClient.readContract({
      address: LAND_NFT_ADDRESS,
      abi: landNFTAbi,
      functionName: "balanceOf",
      args: [account, BigInt(tokenId)],
    })) as bigint;

    const owns = balance > 0n;

    let tokenURI = "";
    if (owns) {
      tokenURI = (await publicClient.readContract({
        address: LAND_NFT_ADDRESS,
        abi: landNFTAbi,
        functionName: "uri",
        args: [BigInt(tokenId)],
      })) as string;
    }

    return NextResponse.json({
      owns,
      tokenURI,
      verified: owns,
      verifyingAgency: "LandQ Agency",
      verificationFee: "5",
    });
  } catch (err: any) {
    console.error("NFT check error:", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}