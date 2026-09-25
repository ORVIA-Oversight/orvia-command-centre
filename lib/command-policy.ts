export type AuthorityLevel = 'A0'|'A1'|'A2'|'A3'|'A4';

export function isReadOnlyRequest(question:string){
  return /\b(show|tell|what|which|where|when|who|status|summary|summarise|review|check|verify|list|report|update\?|any update|how many|are we|is it|do we|current|today|blockers|priorities)\b/i.test(question)
    && !/\b(fix|change|update\s+(the|this|it|website|site|record)|create|build|deploy|publish|send|delete|remove|pay|spend|sign|approve|move|rename|connect|configure|edit|write|draft)\b/i.test(question);
}

export function classifyAuthority(question:string):AuthorityLevel{
  const q=question.toLowerCase();
  if(/\b(sign contract|sign agreement|make payment|transfer money|submit legal filing|safeguarding finding|clinical decision|culpability finding)\b/.test(q)) return 'A4';
  if(/\b(delete|remove account|remove user|publish|send externally|send email|post live|change price|pricing change|grant access|revoke access|production deploy|deploy to production|terminate|execute contract)\b/.test(q)) return 'A3';
  if(/\b(fix|deploy|rename|connect|configure|update website|update site|change website|change site|merge|release)\b/.test(q)) return 'A2';
  if(/\b(draft|prepare|create|build|analyse|analyze|research|write|edit|organise|organize|reconcile|map)\b/.test(q)) return 'A1';
  return 'A0';
}

export function authorityNeedsHuman(level:AuthorityLevel){
  return level==='A3'||level==='A4';
}

export function workClass(question:string){
  if(/\b(safeguard|serious concern|high consequence|critical incident|fatal|death|abuse|clinical harm)\b/i.test(question)) return 'HIGH-CONSEQUENCE';
  if(/\b(material|contract|production|security|privacy|data protection|payment|finance)\b/i.test(question)) return 'MATERIAL';
  return 'ROUTINE';
}

export function priorityFor(question:string){
  return /\b(urgent|critical|immediately|tonight|today|launch|down|broken|failure|incident)\b/i.test(question)?'high':'normal';
}

export function resolveAssetKeys(question:string, assets:Array<{asset_key:string;display_name:string;canonical_domain:string|null}>){
  const q=question.toLowerCase();
  const aliases:Record<string,string[]>={
    'orvia-oversight':['oversight','orvia.org.uk','main website','corporate website'],
    'orvia-web':['orvia web','web.orvia.org.uk','web business'],
    'orvia-mia':['mia','mia.orvia.org.uk','memory platform'],
    'orvia-voice':['voice','aria','orviavoice','orviavoice.co.uk'],
    'orvia-threshold':['threshold','threshold.orvia.org.uk'],
    'orvia-command':['command','command.orvia.org.uk','my workspace','founder workspace'],
    'orvia-iris':['iris','iris.orvia.org.uk'],
    'orvia-workspace-access':['workspace.orvia.org.uk','auth gateway','workspace access'],
    'orvia-witness-room':['witness room','witness','witness.orvia.org.uk']
  };
  const hits=new Set<string>();
  for(const asset of assets){
    const values=[asset.asset_key,asset.display_name,asset.canonical_domain||'',...(aliases[asset.asset_key]||[])].map(x=>x.toLowerCase()).filter(Boolean);
    if(values.some(v=>q.includes(v))) hits.add(asset.asset_key);
  }
  return Array.from(hits);
}
