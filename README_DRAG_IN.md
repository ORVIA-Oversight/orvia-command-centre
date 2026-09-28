# ORVIA Unified Suite — Drag-In Build

Target: ORVIA Command / shared ORVIA backend.

This pack adds the first unified ORVIA shell, customer portal, role/service-aware module routing, and downloadable report endpoints.

## Drag-in files
Copy the folders in this pack into the root of the existing `orvia-command-centre` repository, preserving paths.

## One manual import
Add this line in `app/layout.tsx` immediately after the existing CSS imports:

```ts
import './unified-suite.css';
```

## Existing files expected
The target repo already needs:
- `lib/supabase-server.ts`
- `public/orvia-oversight-logo.png`
- existing central session middleware / `orvia_session`

## Environment variables
No secrets are included in this pack. Continue to configure these only in Vercel/server environment:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## New routes
- `/portal`
- `/portal/reports`
- `/portal/service/[service]`
- `/api/platform/context`
- `/api/platform/report?format=json`
- `/api/platform/report?format=csv`

## Behaviour
The backend resolves user -> person -> organisation -> access -> authorised service records. The module list is then populated from that context. Missing KPI/service feeds remain explicitly unpopulated rather than being guessed.

## Current supported module mapping
- Voice / ARIA
- Web
- Oversight / Complete / Connect
- Witness Room
- MIA
- Academy
- common Work, Library and Reports modules
- internal Command / Landscape / Clients / Systems / Brand Control for internal roles

## Security note
This is a bootstrap integration build. Central 2FA/MFA enforcement is the next identity layer and is not claimed complete by this pack.
