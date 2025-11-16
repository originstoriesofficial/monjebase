export async function uploadToIPFS(metadata: Record<string, any>) {
    try {
      const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
        },
        body: JSON.stringify(metadata),
      });
  
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
  
      return {
        hash: data.IpfsHash,
        url: `ipfs://${data.IpfsHash}`,
      };
    } catch (err) {
      console.error('❌ uploadToIPFS failed:', err);
      throw err;
    }
  }
  