# IRIS V2 MASTER HANDOVER — ARCHITECTURE, INNER WORKINGS, LIVE STATE & NEXT-CHAT BRIEF

**Date:** 26 September 2026  
**Owner:** ORVIA Oversight Ltd  
**Purpose:** Preserve the complete IRIS V2 reasoning, architecture, control model, live implementation state, Independent Challenge learning, and the boundaries that must not be lost during the wider ORVIA landscape review.

---

# 1. EXECUTIVE POSITION

IRIS must not be rebuilt as an AI chatbot, a generic incident system, or a collection of disconnected "brains".

The canonical position is:

> **ORVIA V2 is a deterministic, human-accountable evidence and assurance operating system with optional AI assistance.**

The irreducible architecture is:

- **IRIS** — the authoritative deterministic workflow/control core.
- **HIVE** — the governed evidence, assertion and provenance plane.
- **JAPAN** — the material-action discipline.
- **VERA** — the verification discipline and record.
- **VITA** — assurance/effectiveness controls.
- **Independent Challenge** — governed red-team review; not truth voting.
- **Human Workspace** — authorised human judgement.
- **Human Assurance Board (HAB)** — representative organisational challenge and feedback.
- **AI Gateway** — optional/provider-independent assistance only.
- **Integration Fabric** — external system adapters, never business-state authority.
- **ORVIA Control Plane** — independent platform monitoring/reconciliation.

IRIS is the one authoritative workflow/state controller. The named disciplines remain visible to users and governance, but V2 starts as a **modular monolith with durable workers**, not a microservice estate.

---

# 2. CURRENT LIVE ESTATE — DO NOT CONFUSE THIS WITH THE FUTURE V2 EVIDENCE ENGINE

## Repository

Canonical working repository:

`ORVIA-Oversight/orvia-command-centre`

Current `main` commit verified on 26 September 2026:

`45b406e8261e111080eebfc901fff6dd1c265e2d`

This includes the later Command V3/mobile landscape work as well as the V2 foundation.

## Key merged PRs

- **PR #5 — Build ORVIA V2 core foundation**
  - merged 23 September 2026
  - established IRIS/HIVE/JAPAN/VERA/VITA foundation
  - added V2 schema files, state controls, Serious Concern tracks and foundation page
  - explicitly did **not** apply the V2 schema to the shared live Supabase project.

- **PR #6 — IRIS V2 Independent Challenge red-team layer**
  - merged 24 September 2026
  - added blind first-pass challenge, alternative views, discriminating evidence, missing-evidence review, narrative-drift/source-weighting challenge and human consideration.

- **PRs #7–#12 — later landscape / Command V3 work**
  - unified My Workspace / client workspace shell
  - live ORVIA asset registry
  - live work board
  - A0–A4 Command authority model
  - master client registry
  - direct Entra SSO handoff
  - non-secret access register
  - installable/mobile PWA shell

These later PRs are **not replacements for V2**. They are the live operating shell around the existing shared operational backend.

## Live Command

Live domain:

`command.orvia.org.uk`

The V2 foundation remains available under:

`/v2`

Current Command also contains:
- Founder conversational IRIS surface
- My Workspace
- Work board
- Estate/project registry
- Client workspaces
- Systems & Access
- mobile PWA navigation

Do not remove these during a V2 fix.

---

# 3. DATABASE STATE — CRITICAL SAFETY BOUNDARY

Connected live Supabase project on 26 September 2026:

`qokkyynptzeuuebykmbo`

This is the shared operational project containing current:
- Admin
- Voice
- PTT
- Web
- MIA
- Hub
- asset/access/work data.

Verified on 26 September 2026: **there is no live `orvia_v2` schema in this project.**

The dedicated V2 migration files exist in GitHub but remain unapplied:

- `supabase/v2/001_v2_core.sql`
- `supabase/v2/002_v2_control_plane.sql`
- `supabase/v2/003_independent_challenge.sql`

**DO NOT apply these migrations to the shared Admin/Voice/PTT project.**

The canonical design decision remains:

> Provision a dedicated V2 customer-evidence Supabase/PostgreSQL environment before applying the V2 schema.

The live Command currently reads/writes the existing `public` operational tables, including:
- `admin_work_queue`
- `admin_tasks`
- `admin_integrations`
- `admin_organisations`
- `orvia_asset_registry`
- `admin_access_accounts`
- `admin_verification_checks`
- Voice tables and other operational registers.

That shared estate is transitional/admin-operational state. It is **not** the future V2 customer evidence case engine.

---

# 4. PRODUCT OPERATING LOOP

Public/product journey:

```text
CAPTURE → CONNECT → ASSURE → DECIDE → VERIFY → RECHECK / LEARN
```

Runtime interpretation:

