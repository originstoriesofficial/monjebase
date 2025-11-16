import { useAccount, useReadContract } from 'wagmi'
import { MONKERIA_ABI, MONKERIA_CONTRACT } from '@/lib/contract'

export function useHasMonjeNFT() {
  const { address } = useAccount();

  const { data, isLoading, error } = useReadContract({
    address: MONKERIA_CONTRACT,
    abi: MONKERIA_ABI,
    functionName: 'balanceOf',
    args: address ? [address as `0x${string}`] : undefined, // ✅ Fix here
  });

  const hasNFT = !!(data && BigInt(data as bigint) > 0n);
  return { hasNFT, isLoading, error };
}
