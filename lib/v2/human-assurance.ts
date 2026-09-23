import type { BoardObservationCategory, UUID } from './types';
import { V2InvariantError } from './action-machine';

export interface BoardObservation {
  id: UUID;
  category: BoardObservationCategory;
  statement: string;
  contributorRole: string;
  contributorUserId?: UUID | null;
  evidenceRefs: UUID[];
  dissent: boolean;
}

export type RecommendationDisposition = 'PROPOSED' | 'ACCEPTED' | 'MODIFIED' | 'REJECTED' | 'CONVERTED_TO_ACTION';

export interface BoardRecommendation {
  id: UUID;
  observationIds: UUID[];
  recommendation: string;
  disposition: RecommendationDisposition;
  consideredBy?: UUID | null;
  considerationReason?: string | null;
  actionId?: UUID | null;
}

export function assertRecommendationDisposition(recommendation: BoardRecommendation) {
  if (recommendation.disposition === 'PROPOSED') return true;
  if (!recommendation.consideredBy || !recommendation.considerationReason?.trim()) {
    throw new V2InvariantError('A Human Assurance Board recommendation requires an authorised human consideration record.');
  }
  if (recommendation.disposition === 'CONVERTED_TO_ACTION' && !recommendation.actionId) {
    throw new V2InvariantError('A converted Human Assurance Board recommendation must reference the resulting IRIS action.');
  }
  return true;
}
