-- ORVIA V2 Independent Challenge / red-team layer.
-- Apply only after 001_v2_core.sql and 002_v2_control_plane.sql
-- in the dedicated V2 evidence project.

create table if not exists orvia_v2.challenge_reviews (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references orvia_v2.tenants(id) on delete cascade,
  case_id uuid not null references orvia_v2.cases(id) on delete cascade,
  materiality text not null check (materiality in ('TIER_0_ADMIN','TIER_1_ROUTINE','TIER_2_CONSEQUENTIAL','TIER_3_HIGH_CONSEQUENCE')),
  mode text not null check (mode in ('BLIND_INDEPENDENT','ALTERNATIVE_HYPOTHESIS','DISCONFIRMATION','COUNTERFACTUAL','NARRATIVE_DRIFT','SOURCE_WEIGHTING')),
  review_question text not null,
  blind_to_primary_first_pass boolean not null default true,
  evidence_manifest uuid[] not null default '{}',
  primary_analysis_ref uuid,
  challenger_type text not null check (challenger_type in ('AI','HUMAN')),
  challenger_id text not null,
  status text not null default 'DRAFT' check (status in ('DRAFT','INDEPENDENT_COMPLETE','HUMAN_CONSIDERED','CLOSED')),
  alternative_views jsonb not null default '[]'::jsonb,
  discriminating_evidence jsonb not null default '[]'::jsonb,
  missing_evidence jsonb not null default '[]'::jsonb,
  unresolved_uncertainty jsonb not null default '[]'::jsonb,
  human_considered_by uuid,
  human_considered_at timestamptz,
  human_disposition text check (human_disposition in ('FURTHER_REVIEW','NOT_MATERIAL','MATERIAL_UNRESOLVED','INCORPORATED')),
  human_reasoning text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists v2_challenge_case_status_idx
  on orvia_v2.challenge_reviews(case_id,status);

comment on table orvia_v2.challenge_reviews is
'Independent Challenge preserves alternative interpretations and unresolved uncertainty. It is advisory only, does not vote on truth, and cannot change IRIS state.';
