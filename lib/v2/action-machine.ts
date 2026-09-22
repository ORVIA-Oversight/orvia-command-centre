import type { ActionLifecycle, TransitionContext } from './types';

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

  if (from === 'PROPOSED' && to === 'ASSIGNED') {
    if (!context.japan) throw new V2InvariantError('JAPAN is required before assignment, except the separately recorded urgent path.');
    const j = context.japan;
    if (!j.justified.trim() || !j.proportionate.trim() || !j.necessary.trim()) {
      throw new V2InvariantError('JAPAN justification, proportionality and necessity must be recorded.');
    }
    if (!j.actionable.ownerId || !j.actionable.deadline || !j.actionable.expectedOutcome || !j.actionable.reviewPoint || !j.actionable.escalationRoute) {
      throw new V2InvariantError('JAPAN actionable fields are incomplete.');
    }
    if (j.urgentPath && !j.retrospectiveDueAt) {
      throw new V2InvariantError('Urgent JAPAN requires a retrospective completion deadline.');
    }
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
