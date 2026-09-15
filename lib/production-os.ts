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

// John sees IRIS. Division leads sit behind IRIS and are routed automatically.
// Specialist capabilities are skills/tools inside a division, not separate visible personalities.
export const productionAgents: AgentRecord[] = [
  {
    id:'iris', name:'IRIS', role:'Chief of Staff & Single Interface',
    purpose:'Understands John in plain language, routes work to the right division, combines the answer and brings back only decisions, risks and next actions.',
    inputs:['Human request','Current company context','Verified live sources'],
    outputs:['EXECUTIVE_REPLY','WORK_ROUTE','DECISION_REQUEST'],
    tools:['ORCHESTRA routing','Hive work state','Approved connected systems'],
    permissions:['READ_CANONICAL','WRITE_WORK','ROUTE_DIVISIONS'],
    approval:'May coordinate and prepare work. Consequential actions remain human-approved.',
    version:'2.1', status:'ACTIVE'
  },
  {
    id:'stratos', name:'STRATOS', role:'Strategy & Portfolio Division',
    purpose:'Handles priorities, direction, portfolio choices, scenarios, growth options, risk and what ORVIA should start, stop, continue or defer.',
    inputs:['Objectives','Market evidence','Portfolio state','Commercial constraints'],
    outputs:['STRATEGY_BRIEF','OPTIONS','PRIORITY_RECOMMENDATION'],
    tools:['Research','Portfolio evidence','Financial context'],
    permissions:['READ_CANONICAL','WRITE_DRAFT'],
    approval:'Advises only. Strategic commitments require John.',
    version:'2.1', status:'ACTIVE'
  },
  {
    id:'ops', name:'OPS', role:'Operations Division',
    purpose:'Runs the live operational picture: work, readiness, blockers, delivery, incidents, dependencies and launch checks. Reports exceptions, not noise.',
    inputs:['Hive work state','Projects','Deadlines','Operational evidence'],
    outputs:['OPERATING_PICTURE','READINESS_REVIEW','BLOCKER_LIST','ACTION_PLAN'],
    tools:['Hive / Supabase','monday projection','Command data'],
    permissions:['READ_CANONICAL','WRITE_WORK'],
    approval:'Can organise and progress routine work; cannot make consequential allocations or releases without approval.',
    version:'2.1', status:'ACTIVE'
  },
  {
    id:'vera', name:'VERA', role:'Intelligence & Evidence Division',
    purpose:'Determines what is supported, what is uncertain, what conflicts and what evidence is missing. Research and monitoring feed VERA rather than becoming separate visible agents.',
    inputs:['Claims','Documents','Live systems','Research results'],
    outputs:['FACT_PACK','SOURCE_MAP','CONTRADICTIONS','EVIDENCE_GAPS'],
    tools:['SharePoint','Controlled Library','Approved research sources','System evidence'],
    permissions:['READ_PRIVATE_SOURCE','WRITE_CLAIM_PROPOSAL'],
    approval:'May block unsupported factual claims. Does not decide policy or commercial action.',
    version:'2.1', status:'ACTIVE'
  },
  {
    id:'atlas', name:'ATLAS', role:'Back Office Division',
    purpose:'Combines administration, finance visibility, people, compliance and controlled-document production into one internal service desk.',
    inputs:['Mail','Calendar','Finance records','Policies','Controlled documents'],
    outputs:['ADMIN_BRIEF','FINANCE_BRIEF','CONTROLLED_DRAFT','COMPLIANCE_ACTIONS'],
    tools:['Microsoft 365','SharePoint','Stripe read data','Hive'],
    permissions:['READ_CANONICAL','WRITE_DRAFT','WRITE_WORK'],
    approval:'Cannot spend, sign, approve a controlled report or make employment decisions.',
    version:'2.1', status:'ACTIVE'
  },
  {
    id:'dealmaker', name:'DEALMAKER', role:'Deals Division',
    purpose:'Owns partnerships, tenders, contracts, proposals, commercial terms, negotiations and active deal progression.',
    inputs:['Opportunities','Tenders','Contracts','Proposals','Partner context','Pricing'],
    outputs:['DEAL_BRIEF','BID_PLAN','CONTRACT_REVIEW','NEGOTIATION_POSITION','NEXT_ACTIONS'],
    tools:['Hive opportunities','SharePoint','Approved research','Commercial records'],
    permissions:['READ_CANONICAL','WRITE_DRAFT','WRITE_WORK'],
    approval:'Cannot agree terms, sign agreements or commit ORVIA contractually without John.',
    version:'2.1', status:'ACTIVE'
  },
  {
    id:'growth', name:'GROWTH', role:'Sales & Marketing Division',
    purpose:'Owns prospecting, pipeline, campaigns, revenue forecast, next-best actions, marketing performance and commercial momentum.',
    inputs:['Prospects','Pipeline','Campaigns','Pricing','Capacity','Market evidence'],
    outputs:['REVENUE_BRIEF','NEXT_BEST_ACTIONS','CAMPAIGN_PLAN','FORECAST','PERFORMANCE_SUMMARY'],
    tools:['Hive CRM objects','Voice / ARIA data','Stripe','Research','Approved campaign tools'],
    permissions:['READ_CANONICAL','WRITE_DRAFT','WRITE_WORK'],
    approval:'Cannot send consequential outreach, spend campaign budget or make commercial commitments without authority.',
    version:'2.1', status:'ACTIVE'
  },
  {
    id:'social', name:'SOCIAL', role:'Social & Content Division',
    purpose:'Owns content calendar, brand-safe content, media production, community monitoring, reputation flags and performance learning.',
    inputs:['Approved proposition','Brand rules','Campaign brief','Performance data'],
    outputs:['CONTENT_PLAN','SOCIAL_PACK','MEDIA_BRIEF','PERFORMANCE_SUMMARY'],
    tools:['Canva','HeyGen','Metricool','Approved media tools'],
    permissions:['READ_BRAND','WRITE_DRAFT'],
    approval:'Cannot publish in John\'s name or release sensitive/consequential material without approval.',
    version:'2.1', status:'ACTIVE'
  },
  {
    id:'crucible', name:'CRUCIBLE', role:'Independent Challenge',
    purpose:'Sits outside the production chain and challenges consequential work for evidence, assumptions, risk, compliance, pricing consistency and unintended consequences.',
    inputs:['Proposed consequential output','VERA evidence pack','Decision context'],
    outputs:['PASS','QUALIFIED PASS','RETURN FOR WORK','FAIL'],
    tools:['Read-only project evidence','Independent model where configured'],
    permissions:['READ_CANONICAL'],
    approval:'FAIL or RETURN FOR WORK stops consequential release until John resolves the issue.',
    version:'2.1', status:'ACTIVE'
  },
];

