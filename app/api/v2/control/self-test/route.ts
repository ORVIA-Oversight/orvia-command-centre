import { NextResponse } from 'next/server';
import { runV2SelfTests } from '@/lib/v2/self-test';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = runV2SelfTests();
  return NextResponse.json(result, { status: result.passed ? 200 : 500 });
}
