-- ORVIA V2 control-plane extension.
-- Apply only to the dedicated V2 customer-evidence project after 001_v2_core.sql.
-- Do not apply to the current shared Admin / Voice / PTT project.

create table if not exists orvia_v2.tenant_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references orvia_v2.tenants(id) on delete cascade,
  user_id uuid not null,
  status text not null default 'active' check (status in ('active','suspended','ended')),
  created_at timestamptz not null default now(),
  ended_at timestamptz,
  unique(tenant_id,user_id)
);

create table if not exists orvia_v2.workflow_definitions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references orvia_v2.tenants(id) on delete cascade,
  workflow_code text not null,
  version text not null,
  status text not null default 'draft' check (status in ('draft','validated','published','retired')),
  definition jsonb not null,
  definition_hash text not null,
  approved_by uuid,
  approved_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique(tenant_id,workflow_code,version)
);

create table if not exists orvia_v2.workflow_instances (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null unique references orvia_v2.cases(id) on delete cascade,
  workflow_definition_id uuid not null references orvia_v2.workflow_definitions(id),
  current_state text not null,
  aggregate_version bigint not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists orvia_v2.work_items (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references orvia_v2.cases(id) on delete cascade,
  action_id uuid references orvia_v2.actions(id) on delete cascade,
  title text not null,
  responsible_kind text not null check (responsible_kind in ('user','queue','system')),
  responsible_ref text not null,
  accountable_role text not null,
  accountable_user_id uuid,
  acknowledgement_required boolean not null default true,
  acknowledgement_due_at timestamptz,
  due_at timestamptz,
  status text not null default 'open' check (status in ('open','acknowledged','in_progress','blocked','completed','cancelled')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists v2_work_items_case_status_idx on orvia_v2.work_items(case_id,status);
create index if not exists v2_work_items_accountable_idx on orvia_v2.work_items(accountable_user_id,status);

create table if not exists orvia_v2.japan_assessments (
  id uuid primary key default gen_random_uuid(),
  action_id uuid not null references orvia_v2.actions(id) on delete cascade,
  version integer not null default 1 check (version > 0),
  materiality text not null check (materiality in ('TIER_0_ADMIN','TIER_1_ROUTINE','TIER_2_CONSEQUENTIAL','TIER_3_HIGH_CONSEQUENCE')),
  status text not null default 'draft' check (status in ('draft','pending_human','authorised','rejected','emergency_deferred','superseded')),
  justified text,
  auditable_refs uuid[] not null default '{}',
  proportionate text,
  alternatives_considered text[] not null default '{}',
  actionable jsonb not null default '{}'::jsonb,
  necessary text,
  urgent_path boolean not null default false,
  retrospective_due_at timestamptz,
  authorised_by uuid,
  authorised_at timestamptz,
  created_at timestamptz not null default now(),
  unique(action_id,version)
);

create table if not exists orvia_v2.human_gates (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references orvia_v2.cases(id) on delete cascade,
  action_id uuid references orvia_v2.actions(id) on delete cascade,
  gate_type text not null,
  required_role text not null,
  status text not null default 'PENDING' check (status in ('NOT_REQUIRED','PENDING','SATISFIED','EMERGENCY_DEFERRED','FAILED')),
  decided_by uuid,
  decision_reason text,
  decided_at timestamptz,
  due_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists orvia_v2.board_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references orvia_v2.tenants(id) on delete cascade,
  cadence text not null check (cadence in ('monthly','quarterly','ad_hoc')),
  meeting_at timestamptz not null,
  status text not null default 'planned' check (status in ('planned','open','completed','cancelled')),
  chair_user_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists orvia_v2.board_observations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references orvia_v2.board_sessions(id) on delete cascade,
  category text not null check (category in (
    'KNOWN','INFERRED','DISPUTED','UNKNOWN','MISSING','CHANGED','NOT_WORKING','OPEN','DECISION_REQUIRED','ASSURANCE_LIMITATION'
  )),
  statement text not null,
  contributor_role text not null,
  contributor_user_id uuid,
  evidence_refs uuid[] not null default '{}',
  dissent boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists orvia_v2.board_recommendations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references orvia_v2.board_sessions(id) on delete cascade,
  observation_ids uuid[] not null default '{}',
  recommendation text not null,
  disposition text not null default 'PROPOSED' check (disposition in ('PROPOSED','ACCEPTED','MODIFIED','REJECTED','CONVERTED_TO_ACTION')),
  considered_by uuid,
  consideration_reason text,
  action_id uuid references orvia_v2.actions(id),
  created_at timestamptz not null default now(),
  considered_at timestamptz
);

create table if not exists orvia_v2.config_validation_runs (
  id uuid primary key default gen_random_uuid(),
  config_bundle_id uuid not null references orvia_v2.config_bundles(id) on delete cascade,
  outcome text not null check (outcome in ('pass','fail')),
  issues jsonb not null default '[]'::jsonb,
  run_by text not null default 'deterministic_compiler',
  run_at timestamptz not null default now()
);

create table if not exists orvia_v2.public_claim_controls (
  id uuid primary key default gen_random_uuid(),
  claim_code text not null unique,
  public_claim text not null,
  control_code text not null,
  acceptance_test text not null,
  status text not null default 'unproven' check (status in ('unproven','tested','evidenced','retired')),
  evidence_reference text,
  updated_at timestamptz not null default now()
);

alter table orvia_v2.failure_records
  add column if not exists recovery_action text,
  add column if not exists reconciliation_status text default 'pending'
    check (reconciliation_status in ('pending','reconciled','not_required'));

alter table orvia_v2.events
  add column if not exists aggregate_type text,
  add column if not exists aggregate_id uuid,
  add column if not exists aggregate_version bigint,
  add column if not exists source_event_id text,
  add column if not exists payload_hash text;

alter table orvia_v2.assertions drop constraint if exists assertions_classification_check;
alter table orvia_v2.assertions
  add constraint assertions_classification_check
  check (classification in ('known','reported','observed','documented','inferred','disputed','professional_opinion','verified','unknown'));

alter table orvia_v2.contradictions drop constraint if exists contradictions_status_check;
alter table orvia_v2.contradictions
  add constraint contradictions_status_check
  check (status in ('open','considered','explained','material_to_decision','not_material_to_decision','unresolvable'));

comment on table orvia_v2.work_items is 'Responsible work may sit with a user or queue; consequential accountability remains attached to an accountable human role.';
comment on table orvia_v2.japan_assessments is 'JAPAN structure is system-enforced. Substantive justification, proportionality and necessity remain human judgements for material action.';
comment on table orvia_v2.board_recommendations is 'Human Assurance Board recommendations are advisory until an authorised human accepts, modifies or rejects them and IRIS creates any resulting action.';