export const toolNetwork: ToolRecord[] = [
  { name:'Supabase / Hive', purpose:'Canonical operational truth: work, owners, approvals, audit and structured company state', status:'CONFIGURED', agents:['IRIS','OPS','VERA','ATLAS','DEALMAKER','GROWTH'], note:'Treat Hive as the master work state. Do not create a second competing task truth.' },
  { name:'SharePoint / Microsoft 365', purpose:'Canonical document and evidence truth', status:'CONNECTED', agents:['IRIS','VERA','ATLAS','DEALMAKER'], note:'Approved documents remain in SharePoint; Command should reference them rather than duplicate them.' },
  { name:'GitHub', purpose:'Technical source truth', status:'CONNECTED', agents:['IRIS','OPS','VERA'], note:'Use repository evidence for code and change state.' },
  { name:'Vercel', purpose:'Live deployment truth', status:'NOT VERIFIED', agents:['IRIS','OPS','VERA'], note:'Only show LIVE when the active project/deployment is actually verified.' },
  { name:'monday.com', purpose:'Optional operational/project view', status:'CONNECTED', agents:['OPS'], note:'Use as a projection or collaboration surface; Hive remains master.' },
  { name:'Stripe', purpose:'Financial and payment truth', status:'NOT VERIFIED', agents:['ATLAS','GROWTH'], note:'Prefer read-only financial visibility first; payment actions remain approval-gated.' },
  { name:'Outlook / Calendar', purpose:'Communication, meetings and commitments', status:'CONFIGURED', agents:['IRIS','ATLAS','DEALMAKER','GROWTH'], note:'Summarise and action relevant commitments; do not duplicate whole mailboxes into Hive.' },
  { name:'ORVIA Voice / ARIA', purpose:'Calls, campaigns, outcomes and customer communication evidence', status:'CONFIGURED', agents:['IRIS','OPS','GROWTH'], note:'Expose outcomes and exceptions by default, not raw call data.' },
  { name:'Canva', purpose:'Approved design production', status:'CONNECTED', agents:['SOCIAL'], note:'Use approved ORVIA assets and templates.' },
  { name:'HeyGen', purpose:'Video/avatar production', status:'NOT VERIFIED', agents:['SOCIAL'], note:'Use only after authenticated production access is verified.' },
  { name:'Metricool', purpose:'Social publishing and performance', status:'NOT VERIFIED', agents:['SOCIAL'], note:'Connect when ready; publishing should respect approval rules.' },
];

// Keep the operating loop short. Technical detail sits underneath each step.
export const coreWorkflow = ['ASK','UNDERSTAND','ROUTE','DO','VERIFY','CHALLENGE','APPROVE','ACT'];
