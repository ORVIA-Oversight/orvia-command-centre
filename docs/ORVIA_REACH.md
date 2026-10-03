# ORVIA Reach

## Purpose

ORVIA Reach is the ORVIA-branded research capability presented to IRIS and the ORVIA workforce.

It is **not** a claim that ORVIA created Agent Reach. The first approved backend is the open-source Agent Reach project:

- Upstream: https://github.com/Panniantong/Agent-Reach
- Reviewed commit: `a19a171fa980a0785849596492e0af4db800c82f`
- Upstream licence: MIT
- Upstream copyright: Copyright (c) 2025 Agent Eyes

ORVIA Reach is the controlled ORVIA layer around replaceable research backends.

## Operating model

IRIS → ORVIA Reach → approved research channel → source/provenance → HIVE → VERA/VITA as required → human action.

ORVIA Reach may support public-source research across web search, webpages, GitHub, YouTube, RSS and configured social/professional platforms. Availability depends on the chosen backend and the user's authorised platform access.

## Boundaries

ORVIA Reach does not:
- bypass model safety rules;
- bypass paywalls or private access controls;
- create permission to scrape personal data;
- create permission for unsolicited mass outreach;
- convert a source into verified evidence merely because it was retrieved;
- hide third-party licences or attribution.

Research and outreach remain separate workflows.

## Runtime architecture

The Command/Vercel app does not attempt to install Agent Reach CLI dependencies inside the Next.js serverless runtime.

Instead Command expects a separately controlled ORVIA Reach worker endpoint:

- `ORVIA_REACH_BASE_URL`
- `ORVIA_REACH_API_KEY`
- POST `/v1/search`

This keeps the research backend replaceable and lets ORVIA operate a container/worker with the CLI/browser dependencies required by individual channels.

## Branding

User-facing name: **ORVIA Reach**

Descriptor: **Research Gateway**

Where attribution is material, use:

> ORVIA Reach uses approved open-source and commercial research backends. The current open-source capability layer includes Agent Reach, used under the MIT licence.

Do not remove upstream licence notices from any copied or modified upstream source.