```text
CHANNELS
Voice · Forms · Email · APIs · Existing Systems
        │
        ▼
CAPTURE / INGEST
Validate · timestamp · dedupe · preserve original
        │
        ├──────────────► HIVE
        │                original source / provenance
        ▼
DURABLE EVENT + OUTBOX
        │
        ▼
IRIS
State · ownership · timers · acknowledgement
routing · escalation · failures · human gates
        │
        ├────────────► JAPAN
        ├────────────► VITA
        ├────────────► INDEPENDENT CHALLENGE
        └────────────► HUMAN WORKSPACE
                              │
                           DECISION
                              │
                            VERA
                              │
                      ACTION / VERIFY
                              │
                         EFFECTIVENESS
                              │
                           RECHECK
                              │
                              └────► IRIS

HUMAN ASSURANCE BOARD ◄────────────► IRIS

ORVIA CONTROL PLANE watches the whole system independently.
```

AI is not in the mandatory path.

---

# 5. ORVIA METHOD — LOCKED WORDING

The methodology wording corrected in the live application is:

**O — OBSERVE**  
**R — REVIEW**  
**V — VERIFY**  
**I — INTERPRET**  
**A — ACT**

Do not revert to older wording such as Observation / Reflection / Visibility / Insight / Accountability.

The sidebar wording was deliberately corrected away from "protects the truth".

Preferred principle:

> **IRIS coordinates. VERA verifies against evidence. Humans own the judgement.**

ORVIA preserves source, provenance, competing interpretations and auditability. It does not claim software possesses or preserves "truth".

---

# 6. CONSTITUTIONAL CONTROL LAYER

Internal ORVIA constitutional material establishes the principles that V2 must turn into software controls, not merely policy statements.

Important principles include:

- **Human Reality Principle** — look at what is actually happening, not only paperwork.
- **Human Continuity Principle** — assess ongoing human effect, not one point in time.
- **AI Removal Test / Human Continuity Test** — critical workflows must work without AI.
- **Board Test** — consequential decisions must withstand independent ethical scrutiny.
- **No Yes-Men Principle** — dissent is valuable; weak thinking must be challenged.
- **Reflection Before Reaction** — analysis before non-urgent consequential action.
- **Accountability Without Fear** — honest reporting without retaliation.
- **Every Person Is Human** — avoid simplistic hero/villain narratives.
- **No Single-Point Bias** — actively seek other perspectives.
- **Truth Before Comfort / Jamo Rule** — do not soften inconvenient evidence.
- **360-Degree Perspective** — consider material perspectives, not one narrative.
- **Disclosure Fidelity** — preserve intended meaning from expression through recording, interpretation, context and decision.
- **Redaction Before Publication** — personal/identifiable material must not be published externally without proper redaction.

Primary internal constitutional source checked during handover:
`ORVIA_FULL_KNOWLEDGE_DOWNLOAD_12Aug2026.docx` in SharePoint.

The Constitution is the layer above JAPAN and IRIS.

---

# 7. IRIS — AUTHORITATIVE DETERMINISTIC CONTROL CORE

IRIS owns:

- workflow state;
- case/action transitions;
- ownership;
- responsible queues;
- accountable roles;
- acknowledgement;
- due dates;
- SLA/timers;
- escalation;
- human gates;
- failure states;
- reopening;
- workflow version pinning;
- audit/event generation.

IRIS must **not** decide:

- guilt or innocence;
- abuse/neglect;
- credibility;
- safeguarding findings;
- clinical cause;
- disciplinary outcome;
- culpability;
- statutory referral conclusions.

AI has no direct write path to case/action state.

## Action lifecycle implemented in V2 code

`lib/v2/action-machine.ts`

```text
PROPOSED
↓
ASSIGNED
↓
IN_PROGRESS
↓
COMPLETION_CLAIMED
↓
VERIFIED
↓
EFFECTIVENESS_REVIEW
↓
CLOSED
```

Important enforced distinctions:

- assignment is not execution;
- completion claimed is not verification;
- verification is not effectiveness;
- ineffective action cannot close;
- AI cannot transition action state.

## Case lifecycle

`lib/v2/case-machine.ts`

```text
OPEN
HELD
CLOSING_REVIEW
CLOSED
REOPENED
```

AI cannot transition case state.

---

# 8. RESPONSIBILITY VS ACCOUNTABILITY

This distinction is fundamental.

A queue may be **responsible for receiving or processing work**.

A queue is never the accountable person.

Every material work item should have:

1. responsible actor or queue;
2. accountable role;
3. current accountable human;

or a visible failure state where no eligible human currently occupies the role.

Examples:

```text
Responsible queue: Safeguarding Review Queue
Accountable role: Designated Safeguarding Lead
Current accountable human: Jane Smith
```

If there is no current human:

```text
NO_OWNER / ACCOUNTABLE_ROLE_UNSTAFFED
→ escalation
→ visible system failure
```

Never silently substitute AI.

---

# 9. JAPAN — CONSTITUTIONAL ACTION GATE

JAPAN means:

**J — Justified**  
Why is the action being proposed? What evidence/authority/trigger supports it?

**A — Auditable**  
Can another reviewer reconstruct who, what, when, why, evidence and rule version?

**P — Proportionate**  
Is the response proportionate? Were less intrusive alternatives considered?

**A — Actionable**  
Who owns it? Deadline? Expected outcome? Review point? Escalation route?

