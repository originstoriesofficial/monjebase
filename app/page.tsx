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

  // ❌ Ownership check logic (kept for dev reference)
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

  // 🟢 Main landing page
  return (
    <div className={styles.container}>
      <Image src="/sphere.svg" alt="Sphere" width={200} height={200} priority />
      <h1 className={styles.title}>La Monjería</h1>

      <p className="text-zinc-300 text-center mb-8 max-w-md">
        A creative hub on Base where you can mint your own Monje NFT and play
        your generated beats. Powered by AI + Base + OriginStory.
      </p>

      {user && (
        <p className="text-gray-400 text-sm mb-6">
          Connected as <strong>@{user?.username ?? 'base user'}</strong>
          {address && (
            <>
              <br />
              <span className="text-xs text-zinc-500">{address}</span>
            </>
          )}
        </p>
      )}

      <div className="flex flex-col space-y-4 w-full max-w-xs">
        <Link
          href="/create"
          className="bg-green-600 hover:bg-green-700 text-white text-center py-3 rounded-lg font-semibold transition"
        >
          🎨 Create Your Monje
        </Link>

        <Link
          href="/score"
          className="bg-amber-600 hover:bg-amber-700 text-white text-center py-3 rounded-lg font-semibold transition"
        >
          🎵 Play Music Studio
        </Link>
      </div>

      {/* ❌ Old conditional display (preserved for devs)
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

      <footer className="mt-12 text-xs text-zinc-500 text-center">
        Built with <span className="text-amber-400">Base</span> •{' '}
        <span className="text-green-400">OriginStory</span> •{' '}
        <span className="text-blue-400">AI</span>
      </footer>
    </div>
  );
}
