create table if not exists public.command_deployments (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  name text not null,
  incident_type text not null default 'general',
  authority text,
  status text not null default 'PLANNED',
  country text,
  location_label text,
  started_at timestamptz,
  stood_down_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.command_deploy_assets (
  id uuid primary key default gen_random_uuid(),
  asset_ref text unique not null,
  asset_type text not null,
  ownership text not null default 'PARTNER' check (ownership in ('ORVIA','PARTNER','CLIENT')),
  callsign text,
  serial_number text,
  provider text,
  status text not null default 'AVAILABLE',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.command_deploy_assignments (
  id uuid primary key default gen_random_uuid(),
  deployment_id uuid references public.command_deployments(id) on delete cascade,
  asset_id uuid references public.command_deploy_assets(id) on delete cascade,
  assigned_to text,
  team text,
  issued_at timestamptz not null default now(),
  returned_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists command_deployments_status_idx on public.command_deployments(status);
create index if not exists command_deploy_assets_status_idx on public.command_deploy_assets(status);
create index if not exists command_deploy_assignments_deployment_idx on public.command_deploy_assignments(deployment_id);
