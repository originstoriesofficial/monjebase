'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import PayToAccess from '../components/PayToAccess';
import styles from './page.module.css';

export default function Home() {
  const { setMiniAppReady, isMiniAppReady, context } = useMiniKit();
  const user = context?.user;

  const [address, setAddress] = useState<string | null>(null);
  const [ownsOrigin, setOwnsOrigin] = useState(false);
  const [ownsMonje, setOwnsMonje] = useState(false);
  const [mintPrice, setMintPrice] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);

  /** ✅ Initialize Base Mini App */
  useEffect(() => {
    if (!isMiniAppReady) setMiniAppReady();
  }, [isMiniAppReady, setMiniAppReady]);

  /** ✅ Extract Base custody wallet (Base App identity) */
  useEffect(() => {
    if (!user) return;

    const baseAddress =
      (user as any)?.custody_address ||
      (user as any)?.verifiedAddresses?.[0]?.address ||
      null;

    if (baseAddress && baseAddress !== address) {
      setAddress(baseAddress);
    }
  }, [user, address]);

  // ❌ Ownership check logic (kept for future use)
  /*
  useEffect(() => {
    if (!address) return;
    setChecking(true);

    fetch(`/api/auth/check-nft?address=${address}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Ownership check failed');
        console.log('✅ Ownership data:', d);
        setOwnsOrigin(!!d.ownsOrigin);
        setOwnsMonje(!!d.ownsMonje);
        setMintPrice(d.mintPrice ?? 0.002);
      })
      .catch((err) => {
        console.error('NFT check failed:', err);
        setOwnsOrigin(false);
        setOwnsMonje(false);
        setMintPrice(0.002);
      })
      .finally(() => setChecking(false));
  }, [address]);
  */

  // 🟢 Minimal, production landing page
  return (
    <div className={styles.container}>
      {/* Hero Icon */}
      <Image src="/castle.svg" alt="La Monjería" width={120} height={120} priority />

      {/* Title */}
      <h1 className={styles.title}>La Monjería</h1>

      {/* Optional user info */}
      {user && (
        <p className="text-gray-400 text-sm mb-6 text-center">
          Connected as <strong>@{user?.username ?? 'base user'}</strong>
          {address && (
            <>
              <br />
              <span className="text-xs text-zinc-500">{address}</span>
            </>
          )}
        </p>
      )}

      {/* Core Actions */}
      <div className={styles.actions}>
        <Link href="/create" className={`${styles.button} ${styles.primary}`}>
          🎨 Create
        </Link>
        <Link href="/score" className={`${styles.button} ${styles.secondary}`}>
          🎵 Play
        </Link>
      </div>

      {/* ❌ Old NFT logic preserved for devs
      {ownsMonje ? (
        <div className="text-center space-y-4 mt-8">
          <p className="text-amber-300">🎵 You already own a Monje NFT!</p>
          <Link href="/score" className="px-4 py-3 bg-amber-600 text-white rounded hover:bg-amber-700">
            Go to Music Studio
          </Link>
        </div>
      ) : ownsOrigin ? (
        <div className="text-center space-y-4 mt-8">
          <p className="text-green-400">🪙 You hold OriginStory — your mint is free!</p>
          <Link href="/create" className="px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700">
            Create & Mint Your Monje
          </Link>
        </div>
      ) : (
        <div className="text-center space-y-4 mt-8">
          <p className="text-amber-400">
            You don’t hold OriginStory. Mint costs {mintPrice ?? 0.002} ETH.
          </p>
          {address && (
            <PayToAccess address={address} priceEth={(mintPrice ?? 0.002).toString()} />
          )}
        </div>
      )}
      */}

      {/* Bottom Nav */}
      <nav className={styles.navbar}>
        <Link href="/" className={styles.navItem}>🏰 Home</Link>
        <Link href="/create" className={styles.navItem}>🎨 Create</Link>
        <Link href="/score" className={styles.navItem}>🎵 Play</Link>
      </nav>
    </div>
  );
}
