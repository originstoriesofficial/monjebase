'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import styles from './page.module.css';
import PayToAccess from '../components/PayToAccess';
import Link from 'next/link';

export default function Home() {
  const { context, setMiniAppReady, isMiniAppReady } = useMiniKit();
  const [ownsNFT, setOwnsNFT] = useState<boolean | null>(null);

  const address =
    (context?.user as any)?.verified_addresses?.eth_addresses?.[0] ??
    (context?.user as any)?.address ??
    null;

  const username = context?.user?.username;

  // Initialize MiniKit (Farcaster connection)
  useEffect(() => {
    if (!isMiniAppReady) setMiniAppReady();
  }, [isMiniAppReady, setMiniAppReady]);

  // ✅ Only check ownership once Farcaster user context is ready
  useEffect(() => {
    if (address) {
      fetch(`/api/check-nft?address=${address}`)
        .then((r) => r.json())
        .then((d) => setOwnsNFT(d.ownsNFT))
        .catch(() => setOwnsNFT(false));
    }
  }, [address]);

  return (
    <div className={styles.container}>
      <header className={styles.headerWrapper}>
        {!context?.user ? (
          <p>Connecting Farcaster...</p>
        ) : (
          <p>Welcome, {username || `${address?.slice(0, 6)}...${address?.slice(-4)}`}</p>
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

        {/* ✅ Conditional user & NFT state handling */}
        {!context?.user ? (
          <p>Connecting Farcaster...</p>
        ) : ownsNFT === null ? (
          <p>Checking your Monje status...</p>
        ) : ownsNFT ? (
          <div className="text-center space-y-4">
            <p className="text-amber-400 text-lg">✨ You already own a Monje!</p>
            <Link
              href="/create"
              className="inline-block px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition"
            >
              Enter the Studio 🎵
            </Link>
          </div>
        ) : (
          <PayToAccess address={address!} priceEth="0.002" />
        )}
      </div>
    </div>
  );
}
