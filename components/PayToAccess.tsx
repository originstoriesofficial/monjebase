'use client';

import { useSendTransaction, useAccount } from 'wagmi';
import { parseEther } from 'viem';
import { base } from 'viem/chains';
import { useCallback } from 'react';

type Props = {
  address: string;
  priceEth: string;
};

export default function PayToAccess({ address, priceEth }: Props) {
  const { address: userAddress } = useAccount();
  const { sendTransaction, isPending } = useSendTransaction();

  const handlePayment = useCallback(() => {
    const receiver = process.env.NEXT_PUBLIC_PAYMENT_RECEIVER as `0x${string}`;
    if (!receiver) {
      console.error('❌ Missing NEXT_PUBLIC_PAYMENT_RECEIVER in .env');
      return;
    }

    sendTransaction({
      to: receiver,
      value: parseEther(priceEth),
      chainId: base.id, // ✅ use chainId instead of chain
    });
  }, [priceEth, sendTransaction]);

  return (
    <div className="text-center">
      <p className="mb-3">
        No NFT detected for {address.slice(0, 6)}… — please pay to unlock.
      </p>
      <button
        onClick={handlePayment}
        disabled={isPending}
        className="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600 disabled:opacity-50"
      >
        {isPending ? 'Processing…' : `Unlock for ${priceEth} ETH`}
      </button>
    </div>
  );
}