**N — Necessary**  
Why must this happen? Why now? What if nothing is done?

## JAPAN materiality tiers

Implemented in `lib/v2/materiality.ts`:

- **TIER_0_ADMIN** — no JAPAN.
- **TIER_1_ROUTINE** — deterministic completeness + normal ownership.
- **TIER_2_CONSEQUENTIAL** — full JAPAN + authorised human approval.
- **TIER_3_HIGH_CONSEQUENCE** — full JAPAN + authorised human approval + Independent Challenge.

Software validates that the structure is complete.

Software does **not** decide that an intervention is substantively proportionate, necessary or justified.

Those remain human judgements.

## Emergency / precautionary JAPAN

Governance must not delay urgent protective action.

Urgent path permits action where delay creates risk if there is:

- minimum recorded justification;
- accountable human;
- time limit;
- explicit status:
  **PRECAUTIONARY — NOT A FACTUAL FINDING**
- mandatory retrospective JAPAN review.

---

# 10. HIVE — EVIDENCE, ASSERTIONS & PROVENANCE

HIVE is not another autonomous "brain".

It is the governed evidence/provenance plane.

HIVE must preserve:

- original source;
- source metadata;
- versions;
- hashes;
- provenance;
- derivatives separately;
- assertions separately;
- contradictions;
- missing evidence;
- dissent;
- decisions and links to supporting material;
- Known Then / Known Now reconstruction.

The design deliberately separates:

```text
SOURCE
≠
DERIVATIVE
≠
ASSERTION
≠
DECISION
```

An AI summary is not the original source.

A professional opinion is not automatically an observed fact.

A decision is not proof of its premise.

## Epistemic states in code

`lib/v2/types.ts`

- reported
- observed
- documented
- inferred
- disputed
- professional_opinion
- verified
- unknown

This data structure supports genuine Board reporting of:
- what is known;
- what is inferred;
- what is disputed;
- what remains unknown.

---

# 11. SERIOUS CONCERN FRAMEWORK

A Serious Concern is one parent matter with two parallel but distinct tracks.

```text
SERIOUS CONCERN
      │
      ├──── PROTECTION
      │      what must happen now
      │
      └──── INQUIRY
             what can actually be established
```

Protection does not wait for inquiry.

Inquiry does not convert precaution into a finding.

Required visible principle:

> **PRECAUTIONARY — NOT A FACTUAL FINDING**

The Serious Concern framework should retain:

- Original Source Preservation;
- Concern Origin Record;
- Alternative Hypothesis Register;
- Discriminating Evidence Register;
- Missing/Perishable Evidence;
- Context Alongside Attribution;
- Denominator Integrity;
- Preserved Dissent;
- Terms-of-Reference Freeze;
- Review Question Integrity;
- Premise Register;
- Causal Ladder;
- Narrative Integrity Audit;
- Known Then vs Known Now;
- Counterfactual Challenge;
- Pre-Closure Challenge;
- Explicit Reopen Triggers.

Closure controls currently require:
- Protection track resolved;
- Inquiry track resolved;
- no unresolved material items;
- Independent Challenge considered;
- two distinct authorised challenge approvals.

---

# 12. VERA — VERIFICATION DISCIPLINE

VERA is a method/record, not initially a separate runtime service.

VERA asks:

- Verified against what?
- Verified by whom?
- Using which evidence?
- Within what scope?
- What remains unverified?

Implemented V2 action rule:
- `COMPLETION_CLAIMED` cannot become `VERIFIED` without a VERA record.
- action owner should not be the sole verifier.
- verification requires evidence references, scope and explicit unverified remainder.

Key ladder:

```text
Implemented
→ Verified
→ Effective
→ Sustained / Rechecked
```

**Done ≠ Effective.**

Note for landscape review:
current `lib/command-doctrine.ts` still calls VERA an **"Evidence & Truth Engine"**. That wording should be corrected because the later V2 design deliberately avoids software claiming to be a truth engine.

Preferred operational wording:

> VERA establishes what can be verified against identified evidence, within an identified scope, and what remains unverified.

---

# 13. VITA — ASSURANCE & EFFECTIVENESS

VITA remains a logical module/rule library until scale justifies separation.

It should test:

- completeness;
- process integrity;
- evidence gaps;
- ownership;
- escalation;
- review integrity;
- effectiveness;
- sustainability;
- control failure;
- narrative certainty drift;
- unresolved issues.

VITA can flag that evidence relevant to effectiveness is present/absent.

Consequential effectiveness judgement remains human where required.

The system must distinguish:

```text
ACTION IMPLEMENTED
≠
ACTION VERIFIED
≠
ACTION EFFECTIVE
≠
EFFECT SUSTAINED
```

---

# 14. INDEPENDENT CHALLENGE / RED-TEAM LAYER

This was added after the Letby/documentary discussion highlighted how strongly a coherent narrative can affect interpretation.

**Important: the lesson is architectural, not a finding about Lucy Letby's guilt or innocence.**

IRIS must never encode:
- "she is guilty";
- "she is innocent";
- majority AI opinion;
- model consensus as truth.

