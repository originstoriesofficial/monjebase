import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_KEY!,
});

export async function POST(req: Request) {
  const { animal, cape, design, hand } = await req.json();

  const prompt = `An editorial photograph of an animated ${design} ${animal}, wearing an elaborate ${cape}-inspired cape, holding a ${hand}, cinematic lighting, glossy, detailed, 4k, mystical tone.`;

  try {
    const result = await fal.subscribe("fal-ai/stable-cascade", {
      input: {
        prompt,
        image_size: "square_hd",
        guidance_scale: 4,
        enable_safety_checker: true,
        num_images: 1,
      },
    });

    const imageUrl = result?.data?.images?.[0]?.url;
    if (!imageUrl) {
      return NextResponse.json({ error: "Image generation failed" }, { status: 500 });
    }

    return NextResponse.json({ imageUrl });
  } catch (err) {
    console.error("❌ Fal error:", err);
    return NextResponse.json({ error: "Fal generation error" }, { status: 500 });
  }
}
