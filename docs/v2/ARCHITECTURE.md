# ORVIA V2 Core Architecture

Status: build foundation
Date: 22 September 2026

## Product operating loop

CAPTURE -> CONNECT -> ASSURE -> DECIDE -> VERIFY -> RECHECK / LEARN

This is the product model. The runtime remains deliberately simpler: one modular application, one PostgreSQL system of record, object storage for originals, one durable worker, replaceable integration adapters, and an assurance plane outside the main runtime.

## Canonical responsibilities

- ARIA / Voice: communications and structured capture. It is an adapter, not a decision-maker.
- IRIS: deterministic workflow state, ownership, timers, acknowledgement, escalation, failure handling and human gates.
- HIVE: originals, versions, provenance, assertions, contradictions, dissent, missing evidence and known-then/known-now reconstruction.
- JAPAN: action discipline. Justified, proportionate, actionable and necessary are explicit human records; auditable is structural.
- VITA: assurance tests and challenge.
- VERA: verification discipline and record structure. It is not a separate service.
- Human Workspace: review, interpret, challenge, decide and own responsibility.
- AI Gateway: optional assist only. It has no route that changes case state.

## Non-negotiable boundaries

1. ORVIA never gates or delays emergency, protective, clinical or statutory action.
2. A timeout never becomes approval.
3. Delivery is not acknowledgement.
4. Completion claimed is not verification.
5. Verification is not effectiveness.
6. Precaution is not a factual finding.
7. A derivative is never represented as an original artefact.
8. AI output is never evidence unless a human separately adopts a sourced factual statement through the normal evidence process.
9. Serious Concern cases separate PROTECTION and INQUIRY tracks.
10. Open cases are pinned to the configuration bundle version under which they were opened.
11. Failure states remain visible until cleared or accepted by an authorised human with reasons.
12. The platform must complete its workflows with AI disabled.

## Runtime boundary

The V2 safety-critical core must not use the existing shared Admin / Voice / PTT database as its production customer evidence store.

The existing Command IRIS Voice gateway is transitional. It may continue to serve current non-safeguarding operational routing while V2 is built, but it is not the V2 case engine.

A dedicated Supabase project (or equivalent dedicated PostgreSQL environment) is required before the V2 migration in this branch is applied to production.

## Serious Concern

A Serious Concern opens two independently stated tracks:

- PROTECTION: what must be done now to keep people safe or meet statutory duties.
- INQUIRY: what can actually be established from evidence.

Protection does not wait for inquiry. Inquiry does not convert precaution into a finding.

## Implementation choice

Conceptual components remain visible in product language, but V2 starts as a modular monolith. No microservice split is justified until measured operational need proves otherwise.
