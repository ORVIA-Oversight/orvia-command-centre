import type { HumanGateStatus, JapanRecord, MaterialityTier } from './types';
import { V2InvariantError } from './errors';

const FULL_JAPAN_TIERS: MaterialityTier[] = ['TIER_2_CONSEQUENTIAL', 'TIER_3_HIGH_CONSEQUENCE'];

export function requiresFullJapan(materiality: MaterialityTier) {
  return FULL_JAPAN_TIERS.includes(materiality);
}

export function requiresIndependentChallenge(materiality: MaterialityTier) {
  return materiality === 'TIER_3_HIGH_CONSEQUENCE';
}

function assertActionable(japan: JapanRecord) {
  const a = japan.actionable;
  if (!a.ownerId || !a.accountableRole.trim() || !a.deadline || !a.expectedOutcome.trim() || !a.reviewPoint.trim() || !a.escalationRoute.trim()) {
    throw new V2InvariantError('JAPAN actionable fields are incomplete.');
  }
}

export function assertJapanForExecution(
  materiality: MaterialityTier,
  japan: JapanRecord | null | undefined,
  humanGateStatus: HumanGateStatus | undefined,
) {
  if (!requiresFullJapan(materiality)) return true;
  if (!japan) throw new V2InvariantError('Full JAPAN is required for consequential or high-consequence action.');

  assertActionable(japan);

  if (japan.urgentPath) {
    if (!japan.justified.trim()) {
      throw new V2InvariantError('Urgent protective action still requires a minimum recorded justification.');
    }
    if (!japan.retrospectiveDueAt) {
      throw new V2InvariantError('Urgent JAPAN requires a retrospective review deadline.');
    }
    if (humanGateStatus !== 'EMERGENCY_DEFERRED' && humanGateStatus !== 'SATISFIED') {
      throw new V2InvariantError('Urgent action requires an accountable human or an explicit emergency-deferred human gate.');
    }
    return true;
  }

  if (!japan.justified.trim() || !japan.proportionate.trim() || !japan.necessary.trim()) {
    throw new V2InvariantError('JAPAN justification, proportionality and necessity must be recorded by an authorised human.');
  }
  if (!japan.auditableRefs.length) {
    throw new V2InvariantError('JAPAN requires at least one auditable reference.');
  }
  if (humanGateStatus !== 'SATISFIED' || !japan.authorisedBy || !japan.authorisedAt) {
    throw new V2InvariantError('Consequential JAPAN requires explicit human authorisation before execution.');
  }
  return true;
}
