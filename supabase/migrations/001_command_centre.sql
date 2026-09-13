create table if not exists public.command_telemetry_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  source text not null,
  severity text not null default 'info',
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists command_telemetry_events_occurred_at_idx on public.command_telemetry_events (occurred_at desc);

create table if not exists public.command_mentions (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_url text,
  title text not null,
  snippet text,
  sentiment text not null default 'Neutral' check (sentiment in ('Positive','Neutral','Risk/Negative')),
  observed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.command_social_metrics (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  metric_date date not null,
  impressions bigint,
  engagements bigint,
  followers bigint,
  clicks bigint,
  metadata jsonb not null default '{}'::jsonb,
  unique(platform, metric_date)
);

create table if not exists public.command_keyword_rankings (
  id uuid primary key default gen_random_uuid(),
  keyword text not null,
  region text not null default 'UK',
  checked_at timestamptz not null default now(),
  position numeric,
  landing_url text,
  source text,
  metadata jsonb not null default '{}'::jsonb
);
