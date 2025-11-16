'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { sdk } from '@farcaster/miniapp-sdk';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import Link from 'next/link';
import PayToAccess from '../components/PayToAccess';
import styles from './page.module.css';

export default function Home() {
  const { context, setMiniAppReady, isMiniAppReady } = useMiniKit();
  const [address, setAddress] = useState<string | null>(null);
  const [ownsOrigin, setOwnsOrigin] = useState(false);
  const [ownsMonje, setOwnsMonje] = useState(false);
  const [mintPrice, setMintPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize MiniKit + Farcaster MiniApp SDK
  useEffect(() => {
    async function init() {
      try {
        // Wait for MiniApp environment to be ready
        if (!isMiniAppReady) setMiniAppReady();

        // If user context is available, grab their ETH/Base address
        const ethAddr =
          (context?.user as any)?.verified_addresses?.eth_addresses?.[0] ??
          (context?.user as any)?.address ??
          null;

        if (ethAddr) setAddress(ethAddr);

        // ✅ Tell Farcaster SDK we’re ready (this hides the splash screen)
        await sdk.actions.ready();
      } catch (err) {
        console.error('MiniApp init failed:', err);
      }
    }
    init();
  }, [context, isMiniAppReady, setMiniAppReady]);

  // Check NFT + token ownership
  useEffect(() => {
    if (!address) return;
    setLoading(true);

    fetch(`/api/check-nft?address=${address}`)
      .then((r) => r.json())
      .then((d) => {
        setOwnsOrigin(d.ownsOrigin);
        setOwnsMonje(d.ownsMonje);
        setMintPrice(d.mintPrice);
      })
      .catch((err) => console.error('Check failed', err))
      .finally(() => setLoading(false));
  }, [address]);

  if (loading) {
    return (
      <div className={styles.container}>
        <Image src="/sphere.svg" alt="Sphere" width={200} height={200} priority />
        <p>Checking your Monje status...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Image src="/sphere.svg" alt="Sphere" width={200} height={200} priority />
      <h1 className={styles.title}>La Monjería</h1>

      {!address ? (
        <p>Connect your wallet to begin.</p>
      ) : ownsMonje ? (
        <div className="text-center space-y-4">
          <p className="text-amber-300">🎵 You already own a Monje NFT!</p>
          <Link
            href="/music"
            className="px-4 py-3 bg-amber-600 text-white rounded hover:bg-amber-700 inline-block"
          >
            Go to Music Studio
          </Link>
        </div>
      ) : ownsOrigin ? (
        <div className="text-center space-y-4">
          <p className="text-green-400">🪙 You hold OriginStory — your mint is free!</p>
          <Link
            href="/create"
            className="px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 inline-block"
          >
            Create & Mint Your Monje
          </Link>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <p className="text-amber-400">
            You don’t hold OriginStory. Mint costs {mintPrice ?? 0.002} ETH.
          </p>
          <PayToAccess address={address} priceEth="0.002" />
        </div>
      )}
    </div>
  );
}