The learning retained for ORVIA is:

> **A persuasive narrative — in either direction — can create anchoring. High-consequence review must deliberately test alternative explanations before the dominant interpretation is revealed to the challenger.**

Implemented in:
- `lib/v2/challenge.ts`
- `app/api/v2/control/challenge/route.ts`
- `supabase/v2/003_independent_challenge.sql`
- ADR-021.

## Challenge modes

- BLIND_INDEPENDENT
- ALTERNATIVE_HYPOTHESIS
- DISCONFIRMATION
- COUNTERFACTUAL
- NARRATIVE_DRIFT
- SOURCE_WEIGHTING

## Blind first pass

For high-consequence review, where practicable:

1. challenger receives the review question;
2. bounded evidence manifest;
3. provenance/epistemic labels;
4. scope and limitations;
5. **not the primary interpretation**.

The challenger produces:

- plausible alternative interpretations;
- evidence supporting each;
- evidence weakening each;
- discriminating evidence;
- missing/perishable evidence;
- counterfactual questions;
- source-weighting concerns;
- narrative-drift concerns;
- unresolved uncertainty.

Only after that first pass does comparison with the primary interpretation occur.

## No truth voting

Do not:
- count model votes;
- average confidence;
- treat 3 models agreeing as truth.

Instead preserve:

```text
PRIMARY ANALYSIS
        │
INDEPENDENT CHALLENGE
        │
ALTERNATIVE INTERPRETATIONS
        │
DISCRIMINATING / MISSING EVIDENCE
        │
DISAGREEMENT REGISTER
        │
AUTHORISED HUMAN CONSIDERATION
```

AI challenge is advisory only.

It cannot change IRIS state.

Human consideration is attributable and reasoned.

## Letby learning to preserve in future design reviews

The Letby discussion must be carried forward as a concrete test case for **anti-anchoring architecture**, not a re-trial engine.

When using that learning:
- keep criminal guilt assessment outside ORVIA's automated authority;
- separate governance/system questions from criminal conclusions;
- preserve competing narratives;
- distinguish contemporaneous information from retrospective interpretation;
- distinguish medical/professional opinion from observed fact;
- test denominator/context issues;
- test causal jumps;
- test source selection and omitted facts;
- preserve uncertainty;
- require discriminating evidence, not rhetorical balance;
- challenge an exculpatory narrative just as hard as an inculpatory one.

This is the practical expression of:
- No Yes-Men;
- No Single-Point Bias;
- 360-Degree Perspective;
- Reflection Before Reaction;
- Truth Before Comfort;
- Every Person Is Human.

---

# 15. HUMAN ASSURANCE BOARD

A recurring monthly/quarterly human governance layer was added to the design.

Purpose:

> IRIS tells the organisation what the system recorded.  
> The Human Assurance Board tests whether that matches organisational reality.

Representative membership may include different organisational levels and roles, for example:
- manager;
- senior clinician;
- junior clinician/HCA;
- domestic/cleaner;
- porter;
- catering;
- phlebotomist;
- administration;
- estates;
- governance/safeguarding;
- patient/family/service-user voice where appropriate.

Core rule:

> **Equal right to contribute and challenge does not mean identical statutory or professional authority.**

The cleaner's observation must not be discounted because of rank.

A clinical/statutory decision still belongs to the appropriately authorised professional.

## HAB categories

Implemented data model supports:

- KNOWN
- INFERRED
- DISPUTED
- UNKNOWN
- MISSING
- CHANGED
- NOT_WORKING
- OPEN
- DECISION_REQUIRED
- ASSURANCE_LIMITATION

HAB recommendations are advisory until an authorised human:

- ACCEPTS;
- MODIFIES; or
- REJECTS;

with reasons.

Only accepted/modified material recommendations become IRIS/JAPAN actions.

Dissent must remain preserved.

HAB access must follow least privilege; mixed-role membership does not automatically grant access to all patient/safeguarding records.

---

# 16. AI GATEWAY / MULTI-MODEL POSITION

Do not build uncontrolled AI-to-AI conversations.

Architecture:

```text
IRIS/HIVE
   │
   └── ORVIA AI GATEWAY
         ├── OpenAI adapter
         ├── Anthropic adapter
         ├── Google adapter
         ├── Azure/other approved adapter
         └── deterministic/manual fallback
```

AI tasks may include:
- transcription;
- extraction;
- summarisation;
- semantic comparison;
- possible contradiction identification;
- narrative-drift suggestion;
- report drafting;
- search/retrieval support;
- alternative-hypothesis generation.

AI must not:
- determine guilt/innocence;
- determine abuse/neglect;
- decide credibility;
- rank suspicion;
- make clinical decisions;
- make safeguarding findings;
- determine disciplinary outcomes;
- close serious matters;
- exercise state-changing authority.

## Multi-model use

Routine:
- deterministic code first;
- one approved model only when needed.

High consequence:
- independent challenge may use another approved model/reviewer.

Multi-model means **challenge**, not consensus.

## AI Removal Test

Turn every model off.

