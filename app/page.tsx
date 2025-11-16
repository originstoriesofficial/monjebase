'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import styles from './page.module.css';
import PayToAccess from '../components/PayToAccess';
import Link from 'next/link';

export default function Home() {
  const { context, setMiniAppReady, isMiniAppReady } = useMiniKit();

  // ✅ get wallet address safely (skip failed farcaster lookups)
  const address =
    (context?.user?.verified_addresses?.eth_addresses?.[0] as string | undefined) ??
    (context?.user?.address as string | undefined) ??
    null;

  const username = context?.user?.username ?? '';

  const [ownsOrigin, setOwnsOrigin] = useState(false);
  const [ownsMonje, setOwnsMonje] = useState(false);
  const [mintPrice, setMintPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ ensure MiniKit ready (but skip waiting for neynar)
  useEffect(() => {
    if (!isMiniAppReady) setMiniAppReady();
  }, [isMiniAppReady, setMiniAppReady]);

  // ✅ only query your own /api/check-nft (no external farcaster/neynar calls)
  useEffect(() => {
    if (!address) return;
    setLoading(true);
    fetch(`/api/check-nft?address=${address}`)
      .then((r) => r.json())
      .then((d) => {
        setOwnsOrigin(!!d.ownsOrigin);
        setOwnsMonje(!!d.ownsMonje);
        setMintPrice(d.mintPrice ?? 0.002);
      })
      .catch((err) => {
        console.error('Check failed:', err);
      })
      .finally(() => setLoading(false));
  }, [address]);

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Checking your Monje status...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.headerWrapper}>
        {username ? (
          <p>Welcome, {username}</p>
        ) : address ? (
          <p>{address.slice(0, 6)}...{address.slice(-4)}</p>
        ) : (
          <p>Connect wallet...</p>
        )}
      </header>

      <div className={styles.content}>
        <Image
          src="/sphere.svg"
          alt="Sphere"
          width={200}
          height={200}
          priority
        />
        <h1 className={styles.title}>La Monjería</h1>

        {!address ? (
          <p>Sign in with Base to begin.</p>
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
    </div>
  );
}
