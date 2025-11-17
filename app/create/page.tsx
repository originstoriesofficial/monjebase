'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAccount, useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { MONKERIA_ABI } from '@/lib/contract';
import styles from './create.module.css';

const MONKERIA_ADDRESS = '0x3D1E34Aa63d26f7b1307b96a612a40e5F8297AC7';
const CHAIN = process.env.NODE_ENV === 'production' ? base : baseSepolia;

const QUESTIONS = [
  { key: 'animal', label: '🐾 What animal type is your Monje?' },
  { key: 'cape', label: '🧣 Describe your Monje’s cape (color, texture, pattern).' },
  { key: 'design', label: '🎨 Describe the overall design or vibe (e.g., mystical, futuristic).' },
  { key: 'hand', label: '✋ What is your Monje holding in their hand?' },
];

type FormState = {
  animal: string;
  cape: string;
  design: string;
  hand: string;
};

export default function CreatePage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [ownsOrigin, setOwnsOrigin] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    animal: '',
    cape: '',
    design: '',
    hand: '',
  });
  const [image, setImage] = useState<string | null>(null);
  const [metadataUrl, setMetadataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [minting, setMinting] = useState(false);

  const currentQuestion = QUESTIONS[step];

  // ❌ Ownership check logic (kept for future use)
  /*
  useEffect(() => {
    if (!address) return;
    fetch(`/api/auth/check-nft?address=${address}`)
      .then((r) => r.json())
      .then((d) => setOwnsOrigin(d.ownsOrigin))
      .catch((err) => console.error('Origin check failed:', err));
  }, [address]);
  */

  // 🧠 Step progression
  async function nextQuestion(value: string) {
    const updated = { ...form, [currentQuestion.key]: value };
    setForm(updated);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      await handleGenerate(updated);
    }
  }

  // 🪄 Generate + upload
  async function handleGenerate(data: FormState) {
    setLoading(true);
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!result?.imageUrl) throw new Error('Image generation failed');
      setImage(result.imageUrl);

      const metaRes = await fetch('/api/upload-ipfs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Monje of ${data.animal}`,
          description: `A ${data.design} Monje with a ${data.cape} cape, holding ${data.hand}.`,
          image: result.imageUrl,
          attributes: [
            { trait_type: 'Animal', value: data.animal },
            { trait_type: 'Cape', value: data.cape },
            { trait_type: 'Design', value: data.design },
            { trait_type: 'Hand Item', value: data.hand },
          ],
        }),
      });

      const metaData = await metaRes.json();
      if (metaData?.ipfsUrl) setMetadataUrl(metaData.ipfsUrl);
    } catch (err) {
      console.error('❌ Generation or upload failed:', err);
      alert('Error generating your Monje. Try again.');
    } finally {
      setLoading(false);
    }
  }

  // 🪙 Mint logic
  async function handleMint() {
    if (!metadataUrl || !isConnected || !address) {
      alert('⚠️ Connect your wallet and generate first.');
      return;
    }

    try {
      setMinting(true);
      await writeContractAsync({
        chainId: CHAIN.id,
        address: MONKERIA_ADDRESS,
        abi: MONKERIA_ABI,
        functionName: 'mint',
        args: [metadataUrl, 1],
        value: ownsOrigin ? 0n : parseEther('0.002'),
      });

      alert(ownsOrigin ? '✅ Free Mint successful!' : '✅ Mint successful!');
      router.push('/score');
    } catch (err) {
      console.error('❌ Mint failed:', err);
      alert('Mint failed. Try again.');
    } finally {
      setMinting(false);
    }
  }

  // 🟢 Clean, mobile-first UI
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🧘 Create Your Monje</h1>

      {!image ? (
        <>
          <h2 className={styles.question}>{currentQuestion.label}</h2>
          <input
            key={currentQuestion.key}
            className={styles.input}
            placeholder="Type your answer..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                nextQuestion(e.currentTarget.value.trim());
                e.currentTarget.value = '';
              }
            }}
          />
          <p className={styles.hint}>Press Enter to continue</p>
        </>
      ) : (
        <div className="text-center space-y-4">
          <Image
            src={image}
            alt="Generated Monje"
            width={512}
            height={512}
            className={styles.image}
          />
          <button
            onClick={handleMint}
            disabled={minting}
            className={`${styles.button} ${
              ownsOrigin ? styles.freeMint : styles.paidMint
            }`}
          >
            {minting
              ? 'Minting...'
              : ownsOrigin
              ? '🪙 Free Mint for Origin Holders'
              : '🪙 Mint for 0.002 ETH'}
          </button>
        </div>
      )}

      {loading && <p className={styles.loading}>✨ Summoning your Monje...</p>}

      {/* Bottom Navigation */}
      <nav className={styles.navbar}>
        <a href="/" className={styles.navItem}>🏰 Home</a>
        <a href="/create" className={styles.navItem}>🎨 Create</a>
        <a href="/score" className={styles.navItem}>🎵 Play</a>
      </nav>
    </div>
  );
}
