import type { ActionLifecycle, TransitionContext } from './types';
import { assertJapanForExecution } from './materiality';

const ALLOWED: Record<ActionLifecycle, ActionLifecycle[]> = {
  PROPOSED: ['ASSIGNED'],
  ASSIGNED: ['IN_PROGRESS'],
  IN_PROGRESS: ['COMPLETION_CLAIMED'],
  COMPLETION_CLAIMED: ['VERIFIED'],
  VERIFIED: ['EFFECTIVENESS_REVIEW'],
  EFFECTIVENESS_REVIEW: ['CLOSED', 'IN_PROGRESS'],
  CLOSED: [],
};

export class V2InvariantError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'V2InvariantError';
  }
}

export function assertTransition(
  from: ActionLifecycle,
  to: ActionLifecycle,
  context: TransitionContext,
) {
  if (context.actorType === 'ai') {
    throw new V2InvariantError('AI may not change ORVIA case or action state.');
  }

  if (!ALLOWED[from].includes(to)) {
    throw new V2InvariantError(`Invalid action transition: ${from} -> ${to}`);
  }

  // Assignment is allowed before a material action has been authorised so that
  // the accountable human can receive and assess the proposal. Execution is gated.
  if (from === 'ASSIGNED' && to === 'IN_PROGRESS') {
    const materiality = context.materiality ?? 'TIER_1_ROUTINE';
    assertJapanForExecution(materiality, context.japan, context.humanGateStatus);
  }

  if (from === 'COMPLETION_CLAIMED' && to === 'VERIFIED') {
    if (!context.vera) throw new V2InvariantError('VERA is required before VERIFIED.');
    if (context.currentOwnerId && context.vera.verifiedBy === context.currentOwnerId) {
      throw new V2InvariantError('The action owner cannot be the sole verifier.');
    }
    if (!context.vera.verifiedAgainst.trim() || !context.vera.scope.trim()) {
      throw new V2InvariantError('VERA verification basis and scope are required.');
    }
    if (!context.vera.evidenceUsed.length) {
      throw new V2InvariantError('VERA requires at least one original artefact/version evidence reference.');
    }
    if (context.vera.unverifiedRemainder == null) {
      throw new V2InvariantError('VERA must explicitly state any unverified remainder, including none.');
    }
  }

  if (from === 'EFFECTIVENESS_REVIEW' && to === 'CLOSED') {
    if (context.effectivenessOutcome !== 'effective') {
      throw new V2InvariantError('An action cannot close until effectiveness is positively established.');
    }
  }

  return true;
}

export function availableTransitions(from: ActionLifecycle): ActionLifecycle[] {
  return [...ALLOWED[from]];
}
