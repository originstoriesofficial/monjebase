'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { sdk } from '@farcaster/miniapp-sdk';
import Link from 'next/link';
import styles from './page.module.css';
import PayToAccess from '../components/PayToAccess';

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_URL || 'https://monjebase.vercel.app';

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [fid, setFid] = useState<number | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [ownsOrigin, setOwnsOrigin] = useState(false);
  const [ownsMonje, setOwnsMonje] = useState(false);
  const [mintPrice, setMintPrice] = useState<number>(0.002);
  const [loading, setLoading] = useState(false);

  // ✅ Authenticate user via Farcaster Quick Auth
  async function signIn() {
    try {
      const { token } = await sdk.quickAuth.getToken();
      setToken(token);

      // verify JWT on backend and get FID + address
      const res = await sdk.quickAuth.fetch(`${BACKEND_ORIGIN}/api/auth`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data?.fid) {
        setFid(data.fid);
      }
    } catch (err) {
      console.error('❌ Authentication failed:', err);
    }
  }

  function signOut() {
    setToken(null);
    setFid(null);
    setAddress(null);
  }

  // ✅ Once authenticated, check NFT ownership
  useEffect(() => {
    if (!fid) return;

    setLoading(true);
    fetch(`/api/check-nft?fid=${fid}`)
      .then((r) => r.json())
      .then((data) => {
        setOwnsOrigin(!!data.ownsOrigin);
        setOwnsMonje(!!data.ownsMonje);
        if (data.mintPrice) setMintPrice(data.mintPrice);
      })
      .catch((err) => console.error('NFT check failed:', err))
      .finally(() => setLoading(false));
  }, [fid]);

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
        {!token ? (
          <button
            onClick={signIn}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Sign In with Farcaster
          </button>
        ) : (
          <div>
            <p>✅ Authenticated as FID: {fid}</p>
            <button
              onClick={signOut}
              className="mt-2 px-3 py-1 bg-zinc-700 text-white rounded hover:bg-zinc-800"
            >
              Sign Out
            </button>
          </div>
        )}
      </header>

      <div className={styles.content}>
        <Image src="/sphere.svg" alt="Sphere" width={200} height={200} priority />
        <h1 className={styles.title}>La Monjería</h1>

        {!token ? (
          <p>Sign in to access your Monje.</p>
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
              You don’t hold OriginStory. Mint costs {mintPrice} ETH.
            </p>
            <PayToAccess address={address ?? ''} priceEth={mintPrice.toString()} />
          </div>
        )}
      </div>
    </div>
  );
}
