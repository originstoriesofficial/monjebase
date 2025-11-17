import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, parseAbi } from "viem";
import { base, baseSepolia } from "viem/chains";

// ✅ Clients for both chains
const mainnetClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_BASE_RPC || "https://mainnet.base.org"),
});

const testnetClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || "https://sepolia.base.org"),
});

// ✅ Contract addresses
const ORIGIN_CONTRACT = "0x45737f6950f5c9e9475e9e045c7a89b565fa3648"; // ERC20 on Base mainnet
const MONKERIA_CONTRACT = "0x3D1E34Aa63d26f7b1307b96a612a40e5F8297AC7"; // ERC721 on Base Sepolia testnet

// ✅ Shared ABI
const abi = parseAbi(["function balanceOf(address owner) view returns (uint256)"]);

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address") as `0x${string}` | null;
  if (!address) return NextResponse.json({ error: "Missing address" }, { status: 400 });

  try {
    // 1️⃣ Check OriginStory on Base mainnet
    let originBalance = 0n;
    try {
      originBalance = await mainnetClient.readContract({
        address: ORIGIN_CONTRACT,
        abi,
        functionName: "balanceOf",
        args: [address],
      });
    } catch (e) {
      console.error("OriginStory check failed (mainnet):", e);
    }

    const ownsOrigin = BigInt(originBalance) > 0n;

    // 2️⃣ Check Monkeria NFT on Base Sepolia
    let monjeBalance = 0n;
    try {
      monjeBalance = await testnetClient.readContract({
        address: MONKERIA_CONTRACT,
        abi,
        functionName: "balanceOf",
        args: [address],
      });
    } catch (e) {
      console.error("Monkeria check failed (testnet):", e);
    }

    const ownsMonje = BigInt(monjeBalance) > 0n;

    // 3️⃣ Mint logic
    const mintPrice = ownsOrigin ? 0 : 0.002;

    return NextResponse.json({
      ownsOrigin,
      ownsMonje,
      mintPrice,
      freeMint: ownsOrigin,
      mainnet: base.name,
      testnet: baseSepolia.name,
    });
  } catch (err) {
    console.error("❌ NFT/Token check failed:", err);
    return NextResponse.json(
      { error: "Failed to check ownership", details: String(err) },
      { status: 500 },
    );
  }
}
