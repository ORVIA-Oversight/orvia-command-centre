import { NextResponse } from 'next/server';
import { assertTransition, availableTransitions, V2InvariantError } from '@/lib/v2/action-machine';
import type { ActionLifecycle, TransitionContext } from '@/lib/v2/types';

export async function POST(request: Request) {
  try {
    const body = await request.json() as { from: ActionLifecycle; to: ActionLifecycle; context: TransitionContext };
    assertTransition(body.from, body.to, body.context);
    return NextResponse.json({ allowed: true, from: body.from, to: body.to, next: availableTransitions(body.to) });
  } catch (error) {
    if (error instanceof V2InvariantError) {
      return NextResponse.json({ allowed: false, reason: error.message }, { status: 422 });
    }
    return NextResponse.json({ allowed: false, reason: 'Invalid transition request.' }, { status: 400 });
  }
}
