'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Wallet } from '@coinbase/onchainkit/wallet';
import { useMiniKit, useQuickAuth } from '@coinbase/onchainkit/minikit';
import PayToAccess from '../components/PayToAccess';
import styles from './page.module.css';

export default function Home() {
  const { setMiniAppReady, isMiniAppReady, context } = useMiniKit();
  const { data, isLoading, error } = useQuickAuth<{ userFid: string }>('/api/verify');

  const [ownsOrigin, setOwnsOrigin] = useState(false);
  const [ownsMonje, setOwnsMonje] = useState(false);
  const [mintPrice, setMintPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    if (!isMiniAppReady) setMiniAppReady();
  }, [isMiniAppReady, setMiniAppReady]);

  const user = context?.user;

  // ✅ Step 1: Resolve custody address server-side via Neynar
  useEffect(() => {
    if (!data?.userFid) return;
    (async () => {
      try {
        const res = await fetch(`/api/neynar/user-by-fid?fid=${data.userFid}`);
        const json = await res.json();
        setAddress(json.custody_address);
      } catch (err) {
        console.error('Failed to resolve address:', err);
      }
    })();
  }, [data?.userFid]);

  // ✅ Step 2: Check NFT ownership
  useEffect(() => {
    if (!address) return;
    setLoading(true);
    fetch(`/api/auth/check-nft?address=${address}`)
      .then((r) => r.json())
      .then((d) => {
        setOwnsOrigin(d.ownsOrigin);
        setOwnsMonje(d.ownsMonje);
        setMintPrice(d.mintPrice);
      })
      .catch((err) => console.error('NFT check failed:', err))
      .finally(() => setLoading(false));
  }, [address]);

  // ✅ Step 3: Render
  if (!data && !user) {
    return (
      <div className={styles.container}>
        <header className={styles.headerWrapper}>
          <Wallet />
        </header>

        <Image src="/sphere.svg" alt="Sphere" width={200} height={200} priority />
        <h2 className="mb-6 text-lg text-white">Sign in to continue</h2>
        <p className="text-zinc-400">Use your Base or Farcaster account to sign in.</p>
        {error && <p className="text-red-400 mt-4">{error.message}</p>}
      </div>
    );
  }

  if (loading || isLoading) {
    return (
      <div className={styles.container}>
        <Image src="/sphere.svg" alt="Sphere" width={200} height={200} priority />
        <p>Checking your Monje status...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.headerWrapper}>
        <Wallet />
      </header>

      <Image src="/sphere.svg" alt="Sphere" width={200} height={200} priority />
      <h1 className={styles.title}>La Monjería</h1>

      <p className="text-white mb-4">
        Welcome, <strong>@{user?.username ?? data?.userFid}</strong>
      </p>

      {ownsMonje ? (
        <div className="text-center space-y-4">
          <p className="text-amber-300">🎵 You already own a Monje NFT!</p>
          <Link href="/score" className="px-4 py-3 bg-amber-600 text-white rounded hover:bg-amber-700">
            Go to Music Studio
          </Link>
        </div>
      ) : ownsOrigin ? (
        <div className="text-center space-y-4">
          <p className="text-green-400">🪙 You hold OriginStory — your mint is free!</p>
          <Link href="/create" className="px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700">
            Create & Mint Your Monje
          </Link>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <p className="text-amber-400">
            You don’t hold OriginStory. Mint costs {mintPrice ?? 0.002} ETH.
          </p>
          {address && (
            <PayToAccess address={address} priceEth={(mintPrice ?? 0.002).toString()} />
          )}
          <p className="text-zinc-400 text-sm mt-4">
            Or{' '}
            <Link href="/create" className="underline text-amber-300">
              go create your Monje
            </Link>{' '}
            now.
          </p>
        </div>
      )}
    </div>
  );
}
