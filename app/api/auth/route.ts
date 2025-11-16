import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

const ORIGIN_CONTRACT = process.env.ORIGIN_CONTRACT!;
const MONKERIA_CONTRACT = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL!;

const provider = new ethers.JsonRpcProvider(RPC_URL);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  if (!address) return NextResponse.json({ error: 'Missing address' }, { status: 400 });

  try {
    const origin = new ethers.Contract(
      ORIGIN_CONTRACT,
      ['function balanceOf(address) view returns (uint256)'],
      provider
    );
    const monje = new ethers.Contract(
      MONKERIA_CONTRACT,
      ['function balanceOf(address) view returns (uint256)'],
      provider
    );

    const [originBal, monjeBal] = await Promise.all([
      origin.balanceOf(address),
      monje.balanceOf(address),
    ]);

    return NextResponse.json({
      ownsOrigin: originBal > 0n,
      ownsMonje: monjeBal > 0n,
      mintPrice: 0.002, // fallback default
    });
  } catch (err) {
    console.error('NFT check failed', err);
    return NextResponse.json({ error: 'Failed to check ownership' }, { status: 500 });
  }
}
