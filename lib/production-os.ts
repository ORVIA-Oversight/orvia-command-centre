export type AgentRecord = {
  id: string;
  name: string;
  role: string;
  purpose: string;
  inputs: string[];
  outputs: string[];
  tools: string[];
  permissions: string[];
  approval: string;
  version: string;
  status: 'ACTIVE' | 'DRAFT' | 'TESTING';
};

export type ToolRecord = {
  name: string;
  purpose: string;
  status: 'LIVE VERIFIED' | 'CONNECTED' | 'CONFIGURED' | 'BUILT NOT DEPLOYED' | 'NOT VERIFIED' | 'PLANNED ONLY' | 'BROKEN';
  agents: string[];
  note: string;
};

// John sees IRIS. These division leads sit behind IRIS and are routed automatically.
// Specialist capabilities are skills/tools inside a division, not separate personalities.
export const productionAgents: AgentRecord[] = [
  {
    id:'iris', name:'IRIS', role:'Chief of Staff & Single Interface',
    purpose:'Understands John in plain language, routes work to the right division, combines the answer and brings back only decisions, risks and next actions.',
    inputs:['Human request','Current company context','Verified live sources'],
    outputs:['EXECUTIVE_REPLY','WORK_ROUTE','DECISION_REQUEST'],
    tools:['ORCHESTRA routing','Hive work state','Approved connected systems'],
    permissions:['READ_CANONICAL','WRITE_WORK','ROUTE_DIVISIONS'],
    approval:'May coordinate and prepare work. Consequential actions remain human-approved.',
    version:'2.0', status:'ACTIVE'
  },
  {
    id:'stratos', name:'STRATOS', role:'Strategy Division',
    purpose:'Handles strategy, portfolio choices, scenarios, priorities and what ORVIA should start, stop, continue or defer.',
    inputs:['Objectives','Market evidence','Portfolio state','Commercial constraints'],
    outputs:['STRATEGY_BRIEF','OPTIONS','PRIORITY_RECOMMENDATION'],
    tools:['Research','Portfolio evidence','Financial context'],
    permissions:['READ_CANONICAL','WRITE_DRAFT'],
    approval:'Advises only. Strategic commitments require John.',
    version:'2.0', status:'ACTIVE'
  },
  {
    id:'ops', name:'OPS', role:'Operations Division',
    purpose:'Runs the operational picture: work, readiness, blockers, delivery, incidents, dependencies and launch checks.',
    inputs:['Hive work state','Projects','Deadlines','Operational evidence'],
    outputs:['OPERATING_PICTURE','READINESS_REVIEW','BLOCKER_LIST','ACTION_PLAN'],
    tools:['Hive / Supabase','monday projection','Command data'],
    permissions:['READ_CANONICAL','WRITE_WORK'],
    approval:'Can organise and progress routine work; cannot make consequential allocations or releases without approval.',
    version:'2.0', status:'ACTIVE'
  },
  {
    id:'vera', name:'VERA', role:'Intelligence & Evidence Division',
    purpose:'Determines what is supported, what is uncertain, what conflicts and what evidence is missing. Research and monitoring feed VERA rather than becoming separate visible agents.',
    inputs:['Claims','Documents','Live systems','Research results'],
    outputs:['FACT_PACK','SOURCE_MAP','CONTRADICTIONS','EVIDENCE_GAPS'],
    tools:['SharePoint','Controlled Library','Approved research sources','System evidence'],
    permissions:['READ_PRIVATE_SOURCE','WRITE_CLAIM_PROPOSAL'],
    approval:'May block unsupported factual claims. Does not decide policy or commercial action.',
    version:'2.0', status:'ACTIVE'
  },
  {
    id:'atlas', name:'ATLAS', role:'Back Office Division',
    purpose:'Combines administration, finance visibility, people, compliance and controlled-document production into one internal service desk.',
    inputs:['Mail','Calendar','Finance records','Policies','Controlled documents'],
    outputs:['ADMIN_BRIEF','FINANCE_BRIEF','CONTROLLED_DRAFT','COMPLIANCE_ACTIONS'],
    tools:['Microsoft 365','SharePoint','Stripe read data','Hive'],
    permissions:['READ_CANONICAL','WRITE_DRAFT','WRITE_WORK'],
    approval:'Cannot spend, sign, approve a controlled report or make employment decisions.',
    version:'2.0', status:'ACTIVE'
  },
  {
    id:'commercial', name:'COMMERCIAL', role:'Deals, Sales & Marketing Division',
    purpose:'Owns the revenue journey from prospecting through pipeline, proposals, partnerships, campaigns, negotiation and sale.',
    inputs:['Prospects','Pipeline','Campaigns','Pricing','Capacity','Market evidence'],
    outputs:['REVENUE_BRIEF','NEXT_BEST_ACTIONS','PROPOSAL_DRAFT','CAMPAIGN_PLAN','FORECAST'],
    tools:['Hive CRM objects','Voice / ARIA data','Stripe','Research','Approved campaign tools'],
    permissions:['READ_CANONICAL','WRITE_DRAFT','WRITE_WORK'],
    approval:'Cannot send consequential outreach, agree terms, spend budget or sign contracts without authority.',
    version:'2.0', status:'ACTIVE'
  },
  {
    id:'social', name:'SOCIAL', role:'Social & Brand Division',
    purpose:'Owns content calendar, brand-safe content, media production, community monitoring and performance learning.',
    inputs:['Approved proposition','Brand rules','Campaign brief','Performance data'],
    outputs:['CONTENT_PLAN','SOCIAL_PACK','MEDIA_BRIEF','PERFORMANCE_SUMMARY'],
    tools:['Canva','HeyGen','Metricool','Approved media tools'],
    permissions:['READ_BRAND','WRITE_DRAFT'],
    approval:'Cannot publish sensitive or consequential material without the required release approval.',
    version:'2.0', status:'ACTIVE'
  },
  {
    id:'crucible', name:'CRUCIBLE', role:'Independent Challenge',
    purpose:'Sits outside the production chain and challenges consequential work for evidence, assumptions, risk, compliance and unintended consequences.',
    inputs:['Proposed consequential output','VERA evidence pack','Decision context'],
    outputs:['PASS','QUALIFIED','REVIEW','FAIL'],
    tools:['Read-only project evidence','Independent model where configured'],
    permissions:['READ_CANONICAL'],
    approval:'FAIL or REVIEW stops consequential release until a human resolves the issue.',
    version:'2.0', status:'ACTIVE'
  },
];

