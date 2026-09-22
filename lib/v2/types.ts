export type UUID = string;

export type Sensitivity = 'standard' | 'restricted' | 'serious_concern';
export type ActorType = 'human' | 'system' | 'integration' | 'ai';

export type ActionLifecycle =
  | 'PROPOSED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETION_CLAIMED'
  | 'VERIFIED'
  | 'EFFECTIVENESS_REVIEW'
  | 'CLOSED';

export type ActionCondition =
  | 'UNOWNED'
  | 'ACK_OVERDUE'
  | 'STALLED'
  | 'ESCALATED'
  | 'ESCALATION_FAILED'
  | 'BLOCKED'
  | 'EVIDENCE_GAP'
  | 'EVIDENCE_CONTRADICTS_COMPLETION'
  | 'VERIFICATION_FAILED'
  | 'NOT_EFFECTIVE'
  | 'RECHECK_OVERDUE'
  | 'DISPUTED'
  | 'REOPENED';

export type CaseTrackType = 'PROTECTION' | 'INQUIRY';

export interface CanonicalEvent {
  eventId: UUID;
  tenantId: UUID;
  eventType: string;
  schemaVersion: string;
  correlationId: UUID;
  causationId?: UUID | null;
  idempotencyKey: string;
  caseId?: UUID | null;
  subjectRef?: string | null;
  eventTime: string;
  receivedTime: string;
  recordedTime: string;
  actorType: ActorType;
  actorId?: UUID | null;
  onBehalfOf?: string | null;
  authorityBasis?: string | null;
  sourceId: string;
  evidenceRefs: UUID[];
  configBundleVersion: string;
  aiInvocationId?: UUID | null;
  sensitivity: Sensitivity;
  limitations?: string | null;
  traceId: string;
  supersedesEventId?: UUID | null;
  integrityDigest?: string | null;
}

export interface JapanRecord {
  justified: string;
  proportionate: string;
  actionable: {
    ownerId: UUID;
    deadline: string;
    expectedOutcome: string;
    reviewPoint: string;
    escalationRoute: string;
  };
  necessary: string;
  urgentPath: boolean;
  retrospectiveDueAt?: string | null;
}

export interface VeraRecord {
  verifiedAgainst: string;
  verifiedBy: UUID;
  evidenceUsed: UUID[];
  scope: string;
  unverifiedRemainder: string;
}

export interface TransitionContext {
  actorType: ActorType;
  actorId?: UUID | null;
  currentOwnerId?: UUID | null;
  japan?: JapanRecord | null;
  vera?: VeraRecord | null;
  effectivenessOutcome?: 'effective' | 'partially_effective' | 'not_effective' | null;
}
