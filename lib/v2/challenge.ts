import { V2InvariantError } from './errors';
import type { MaterialityTier, UUID } from './types';

export type ChallengeMode =
  | 'BLIND_INDEPENDENT'
  | 'ALTERNATIVE_HYPOTHESIS'
  | 'DISCONFIRMATION'
  | 'COUNTERFACTUAL'
  | 'NARRATIVE_DRIFT'
  | 'SOURCE_WEIGHTING';

export type ChallengeStatus = 'DRAFT' | 'INDEPENDENT_COMPLETE' | 'HUMAN_CONSIDERED' | 'CLOSED';

export interface AlternativeView {
  statement: string;
  evidenceRefs: UUID[];
  contradictoryEvidenceRefs: UUID[];
  limitations: string;
}

export interface IndependentChallengeRecord {
  id: UUID;
  caseId: UUID;
  materiality: MaterialityTier;
  mode: ChallengeMode;
  question: string;
  blindToPrimaryAtFirstPass: boolean;
  evidenceManifest: UUID[];
  alternativeViews: AlternativeView[];
  discriminatingEvidence: Array<{ question: string; evidenceRefs: UUID[]; whyItMatters: string }>;
  missingEvidence: Array<{ description: string; consequence: string }>;
  unresolvedUncertainty: string[];
  primaryAnalysisRef?: UUID | null;
  challengerType: 'AI' | 'HUMAN';
  challengerId: string;
  status: ChallengeStatus;
  humanConsideredBy?: UUID | null;
  humanConsideredAt?: string | null;
  humanDisposition?: 'FURTHER_REVIEW' | 'NOT_MATERIAL' | 'MATERIAL_UNRESOLVED' | 'INCORPORATED' | null;
  humanReasoning?: string | null;
}

export function assertIndependentFirstPass(record: IndependentChallengeRecord) {
  if (record.status === 'DRAFT') return true;
  if (!record.question.trim()) throw new V2InvariantError('Independent Challenge requires a defined review question.');
  if (!record.evidenceManifest.length) throw new V2InvariantError('Independent Challenge requires a bounded evidence manifest.');
  if (!record.blindToPrimaryAtFirstPass) {
    throw new V2InvariantError('The initial red-team pass must be blind to the primary analysis to reduce anchoring.');
  }
  if (!record.alternativeViews.length) {
    throw new V2InvariantError('Independent Challenge must record at least one alternative interpretation or explicitly record that none was identified.');
  }
  return true;
}

export function assertChallengeHumanConsidered(record: IndependentChallengeRecord) {
  assertIndependentFirstPass(record);
  if (record.status !== 'HUMAN_CONSIDERED' && record.status !== 'CLOSED') {
    throw new V2InvariantError('Independent Challenge must be considered by an authorised human before it can satisfy a high-consequence closure control.');
  }
  if (!record.humanConsideredBy || !record.humanConsideredAt || !record.humanDisposition || !record.humanReasoning?.trim()) {
    throw new V2InvariantError('Human consideration of Independent Challenge must be attributable and reasoned.');
  }
  return true;
}

export function challengeRequired(materiality: MaterialityTier) {
  return materiality === 'TIER_3_HIGH_CONSEQUENCE';
}
