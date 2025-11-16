import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

// 🚀 ENS client for .eth lookups
const ensClient = createPublicClient({
  chain: mainnet,
  transport: http("https://eth.llamarpc.com"),
});

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  if (!name) {
    return NextResponse.json({ error: "Missing name" }, { status: 400 });
  }

  try {
    const lowerName = name.toLowerCase();

    // 🟣 1️⃣ ENS: works for standard .eth names
    if (lowerName.endsWith(".eth")) {
      const address = await ensClient.getEnsAddress({ name: lowerName });
      if (address) {
        return NextResponse.json({ source: "ens", address });
      }
    }

    // 🔵 2️⃣ Base Name Service: works for .base.eth names
    const bnsRes = await fetch(`https://api.base.org/names/${encodeURIComponent(lowerName)}`);
    if (bnsRes.ok) {
      const bnsData = await bnsRes.json();
      const address = bnsData?.owner || bnsData?.resolved_address;
      if (address) {
        return NextResponse.json({ source: "base", address });
      }
    }

    // ⚫ 3️⃣ No match found
    return NextResponse.json({ error: `No address found for ${name}` }, { status: 404 });
  } catch (err) {
    console.error("❌ Name resolution failed:", err);
    return NextResponse.json({ error: "Name resolution failed" }, { status: 500 });
  }
}
