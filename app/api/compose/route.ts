import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt, music_length_ms = 60000, output_format = 'mp3_44100_128' } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      console.error('Missing ELEVENLABS_API_KEY in environment variables');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const response = await fetch('https://api.elevenlabs.io/v1/music/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        prompt,
        music_length_ms,
        output_format,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('🎵 ElevenLabs music generation failed:', errText);
      return NextResponse.json({ error: 'Failed to generate music', details: errText }, { status: 500 });
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'inline; filename="monk-anthem.mp3"',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('🎵 Compose API Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
