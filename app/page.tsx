'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { sdk } from '@farcaster/miniapp-sdk';
import Link from 'next/link';
import PayToAccess from '../components/PayToAccess';
import styles from './page.module.css';

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [fid, setFid] = useState<number | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [ownsOrigin, setOwnsOrigin] = useState(false);
  const [ownsMonje, setOwnsMonje] = useState(false);
  const [mintPrice, setMintPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  async function handleSignIn() {
    try {
      const { token } = await sdk.quickAuth.getToken();
      setToken(token);

      const res = await sdk.quickAuth.fetch('/api/verify', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data?.userFid) setFid(data.userFid);

      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload?.sub) setAddress(payload.sub);
    } catch (err) {
      console.error('Authentication failed:', err);
    }
  }

  useEffect(() => {
    sdk.actions.ready().catch(console.error);
  }, []);

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
      .catch((err) => console.error('Check failed', err))
      .finally(() => setLoading(false));
  }, [address]);

  if (!token) {
    return (
      <div className={styles.container}>
        <Image src="/sphere.svg" alt="Sphere" width={200} height={200} priority />
        <h2 className="mb-6 text-lg text-white">Sign in to continue</h2>
        <button
          onClick={handleSignIn}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
        >
          Sign In with Farcaster
        </button>
      </div>
    );
  }

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
          <Link href="/music" className="px-4 py-3 bg-amber-600 text-white rounded hover:bg-amber-700">
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
          <PayToAccess address={address} priceEth={(mintPrice ?? 0.002).toString()} />
          <p className="text-zinc-400 text-sm mt-4">
            Or <Link href="/create" className="underline text-amber-300">go create your Monje</Link> now.
          </p>
        </div>
      )}
    </div>
  );
}
