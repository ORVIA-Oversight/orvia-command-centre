import { NextResponse } from 'next/server';
import { configCanPublish } from '@/lib/v2/config-compiler';
import type { TenantConfig } from '@/lib/v2/types';

export async function POST(request: Request) {
  try {
    const config = await request.json() as TenantConfig;
    const result = configCanPublish(config);
    return NextResponse.json(result, { status: result.ok ? 200 : 422 });
  } catch {
    return NextResponse.json({ ok: false, issues: [{ code: 'INVALID_JSON', severity: 'error', message: 'A valid tenant configuration payload is required.' }] }, { status: 400 });
  }
}
