export type UUID = string;

export type Sensitivity = 'standard' | 'restricted' | 'serious_concern';
export type ActorType = 'human' | 'system' | 'integration' | 'ai';
export type MaterialityTier = 'TIER_0_ADMIN' | 'TIER_1_ROUTINE' | 'TIER_2_CONSEQUENTIAL' | 'TIER_3_HIGH_CONSEQUENCE';
export type HumanGateStatus = 'NOT_REQUIRED' | 'PENDING' | 'SATISFIED' | 'EMERGENCY_DEFERRED' | 'FAILED';
export type EpistemicState =
  | 'reported'
  | 'observed'
  | 'documented'
  | 'inferred'
  | 'disputed'
  | 'professional_opinion'
  | 'verified'
  | 'unknown';

export type BoardObservationCategory =
  | 'KNOWN'
  | 'INFERRED'
  | 'DISPUTED'
  | 'UNKNOWN'
  | 'MISSING'
  | 'CHANGED'
  | 'NOT_WORKING'
  | 'OPEN'
  | 'DECISION_REQUIRED'
  | 'ASSURANCE_LIMITATION';

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
export type CaseLifecycle = 'OPEN' | 'HELD' | 'CLOSING_REVIEW' | 'CLOSED' | 'REOPENED';

export interface CanonicalEvent {
  eventId: UUID;
  tenantId: UUID;
  eventType: string;
  schemaVersion: string;
  correlationId: UUID;
  causationId?: UUID | null;
  idempotencyKey: string;
  caseId?: UUID | null;
  aggregateType?: string | null;
  aggregateId?: UUID | null;
  aggregateVersion?: number | null;
  subjectRef?: string | null;
  eventTime: string;
  receivedTime: string;
  recordedTime: string;
  actorType: ActorType;
  actorId?: UUID | null;
  actingRole?: string | null;
  onBehalfOf?: string | null;
  authorityBasis?: string | null;
  sourceId: string;
  sourceEventId?: string | null;
  evidenceRefs: UUID[];
  configBundleVersion: string;
  aiInvocationId?: UUID | null;
  sensitivity: Sensitivity;
  limitations?: string | null;
  traceId: string;
  supersedesEventId?: UUID | null;
  payloadHash?: string | null;
  integrityDigest?: string | null;
}

export interface JapanRecord {
  materiality: MaterialityTier;
  justified: string;
  auditableRefs: UUID[];
  proportionate: string;
  alternativesConsidered: string[];
  actionable: {
    ownerId: UUID;
    accountableRole: string;
    deadline: string;
    expectedOutcome: string;
    reviewPoint: string;
    escalationRoute: string;
  };
  necessary: string;
  urgentPath: boolean;
  retrospectiveDueAt?: string | null;
  authorisedBy?: UUID | null;
  authorisedAt?: string | null;
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
  materiality?: MaterialityTier;
  humanGateStatus?: HumanGateStatus;
  japan?: JapanRecord | null;
  vera?: VeraRecord | null;
  effectivenessOutcome?: 'effective' | 'partially_effective' | 'not_effective' | null;
}

export interface SeriousConcernClosureContext {
  actorType: ActorType;
  protectionTrackResolved: boolean;
  inquiryTrackResolved: boolean;
  challengeApproverIds: UUID[];
  unresolvedMaterialItems: number;
}

export interface TenantWorkflowConfig {
  code: string;
  version: string;
  enabled: boolean;
  accountableRole?: string | null;
  requiresAi?: boolean;
  slaMinutes?: number | null;
  notificationChannels?: string[];
  seriousConcernTracks?: CaseTrackType[];
}

export interface TenantConfig {
  version: string;
  aiEnabled: boolean;
  roles: Array<{ code: string; activeUsers: number }>;
  escalations: Array<{ fromRole: string; toRole: string }>;
  workflows: TenantWorkflowConfig[];
}

export interface ValidationIssue {
  code: string;
  severity: 'error' | 'warning';
  message: string;
  path?: string;
}
