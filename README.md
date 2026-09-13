# ORVIA Command Centre

Internal founder command, controlled-document and intelligence workspace for ORVIA Oversight Ltd.

Target review domain: `command.orvia.org.uk`

## What is included

- Next.js + React + TypeScript
- Tailwind available for future component work; the current visual system is implemented in `app/globals.css`
- ORVIA official logo asset
- ORVIA palette and five-stage methodology
- Today / Command dashboard
- Intelligence & brand monitor
- Controlled Knowledge Library
- Systems & telemetry view
- Optional Supabase live data route
- Authenticated ingestion endpoint for Make/Zapier/Python pipelines
- `noindex` headers + robots exclusion
- Optional HTTP Basic Auth via environment variables
- Supabase migration for telemetry, mentions, social metrics and SEO rank snapshots

## Local run

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Vercel

Create/import the GitHub repository in Vercel. Add the environment variables from `.env.example` as required.

For restricted review access, set:

- `COMMAND_PRIVATE_MODE=true`
- `COMMAND_USERNAME=<review username>`
- `COMMAND_PASSWORD=<strong password>`

Do not commit passwords or service-role keys.

## Live backend

When `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are supplied server-side, `/api/dashboard` reads the existing admin task and integration tables.

Run `supabase/migrations/001_command_centre.sql` only after review; it creates new `command_*` ingestion tables and does not alter the existing Admin/Voice/PTT tables.

## External ingestion

`POST /api/ingest`

Header:

`Authorization: Bearer <INGEST_API_KEY>`

Example body:

```json
{
  "event_type": "brand_mention",
  "source": "approved-scraper",
  "severity": "info",
  "payload": { "url": "https://example.org/result", "title": "Example" }
}
```

## Editing

The main page content is split into reusable components under `/components`. Shared ORVIA colours and layout tokens are in `/app/globals.css`. Static baseline data is in `/lib/data.ts` and is deliberately marked/fallback-only until live feeds are connected.
