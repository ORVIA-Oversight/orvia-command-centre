export type MethodStage = 'Observation' | 'Reflection' | 'Visibility' | 'Insight' | 'Accountability';
export type EvidenceState = 'LIVE VERIFIED' | 'CONNECTED' | 'CONFIGURED' | 'BUILT NOT DEPLOYED' | 'NOT VERIFIED' | 'PLANNED ONLY';
export type Integration = { name: string; category: string; state: EvidenceState; note: string };
export type Mention = { source: string; title: string; snippet: string; sentiment: 'Positive' | 'Neutral' | 'Risk/Negative'; time: string };
export type DocumentRecord = { reference: string; title: string; version: string; status: string; owner: string; source: string };
