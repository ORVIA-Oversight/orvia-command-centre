# ORVIA V2 Architecture Decision Register

Status: accepted baseline for implementation review

| ADR | Decision |
|---|---|
| ADR-001 | Start as a modular monolith; split services only when measured need justifies it. |
| ADR-002 | IRIS is the only authoritative workflow/state controller. |
| ADR-003 | Use relational current state plus append-only audit/domain events and a transactional outbox. |
| ADR-004 | Use at-least-once delivery, idempotent processing and reconciliation; do not promise exactly-once delivery. |
| ADR-005 | HIVE preserves original source/provenance and separates originals from derivatives and assertions. |
| ADR-006 | Evidence, assertion, decision and recommendation are separate entities. |
| ADR-007 | Responsible actor/queue is separate from accountable human authority. |
| ADR-008 | JAPAN is tiered by materiality; software checks structure, humans judge material action. |
| ADR-009 | Urgent protective action may use emergency-deferred JAPAN and mandatory retrospective review. |
| ADR-010 | AI is an optional sidecar with no direct state-change route. |
| ADR-011 | Multi-model use is challenge, not consensus or truth voting. |
| ADR-012 | Serious Concern always separates PROTECTION from INQUIRY. |
| ADR-013 | Version workflows, tenant config, prompts, evidence rules, permissions and integration mappings. |
| ADR-014 | White-label by configuration; never fork tenant code. |
| ADR-015 | Tenant configuration must compile/validate before publication. |
| ADR-016 | VERA remains a verification discipline/record until scale proves a separate service is needed. |
| ADR-017 | VITA remains an assurance/effectiveness module until scale proves separation is needed. |
| ADR-018 | Human Assurance Board recommendations remain advisory until authorised human consideration. |
| ADR-019 | Independent observability/reconciliation must not depend solely on IRIS self-reporting. |
| ADR-020 | Public product claims map to explicit controls and acceptance evidence. |
| ADR-021 | Independent Challenge is a governed red-team function inside IRIS/VITA, not a second decision engine. Its initial high-consequence pass is blind to the primary interpretation, disagreement is preserved, and an authorised human considers the result. |
