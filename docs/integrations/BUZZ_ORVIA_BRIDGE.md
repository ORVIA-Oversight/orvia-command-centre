# ORVIA Command — Buzz Bridge

**Upstream:** `block/buzz`  
**Role in ORVIA:** shared human/agent collaboration rooms and signed event flow beneath IRIS.

## Boundary

Buzz does **not** replace IRIS, HIVE, VITA or VERA.

ORVIA authority remains:

```
Managing Director
  ↓
IRIS — deputy / sole conductor
  ↓
Department leads / specialist agents / external workers
  ↔ Buzz rooms, agent conversations, delegation and workflow events
  ↓
HIVE — canonical work/evidence state
  ↓
VITA / VERA
  ↓
Human approval where required
  ↓
Action
```

Buzz may hold the collaborative conversation and signed workspace event stream. Every material job, handoff, evidence reference, approval request and completion used by ORVIA must also have an ORVIA/HIVE receipt.

## Why it fits

Buzz is designed for humans and agents to occupy the same rooms, with signed events, agent identities, workflows, project memory, search and audit. ORVIA uses those capabilities for the 360-degree workforce model:

- department lead ↔ specialist;
- specialist ↔ specialist;
- agent ↔ external worker;
- challenge and return;
- escalation to IRIS;
- escalation to Managing Director;
- human review in the same collaboration chain.

## Mapping

| Buzz | ORVIA |
|---|---|
| Community | ORVIA organisation / tenant boundary |
| Channel / room | Department, case, client, project or work room |
| Agent identity | `admin_agents.code` |
| Job request kind 43001 | `admin_brain_jobs` or controlled `admin_work_queue` item |
| Workflow events 46001–46012 | job/work state events + verification/approval receipts |
| Message / thread | collaboration context; material decisions copied to HIVE |
| Approval/review event | ORVIA approval record; Buzz cannot override ORVIA authority |
| Git event | technical work evidence linked to project/repository |
| Media event | source/derivative references registered through HIVE/media assets |

## Required production configuration

- `BUZZ_RELAY_URL`
- `BUZZ_PRIVATE_KEY` in approved secret storage
- ORVIA-to-Buzz identity map
- tenant/community mapping
- channel naming policy
- material-event receipt writer
- retention and deletion mapping
- end-to-end acceptance test

## Acceptance gate

Buzz integration is not LIVE VERIFIED until:

1. IRIS can create/route a controlled job into an authorised Buzz room.
2. Only authorised agent identities can see the room.
3. One agent can delegate to another and the ORVIA `admin_handoffs` record is created.
4. Completion creates an ORVIA/HIVE receipt.
5. Evidence references resolve back to the original source.
6. A VERA-required job creates/updates verification state.
7. A high-consequence action cannot bypass ORVIA human approval.
8. Cross-tenant room access fails closed.
9. Loss of Buzz does not corrupt HIVE canonical work state.

## Design rule

The ORVIA interface may borrow the collaborative feel of Buzz and Sintra, but the end user remains inside ORVIA Command. Buzz is an integrated workforce substrate, not a second dashboard the Managing Director has to operate.