The system must still permit:
- capture;
- source preservation;
- case creation;
- ownership;
- escalation;
- JAPAN;
- human review;
- evidence addition;
- verification;
- effectiveness review;
- independent human challenge;
- closure;
- reporting.

If not, the design fails.

---

# 17. INTEGRATION FABRIC

IRIS owns desired business state.

Integration adapters own vendor-specific transport.

IRIS must not contain:
- SharePoint retry rules;
- Microsoft Graph OAuth lifecycle;
- Datix vendor-specific errors;
- telephony API implementation details.

Use a transactional outbox:

```text
BEGIN
  change IRIS state
  write domain event
  write outbound command
COMMIT

worker sends external effect later
```

This prevents:
"IRIS says it happened, but the external request disappeared."

n8n/MCP may assist with non-authoritative integration/automation.

Neither should become the IRIS workflow source of truth.

Critical app-to-app integrations should prefer direct APIs/webhooks/queues/workers where appropriate.

---

# 18. EVENT & AUDIT MODEL

Canonical design is:

> relational authoritative current state + append-only event/audit ledger + transactional outbox + durable workers.

Do not convert ORVIA into pure event sourcing unless a future measured need justifies it.

Canonical event concepts include:

- event_id
- tenant_id
- event_type
- schema_version
- correlation_id
- causation_id
- idempotency_key
- aggregate_type
- aggregate_id
- aggregate_version
- case_id
- event_time
- received_time
- recorded_time
- actor_type
- actor_id
- acting_role
- authority_basis
- source_id
- source_event_id
- evidence refs
- config bundle version
- sensitivity
- trace_id
- payload hash
- limitations
- AI invocation ref where relevant.

Delivery semantics:

> **at-least-once + idempotent processing + reconciliation**

Do not promise meaningful end-to-end "exactly once".

---

# 19. FAILURE STATES & RECOVERY

Failure is not a hidden technical error. It becomes visible state.

Key states include:

- NO OWNER / UNOWNED
- OWNER NOT ACKNOWLEDGED / ACK_OVERDUE
- ACCOUNTABLE OWNER NOT ACTING
- ESCALATION FAILED
- NOTIFICATION FAILED
- REQUIRED EVIDENCE MISSING
- HUMAN REVIEW OVERDUE
- WORKFLOW STALLED
- INTEGRATION UNAVAILABLE
- AI PROVIDER UNAVAILABLE
- SOURCE INGESTION FAILED
- DUPLICATE EVENT SUSPECTED
- RULE CONFLICT
- PERMISSION FAILURE
- VERIFICATION FAILED
- NOT EFFECTIVE
- RECHECK OVERDUE
- REOPENED
- SYSTEM CONTINUITY MODE

Core rule:

> **No failure silently disappears.**

A retry is not the same as recovery.

Recovery requires:
1. failure identified;
2. intended state reconstructed;
3. effect replayed/substituted;
4. internal/external records reconciled;
5. duplicate effects excluded;
6. accountable owner confirms restoration where necessary;
7. failure closed with evidence.

---

# 20. ORVIA CONTROL PLANE — ASSURANCE OF ORVIA

IRIS cannot certify that IRIS worked solely using IRIS-generated evidence.

Independent control/observability must monitor:

- API health;
- database health;
- queue depth;
- outbox lag;
- stuck workers;
- workflow stalls;
- notification delivery;
- integration failures;
- tenant error rates;
- configuration drift;
- permission anomalies;
- audit integrity;
- AI latency/errors/cost;
- backup completion;
- restore testing;
- continuity activations.

Important invariants:

- every accepted capture has success or explicit failure/quarantine;
- every material open case has accountable human or visible owner failure;
- every completed material action has evidence or documented permitted exception;
- every outbound command has acknowledged success, known failure or reconciled uncertainty;
- every consequential closure has required VERA state;
- every AI-derived artefact records provider/model/prompt/input-set/limitations.

Synthetic journeys should test the platform from outside the normal runtime.

---

# 21. WHITE-LABEL / TENANT MODEL

Core rule:

> **Configure customers. Do not fork customers.**

Tenant configuration should govern:
- branding;
- domain;
- organisation hierarchy;
- sites/services;
- users/roles;
- permissions;
- terminology;
- workflow packs;
- forms;
- evidence requirements;
- SLAs;
- escalation routes;
- Voice;
- notification channels;
- integrations;
- retention;
- AI policy;
- HAB cadence;
- regulatory profile;
- feature flags.

Published workflow/config versions are never edited in place.

Lifecycle:

```text
DRAFT
→ VALIDATED
→ TEST ENVIRONMENT
→ CUSTOMER UAT
→ APPROVED
→ PUBLISHED
→ RETIRED
```

Open cases remain pinned to their original version unless explicit audited migration is authorised.

## Config compiler

`lib/v2/config-compiler.ts` validates examples such as:
- no accountable role;
- unknown/unpopulated accountable role;
- circular escalation;
- AI-required workflow when AI disabled;
- invalid SLA;
- missing notification route;
- incomplete Serious Concern tracks.

