import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, parseAbi } from "viem";
import { baseSepolia } from "viem/chains";

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.base.org"),
});

const ORIGIN_CONTRACT = process.env.ORIGIN_CONTRACT as `0x${string}`;
const MONKERIA_CONTRACT = process.env.MONKERIA_CONTRACT as `0x${string}`;

const abi = parseAbi(["function balanceOf(address owner) view returns (uint256)"]);

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address") as `0x${string}` | null;
  if (!address) {
    return NextResponse.json({ error: "Missing address" }, { status: 400 });
  }

  try {
    // ✅ Check OriginStory ERC-20
    const originBalance = await publicClient.readContract({
      address: ORIGIN_CONTRACT,
      abi,
      functionName: "balanceOf",
      args: [address],
    });
    const ownsOrigin = BigInt(originBalance) > 0n;

    // ✅ Check Monkeria NFT ERC-721
    const monjeBalance = await publicClient.readContract({
      address: MONKERIA_CONTRACT,
      abi,
      functionName: "balanceOf",
      args: [address],
    });
    const ownsMonje = BigInt(monjeBalance) > 0n;

    // ✅ Define mint logic
    const mintPrice = ownsOrigin ? 0 : 0.002;

    return NextResponse.json({
      ownsOrigin,
      ownsMonje,
      mintPrice,
      freeMint: ownsOrigin,
      chain: "base-sepolia",
    });
  } catch (err) {
    console.error("❌ NFT/Token check failed:", err);
    return NextResponse.json({ error: "Failed to check ownership" }, { status: 500 });
  }
}
