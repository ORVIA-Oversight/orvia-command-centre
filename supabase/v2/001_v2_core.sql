-- ORVIA V2 foundation schema
-- DO NOT apply this migration to the current shared Admin / Voice / PTT production project.
-- Target: dedicated ORVIA V2 customer-evidence Supabase/PostgreSQL environment.

create schema if not exists orvia_v2;

create table if not exists orvia_v2.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'active' check (status in ('active','suspended','offboarding','closed')),
  created_at timestamptz not null default now()
);

create table if not exists orvia_v2.people (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references orvia_v2.tenants(id),
  display_name text not null,
  external_ref text,
  subject_only boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists v2_people_tenant_idx on orvia_v2.people(tenant_id);

create table if not exists orvia_v2.role_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references orvia_v2.tenants(id),
  user_id uuid not null,
  role_code text not null,
  authority_basis text not null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  check (ends_at is null or ends_at > starts_at)
);
create index if not exists v2_role_assignments_user_idx on orvia_v2.role_assignments(tenant_id,user_id,starts_at,ends_at);

create table if not exists orvia_v2.availability (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references orvia_v2.tenants(id),
  user_id uuid not null,
  status text not null check (status in ('available','unavailable','unknown')),
  available_from timestamptz not null,
  available_until timestamptz,
  source text not null default 'manual',
  created_at timestamptz not null default now()
);

create table if not exists orvia_v2.config_bundles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references orvia_v2.tenants(id),
  version text not null,
  status text not null default 'draft' check (status in ('draft','published','retired')),
  config jsonb not null default '{}'::jsonb,
  immutable_hash text,
  approved_by uuid,
  safety_reviewed_by uuid,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique(tenant_id, version)
);

create table if not exists orvia_v2.cases (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references orvia_v2.tenants(id),
  reference text not null,
  title text not null,
  case_type text not null default 'standard' check (case_type in ('standard','serious_concern')),
  sensitivity text not null default 'standard' check (sensitivity in ('standard','restricted','serious_concern')),
  status text not null default 'open' check (status in ('open','held','closing_review','closed','reopened')),
  config_bundle_id uuid not null references orvia_v2.config_bundles(id),
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  unique(tenant_id, reference)
);
create index if not exists v2_cases_tenant_status_idx on orvia_v2.cases(tenant_id,status);

create table if not exists orvia_v2.case_tracks (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references orvia_v2.cases(id) on delete cascade,
  track_type text not null check (track_type in ('PROTECTION','INQUIRY')),
  status text not null default 'open' check (status in ('open','held','resolved')),
  created_at timestamptz not null default now(),
  unique(case_id, track_type)
);

create table if not exists orvia_v2.actions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references orvia_v2.cases(id) on delete cascade,
  track_id uuid references orvia_v2.case_tracks(id),
  title text not null,
  description text,
  lifecycle_state text not null default 'PROPOSED' check (lifecycle_state in (
    'PROPOSED','ASSIGNED','IN_PROGRESS','COMPLETION_CLAIMED','VERIFIED','EFFECTIVENESS_REVIEW','CLOSED'
  )),
  due_at timestamptz,
  review_due_at timestamptz,
  expected_outcome text,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists v2_actions_case_state_idx on orvia_v2.actions(case_id,lifecycle_state);

create table if not exists orvia_v2.action_conditions (
  id uuid primary key default gen_random_uuid(),
  action_id uuid not null references orvia_v2.actions(id) on delete cascade,
  condition_type text not null check (condition_type in (
    'UNOWNED','ACK_OVERDUE','STALLED','ESCALATED','ESCALATION_FAILED','BLOCKED',
    'EVIDENCE_GAP','EVIDENCE_CONTRADICTS_COMPLETION','VERIFICATION_FAILED',
    'NOT_EFFECTIVE','RECHECK_OVERDUE','DISPUTED','REOPENED'
  )),
  detail text,
  active boolean not null default true,
  raised_at timestamptz not null default now(),
  cleared_at timestamptz,
  cleared_by uuid
);
create index if not exists v2_action_conditions_active_idx on orvia_v2.action_conditions(action_id,active);