Future compiler should also test:
- impossible transitions;
- inaccessible required evidence;
- conflicting permissions;
- contradictory retention;
- no emergency route;
- role changes with no successor.

---

# 22. PUBLIC CLAIMS CONTROL

V2 introduced a public-claims register concept.

Every important marketing statement should map to:

```text
PUBLIC CLAIM
→ CONTROL
→ ACCEPTANCE TEST
→ PRODUCTION EVIDENCE
```

Example:

"Humans own consequential judgement"
→ human-gate control
→ API test that service/AI cannot close serious case
→ audited production evidence.

This prevents website copy becoming ahead of actual capability.

---

# 23. CURRENT LIVE COMMAND V3 — WHAT EXISTS NOW

The later landscape build has moved Command significantly forward.

## Live Founder interface

`components/DashboardHome.tsx`

- Chat-style founder interface.
- IRIS reads live ORVIA state.
- local browser chat history for convenience.
- speech synthesis for local voice output.
- does not make local chat history authoritative evidence.

## Current live IRIS endpoint

`app/api/iris/ask/route.ts`

Current behavior:

### A0 read-only
Read-only questions:
- query live asset/work/system/client/access state;
- return current status;
- do **not** create a work item.

### Action requests
Action requests are classified A0–A4 and, where appropriate, written to `admin_work_queue`.

## Current authority levels

`lib/command-policy.ts`

- **A0** — read-only
- **A1** — drafting/research/preparation
- **A2** — controlled reversible production change
- **A3** — consequential external/change action requiring human approval
- **A4** — human-only authority such as signing/payment/legal filing/safeguarding finding/clinical decision/culpability finding.

Current rule:
A3/A4 require human approval.

## Current work classes

Current Command rule layer classifies:
- ROUTINE
- MATERIAL
- HIGH-CONSEQUENCE

Important limitation:
the live Command classifier is currently regex/keyword based. It is useful as an intake aid but **must not become the final safety/materiality classifier for the V2 evidence engine**. V2 needs approved rule packs + human authority for material/high-consequence classification where required.

## Work board

`app/work/page.tsx`

Shows:
- NEEDS JOHN
- FOR REVIEW / BLOCKED
- IN PROGRESS
- COMPLETED

Combines tasks and IRIS-routed work.

This should be retained and eventually backed by the proper V2 work-item model.

## Asset registry

`lib/asset-registry.ts`

Live asset registry is now the source for the internal ORVIA landscape.

Do not replace this with a new static project list.

## Client registry

`lib/client-registry.ts`

Client Workspaces now use `admin_organisations` as the master external organisation record.

Do not invent client/service relationships.

## Access register

Command V3 added `admin_access_accounts`.

It stores non-secret account/control metadata only.

No passwords, API keys or recovery codes should be stored there.

## PWA

Current Command is now installable/mobile-first.

The PWA service worker was deliberately designed not to cache authenticated/API/evidence content.

Do not lose this during the IRIS landscape refit.

---

# 24. CURRENT COMMAND DOCTRINE — RECONCILIATION NEEDED

`lib/command-doctrine.ts` currently contains:

```text
IRIS → responsible lead → VERA → CRUCIBLE → John
```

and defines:
- VERA;
- CRUCIBLE as independent challenge agent;
- IRIS as single human interface.

This is broadly compatible with V2 but needs terminology reconciliation.

Recommended mapping:

- **CRUCIBLE** = user-facing/operational name for the V2 **Independent Challenge** discipline, not a second duplicate architecture.
- **VERA** = evidence verification, not "Truth Engine".
- **IRIS** = conductor/workflow controller, but should not imply all VITA/HIVE roles collapse into IRIS.

Do not build both "CRUCIBLE" and "Independent Challenge" as separate red-team systems unless a genuine distinct use case emerges.

---

# 25. KNOWN DOCUMENTATION / IMPLEMENTATION DRIFT TO FIX

The next landscape review should explicitly fix these:

1. `docs/v2/HUMAN_HANDOFF.md` still contains the old instruction "keep PR #5 draft". PR #5 is merged. Update the handoff document.

2. `lib/command-doctrine.ts` still calls VERA an "Evidence & Truth Engine". Replace "truth" language with verified/evidence wording.

3. The Command V3 A0–A4 authority model and V2 JAPAN Tiers 0–3 are related but not yet formally mapped. Create a mapping rather than running two ambiguous severity systems.

4. CRUCIBLE and V2 Independent Challenge should be consolidated/mapped, not duplicated.

5. Current `/api/iris/ask` writes general actionable work into `admin_work_queue`; it is not yet using the V2 workflow/action/case state machines.

6. Current Command "Completed" state is operational status. V2 must preserve the distinction between completed / verified / effective / sustained.

7. Current `admin_verification_checks` is useful live scaffolding, but future customer-evidence VERA should live in the dedicated V2 evidence environment.

8. Current live IRIS status answering is deterministic/live-data based, which is good. Do not replace that with free-form LLM answers that can invent estate state.

9. Current browser speech synthesis and local conversation history are UX conveniences, not ARIA evidence/capture infrastructure.

