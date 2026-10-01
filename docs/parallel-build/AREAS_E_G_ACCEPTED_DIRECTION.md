# Accepted Area E and Area G Direction

## Area E — AI / Model Gateway

Accepted principle: **the Model Gateway is a replaceable capability broker, not an intelligence layer.** Intelligence and user interaction remain with IRIS and the ORVIA Agent Team.

Required production functions:
- capability registry: provider/model capability, context limit, latency, cost, health, safety/approval state;
- routing engine driven by task type, input/evidence type, sensitivity, organisation policy, urgency, context size and availability;
- provider adapters behind a common interface;
- failover without exposing provider changes to the user;
- policy filtering so sensitive work uses only approved provider sets;
- audit/observability linked to HIVE: success, latency, cost, failures and fallback;
- source-aware outputs;
- mandatory human gates for safeguarding, clinical, employment, legal and culpability decisions.

Initial provider adapters may cover OpenAI/Azure OpenAI/Claude, while Gemini, Microsoft-hosted models, BytePlus/Dola Seed and future providers remain plug-compatible.

Normal IRIS UI must never display model names or API identifiers.

Acceptance themes:
- large PDF routing;
- 90-minute audio transcription + reasoning;
- provider failure and transparent fallback;
- safeguarding request halted before final finding;
- multi-modal mixed input merged into one provenance-preserving response.

## Area G — Skills / Memory / Teach IRIS

Accepted principle: a taught process becomes a **versioned organisational skill**, never an invisible conversational shortcut.

Minimum skill manifest:
- name
- purpose
- accepted inputs
- ordered steps/workflow
- required evidence
- responsible agent
- approval threshold
- permitted actions
- version
- owner
- effective date
- lifecycle status
- change history

Lifecycle:
`draft → review/approved → active → deprecated/retired`

Rules:
- active versions are immutable;
- edits create a new version;
- every execution records the exact skill version used;
- tenant isolation is mandatory;
- runtime permissions may never exceed the initiating user's permissions;
- health/social-care, safeguarding and employment-affecting skills require appropriate human approval before activation or consequential execution;
- Teach IRIS may draft a skill from a successful/corrected conversation, but it may not silently activate it.

Area G must build on Area B's accepted shared-object and tenant contract rather than create a separate memory store.

Acceptance themes:
- reject manifests missing mandatory fields;
- immutable active versions;
- high-consequence approval gate stops before action;
- no cross-tenant skill visibility or execution.