export const toolNetwork: ToolRecord[] = [
  { name:'Supabase / Hive', purpose:'Canonical operational truth: work, owners, approvals, audit and structured company state', status:'CONFIGURED', agents:['IRIS','OPS','VERA','ATLAS','COMMERCIAL'], note:'Treat Hive as the master work state. Do not create a second competing task truth.' },
  { name:'SharePoint / Microsoft 365', purpose:'Canonical document and evidence truth', status:'CONNECTED', agents:['IRIS','VERA','ATLAS'], note:'Approved documents remain in SharePoint; Command should reference them rather than duplicate them.' },
  { name:'GitHub', purpose:'Technical source truth', status:'CONNECTED', agents:['IRIS','OPS','VERA'], note:'Use repository evidence for code and change state.' },
  { name:'Vercel', purpose:'Live deployment truth', status:'NOT VERIFIED', agents:['IRIS','OPS','VERA'], note:'Only show LIVE when the active project/deployment is actually verified.' },
  { name:'monday.com', purpose:'Optional operational/project view', status:'CONNECTED', agents:['OPS'], note:'Use as a projection or collaboration surface; Hive remains master.' },
  { name:'Stripe', purpose:'Financial and payment truth', status:'NOT VERIFIED', agents:['ATLAS','COMMERCIAL'], note:'Prefer read-only financial visibility first; payment actions remain approval-gated.' },
  { name:'Outlook / Calendar', purpose:'Communication, meetings and commitments', status:'CONFIGURED', agents:['IRIS','ATLAS','COMMERCIAL'], note:'Summarise and action relevant commitments; do not duplicate whole mailboxes into Hive.' },
  { name:'ORVIA Voice / ARIA', purpose:'Calls, campaigns, outcomes and customer communication evidence', status:'CONFIGURED', agents:['IRIS','OPS','COMMERCIAL'], note:'Expose outcomes and exceptions by default, not raw call data.' },
  { name:'Canva', purpose:'Approved design production', status:'CONNECTED', agents:['SOCIAL'], note:'Use approved ORVIA assets and templates.' },
  { name:'HeyGen', purpose:'Video/avatar production', status:'NOT VERIFIED', agents:['SOCIAL'], note:'Use only after authenticated production access is verified.' },
  { name:'Metricool', purpose:'Social publishing and performance', status:'NOT VERIFIED', agents:['SOCIAL'], note:'Connect when ready; publishing should respect approval rules.' },
];

// Keep the operating loop short. The technical detail sits underneath each step.
export const coreWorkflow = ['ASK','UNDERSTAND','ROUTE','DO','VERIFY','CHALLENGE','APPROVE','ACT'];