10. `app/v2` is currently a foundation/architecture view, not the full working customer case application.

---

# 26. WHAT IS BUILT VS DESIGNED VS HELD

## BUILT / MERGED

- V2 TypeScript control types.
- deterministic action state machine.
- case state machine.
- JAPAN tier controls.
- emergency-deferred JAPAN.
- Serious Concern track rules.
- VERA transition requirements.
- effectiveness-before-close rule.
- tenant configuration compiler.
- Human Assurance Board model.
- Independent Challenge TypeScript model and validator.
- V2 self-test/control API routes.
- three dedicated V2 migration files.
- V2 foundation UI.
- current live Command conversational IRIS.
- A0–A4 operational authority classification.
- live work board.
- live asset/client/access registry integrations.
- Command mobile PWA.

## DESIGNED / PARTIALLY SCAFFOLDED

- dedicated V2 evidence environment.
- full HIVE customer evidence repository.
- VITA full rule packs.
- VERA customer evidence workflow.
- full Serious Concern UI.
- HAB operational portal.
- AI Gateway provider adapters.
- Integration Fabric production connectors.
- independent Control Plane/reconciliation service.
- tenant self-configuration/UAT compiler.
- full claims-to-controls dashboard.

## DELIBERATELY HELD

- applying V2 schema to shared Supabase.
- routing live safeguarding/clinical evidence into V2.
- automated consequential judgement.
- AI write path.
- autonomous serious-case closure.
- treating AI consensus as truth.

---

# 27. HUMAN DECISIONS STILL REQUIRED BEFORE CUSTOMER-EVIDENCE PRODUCTION

1. provision/approve dedicated V2 Supabase/PostgreSQL evidence environment;
2. approve first customer organisation hierarchy;
3. define accountable roles and real users;
4. map A0–A4 Command authority to JAPAN materiality Tiers 0–3;
5. define emergency/break-glass authority;
6. define retrospective JAPAN deadlines;
7. approve Serious Concern closure/challenge roles;
8. approve retention/legal hold/deletion schedules by processing purpose;
9. define ORVIA/customer controller/processor responsibilities;
10. approve first production workflow/escalation map;
11. approve HAB membership/cadence/confidentiality/access rules;
12. approve public claims that may become TESTED/EVIDENCED;
13. run customer UAT;
14. run AI-off continuity test;
15. run notification/integration failure exercises;
16. run backup restore test;
17. run tenant-isolation tests;
18. run independent challenge test on a complex non-live fixture.

---

# 28. NEXT BUILD ORDER — DO THIS, DO NOT REDESIGN THE CORE

## Priority 0 — reconcile current Command V3 with canonical V2

- update stale docs;
- map A0–A4 to JAPAN tiers;
- map CRUCIBLE to Independent Challenge;
- fix VERA "truth" language;
- define one shared vocabulary.

## Priority 1 — dedicated V2 database

- create dedicated project/environment;
- apply `001_v2_core.sql`;
- review;
- apply `002_v2_control_plane.sql`;
- review;
- apply `003_independent_challenge.sql`;
- enable/test tenant RLS and evidence storage policies;
- generate DB types.

## Priority 2 — real V2 IRIS persistence

Wire:
- Case
- WorkflowDefinition
- WorkflowInstance
- WorkItem
- Action
- HumanGate
- JAPANAssessment
- Evidence/Artefact
- Assertion
- Contradiction
- Dissent
- Verification
- EffectivenessReview
- FailureRecord
- ChallengeReview

to the dedicated backend.

## Priority 3 — convert live Command UI into real V2 operational surfaces

Retain current landscape shell and add:
- My Work
- Capture
- Cases
- Actions
- Evidence
- Serious Concerns
- Assurance
- Independent Challenge
- Human Assurance Board
- System Health.

## Priority 4 — Control Plane

Build:
- outbox worker;
- timers;
- reconciliation;
- failure monitoring;
- config drift;
- synthetic journey tests;
- continuity mode.

## Priority 5 — AI Gateway

Only after deterministic core works without it.

---

# 29. NON-NEGOTIABLE TESTS

Before V2 can be sold as fully operational:

- AI disconnected: critical workflow still works.
- duplicate event replay: one consequential business effect.
- tenant A cannot read tenant B at API/DB/storage/search layers.
- no accountable human: visible failure + escalation.
- notification sent but undelivered: not treated as acknowledgement.
- action completed without evidence: remains unverified.
- contradictory evidence: preserved; verification reopens where relevant.
- workflow V2 published while V1 case open: V1 remains pinned.
- permission removed mid-case: current access removed; historical attribution preserved.
- Serious Concern: Protection and Inquiry remain distinct.
- precaution never silently becomes finding.
- independent challenge first pass can be blind.
- challenge disagreement remains visible.
- AI cannot transition state.
- service account cannot close high-consequence case without human controls.
- backup restore succeeds within agreed RPO/RTO.
- public claims map to passing controls.

---

# 30. WHAT THE NEXT CHAT MUST NOT DO

Do not:

