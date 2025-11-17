'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
// import { useHasMonjeNFT } from '@/lib/hooks/useHasMonjeNFT'; // ❌ Commented out for now

const styles = [
  'Tango', 'Tango Electronic', 'Cumbia', 'Cumbia 420', 'Reggaeton', 'Neo-Reggaeton', 'Dembow',
  'Salsa', 'Bachata', 'Bachata Fusion', 'Merengue', 'Samba', 'Bossa Nova',
  'Latin Pop', 'Latin Trap', 'Latin House', 'Latin Jazz', 'Latin Soul', 'Latin R&B',
  'Brazilian Funk (Funk Carioca)', 'Afro-Latin', 'Folklore Argentino', 'Folktronica',
  'Andean Electronic', 'Electro-Latino', 'Bolero', 'Corridos Tumbados', 'Tango Techno',
  'Cumbia Electronica', 'Reggaeton Ambient', 'Reggaeton Jazz', 'Reggaeton Gospel',
  'Latin Chillwave', 'Latin Lo-Fi', 'Andean Techno', 'Amazonian Bass',
  'Latin Drill', 'Bossa Nova Electronic', 'Bossa Nova Trap', 'Bossa Nova House'
];

export default function MusicPage() {
  const { isConnected } = useAccount();
  // const { hasNFT, isLoading } = useHasMonjeNFT(); // ❌ Temporarily disabled

  // 🔒 Wallet not connected
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <p className="text-zinc-400 text-lg">🔗 Please connect your wallet to continue.</p>
      </div>
    );
  }

  /*  // ❌ NFT gating (commented for now)
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <p className="text-zinc-400">Checking NFT ownership...</p>
      </div>
    );
  }

  if (!hasNFT) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center text-white">
        <p className="text-amber-300 text-xl mb-4">🧙 Access Restricted</p>
        <p className="text-zinc-400 max-w-md">
          You must hold a <strong>Monje NFT</strong> to unlock the Music Studio.
          <br />
          Go mint your character first on the{' '}
          <a href="/create" className="text-amber-400 underline">Create page</a>.
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
  const [style, setStyle] = useState(styles[0]);
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
    <div className="flex flex-col items-center justify-center p-6 min-h-screen bg-[var(--bg-gradient)] text-white">
      <h1 className="text-3xl font-bold mb-4 text-amber-300 drop-shadow-[var(--border-glow)]">
        🎶 Create Your Monje Anthem
      </h1>

      <div className="w-full max-w-2xl bg-[var(--card-bg)] p-6 rounded-xl border border-amber-600 shadow-lg space-y-4">
        {/* 🎼 Style */}
        <label className="block text-sm text-amber-300 text-left">
          Style
        </label>
        <select
          className="w-full p-3 bg-zinc-900 rounded border border-zinc-700 focus:ring-2 focus:ring-amber-600 outline-none"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
        >
          {styles.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* 📝 Prompt */}
        <label className="block text-sm text-amber-300 text-left">Lore / Story</label>
        <textarea
          className="w-full p-3 bg-zinc-900 rounded border border-zinc-700 text-white"
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your Monje’s journey..."
        />

        {/* 🎤 Lyrics */}
        <label className="block text-sm text-amber-300 text-left mt-2">
          Optional Lyrics
        </label>
        <textarea
          className="w-full p-3 bg-zinc-900 rounded border border-zinc-700 text-white"
          rows={2}
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          placeholder="Add lyrics if you’d like..."
        />

        {/* ▶️ Button */}
        <button
          onClick={generateSong}
          disabled={loading || !prompt}
          className="w-full mt-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
        >
          {loading ? '🎧 Generating...' : '🎼 Generate Anthem'}
        </button>

        {error && <p className="text-red-400 text-center mt-3">{error}</p>}

        {audioUrl && (
          <div className="mt-4 text-center">
            <audio controls src={audioUrl} className="w-full rounded-lg" />
            <a
              href={audioUrl}
              download={`monje-anthem-${Date.now()}.mp3`}
              className="mt-3 inline-block px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
            >
              ⬇️ Download Anthem
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
