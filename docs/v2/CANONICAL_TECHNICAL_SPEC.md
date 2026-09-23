# ORVIA V2 Canonical Technical Specification

Status: controlled build baseline
Date: 23 September 2026

## Canonical runtime

ORVIA V2 starts as a modular monolith with durable workers.

- IRIS is the authoritative deterministic workflow/control core.
- HIVE is the governed evidence, assertion and provenance plane.
- JAPAN is the material-action discipline. Software validates structure; authorised humans judge substantive justification, proportionality and necessity.
- VERA is the verification discipline and structured record, not a separate runtime service.
- VITA is the assurance/effectiveness rule library, not an autonomous decision-maker.
- The AI Gateway is optional assistance and has no direct state-change authority.
- The Integration Fabric translates external systems but never owns ORVIA business state.
- The Human Assurance Board provides representative organisational challenge and recommendations; it does not seize professional or statutory authority.
- The ORVIA Control Plane independently monitors and reconciles the platform.

## Data pattern

Use relational current-state tables plus:
- append-only domain/audit events;
- transactional outbox;
- durable workers/queues;
- explicit failure records;
- versioned workflow/configuration;
- object storage for original artefacts.

Do not use pure event sourcing for V2.

## Accountability invariant

Every open material work item must have:
1. a responsible actor or queue;
2. an accountable role;
3. a current accountable human, or a visible NO_OWNER / unstaffed-role failure state with escalation.

A queue is never the accountable person.

## Human authority

AI can extract, summarise, compare, identify possible contradictions and draft.
AI cannot perform case/action state transitions, determine credibility, make safeguarding/clinical/disciplinary findings, or close Serious Concern matters.

## JAPAN materiality

- TIER_0_ADMIN: no JAPAN.
- TIER_1_ROUTINE: deterministic completeness and normal human ownership.
- TIER_2_CONSEQUENTIAL: full JAPAN + authorised human approval.
- TIER_3_HIGH_CONSEQUENCE: full JAPAN + authorised human approval + independent challenge.

Urgent precautionary protection may execute before full JAPAN where delay would create risk, but requires minimum justification, a named accountable human, an explicit PRECAUTIONARY — NOT A FACTUAL FINDING status, a time limit and mandatory retrospective JAPAN review.

## Serious Concern

Serious Concern is one parent case with two parallel tracks:
- PROTECTION
- INQUIRY

Protection does not wait for inquiry.
Precaution never becomes proof merely because action was taken.
Closure requires both tracks resolved, material items addressed, and two distinct authorised challenge approvals.

## Human Assurance Board

Board observations are governance observations, not automatically evidence of an underlying factual proposition.

Recommendations must be considered by an authorised role and recorded as ACCEPTED, MODIFIED or REJECTED. Only accepted/modified material recommendations enter JAPAN and create an IRIS action.

## White label

Configure tenants; never fork customer code.

Published workflow/configuration versions are never edited in place. New versions are validated, tested, approved and published. Open cases remain pinned unless an explicit audited migration is authorised.

## AI removal

With all AI disabled, critical representative workflows must still support capture, source preservation, case creation, ownership, escalation, JAPAN, human decision, verification, effectiveness review, closure and reporting.

## Production database hold

The V2 schema in this branch must not be applied to the current shared Admin/Voice/PTT Supabase project. Provision a dedicated V2 evidence project before migration.
