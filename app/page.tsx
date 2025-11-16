'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Wallet } from '@coinbase/onchainkit/wallet';
import { useMiniKit, useAuthenticate } from '@coinbase/onchainkit/minikit';
import PayToAccess from '../components/PayToAccess';
import styles from './page.module.css';

export default function Home() {
  const { setMiniAppReady, isMiniAppReady, context } = useMiniKit();
  const { signIn } = useAuthenticate();

  const [address, setAddress] = useState<string | null>(null);
  const [ownsOrigin, setOwnsOrigin] = useState(false);
  const [ownsMonje, setOwnsMonje] = useState(false);
  const [mintPrice, setMintPrice] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);

  const user = context?.user;

  // ✅ Initialize MiniKit
  useEffect(() => {
    if (!isMiniAppReady) setMiniAppReady();
  }, [isMiniAppReady, setMiniAppReady]);

  // ✅ Detect wallet via Base provider (Coinbase injected EIP-1193)
  useEffect(() => {
    async function getBaseWallet() {
      if (typeof window === 'undefined') return;
      const provider = (window as any).ethereum;
      if (!provider?.request) return;

      try {
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        if (accounts?.[0]) setAddress(accounts[0]);
      } catch (e) {
        console.warn('No Base wallet connected yet');
      }
    }

    getBaseWallet();
  }, []);

  // ✅ Check NFT ownership
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

  // 🟣 Sign-in screen
  if (!user) {
    return (
      <div className={styles.container}>
        <header className={styles.headerWrapper}>
          <Wallet />
        </header>

        <Image src="/sphere.svg" alt="Sphere" width={200} height={200} priority />
        <h2 className="mb-6 text-lg text-white">Sign in with Base</h2>
        <button
          onClick={() => signIn()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
        >
          Sign In
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

  // 🟢 Authenticated + wallet connected
  return (
    <div className={styles.container}>
      <header className={styles.headerWrapper}>
        <Wallet />
      </header>

      <Image src="/sphere.svg" alt="Sphere" width={200} height={200} priority />
      <h1 className={styles.title}>La Monjería</h1>

      <p className="text-white mb-4">
        Welcome, <strong>@{user?.username ?? address ?? 'Guest'}</strong>
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