create table if not exists orvia_v2.ownership_assignments (
  id uuid primary key default gen_random_uuid(),
  action_id uuid not null references orvia_v2.actions(id) on delete cascade,
  owner_user_id uuid not null,
  role_code text not null,
  assigned_by uuid not null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  acknowledged_at timestamptz,
  check (ends_at is null or ends_at > starts_at)
);
create index if not exists v2_ownership_active_idx on orvia_v2.ownership_assignments(action_id,ends_at);

create table if not exists orvia_v2.japan_records (
  id uuid primary key default gen_random_uuid(),
  action_id uuid not null references orvia_v2.actions(id) on delete cascade,
  justified text not null,
  proportionate text not null,
  necessary text not null,
  owner_user_id uuid not null,
  deadline timestamptz not null,
  expected_outcome text not null,
  review_point timestamptz not null,
  escalation_route text not null,
  urgent_path boolean not null default false,
  retrospective_due_at timestamptz,
  completed_by uuid not null,
  completed_at timestamptz not null default now(),
  check (not urgent_path or retrospective_due_at is not null)
);

create table if not exists orvia_v2.artefacts (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references orvia_v2.cases(id) on delete cascade,
  source_type text not null,
  source_id text not null,
  captured_at timestamptz,
  received_at timestamptz not null default now(),
  content_hash text not null,
  storage_key text not null,
  original_filename text,
  mime_type text,
  created_at timestamptz not null default now(),
  unique(case_id, content_hash, source_id)
);

create table if not exists orvia_v2.artefact_versions (
  id uuid primary key default gen_random_uuid(),
  artefact_id uuid not null references orvia_v2.artefacts(id) on delete cascade,
  version_no integer not null check (version_no > 0),
  content_hash text not null,
  storage_key text not null,
  correction_reason text,
  created_by uuid,
  created_at timestamptz not null default now(),
  unique(artefact_id, version_no)
);

create table if not exists orvia_v2.ai_invocations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references orvia_v2.tenants(id),
  task_type text not null,
  provider text not null,
  model text not null,
  prompt_version text not null,
  schema_version text not null,
  input_hashes text[] not null default '{}',
  outcome text not null check (outcome in ('success','rejected','failed','budget_blocked')),
  latency_ms integer,
  cost_minor_units integer,
  created_at timestamptz not null default now()
);

create table if not exists orvia_v2.derivatives (
  id uuid primary key default gen_random_uuid(),
  artefact_version_id uuid not null references orvia_v2.artefact_versions(id) on delete cascade,
  derivative_type text not null,
  method text not null check (method in ('human','deterministic','ai')),
  content jsonb not null,
  ai_invocation_id uuid references orvia_v2.ai_invocations(id),
  created_by uuid,
  created_at timestamptz not null default now(),
  check ((method = 'ai' and ai_invocation_id is not null) or method <> 'ai')
);

create table if not exists orvia_v2.assertions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references orvia_v2.cases(id) on delete cascade,
  artefact_version_id uuid not null references orvia_v2.artefact_versions(id),
  statement text not null,
  subject_person_id uuid references orvia_v2.people(id),
  event_time timestamptz,
  classification text not null default 'known' check (classification in ('known','inferred','disputed')),
  created_by uuid not null,
  created_at timestamptz not null default now()
);

create table if not exists orvia_v2.decisions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references orvia_v2.cases(id) on delete cascade,
  action_id uuid references orvia_v2.actions(id),
  decision_type text not null,
  outcome text not null,
  reasons text not null,
  authority_basis text not null,
  made_by uuid not null,
  made_at timestamptz not null default now()
);

create table if not exists orvia_v2.decision_evidence (
  decision_id uuid not null references orvia_v2.decisions(id) on delete cascade,
  artefact_version_id uuid not null references orvia_v2.artefact_versions(id),
  assertion_id uuid references orvia_v2.assertions(id),
  primary key(decision_id, artefact_version_id, assertion_id)
);

create table if not exists orvia_v2.contradictions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references orvia_v2.cases(id) on delete cascade,
  assertion_a_id uuid not null references orvia_v2.assertions(id),
  assertion_b_id uuid not null references orvia_v2.assertions(id),
  status text not null default 'open' check (status in ('open','resolved','unresolvable')),
  resolution_decision_id uuid references orvia_v2.decisions(id),
  created_at timestamptz not null default now()
);

