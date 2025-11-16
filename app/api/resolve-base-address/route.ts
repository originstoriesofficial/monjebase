// app/api/resolve-base-address/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";

const client = createPublicClient({
  chain: base,
  transport: http("https://mainnet.base.org"),
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
    console.error("ENS/Base name resolve failed:", err);
    return NextResponse.json({ error: "Resolve failed" }, { status: 500 });
  }
}
