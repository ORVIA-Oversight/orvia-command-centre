# ORVIA Review Engine - Independent Workstream Architecture

## Core rule

Specialist tools do not sit inside IRIS, VITA, DEREK or any other ORVIA reasoning layer.

They are allocated as independent workstreams. Each workstream receives a defined evidence scope, performs its own specialist examination and produces its own source-linked observation report.

No specialist tool is allowed to decide the overall case position.

## Operating model

1. Intake and scope
2. Preserve originals and record provenance
3. Allocate independent workstreams
4. Each workstream examines only its allocated evidence
5. Each workstream produces a separate observation report
6. Reports enter an Evidence Consolidation Gate
7. The Three Sides Review compares:
   - their account
   - client account
   - evidential position
8. Relevant legal, policy and regulatory framework is applied after the observations are available
9. VITA challenges the combined interpretation
10. DEREK verifies material factual claims and citations
11. Human review and sign-off
12. Final controlled report

## Workstreams

### WS-DOCUMENT-METADATA
Tool family: oletools and document-property parsers.
Role: inspect Office/PDF properties, authors, modifiers, revisions, embedded objects and structural anomalies.
Output: Document Metadata Observation Report.
Boundary: records observations only. A later modification date is not automatically labelled fabrication.

### WS-CHRONOLOGY
Tool family: Plaso / log2timeline.
Role: generate a normalised event chronology from files, messages, logs and metadata.
Output: Forensic Chronology Observation Report.
Boundary: reports dates, provenance, clusters and anomalies. It does not decide motive or legal significance.

### WS-TIMELINE-ANALYSIS
Tool family: Timesketch.
Role: analyse and annotate large event timelines and compare events across sources.
Output: Timeline Analysis Observation Report.
Boundary: remains an independent analytical report until consolidation.

### WS-ENTITY-RELATIONSHIPS
Tool family: Aleph / FollowTheMoney.
Role: identify and map people, organisations, records and relationships.
Output: Entity and Relationship Observation Report.
Boundary: reports links and source provenance; no automatic culpability or reliability conclusion.

### WS-CASE-STRUCTURE
Tool family: DFIR-IRIS concepts/service.
Role: hold specialist case notes, artefacts and task history for its allocated examination.
Output: Investigation Case Structure Report.
Boundary: it is not ORVIA IRIS and does not control ORVIA workflow.

### WS-DISK-FORENSICS
Tool family: Autopsy + The Sleuth Kit.
Role: inspect authorised disk/filesystem evidence, recovered files and deleted artefacts.
Output: Disk and Filesystem Forensic Observation Report.
Boundary: specialist workstream, source-linked and separately reviewed.

### WS-WINDOWS-EVENTS
Tool family: Hayabusa.
Role: inspect supplied Windows event logs and generate event findings/timelines.
Output: Windows Event Log Observation Report.

### WS-ENDPOINT-FORENSICS
Tool family: Velociraptor.
Role: examine authorised endpoint artefacts where this evidence type is legitimately available.
Output: Endpoint Forensic Collection and Observation Report.

### WS-MEMORY-FORENSICS
Tool family: Volatility 3.
Role: analyse supplied memory images.
Output: Memory Forensic Observation Report.

### WS-OSINT-RESEARCH
Tool family: SpiderFoot plus authoritative public sources.
Role: perform proportionate independent public-source research.
Output: Independent OSINT Observation Report.
Boundary: client-supplied evidence and independent research remain visibly separate.

### WS-USERNAME-RESEARCH
Tool family: Sherlock.
Role: narrow public username correlation where relevant.
Output: Username Correlation Observation Report.

### WS-INFRASTRUCTURE-RESEARCH
Tool family: OWASP Amass.
Role: public domain and infrastructure relationship research.
Output: Domain and Infrastructure Observation Report.

## Observation report schema

Every workstream report should contain:

- Workstream ID
- Tool/version
- Examiner/automation identity
- Scope allocated
- Sources received
- Sources not received
- Hash/provenance references where available
- Method used
- Observations
- Anomalies
- Limitations
- Contrary observations
- Unresolved questions
- Files/events/entities requiring another workstream
- Confidence in each observation where deterministically supportable
- Source references
- Completion timestamp

## Evidence Consolidation Gate

The gate must never silently merge or rewrite specialist conclusions.

It records each observation as one of:

- independently observed
- corroborated by another workstream
- contradicted by another source/workstream
- interpretation required
- unresolved
- outside scope

Only after this gate does ORVIA perform the Three Sides Review and legal/policy analysis.

## Important separation

IRIS allocates and tracks work. It does not become the forensic examiner.

HIVE preserves evidence and reports. It does not decide what they mean.

VITA challenges the later combined interpretation. It does not alter the specialist observation.

DEREK verifies factual claims and citations in the proposed controlled output.

The final report must retain traceability back to the independent workstream report and original source.

## Desired user interface

For each matter show:

WORKSTREAMS

- Document Metadata - allocated / running / completed
- Chronology - allocated / running / completed
- Timeline Analysis - allocated / running / completed
- Entity Relationships - allocated / running / completed
- OSINT - allocated / running / completed
- Disk Forensics - not required
- Windows Events - not required
- Endpoint Forensics - not required
- Memory Forensics - not required

Each card must show:

What this workstream does
Evidence allocated
Tool being used
Observations found
Separate report
Outstanding questions
Handoff status

The user should be able to open the separate report before any combined interpretation is shown.