create table if not exists orvia_v2.dissent (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references orvia_v2.cases(id) on delete cascade,
  subject_ref text not null,
  statement text not null,
  contributor_user_id uuid,
  attribution_mode text not null default 'named' check (attribution_mode in ('named','facilitator_only','anonymous')),
  created_at timestamptz not null default now()
);

create table if not exists orvia_v2.evidence_gaps (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references orvia_v2.cases(id) on delete cascade,
  description text not null,
  required_by timestamptz,
  perishable boolean not null default false,
  status text not null default 'open' check (status in ('open','obtained','accepted_missing')),
  accepted_missing_reason text,
  decided_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists orvia_v2.verification_records (
  id uuid primary key default gen_random_uuid(),
  action_id uuid not null references orvia_v2.actions(id) on delete cascade,
  outcome text not null check (outcome in ('accepted','rejected')),
  verified_against text not null,
  verified_by uuid not null,
  evidence_used_summary text not null,
  scope text not null,
  unverified_remainder text not null,
  created_at timestamptz not null default now()
);

create table if not exists orvia_v2.verification_evidence (
  verification_id uuid not null references orvia_v2.verification_records(id) on delete cascade,
  artefact_version_id uuid not null references orvia_v2.artefact_versions(id),
  primary key(verification_id, artefact_version_id)
);

create table if not exists orvia_v2.effectiveness_reviews (
  id uuid primary key default gen_random_uuid(),
  action_id uuid not null references orvia_v2.actions(id) on delete cascade,
  outcome text not null check (outcome in ('effective','partially_effective','not_effective')),
  evidence_summary text not null,
  reviewed_by uuid not null,
  reviewed_at timestamptz not null default now(),
  recheck_due_at timestamptz
);

create table if not exists orvia_v2.reopen_triggers (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references orvia_v2.cases(id) on delete cascade,
  trigger_type text not null,
  condition_text text not null,
  active boolean not null default true,
  triggered_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists orvia_v2.events (
  event_id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references orvia_v2.tenants(id),
  event_type text not null,
  schema_version text not null default '1.0',
  correlation_id uuid not null,
  causation_id uuid,
  idempotency_key text not null,
  case_id uuid references orvia_v2.cases(id),
  subject_ref text,
  event_time timestamptz not null,
  received_time timestamptz not null default now(),
  recorded_time timestamptz not null default now(),
  actor_type text not null check (actor_type in ('human','system','integration','ai')),
  actor_id uuid,
  on_behalf_of text,
  authority_basis text,
  source_id text not null,
  evidence_refs uuid[] not null default '{}',
  config_bundle_version text not null,
  ai_invocation_id uuid references orvia_v2.ai_invocations(id),
  sensitivity text not null default 'standard' check (sensitivity in ('standard','restricted','serious_concern')),
  limitations text,
  trace_id text not null,
  supersedes_event_id uuid references orvia_v2.events(event_id),
  integrity_digest text,
  unique(tenant_id,idempotency_key)
);
create index if not exists v2_events_case_time_idx on orvia_v2.events(case_id,event_time,recorded_time);

create table if not exists orvia_v2.outbox (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references orvia_v2.events(event_id),
  topic text not null,
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending','publishing','published','failed')),
  publish_attempts integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  published_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);
create index if not exists v2_outbox_due_idx on orvia_v2.outbox(status,next_attempt_at);

create table if not exists orvia_v2.timers (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references orvia_v2.cases(id) on delete cascade,
  action_id uuid references orvia_v2.actions(id) on delete cascade,
  timer_type text not null,
  due_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled','claimed','fired','cancelled','failed')),
  owner_user_id uuid,
  claimed_at timestamptz,
  fired_at timestamptz,
  created_at timestamptz not null default now(),
  check (case_id is not null or action_id is not null)
);
create index if not exists v2_timers_due_idx on orvia_v2.timers(status,due_at);

create table if not exists orvia_v2.notifications (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references orvia_v2.events(event_id),
  case_id uuid references orvia_v2.cases(id),
  action_id uuid references orvia_v2.actions(id),
  channel text not null,
  recipient_ref text not null,
  status text not null default 'queued' check (status in ('queued','sent','delivered','failed','cancelled')),
  explicit_ack_required boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists orvia_v2.delivery_attempts (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid not null references orvia_v2.notifications(id) on delete cascade,
  attempt_no integer not null,
  status text not null check (status in ('sent','delivered','failed')),
  provider_ref text,
  error text,
  attempted_at timestamptz not null default now(),
  unique(notification_id,attempt_no)
);

create table if not exists orvia_v2.acknowledgements (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid references orvia_v2.notifications(id),
  action_id uuid references orvia_v2.actions(id),
  acknowledged_by uuid not null,
  acknowledgement_type text not null default 'explicit' check (acknowledgement_type = 'explicit'),
  acknowledged_at timestamptz not null default now()
);

create table if not exists orvia_v2.failure_records (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references orvia_v2.tenants(id),
  case_id uuid references orvia_v2.cases(id),
  action_id uuid references orvia_v2.actions(id),
  failure_type text not null,
  severity text not null check (severity in ('info','warning','high','critical')),
  detail text not null,
  status text not null default 'open' check (status in ('open','mitigated','closed','accepted')),
  detected_at timestamptz not null default now(),
  owner_user_id uuid,
  closed_at timestamptz,
  closure_reason text,
  closed_by uuid
);

create table if not exists orvia_v2.closure_approvals (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references orvia_v2.cases(id) on delete cascade,
  approved_by uuid not null,
  authority_basis text not null,
  challenge_completed boolean not null default false,
  approved_at timestamptz not null default now(),
  unique(case_id,approved_by)
);

create or replace function orvia_v2.block_event_mutation()
returns trigger language plpgsql as $$
begin
  raise exception 'ORVIA V2 events are append-only; corrections must create a superseding event';
end;
$$;

drop trigger if exists v2_events_no_update on orvia_v2.events;
create trigger v2_events_no_update before update or delete on orvia_v2.events
for each row execute function orvia_v2.block_event_mutation();

create or replace function orvia_v2.block_artefact_version_mutation()
returns trigger language plpgsql as $$
begin
  raise exception 'ORVIA V2 artefact versions are immutable; create a new version instead';
end;
$$;

drop trigger if exists v2_artefact_versions_no_update on orvia_v2.artefact_versions;
create trigger v2_artefact_versions_no_update before update or delete on orvia_v2.artefact_versions
for each row execute function orvia_v2.block_artefact_version_mutation();

create or replace function orvia_v2.guard_serious_concern_tracks()
returns trigger language plpgsql as $$
declare
  protection_count integer;
  inquiry_count integer;
begin
  if new.status = 'closed' and old.status is distinct from 'closed' and new.case_type = 'serious_concern' then
    select count(*) into protection_count from orvia_v2.case_tracks
      where case_id = new.id and track_type = 'PROTECTION' and status = 'resolved';
    select count(*) into inquiry_count from orvia_v2.case_tracks
      where case_id = new.id and track_type = 'INQUIRY' and status = 'resolved';
    if protection_count <> 1 or inquiry_count <> 1 then
      raise exception 'Serious Concern cannot close until both PROTECTION and INQUIRY tracks are resolved';
    end if;
    if (select count(*) from orvia_v2.closure_approvals where case_id = new.id and challenge_completed) < 2 then
      raise exception 'Serious Concern closure requires two recorded challenge approvals';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists v2_serious_concern_close_guard on orvia_v2.cases;
create trigger v2_serious_concern_close_guard before update of status on orvia_v2.cases
for each row execute function orvia_v2.guard_serious_concern_tracks();

comment on schema orvia_v2 is 'ORVIA V2 safety-critical core. AI may assist but must not hold state-changing authority.';
comment on table orvia_v2.events is 'Canonical append-only event ledger. Retry mechanics belong to delivery/job records, not immutable business events.';
comment on table orvia_v2.derivatives is 'Transcripts, summaries, extraction and other derived material. Derivatives are not original evidence.';