- start IRIS again from scratch;
- replace the live asset/client/work PWA shell with a static prototype;
- apply V2 migrations to the current shared Supabase project;
- turn HIVE/VITA/VERA/JAPAN into unnecessary separate microservices;
- make AI mandatory;
- let AI change case state;
- introduce model voting as truth;
- collapse Protection and Inquiry;
- make emergency action wait for workflow approval;
- treat a queue as accountable human authority;
- let HAB become a statutory decision body;
- overwrite original source with summaries;
- label every disagreement a contradiction requiring one side to be "dismissed";
- treat "completed" as "effective";
- use Lucy Letby material as an automated guilt/innocence benchmark;
- delete the later Command V3/PWA/live registry work.

---

# 31. SOURCE REGISTER

## GitHub canonical sources

- `docs/v2/CANONICAL_TECHNICAL_SPEC.md`
- `docs/v2/ADR_REGISTER.md`
- `docs/v2/ARCHITECTURE.md`
- `docs/v2/SCOPE_AND_RESPONSIBILITY.md`
- `docs/v2/HUMAN_HANDOFF.md`
- `lib/v2/types.ts`
- `lib/v2/action-machine.ts`
- `lib/v2/case-machine.ts`
- `lib/v2/materiality.ts`
- `lib/v2/config-compiler.ts`
- `lib/v2/human-assurance.ts`
- `lib/v2/challenge.ts`
- `lib/v2/self-test.ts`
- `app/api/v2/control/*`
- `app/v2/page.tsx`
- `supabase/v2/001_v2_core.sql`
- `supabase/v2/002_v2_control_plane.sql`
- `supabase/v2/003_independent_challenge.sql`

## Current live Command sources

- `app/api/iris/ask/route.ts`
- `lib/command-policy.ts`
- `lib/command-doctrine.ts`
- `components/DashboardHome.tsx`
- `components/IrisConsole.tsx`
- `app/work/page.tsx`
- `app/workspace/page.tsx`
- `lib/asset-registry.ts`
- `lib/client-registry.ts`
- `lib/access-register.ts`

## Internal SharePoint constitutional source

- `ORVIA_FULL_KNOWLEDGE_DOWNLOAD_12Aug2026.docx`

This contains the internal constitutional principles used to shape Human Reality, Human Continuity, AI Removal, Board Test, No Yes-Men, Accountability Without Fear, Every Person Is Human, No Single-Point Bias, Truth Before Comfort, 360-Degree Perspective and Disclosure Fidelity.

---

# 32. PASTE-FIRST PROMPT FOR THE NEXT CHAT

Use the following at the top of the new landscape-review chat:

> You are continuing the existing ORVIA IRIS V2 programme. Do not redesign from scratch.
>
> The canonical runtime is a modular monolith with IRIS as the only authoritative deterministic workflow/state controller; HIVE as evidence/assertion/provenance; JAPAN as the human material-action discipline; VERA as verification; VITA as assurance/effectiveness; Independent Challenge as the governed red-team layer; Human Assurance Board as representative governance feedback; optional AI Gateway; Integration Fabric; and an independent ORVIA Control Plane.
>
> First inspect the current `ORVIA-Oversight/orvia-command-centre` main branch and this handover. Preserve the later Command V3 live work: conversational IRIS, A0–A4 authority, live work board, asset registry, client registry, access register, direct SSO and PWA/mobile shell.
>
> The current shared Supabase project is operational Admin/Voice/PTT/Web/MIA state and MUST NOT receive the V2 customer-evidence migrations. The V2 schema files `001_v2_core.sql`, `002_v2_control_plane.sql`, and `003_independent_challenge.sql` require a dedicated evidence project.
>
> Reconcile current Command V3 with V2 rather than replacing it. Specifically fix stale handoff docs, VERA "truth engine" wording, map A0–A4 to JAPAN materiality tiers, unify CRUCIBLE with Independent Challenge, and then wire the real V2 entities/state machines to a dedicated backend.
>
> Preserve the Lucy Letby learning as an anti-anchoring design lesson only: high-consequence review requires blind first-pass Independent Challenge, alternative hypotheses, disconfirming/discriminating evidence, missing evidence, narrative/source-weighting challenge and preserved uncertainty. Do not encode guilt/innocence, AI consensus or truth voting.
>
> Non-negotiables: Human first/human last; AI can be switched off; failures become visible state; precaution is not finding; Protection and Inquiry remain separate; completion is not verification; verification is not effectiveness; queues are not accountable humans; emergency/statutory action never waits for ORVIA.
>
> Begin by producing a current-state gap map: LIVE / BUILT BUT UNWIRED / DESIGNED / STALE OR CONFLICTING / HUMAN DECISION REQUIRED. Then fix the P0 conflicts before adding new features.

---

# 33. BOTTOM LINE

Do not lose the central proposition:

> **IRIS is not an AI that decides what happened. It is the deterministic accountability spine that preserves what was reported, makes ownership and failure visible, forces consequential action to be justified and human-owned, keeps alternative interpretations alive, records what was actually verified, tests whether action worked, and makes unresolved uncertainty impossible to hide.**

That is the architecture to preserve through the landscape review.
