'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import styles from './score.module.css';
// import { useHasMonjeNFT } from '@/lib/hooks/useHasMonjeNFT'; // ❌ Commented out for now

const musicStyles = [
  'Tango', 'Tango Electronic', 'Cumbia', 'Cumbia 420', 'Reggaeton', 'Neo-Reggaeton', 'Dembow',
  'Salsa', 'Bachata', 'Bachata Fusion', 'Merengue', 'Samba', 'Bossa Nova',
  'Latin Pop', 'Latin Trap', 'Latin House', 'Latin Jazz', 'Latin Soul', 'Latin R&B',
  'Brazilian Funk (Funk Carioca)', 'Afro-Latin', 'Folklore Argentino', 'Folktronica',
  'Andean Electronic', 'Electro-Latino', 'Bolero', 'Corridos Tumbados', 'Tango Techno',
  'Cumbia Electronica', 'Reggaeton Ambient', 'Reggaeton Jazz', 'Reggaeton Gospel',
  'Latin Chillwave', 'Latin Lo-Fi', 'Andean Techno', 'Amazonian Bass',
  'Latin Drill', 'Bossa Nova Electronic', 'Bossa Nova Trap', 'Bossa Nova House',
];

export default function MusicPage() {
  const { isConnected } = useAccount();
  // const { hasNFT, isLoading } = useHasMonjeNFT(); // ❌ Temporarily disabled

  // 🔒 Wallet not connected
  if (!isConnected) {
    return (
      <div className={styles.center}>
        <p className={styles.muted}>🔗 Please connect your wallet to continue.</p>
      </div>
    );
  }

  /* ❌ NFT gating (commented for now)
  if (isLoading) {
    return (
      <div className={styles.center}>
        <p className={styles.muted}>Checking NFT ownership...</p>
      </div>
    );
  }

  if (!hasNFT) {
    return (
      <div className={styles.center}>
        <p className={styles.restrictedTitle}>🧙 Access Restricted</p>
        <p className={styles.restrictedText}>
          You must hold a <strong>Monje NFT</strong> to unlock the Music Studio.
          <br />
          Go mint your character first on the{' '}
          <a href="/create" className={styles.link}>Create page</a>.
        </p>
      </div>
    );
  }
  */

  // ✅ Open access to Music Studio
  return <MusicComposer />;
}

// 🎵 Music Studio UI
function MusicComposer() {
  const [prompt, setPrompt] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [style, setStyle] = useState(musicStyles[0]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSong = async () => {
    setLoading(true);
    setError(null);
    setAudioUrl(null);

    try {
      const fullPrompt = `${prompt} in the style of ${style}. ${lyrics ? 'Lyrics: ' + lyrics : ''}`;
      const res = await fetch('/api/compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          music_length_ms: 60000,
          output_format: 'mp3_44100_128',
        }),
      });

      if (!res.ok) throw new Error('Failed to generate song');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error generating music:', msg);
      setError('Error generating music. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🎶 Create Your Monje Anthem</h1>

      <div className={styles.card}>
        {/* 🎼 Style */}
        <label className={styles.label}>Style</label>
        <select
          className={styles.select}
          value={style}
          onChange={(e) => setStyle(e.target.value)}
        >
          {musicStyles.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* 📝 Prompt */}
        <label className={styles.label}>Lore / Story</label>
        <textarea
          className={styles.textarea}
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your Monje’s story..."
        />

        {/* 🎤 Lyrics */}
        <label className={styles.label}>Optional Lyrics</label>
        <textarea
          className={styles.textarea}
          rows={2}
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          placeholder="Add lyrics if you'd like..."
        />

        {/* ▶️ Button */}
        <button
          onClick={generateSong}
          disabled={loading || !prompt}
          className={styles.button}
        >
          {loading ? '🎧 Generating...' : '🎼 Generate Anthem'}
        </button>

        {error && <p className={styles.error}>{error}</p>}

        {audioUrl && (
          <div className={styles.audioBox}>
            <audio controls src={audioUrl} className={styles.audio} />
            <a
              href={audioUrl}
              download={`monje-anthem-${Date.now()}.mp3`}
              className={styles.download}
            >
              ⬇️ Download Anthem
            </a>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className={styles.navbar}>
        <a href="/" className={styles.navItem}>🏰 Home</a>
        <a href="/create" className={styles.navItem}>🎨 Create</a>
        <a href="/score" className={styles.navItem}>🎵 Play</a>
      </nav>
    </div> // ✅ closing root div
  ); // ✅ closing return
} // ✅ closing component
