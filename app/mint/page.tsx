'use client';

import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { useState } from 'react';
import { MONKERIA_ABI, MONKERIA_CONTRACT, MONKERIA_CHAIN } from '@/lib/contract';

export default function MintPage() {
  const { address } = useAccount();
  const [tokenURI, setTokenURI] = useState('');
  const [quantity, setQuantity] = useState(1);

  // ✅ read mint price safely
  const { data: mintPrice } = useReadContract({
    address: MONKERIA_CONTRACT,
    abi: MONKERIA_ABI,
    functionName: 'getMintPrice',
    args: address ? [address as `0x${string}`] : undefined,
    chainId: MONKERIA_CHAIN.id,
  });

  const { writeContractAsync } = useWriteContract();
  const [txHash, setTxHash] = useState<string | null>(null);

  const { isLoading: txLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}` | undefined,
  });

  const handleMint = async () => {
    if (!address) return alert('Connect your wallet first.');
    if (!tokenURI) return alert('Upload or generate your character first.');

    try {
      // ✅ normalize mint price to bigint
      const price = mintPrice ? BigInt(mintPrice as any) : 0n;
      const totalCost = price * BigInt(quantity);

      const hash = await writeContractAsync({
        address: MONKERIA_CONTRACT,
        abi: MONKERIA_ABI,
        functionName: 'mint',
        args: [tokenURI, quantity],
        value: totalCost,
      });

      setTxHash(hash);
    } catch (err) {
      console.error('❌ Mint failed:', err);
      alert('Mint failed. Try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-amber-100 p-6">
      <h1 className="text-3xl font-bold text-amber-200 mb-6">🧙‍♂️ Mint Your Monje</h1>

      <div className="w-full max-w-md space-y-4 bg-zinc-900/80 p-6 rounded-lg border border-amber-600">
        <input
          type="text"
          value={tokenURI}
          onChange={(e) => setTokenURI(e.target.value)}
          placeholder="ipfs://...metadata.json"
          className="w-full p-3 bg-gray-800 rounded text-white"
        />

        <input
          type="number"
          min="1"
          max="20"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-full p-3 bg-gray-800 rounded text-white"
        />

        <button
          disabled={txLoading}
          onClick={handleMint}
          className="w-full py-3 bg-amber-600 text-white rounded hover:bg-amber-700 transition disabled:opacity-50"
        >
          {txLoading ? 'Minting... ⏳' : `Mint for ${mintPrice ? (Number(mintPrice) / 1e18).toFixed(3) : '...'} ETH`}
        </button>

        {isSuccess && txHash && (
          <p className="text-green-400 mt-3 text-center">
            ✅ Minted successfully!<br />
            <a
              href={`https://sepolia.basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              View on BaseScan
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
