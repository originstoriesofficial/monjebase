import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, parseAbi } from "viem";
import { base } from "viem/chains";

const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://mainnet.base.org"),
});

const ORIGIN_CONTRACT = process.env.ORIGIN_CONTRACT as `0x${string}`;
const MONKERIA_CONTRACT = process.env.MONKERIA_CONTRACT as `0x${string}`;

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address") as `0x${string}` | null;

  if (!address) {
    return NextResponse.json({ error: "Missing address" }, { status: 400 });
  }

  try {
    // ERC-20 balance check ABI
    const abi = parseAbi(["function balanceOf(address) view returns (uint256)"]);

    // ✅ 1️⃣ OriginStory ERC-20 token balance
    const originBalance = await publicClient.readContract({
      address: ORIGIN_CONTRACT,
      abi,
      functionName: "balanceOf",
      args: [address],
    });

    const ownsOrigin = BigInt(originBalance || 0n) > 0n;

    // ✅ 2️⃣ Monje NFT (ERC-721)
    const monjeBalance = await publicClient.readContract({
      address: MONKERIA_CONTRACT,
      abi,
      functionName: "balanceOf",
      args: [address],
    });

    const ownsMonje = BigInt(monjeBalance || 0n) > 0n;

    const mintPrice = ownsOrigin ? 0 : 0.002;

    return NextResponse.json({
      ownsOrigin,
      ownsMonje,
      mintPrice,
      freeMint: ownsOrigin,
    });
  } catch (err) {
    console.error("❌ Token check failed:", err);
    return NextResponse.json({ error: "Failed to check ownership" }, { status: 500 });
  }
}
