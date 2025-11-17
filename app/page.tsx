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
  const [refreshing, setRefreshing] = useState(false);

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

  /** ✅ Check NFT / token ownership */
  useEffect(() => {
    if (!address) return;
    setChecking(true);

    fetch(`/api/auth/check-nft?address=${address}`)
      .then((r) => r.json())
      .then((d) => {
        setOwnsOrigin(d.ownsOrigin);
        setOwnsMonje(d.ownsMonje);
        setMintPrice(d.mintPrice);
      })
      .catch((err) => console.error('NFT check failed:', err))
      .finally(() => setChecking(false));
  }, [address]);

  /** 🔄 Refresh Base user context manually */
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Re-run the MiniKit setup to refresh the Base app session
      setMiniAppReady();
    } catch (err) {
      console.error('Failed to refresh Base identity:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // 🟣 Not signed in
  if (!user) {
    return (
      <div className={styles.container}>
        <Image src="/sphere.svg" alt="Sphere" width={200} height={200} priority />
        <h2 className="mb-6 text-lg text-white">Sign in with Base</h2>
        <p className="text-gray-400 text-sm mb-4">
          Open this app inside the <strong>Base mobile app</strong> to connect automatically.
        </p>
        <button
          onClick={handleRefresh}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm"
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh Base Identity'}
        </button>
      </div>
    );
  }

  // 🟢 Checking ownership
  if (checking) {
    return (
      <div className={styles.container}>
        <Image src="/sphere.svg" alt="Sphere" width={200} height={200} priority />
        <p>Checking your Monje + OriginStory status...</p>
      </div>
    );
  }

  // 🟢 Authenticated + loaded
  return (
    <div className={styles.container}>
      <Image src="/sphere.svg" alt="Sphere" width={200} height={200} priority />
      <h1 className={styles.title}>La Monjería</h1>

      <p className="text-white mb-2">
        Welcome, <strong>@{user?.username ?? 'base user'}</strong>
      </p>

      {address && (
        <p className="text-gray-400 mb-4 break-all text-xs">
          Connected Base address: <br />
          {address}
        </p>
      )}

      <button
        onClick={handleRefresh}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md mb-4 text-sm"
        disabled={refreshing}
      >
        {refreshing ? 'Refreshing...' : 'Refresh Base Identity'}
      </button>

      {ownsMonje ? (
        <div className="text-center space-y-4">
          <p className="text-amber-300">🎵 You already own a Monje NFT!</p>
          <Link
            href="/score"
            className="px-4 py-3 bg-amber-600 text-white rounded hover:bg-amber-700"
          >
            Go to Music Studio
          </Link>
        </div>
      ) : ownsOrigin ? (
        <div className="text-center space-y-4">
          <p className="text-green-400">🪙 You hold OriginStory — your mint is free!</p>
          <Link
            href="/create"
            className="px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Create & Mint Your Monje
          </Link>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <p className="text-amber-400">
            You don’t hold OriginStory. Mint costs {mintPrice ?? 0.002} ETH.
          </p>
          {address && (
            <PayToAccess
              address={address}
              priceEth={(mintPrice ?? 0.002).toString()}
            />
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
