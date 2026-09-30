# DeerFlow inside ORVIA Command

Reviewed: 30 Sep 2026

## Position

DeerFlow is the **work floor beneath IRIS**.

It is not a replacement for Command, IRIS, HIVE, VITA, VERA or human authority.

Target workflow:

Managing Director
→ Command
→ IRIS
→ DeerFlow Work Floor
→ ORVIA specialist agents / tools / external workers
→ HIVE evidence + work receipts
→ Independent Challenge / VITA where required
→ VERA verification
→ human approval where required
→ action

## Why it sits here

DeerFlow is suited to long-horizon work that benefits from decomposition into sub-tasks, multiple bounded agents, skills/tools, memory and sandboxed execution.

IRIS decides when to use it.

## Use cases

- multi-step research;
- large evidence or document work;
- parallel specialist analysis;
- technical build decomposition;
- media/document processing chains;
- cross-department tasks;
- controlled research packs;
- delegated work requiring several bounded workers.

## It must not own

- authoritative workflow state;
- final evidence status;
- approval decisions;
- safeguarding findings;
- clinical findings;
- employment outcomes;
- legal conclusions;
- culpability findings;
- final publication/spend/contract authority.

## Integration contract

Command sends a bounded job containing:
- ORVIA job id;
- objective;
- permitted context;
- permitted sources;
- permitted tools;
- verification requirement.

DeerFlow returns:
- run id;
- status;
- outputs;
- execution receipt;
- any failure state.

IRIS/HIVE stores the authoritative state and receipt.

## Acceptance gate

Do not mark DeerFlow live until:
1. runtime endpoint is connected;
2. auth is verified;
3. one low-risk test job completes;
4. job decomposition is visible;
5. receipt returns to HIVE;
6. VERA can verify the result;
7. human-gated jobs remain blocked;
8. tenant isolation is proven;
9. timeout/failure states return visibly;
10. disabling DeerFlow does not stop core IRIS workflow.
