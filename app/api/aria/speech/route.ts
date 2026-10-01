import { NextResponse } from 'next/server';

const ARIA_VOICE_ID = process.env.HEYGEN_ARIA_VOICE_ID || 'FfFqvaTg0z8GSMLMTWln';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    const clean = typeof text === 'string' ? text.trim() : '';

    if (!clean) {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }

    const apiKey = process.env.HEYGEN_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'HEYGEN_API_KEY is not configured', fallback: true },
        { status: 503 }
      );
    }

    const response = await fetch('https://api.heygen.com/v3/voices/speech', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: clean.slice(0, 5000),
        voice_id: ARIA_VOICE_ID,
        input_type: 'text',
        speed: 0.96,
        locale: 'en-GB'
      }),
      cache: 'no-store'
    });

    const payload = await response.json().catch(() => null);
    const audioUrl = payload?.data?.audio_url;

    if (!response.ok || !audioUrl) {
      return NextResponse.json(
        {
          error: payload?.error?.message || payload?.message || 'HeyGen speech generation failed',
          fallback: true
        },
        { status: response.status || 502 }
      );
    }

    return NextResponse.json({
      audioUrl,
      duration: payload?.data?.duration ?? null,
      provider: 'heygen',
      voiceId: ARIA_VOICE_ID
    });
  } catch {
    return NextResponse.json(
      { error: 'ARIA speech service is unavailable', fallback: true },
      { status: 500 }
    );
  }
}
