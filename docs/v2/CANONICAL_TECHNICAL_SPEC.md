# ORVIA V2 Canonical Technical Specification

Status: controlled build baseline
Date: 24 September 2026

## Canonical runtime

ORVIA V2 starts as a modular monolith with durable workers.

- IRIS is the authoritative deterministic workflow/control core.
- HIVE is the governed evidence, assertion and provenance plane.
- JAPAN is the material-action discipline. Software validates structure; authorised humans judge substantive justification, proportionality and necessity.
- VERA is the verification discipline and structured record, not a separate runtime service.
- VITA is the assurance/effectiveness rule library, not an autonomous decision-maker.
- Independent Challenge is the governed red-team review function: it seeks alternative explanations, discriminating evidence, missing evidence, narrative drift and unresolved uncertainty without voting on truth.
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

AI can extract, summarise, compare, identify possible contradictions, generate alternative interpretations and draft.
AI cannot perform case/action state transitions, determine credibility, make safeguarding/clinical/disciplinary findings, determine guilt or innocence, or close Serious Concern matters.

## Independent Challenge

For TIER_3_HIGH_CONSEQUENCE reviews, an independent challenge is required before closure.

The first challenge pass should be blind to the primary interpretation where practicable. It receives:
- the review question;
- a bounded evidence manifest;
- provenance/epistemic labels;
- applicable scope and limitations.

It returns:
- plausible alternative interpretations;
- evidence that supports or weakens each interpretation;
- discriminating evidence that would help separate explanations;
- missing/perishable evidence;
- counterfactual questions;
- narrative-drift or source-weighting concerns;
- unresolved uncertainty.

Only after that first pass is complete may the primary interpretation be shown for comparison.

Disagreement is not averaged into consensus. AI challenge output is advisory and cannot change IRIS state. An authorised human must consider the challenge, record the disposition and preserve any material unresolved disagreement.

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
Closure requires both tracks resolved, material items addressed, independent challenge considered and two distinct authorised challenge approvals.

## Human Assurance Board

Board observations are governance observations, not automatically evidence of an underlying factual proposition.

Recommendations must be considered by an authorised role and recorded as ACCEPTED, MODIFIED or REJECTED. Only accepted/modified material recommendations enter JAPAN and create an IRIS action.

## White label

Configure tenants; never fork customer code.

Published workflow/configuration versions are never edited in place. New versions are validated, tested, approved and published. Open cases remain pinned unless an explicit audited migration is authorised.

## AI removal

With all AI disabled, critical representative workflows must still support capture, source preservation, case creation, ownership, escalation, JAPAN, human decision, verification, effectiveness review, independent human challenge, closure and reporting.

## Production database hold

The V2 schemas in this branch must not be applied to the current shared Admin/Voice/PTT Supabase project. Provision a dedicated V2 evidence project before migration.
