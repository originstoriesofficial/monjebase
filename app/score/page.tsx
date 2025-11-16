'use client';

import React, { useState } from 'react';
import { useHasMonjeNFT } from '@/lib/hooks/useHasMonjeNFT';
import { useAccount } from 'wagmi';

const styles = [
  'Electronic', 'Hip-Hop', 'Trap', 'Lo-fi', 'Jazz', 'Ambient',
  'Synthwave', 'Orchestral', 'Fantasy', 'Cyberpunk', 'Retro', 'Rock',
  'Funk', 'Drill', 'Dubstep', 'Techno', 'Industrial', 'Afrobeats',
  'Pop', 'Ballad', 'Hardstyle', 'Epic', 'Darkwave', 'R&B', 'Chillwave',
  'Glitch', 'Punk', 'EDM', 'Metal', 'Reggaeton', 'Acoustic', 'Minimal',
  'Experimental', 'Dream Pop', 'Gospel', 'Neo Soul', 'Boom Bap',
  'Future Bass', 'Trap Soul', 'Post-Rock', 'Shoegaze', 'Vaporwave',
  'Bossa Nova', 'Trance',
];

export default function MusicPage() {
  const { isConnected } = useAccount();
  const { hasNFT, isLoading } = useHasMonjeNFT();

  // 🔒 Wallet not connected
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <p className="text-zinc-400 text-lg">🔗 Please connect your wallet to continue.</p>
      </div>
    );
  }

  // ⏳ Checking ownership
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <p className="text-zinc-400">Checking NFT ownership...</p>
      </div>
    );
  }

  // 🚫 Not a holder
  if (!hasNFT) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center text-white">
        <p className="text-amber-300 text-xl mb-4">🧙 Access Restricted</p>
        <p className="text-zinc-400 max-w-md">
          You must hold a <strong>Monje NFT</strong> to unlock the Music Studio.
          <br />
          Go mint your character first on the <a href="/create" className="text-amber-400 underline">Create page</a>.
        </p>
      </div>
    );
  }

  // ✅ Holder → show composer
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
    <div className="flex flex-col items-center justify-center p-6 min-h-screen bg-black text-white">
      <h1 className="text-3xl font-bold mb-4 text-amber-200">
        🎶 Create Your Monk Anthem
      </h1>

      <div className="w-full max-w-2xl bg-black/80 p-6 rounded-lg text-amber-100 border border-amber-600 space-y-4">

        {/* 🎼 Style */}
        <label className="block text-sm text-amber-300 text-left">
          Style
        </label>
        <select
          className="w-full p-3 bg-gray-900 rounded"
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
        <label className="block text-sm text-amber-300 text-left">
          Lore / Story
        </label>
        <textarea
          className="w-full p-3 bg-gray-900 rounded"
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your monk's story..."
        />

        {/* 🎤 Lyrics */}
        <label className="block text-sm text-amber-300 text-left mt-2">
          Optional Lyrics
        </label>
        <textarea
          className="w-full p-3 bg-gray-900 rounded"
          rows={2}
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          placeholder="Add lyrics if you'd like..."
        />

        {/* ▶️ Button */}
        <button
          onClick={generateSong}
          disabled={loading || !prompt}
          className="w-full mt-4 py-3 bg-amber-600 text-white rounded hover:bg-amber-700 transition disabled:opacity-50"
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
