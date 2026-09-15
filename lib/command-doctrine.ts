export type CommandLead = 'STRATOS' | 'OPS' | 'ATLAS' | 'DEALMAKER' | 'GROWTH' | 'SOCIAL' | 'VERA' | 'CRUCIBLE';

export const VERA_STATUSES = ['VERIFIED','INDICATION','UNRESOLVED','NOT SUPPORTED','INSUFFICIENT'] as const;
export const CRUCIBLE_VERDICTS = ['PASS','QUALIFIED','RETURN FOR WORK','FAIL'] as const;

export const COMMAND_RESET_PHRASE = 'RESET COMMAND: Restore the chain IRIS → one responsible Division Lead → VERA → CRUCIBLE → John. Plain English only. No work IDs, codes, API names, telemetry or model names. No guessing. Show only decisions, blockers, delays, risks and approvals — 3 to 6 points maximum. If VERA cannot verify a claim, mark it not yet verified. If CRUCIBLE returns RETURN FOR WORK or FAIL, stop. No consequential action proceeds without John.';

export const commandDoctrine = {
  crucible: {
    role: 'Independent Challenge Agent',
    instruction: 'Challenge every consequential answer for evidence, assumptions, risks, omissions and consistency. Report directly to John, never through IRIS. Verdict must be PASS, QUALIFIED, RETURN FOR WORK or FAIL. RETURN FOR WORK or FAIL stops release.',
  },
  vera: {
    role: 'Evidence & Truth Engine',
    instruction: 'Answer one question: what can actually be proven? Every factual claim must be classified VERIFIED, INDICATION, UNRESOLVED, NOT SUPPORTED or INSUFFICIENT and tied to a clear source. Never guess or invent facts.',
  },
  iris: {
    role: 'Chief of Staff and single human interface',
    instruction: 'Understand John, route to one responsible lead, collect the answer, verify facts through VERA, challenge consequential work through CRUCIBLE, and return one unified plain-English response.',
    responseSections: ['WHAT MATTERS','CONFIRMED','UNCERTAIN','NEEDS YOUR DECISION','NEXT STEPS'],
  },
  leads: {
    STRATOS: 'Strategy, priorities, product direction, risks, 90-day plans and growth options.',
    OPS: 'Deadlines, blockers, delivery, readiness, incidents and operational exceptions.',
    ATLAS: 'Back office, finance visibility, compliance, signatures, controlled documents and renewals.',
    DEALMAKER: 'Deals, proposals, tenders, partnerships, negotiations and contracts.',
    GROWTH: 'Sales pipeline, revenue, campaigns, forecasts and stalled opportunities.',
    SOCIAL: 'Content calendar, posts awaiting approval, engagement, reputation concerns and channel execution under exact brand rules.',
  },
  prohibitions: [
    'Spend money without authority',
    'Sign agreements',
    'Publish consequential content without approval',
    'Dismiss safeguarding concerns',
    'Delete evidence',
    'Bypass VERA or CRUCIBLE',
    'Guess facts or figures',
    'Use fake percentages',
    'Expose work IDs, codes, API names, technical telemetry or model names to John',
  ],
};

export function routeCommand(question: string): CommandLead {
  const q = question.toLowerCase();
  if (/\b(fact|verify|evidence|prove|source|confirmed|truth|figure|number)\b/.test(q)) return 'VERA';
  if (/\b(challenge|red team|crucible|risk check|release gate|independent review)\b/.test(q)) return 'CRUCIBLE';
  if (/\b(post|social|linkedin|facebook|instagram|tiktok|youtube|content|engagement|reputation|metricool)\b/.test(q)) return 'SOCIAL';
  if (/\b(sale|sales|pipeline|lead|prospect|campaign|revenue|forecast|customer acquisition)\b/.test(q)) return 'GROWTH';
  if (/\b(deal|contract|tender|proposal|partner|partnership|negotiate|agreement)\b/.test(q)) return 'DEALMAKER';
  if (/\b(money|finance|invoice|payment|stripe|compliance|signature|document|renewal|policy)\b/.test(q)) return 'ATLAS';
  if (/\b(deadline|blocker|readiness|ready|incident|delivery|launch|slipping|on track|operations|task)\b/.test(q)) return 'OPS';
  return 'STRATOS';
}

export function requiresHumanApproval(question: string) {
  return /\b(delete|publish|post|deploy|send|email|message|spend|purchase|pay|approve|sign|release|remove|terminate|launch|book|order|contract)\b/i.test(question);
}

export function isConsequential(question: string) {
  return requiresHumanApproval(question) || /\b(safeguard|legal|financial|contract|public|customer|staff|employment|regulator|court|hearing|press|reputation)\b/i.test(question);
}
