'use client';

import { useState } from 'react';
import { useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import { base } from 'viem/chains';
import { MONKERIA_ABI } from '@/lib/contract';

type MintButtonProps = {
  metadataUrl: string;
  freeMint?: boolean;
  priceEth?: string; // fallback price if not free
  contractAddress: `0x${string}`;
};

export default function MintButton({
  metadataUrl,
  freeMint = false,
  priceEth = '0.002',
  contractAddress,
}: MintButtonProps) {
  const [minting, setMinting] = useState(false);
  const { writeContractAsync } = useWriteContract();

  async function handleMint() {
    if (!metadataUrl) {
      alert('Please generate your Monje first.');
      return;
    }

    try {
      setMinting(true);
      await writeContractAsync({
        chainId: base.id,
        address: contractAddress,
        abi: MONKERIA_ABI,
        functionName: 'mint',
        args: [metadataUrl, 1],
        value: freeMint ? 0n : parseEther(priceEth),
      });
      alert('✅ Mint successful! View it on BaseScan.');
    } catch (err) {
      console.error('❌ Mint failed:', err);
      alert('Mint failed. Try again.');
    } finally {
      setMinting(false);
    }
  }

  return (
    <button
      onClick={handleMint}
      disabled={minting}
      className={`w-full py-3 font-bold rounded-lg transition ${
        freeMint
          ? 'bg-green-600 hover:bg-green-700 text-white'
          : 'bg-amber-600 hover:bg-amber-700 text-white'
      }`}
    >
      {minting
        ? 'Minting...'
        : freeMint
        ? '🪙 Free Mint for Origin Holders'
        : `🪙 Mint for ${priceEth} ETH`}
    </button>
  );
}
