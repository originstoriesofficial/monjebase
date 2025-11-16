// app/api/resolve-base-address/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

const client = createPublicClient({
  chain: mainnet,
  transport: http("https://eth.llamarpc.com"), // fast reliable RPC
});

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  if (!name) {
    return NextResponse.json({ error: "Missing name" }, { status: 400 });
  }

  try {
    const address = await client.getEnsAddress({ name });
    if (!address) {
      return NextResponse.json({ error: "No address found for name" }, { status: 404 });
    }

    return NextResponse.json({ address });
  } catch (err) {
    console.error("ENS resolution failed:", err);
    return NextResponse.json({ error: "Failed to resolve ENS name" }, { status: 500 });
  }
}
