# Buzz integration inside ORVIA Command

Reviewed: 30 Sep 2026
Source: block/buzz (Apache 2.0)

## Why it fits

Buzz is a self-hostable workspace where humans and AI agents share rooms, workflows, project memory and signed events. Its model maps well to ORVIA's intended 360-degree workforce because agents can participate as first-class members, delegate, review, collaborate and leave an auditable event trail.

## ORVIA placement

Buzz is **not** a replacement for IRIS, HIVE, VITA or VERA.

Target composition:

Managing Director
→ IRIS (Deputy / sole conductor)
→ ORVIA Departments / Roles / External Workers
→ Buzz-style collaboration rooms and signed handoffs
→ HIVE master work/evidence state
→ VITA challenge / VERA verification
→ human approval where required
→ action

## Planned use

- department rooms;
- project/case rooms where appropriate;
- agent-to-agent collaboration;
- job handoff conversations;
- challenge/review loops;
- shared project memory;
- workflow events;
- searchable receipts;
- auditable human/agent participation.

## Guardrails

- HIVE remains authoritative for work and evidence;
- Buzz events are collaboration/audit events, not verified evidence by default;
- IRIS remains the sole orchestration authority;
- agent permissions remain scoped;
- no consequential safeguarding, clinical, employment, legal, financial or culpability decision becomes autonomous;
- tenant isolation and retention rules must be proven before sensitive customer deployment;
- only Buzz features that exist and pass ORVIA acceptance testing may be enabled.

## Integration acceptance tests

1. IRIS creates/assigns a controlled job.
2. Department lead delegates to a registered specialist.
3. Collaboration event is visible in the room/event stream.
4. Handoff is also recorded in Command/HIVE.
5. Specialist can return or escalate the work.
6. IRIS can reconstruct the complete chain.
7. VERA receives verification when required.
8. Human gate blocks consequential action.
9. Cross-tenant access fails.
10. Deleting or editing a collaboration event cannot silently alter preserved HIVE evidence.
