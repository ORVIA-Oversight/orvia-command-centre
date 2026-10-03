# IRIS Fast Path — candidate architecture

## Goal

A user gives IRIS one instruction and receives the first useful, grounded answer quickly. Deeper workers continue in parallel and update the same work object as verification completes.

This does not create another conductor. IRIS remains the sole state/workflow conductor.

## Proposed flow

INPUT
→ IRIS intent / authority / matter resolver
→ FAST CONTEXT
→ parallel bounded workers
→ early synthesis
→ response
→ deeper verification / VITA / DEREK
→ same matter updated

## Candidate connection / speed components

### LiteLLM Proxy
Candidate role: one low-latency model gateway in front of OpenAI, Anthropic, Gemini and compatible providers.

Use:
- one API shape for IRIS;
- provider fallback;
- model routing;
- cost and latency telemetry;
- fast model first, deeper model only when required.

Do not let LiteLLM own ORVIA workflow state.

### IBM MCP Context Forge
Candidate role: central MCP gateway / registry between IRIS and tool servers.

Use:
- standard connection surface for tools;
- connection discovery;
- auth and policy boundary;
- fewer one-off integrations inside IRIS.

IRIS remains the conductor; the gateway is transport and tool access.

### Valkey
Candidate role: hot in-memory cache.

Use:
- cache repeated retrievals;
- cache organisation / matter context;
- cache tool schemas and permissions;
- short-lived retrieval results;
- response fragments that are safe to reuse.

Target: remove unnecessary database and connector round-trips from the critical response path.

### NATS + JetStream
Candidate role: very fast event bus and worker queue.

Use:
- fan one IRIS instruction out to several bounded workers;
- stream worker completion events back;
- avoid polling;
- let the first useful worker results reach synthesis immediately.

### Qdrant
Candidate role: HIVE semantic retrieval index.

Use:
- rapidly retrieve the most relevant evidence chunks, policies, previous matter context and knowledge;
- retain the canonical source/provenance in HIVE/Supabase;
- treat Qdrant as retrieval acceleration, not evidence truth.

### Temporal
Candidate role: durable long-running workflow execution.

Use for:
- workflows that may last minutes, hours or days;
- retries;
- timers;
- external dependencies;
- resumable case processing.

Do not put every chat response through a heavy durable workflow. The first-response path should stay light.

### PydanticAI
Candidate role: typed worker/tool layer where useful.

Use:
- strict structured outputs;
- validation of worker results;
- typed tool contracts.

Do not create a second agent operating system. Use only for bounded workers if it materially simplifies implementation.

## Fast response design

### Tier 0 — immediate
Resolve:
- user identity;
- matter;
- authority;
- service pack;
- cached matter summary.

### Tier 1 — fast workers
Launch in parallel:
- evidence retrieval;
- chronology lookup;
- issue lookup;
- policy / framework retrieval;
- recent matter activity.

Return once enough reliable context exists to answer usefully.

### Tier 2 — deeper workers
Continue:
- contradiction analysis;
- external research;
- alternative explanations;
- VITA challenge;
- report assembly;
- DEREK verification.

### User experience

The user should see:

1. IRIS acknowledges the instruction immediately.
2. A useful grounded answer appears as soon as Tier 1 has enough evidence.
3. A visible status shows deeper checks continuing.
4. Material updates append to the same answer / matter.
5. The user never waits for an irrelevant worker.

## Performance targets for pilot

- request accepted: sub-second target;
- cached matter/context resolved: ~1 second target;
- first useful grounded answer: target under 10 seconds for simple matters;
- multi-source review response: target 30–180 seconds;
- deep review/report: minutes, while the user can continue working.

Targets are engineering goals, not promises until measured in production.

## Implementation order

1. Review Engine schema + practice workspace.
2. Add hot cache.
3. Add model gateway.
4. Add MCP gateway.
5. Add event bus / parallel worker events.
6. Add semantic evidence index.
7. Add durable orchestration for long tasks.
8. Instrument every stage for latency, cost, cache hit and failure.
