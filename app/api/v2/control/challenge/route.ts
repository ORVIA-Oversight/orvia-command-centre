import { NextResponse } from 'next/server';
import { assertChallengeHumanConsidered, assertIndependentFirstPass, type IndependentChallengeRecord } from '@/lib/v2/challenge';
import { V2InvariantError } from '@/lib/v2/errors';

export async function POST(request: Request) {
  try {
    const body = await request.json() as { record: IndependentChallengeRecord; requireHumanConsideration?: boolean };
    if (body.requireHumanConsideration) assertChallengeHumanConsidered(body.record);
    else assertIndependentFirstPass(body.record);

    return NextResponse.json({
      valid: true,
      mode: body.record.mode,
      status: body.record.status,
      advisoryOnly: true,
      stateWritePermitted: false,
    });
  } catch (error) {
    if (error instanceof V2InvariantError) {
      return NextResponse.json({ valid: false, reason: error.message }, { status: 422 });
    }
    return NextResponse.json({ valid: false, reason: 'Invalid Independent Challenge payload.' }, { status: 400 });
  }
}
