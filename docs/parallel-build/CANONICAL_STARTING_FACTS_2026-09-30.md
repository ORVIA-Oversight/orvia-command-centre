# Canonical Starting Facts — ORVIA Command / IRIS

**Verified:** 30 Sep 2026  
**Purpose:** Give every parallel-build agent the same real starting point.

## Current Command repository

Repository: `ORVIA-Oversight/orvia-command-centre`

Verified reusable runtime foundations:
- Next.js + React + TypeScript Command application.
- `components/IrisConsole.tsx`: live text IRIS console.
- `app/api/iris/ask/route.ts`: controlled request intake into Command work state.
- `app/api/iris/voice/route.ts`: authenticated IRIS voice tool gateway.
- `lib/agent-gateway.ts`: external worker authentication and public job contract.
- `lib/agent-instructions.ts`: IRIS/division instruction model and routing doctrine.
- `lib/command-policy.ts`: authority classes, human approval rules and work classification.
- `docs/agent-gateway/ORVIA_AGENT_GATEWAY_v1.md`: existing multi-model worker contract.
- Supabase server-side integration already exists.

## Current live database foundations

The production ORVIA Supabase project already contains reusable structures. Agents must design around these first rather than inventing duplicates.

### Agents and queued AI work

`admin_agents`
- code, display_name, purpose, operating_scope
- human_owner_role, risk_ceiling
- can_draft, can_read, can_write_low_risk
- requires_human_approval_above
- instructions, metadata, active

`admin_brain_jobs`
- user_request, interpreted_intent
- selected_tool_code, selected_agent_code
- status, risk_level
- approval_required, approval_status
- input_context
- requested_outputs, permitted_sources
- completion_evidence
- external_ref, due_at
- verification_required
- execution timestamps, heartbeat, lease and recovery fields

`admin_brain_job_events`
- job_id, event_type, tool_code, agent_code, summary, payload

`admin_work_queue`
- work_type, title, detail, status, priority
- assigned_to, approval_required
- source_system, source_reference

`admin_worker_schedules`
- worker_code, task_template, input_context
- requested_outputs, permitted_sources
- risk_level, approval_required, verification_required
- active and schedule fields

### Media and SharePoint metadata

`admin_media_assets`
- asset_type, business_area_code, function_code
- source_system, source_url
- sharepoint_item_id, sharepoint_drive_id
- file_name, mime_type
- status, is_primary, usage_notes
- tags, metadata

`admin_media_collections`
- collection identity and business-area mapping
- sharepoint_folder_url
- active, metadata

### Evidence / HIVE-compatible foundations

`assurance_evidence`
- organisation_id, case_id
- evidence_ref, version_no
- title, evidence_type
- authoritative_origin
- source_system, source_ref, source_uri
- storage_mode
- source_hash
- original_filename, mime_type
- captured_at, occurred_at
- provenance
- integrity_status
- created_by, created_at

`assurance_evidence_links`
- organisation_id, case_id, evidence_id
- target_type, target_id
- relationship, rationale
- linked_by, linked_at

`assurance_ai_runs`
- organisation_id, case_id
- run_ref
- provider, model
- purpose
- evidence_refs
- output, validation
- human_adoption_status

These tables already provide most of the primitives required for original/source records, provenance, evidence linking and AI run audit. Area B must explicitly decide which are extended, wrapped or retained as-is before other agents introduce new persistence objects.

## Existing agent gateway

The current gateway already defines external workers as subordinate to IRIS and HIVE/Supabase, with VERA verification and human approval for consequential actions. Registered worker concepts already include Microsoft, ChatGPT, Claude, Dola, Sintra, Viktor and media workers.

Area E therefore extends the existing gateway into a capability broker; it does not create a second orchestration system.

## Known material gap

Universal file/media/link/SharePoint intake is not yet implemented as a complete end-to-end IRIS pipeline in the Command repo.

## Security blocker discovered during verification

Eight current Command Mail tables have Row Level Security disabled:
- command_mail_accounts
- command_mail_items
- command_mail_drafts
- command_mail_rules
- command_mail_actions
- command_signatures
- command_mail_connections
- command_voice_profiles

This must be resolved with deliberate policies before broader multi-user or tenant use. Do **not** simply enable RLS without defining the required policies, because that can break all application access.

## Decision-rights rule

If parallel agents disagree:
1. canonical starting facts win over assumptions;
2. Area B's accepted shared-object contract wins for persistence semantics;
3. governance rules win over convenience;
4. IRIS integrates the technical decision;
5. unresolved consequential conflicts require human/founder decision.
