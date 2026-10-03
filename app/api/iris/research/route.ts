import { NextRequest, NextResponse } from 'next/server';
import { orviaReachConfigured, searchOrviaReach, type OrviaReachChannel } from '@/lib/orvia-reach';

export const dynamic = 'force-dynamic';

const ALLOWED_CHANNELS = new Set<OrviaReachChannel>([
  'web','search','github','youtube','rss','twitter','reddit','linkedin','facebook','instagram'
]);

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ status: 'INCOMPLETE', reason: 'I could not read that research request.' }, { status: 400 });
  }

  const query = String(body?.query || '').trim();
  if (!query) {
    return NextResponse.json({ status: 'INCOMPLETE', reason: 'Tell IRIS what you want researched.' }, { status: 400 });
  }

  if (!orviaReachConfigured()) {
    return NextResponse.json({
      status: 'NOT_CONFIGURED',
      reason: 'ORVIA Reach is present in Command but its research worker has not been activated yet.'
    }, { status: 503 });
  }

  const requested = Array.isArray(body?.channels) ? body.channels.map(String) : [];
  const channels = requested.filter((value: string): value is OrviaReachChannel => ALLOWED_CHANNELS.has(value as OrviaReachChannel));

  try {
    const result = await searchOrviaReach({
      query,
      channels: channels.length ? channels : undefined,
      maxResults: Number(body?.maxResults || 10)
    });

    return NextResponse.json({
      status: 'COMPLETE',
      product: 'ORVIA Reach',
      query: result.query,
      sources: result.sources,
      backend: result.backend,
      warnings: result.warnings,
      boundary: 'Research only. Sources are not treated as verified evidence until checked through ORVIA verification controls.'
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'INCOMPLETE',
      reason: error?.message || 'ORVIA Reach could not complete the research request.'
    }, { status: 502 });
  }
}
