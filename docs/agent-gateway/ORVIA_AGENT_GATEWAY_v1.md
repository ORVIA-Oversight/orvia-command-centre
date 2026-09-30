# ORVIA Agent Gateway v1

Status: foundation built; provider authorisations remain human-controlled.

## Purpose

IRIS remains the single conductor. External AI systems are workers, not competing authorities.

HIVE/Supabase remains the master work state.
SharePoint remains the controlled document/evidence store.
VERA verifies material completion and factual claims.
Consequential actions remain approval-gated.

## External worker contract

Every worker uses the same controlled sequence:

1. GET /api/agent-gateway/health
2. GET /api/agent-gateway/tasks
3. POST /api/agent-gateway/tasks/{id}/claim
4. GET /api/agent-gateway/tasks/{id}
5. Perform only the allocated task using only the permitted context/sources
6. POST heartbeat for longer work
7. POST /api/agent-gateway/tasks/{id}/result

Required headers:

Authorization: Bearer <ORVIA_AGENT_GATEWAY_KEY>
X-ORVIA-Worker: <registered worker code>

The shared gateway key is a bootstrap control for v1. Provider-specific credentials should replace it once each provider's authenticated MCP/API identity has been proven.

## Registered workers

- M365-WORKER
- CHATGPT-WORKER
- CLAUDE-WORKER
- DOLA-WORKER
- SINTRA-WORKER
- VIKTOR-WORKER
- MEDIA-WORKER

## Daily schedules prepared

Schedules are stored in admin_worker_schedules and are inactive until the human connection for that provider is verified.

- M365-DAILY-ATLAS
- CHATGPT-DAILY-PRODUCTION
- CLAUDE-DAILY-REVIEW
- DOLA-DAILY-REMINDERS
- SINTRA-DAILY-ROUTINES
- VIKTOR-DAILY-MEDIA

Supabase Cron calls materialize_due_worker_schedules every 15 minutes. A schedule creates at most one job per local calendar day and respects the schedule timezone.

## Human activation steps

1. Set ORVIA_AGENT_GATEWAY_ENABLED=true in the production Command project.
2. Generate a strong ORVIA_AGENT_GATEWAY_KEY and save it only in the approved secret store/Vercel environment.
3. Verify the production gateway health endpoint with one worker identity.
4. Microsoft 365: create/authorise the ORVIA Microsoft agent and point its approved actions at the gateway.
5. ChatGPT/OpenAI: connect the ORVIA MCP/API gateway in the approved workspace.
6. Claude/Anthropic: connect the same gateway in the approved Claude/Anthropic workspace.
7. Dola: verify the currently available integration route before enabling its schedule.
8. Sintra: configure only supported recurring routines and a controlled return path.
9. Viktor: verify its current basic capability and permitted production handoff.
10. Media: select/authorise approved image/video provider credentials.
11. Activate each admin_worker_schedules row only after its end-to-end test passes.
12. Run one controlled task from HIVE -> worker -> result -> VERA -> SharePoint/HIVE completion before enabling unattended daily work.

## Result payload

Example:

{
  "outcome": "complete",
  "summary": "Prepared the daily administration pack.",
  "completionEvidence": ["sharepoint:item-reference"],
  "artifacts": [{"name":"Daily admin pack","sharePointRef":"..."}],
  "uncertainties": [],
  "nextAction": "None"
}

If verification_required is true on the job, a completed result is automatically routed to admin_verification_checks before it can be treated as verified.

## Authority boundaries

External workers may prepare, research, draft, classify low-risk work and return controlled artefacts.

They may not autonomously:
- publish in John's name
- spend or move money
- sign or accept contracts
- make safeguarding/clinical/disciplinary/culpability decisions
- delete controlled evidence
- change canonical pricing or policy
- claim an asset is complete if the provider did not actually return it

## SharePoint convention

Recommended canonical location:
00 ORVIA vNext - Clean Core / 08 Technology Data and Integrations / ORVIA Agent Gateway

Subfolders:
- 01 Architecture and Contracts
- 02 Worker Instructions
- 03 Daily Output Receipts
- 04 Verification Required
- 05 Human Activation
- 06 Recovery and Audit

HIVE records completion state. SharePoint stores documents and evidence.
