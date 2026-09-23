import type { CaseLifecycle, SeriousConcernClosureContext } from './types';
import { V2InvariantError } from './action-machine';

const ALLOWED: Record<CaseLifecycle, CaseLifecycle[]> = {
  OPEN: ['HELD', 'CLOSING_REVIEW'],
  HELD: ['OPEN', 'CLOSING_REVIEW'],
  CLOSING_REVIEW: ['OPEN', 'CLOSED'],
  CLOSED: ['REOPENED'],
  REOPENED: ['HELD', 'OPEN', 'CLOSING_REVIEW'],
};

export function assertCaseTransition(from: CaseLifecycle, to: CaseLifecycle, actorType: SeriousConcernClosureContext['actorType']) {
  if (actorType === 'ai') throw new V2InvariantError('AI may not change ORVIA case state.');
  if (!ALLOWED[from].includes(to)) throw new V2InvariantError(`Invalid case transition: ${from} -> ${to}`);
  return true;
}

export function assertSeriousConcernClosure(context: SeriousConcernClosureContext) {
  if (context.actorType === 'ai') throw new V2InvariantError('AI may not close a Serious Concern.');
  if (!context.protectionTrackResolved || !context.inquiryTrackResolved) {
    throw new V2InvariantError('Serious Concern closure requires both PROTECTION and INQUIRY tracks to be resolved.');
  }
  if (new Set(context.challengeApproverIds).size < 2) {
    throw new V2InvariantError('Serious Concern closure requires two distinct authorised human challenge approvals.');
  }
  if (context.unresolvedMaterialItems > 0) {
    throw new V2InvariantError('Serious Concern cannot close while material items remain unresolved.');
  }
  return true;
}
