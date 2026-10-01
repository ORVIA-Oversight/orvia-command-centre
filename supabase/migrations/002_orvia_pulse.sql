-- ORVIA PULSE
-- Listen -> Learn -> Create -> Approve -> Publish -> Measure -> Adapt
-- This migration creates only new PULSE tables.

create table if not exists public.pulse_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source_type text not null,
  source_url text,
  connection_method text,
  status text not null default 'planned',
  terms_reviewed boolean not null default false,
  owner text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pulse_signals (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.pulse_sources(id) on delete set null,
  signal_type text not null,
  topic text,
  source_url text,
  source_reference text,
  observed_text text,
  observed_at timestamptz not null default now(),
  captured_at timestamptz not null default now(),
  sentiment text,
  relevance numeric,
  evidence_state text not null default 'observed',
  metadata jsonb not null default '{}'::jsonb
);
create index if not exists pulse_signals_observed_at_idx on public.pulse_signals(observed_at desc);
create index if not exists pulse_signals_topic_idx on public.pulse_signals(topic);

create table if not exists public.pulse_interpretations (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  period_start timestamptz,
  period_end timestamptz,
  signal_count integer not null default 0,
  interpretation text not null,
  confidence text not null default 'low',
  alternative_explanations jsonb not null default '[]'::jsonb,
  recommended_test text,
  human_review_status text not null default 'pending',
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.pulse_campaigns (
  id uuid primary key default gen_random_uuid(),
  campaign_code text not null unique,
  title text not null,
  objective text not null,
  audience text,
  proposition text,
  primary_product text,
  method_stage text,
  source_interpretation_id uuid references public.pulse_interpretations(id) on delete set null,
  owner text,
  status text not null default 'draft',
  approval_required boolean not null default true,
  approved_by text,
  approved_at timestamptz,
  starts_at timestamptz,
  ends_at timestamptz,
  landing_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pulse_content_items (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.pulse_campaigns(id) on delete cascade,
  channel text not null,
  format text not null,
  headline text,
  body text,
  asset_url text,
  evidence_refs jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  human_approved boolean not null default false,
  approved_by text,
  approved_at timestamptz,
  scheduled_for timestamptz,
  published_at timestamptz,
  platform_post_id text,
  platform_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.pulse_performance (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.pulse_campaigns(id) on delete cascade,
  content_item_id uuid references public.pulse_content_items(id) on delete cascade,
  platform text not null,
  measured_at timestamptz not null default now(),
  impressions bigint,
  reach bigint,
  views bigint,
  engagements bigint,
  clicks bigint,
  enquiries bigint,
  qualified_leads bigint,
  proposals bigint,
  sales bigint,
  revenue_gbp numeric,
  metadata jsonb not null default '{}'::jsonb
);
create index if not exists pulse_performance_campaign_idx on public.pulse_performance(campaign_id, measured_at desc);

create table if not exists public.pulse_learnings (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.pulse_campaigns(id) on delete set null,
  topic text,
  observed_result text not null,
  interpretation text,
  decision text,
  next_test text,
  evidence_refs jsonb not null default '[]'::jsonb,
  human_review_status text not null default 'pending',
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- PULSE keeps these categories distinct:
-- 1. pulse_signals = what was observed
-- 2. pulse_performance = what ORVIA's own campaigns actually did
-- 3. pulse_interpretations / pulse_learnings = what ORVIA thinks the evidence may mean


-- Security: PULSE is server-only in Command by default.
alter table public.pulse_sources enable row level security;
alter table public.pulse_signals enable row level security;
alter table public.pulse_interpretations enable row level security;
alter table public.pulse_campaigns enable row level security;
alter table public.pulse_content_items enable row level security;
alter table public.pulse_performance enable row level security;
alter table public.pulse_learnings enable row level security;

revoke all on table public.pulse_sources from anon, authenticated;
revoke all on table public.pulse_signals from anon, authenticated;
revoke all on table public.pulse_interpretations from anon, authenticated;
revoke all on table public.pulse_campaigns from anon, authenticated;
revoke all on table public.pulse_content_items from anon, authenticated;
revoke all on table public.pulse_performance from anon, authenticated;
revoke all on table public.pulse_learnings from anon, authenticated;

grant select, insert, update, delete on table public.pulse_sources to service_role;
grant select, insert, update, delete on table public.pulse_signals to service_role;
grant select, insert, update, delete on table public.pulse_interpretations to service_role;
grant select, insert, update, delete on table public.pulse_campaigns to service_role;
grant select, insert, update, delete on table public.pulse_content_items to service_role;
grant select, insert, update, delete on table public.pulse_performance to service_role;
grant select, insert, update, delete on table public.pulse_learnings to service_role;
