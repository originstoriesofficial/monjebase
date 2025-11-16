// app/api/auth/check-nft/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, parseAbi } from "viem";
import { base } from "viem/chains";

// 🧠 Your real contract addresses here
const ORIGIN_CONTRACT = process.env.ORIGIN_CONTRACT as `0x${string}`; // ERC-20
const MONJE_NFT_CONTRACT = process.env.MONJE_NFT_CONTRACT as `0x${string}`; // ERC-721 or 1155

const client = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://mainnet.base.org"),
});

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address") as `0x${string}` | null;
  if (!address) {
    return NextResponse.json({ error: "Missing address" }, { status: 400 });
  }

  try {
    const abi = parseAbi(["function balanceOf(address) view returns (uint256)"]);

    // ✅ Check OriginStory ERC-20
    const originBalance = await client.readContract({
      address: ORIGIN_CONTRACT,
      abi,
      functionName: "balanceOf",
      args: [address],
    });

    const ownsOrigin = BigInt(originBalance ?? 0n) > 0n;

    // ✅ Check Monje NFT ERC-721
    const monjeBalance = await client.readContract({
      address: MONJE_NFT_CONTRACT,
      abi,
      functionName: "balanceOf",
      args: [address],
    });

    const ownsMonje = BigInt(monjeBalance ?? 0n) > 0n;

    // ✅ Determine mint price
    const mintPrice = ownsOrigin ? 0 : 0.002;

    return NextResponse.json({
      ownsOrigin,
      ownsMonje,
      mintPrice,
      freeMint: ownsOrigin,
    });
  } catch (err) {
    console.error("❌ NFT/Token check failed:", err);
    return NextResponse.json({ error: "Failed to check ownership" }, { status: 500 });
  }
}
