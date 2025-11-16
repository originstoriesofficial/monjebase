import { NextResponse } from 'next/server';
import { uploadToIPFS } from '@/lib/ipfs';

// Handles metadata + image URL upload to IPFS (using your helper)
export async function POST(req: Request) {
  try {
    const { image, animal, cape, design, hand } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'Missing image URL' }, { status: 400 });
    }

    // Build full NFT metadata object
    const metadata = {
      name: `Monje of ${animal || 'Unknown'}`,
      description: `A ${design || 'unique'} Monje wearing a ${cape || 'mystical'} cape and holding ${hand || 'something powerful'}.`,
      image,
      attributes: [
        { trait_type: 'Animal', value: animal },
        { trait_type: 'Cape', value: cape },
        { trait_type: 'Design', value: design },
        { trait_type: 'Hand Item', value: hand },
      ],
    };

    // Use your existing upload helper
    const result = await uploadToIPFS(metadata);

    if (!result || !result.url) {
      throw new Error('IPFS upload failed');
    }

    return NextResponse.json({ ipfsUrl: result.url });
  } catch (err) {
    console.error('❌ Upload API error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
