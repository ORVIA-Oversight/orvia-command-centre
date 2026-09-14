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

export const productionAgents: AgentRecord[] = [
  { id:'iris', name:'IRIS', role:'ORVIA Conductor', purpose:'Understands requests, builds work orders, routes specialist work and enforces hand-offs.', inputs:['Human intent','Project context','Verified sources'], outputs:['WORK_ORDER','AGENT_PLAN','SYNTHESIS_REPORT'], tools:['Approved knowledge','Project registry'], permissions:['READ_CANONICAL','WRITE_PROJECT'], approval:'Cannot publish or change canonical truth.', version:'1.0', status:'ACTIVE' },
  { id:'vera', name:'VERA', role:'Canonical Truth & Evidence', purpose:'Protects factual truth, claims, prices, features and evidence states.', inputs:['Claims','Approved sources'], outputs:['FACT_PACK','CLAIM_CHECK','RISK_FLAGS'], tools:['SharePoint','Controlled library'], permissions:['READ_PRIVATE_SOURCE','WRITE_CLAIM_PROPOSAL'], approval:'May block unsupported public claims.', version:'1.0', status:'ACTIVE' },
  { id:'brand', name:'Brand Guardian', role:'ORVIA Brand Agent', purpose:'Supplies and protects canonical visual and verbal brand rules.', inputs:['Brand request','Product identity'], outputs:['BRAND_PACK','BRAND_CHECK','PROPOSED_CHANGE'], tools:['Brand library','Asset library'], permissions:['READ_BRAND','WRITE_BRAND_PROPOSAL'], approval:'Cannot make proposed branding canonical.', version:'1.0', status:'ACTIVE' },
  { id:'creative', name:'Creative Director', role:'Concept & Campaign', purpose:'Turns rough ideas into strong human-centred creative concepts.', inputs:['Human idea','FACT_PACK','BRAND_PACK'], outputs:['CREATIVE_BRIEF','CONCEPT_OPTIONS'], tools:['Proven library'], permissions:['WRITE_DRAFT'], approval:'Creative concepts remain drafts until accepted.', version:'1.0', status:'ACTIVE' },
  { id:'script', name:'Scriptwriter', role:'Spoken Content', purpose:'Writes scripts for real speech, pacing, scenes and calls to action.', inputs:['CREATIVE_BRIEF','FACT_PACK'], outputs:['SCRIPT_V1','SCENE_PLAN'], tools:['Prompt library'], permissions:['WRITE_DRAFT'], approval:'Cannot alter verified claims.', version:'1.0', status:'ACTIVE' },
  { id:'podcast', name:'Podcast Producer', role:'Podcast Production', purpose:'Builds solo, interview, panel and avatar podcast episodes.', inputs:['CREATIVE_BRIEF','FACT_PACK'], outputs:['EPISODE_BRIEF','RUNNING_ORDER','SHOW_NOTES'], tools:['Approved audio/video tools'], permissions:['WRITE_DRAFT'], approval:'Production pack requires editorial review.', version:'1.0', status:'ACTIVE' },
  { id:'blog', name:'Blog & Editorial', role:'Editorial Content', purpose:'Turns approved ideas into blogs, articles, newsletters and thought leadership.', inputs:['Master idea','FACT_PACK'], outputs:['MASTER_ARTICLE','TITLE_OPTIONS'], tools:['Prompt library'], permissions:['WRITE_DRAFT'], approval:'No unsupported claims or generic filler.', version:'1.0', status:'ACTIVE' },
  { id:'social', name:'Social Producer', role:'Platform Content', purpose:'Creates channel-native social derivatives from approved master content.', inputs:['Approved master content'], outputs:['PLATFORM_PACK'], tools:['Social tools when verified'], permissions:['WRITE_DRAFT'], approval:'Cannot publish without release approval.', version:'1.0', status:'ACTIVE' },
  { id:'video', name:'Video Producer', role:'Video Production', purpose:'Converts approved scripts into scenes, shots, B-roll, graphics and edit instructions.', inputs:['Approved script','BRAND_PACK'], outputs:['VIDEO_PRODUCTION_PLAN'], tools:['HeyGen','Synthesia','Gemini'], permissions:['WRITE_DRAFT'], approval:'Does not assume tool capabilities.', version:'1.0', status:'ACTIVE' },
  { id:'heygen', name:'HeyGen Specialist', role:'HeyGen Production', purpose:'Creates HeyGen-ready scene, avatar, voice and export instructions.', inputs:['VIDEO_PRODUCTION_PLAN'], outputs:['HEYGEN_PRODUCTION_PACK'], tools:['HeyGen'], permissions:['CALL_GENERATIVE_TOOL'], approval:'Only available actions verified in Tool Network.', version:'1.0', status:'ACTIVE' },
  { id:'synthesia', name:'Synthesia Specialist', role:'Synthesia Production', purpose:'Creates presenter-led training and explainer production packs.', inputs:['VIDEO_PRODUCTION_PLAN'], outputs:['SYNTHESIA_PRODUCTION_PACK'], tools:['Synthesia'], permissions:['CALL_GENERATIVE_TOOL'], approval:'Only verified capabilities may be used.', version:'1.0', status:'ACTIVE' },
  { id:'gemini', name:'Gemini Visual Producer', role:'Generative Visuals', purpose:'Creates cinematic B-roll and visual prompts without fake product UI.', inputs:['Scene brief','BRAND_PACK'], outputs:['GEMINI_VISUAL_PACK'], tools:['Gemini video'], permissions:['CALL_GENERATIVE_TOOL'], approval:'Critical UI/text must be composited elsewhere.', version:'1.0', status:'ACTIVE' },
  { id:'design', name:'Design Agent', role:'Design Production', purpose:'Creates design packs for Canva, social artwork, thumbnails and campaign graphics.', inputs:['BRAND_PACK','Creative direction'], outputs:['DESIGN_PACK'], tools:['Canva'], permissions:['WRITE_DRAFT'], approval:'Must consume canonical brand context.', version:'1.0', status:'ACTIVE' },
  { id:'web', name:'Web Producer', role:'Website Production', purpose:'Builds page structure, beginning/middle/end story, UX and conversion logic.', inputs:['FACT_PACK','BRAND_PACK','Creative brief'], outputs:['SITE_MAP','WEB_BUILD_PACK'], tools:['GitHub','Vercel when authorised'], permissions:['WRITE_DRAFT','CREATE_PREVIEW'], approval:'Cannot deploy without approval.', version:'1.0', status:'ACTIVE' },
  { id:'prompt', name:'Prompt Engineer', role:'Tool Prompting', purpose:'Translates approved ORVIA work into precise tool-specific production prompts.', inputs:['Approved content','Tool profile'], outputs:['TOOL_PROMPT_PACK'], tools:['Prompt library'], permissions:['WRITE_DRAFT'], approval:'Cannot invent tool capability.', version:'1.0', status:'ACTIVE' },
  { id:'editor', name:'ORVIA Editor', role:'Senior Editor', purpose:'Integrates, tightens and humanises specialist outputs while respecting locked sections.', inputs:['Agent outputs','Locked sections'], outputs:['EDITOR_VERSION','EDITOR_NOTES'], tools:['Project versions'], permissions:['WRITE_DRAFT'], approval:'Cannot approve release.', version:'1.0', status:'ACTIVE' },
  { id:'redteam', name:'Red Team', role:'Independent Challenge', purpose:'Tries to break claims, story, brand, UX, technical assumptions and reputation risk.', inputs:['Edited package','Evidence'], outputs:['RED_TEAM_REPORT'], tools:['Read-only project evidence'], permissions:['READ_CANONICAL'], approval:'Returns PASS, PASS WITH CHANGES or FAIL.', version:'1.0', status:'ACTIVE' },
  { id:'release', name:'Release Controller', role:'Final Governance Gate', purpose:'Checks evidence, brand, editing, red team, accessibility, technical and human approval.', inputs:['Approval records','Final package'], outputs:['RELEASE_RECORD'], tools:['Approval registry'], permissions:['WRITE_PROJECT'], approval:'Can mark APPROVED FOR RELEASE but never publish autonomously.', version:'1.0', status:'ACTIVE' },
  { id:'performance', name:'Performance Analyst', role:'Post-release Intelligence', purpose:'Measures outcomes and proposes evidence-backed learning candidates.', inputs:['Analytics','Release record'], outputs:['PERFORMANCE_REPORT','LEARNING_CANDIDATE'], tools:['Verified analytics'], permissions:['READ_CANONICAL','WRITE_DRAFT'], approval:'Cannot make a method canonical automatically.', version:'1.0', status:'ACTIVE' },
];

export const toolNetwork: ToolRecord[] = [
  { name:'SharePoint / Microsoft 365', purpose:'Canonical internal knowledge and evidence', status:'CONNECTED', agents:['IRIS','VERA','Brand Guardian'], note:'Connection exists; individual source provenance is still required.' },
  { name:'GitHub', purpose:'Source control and build evidence', status:'CONNECTED', agents:['Web Producer','IRIS'], note:'Command Centre repository is connected and writable.' },
  { name:'Vercel', purpose:'Preview and production deployment', status:'NOT VERIFIED', agents:['Web Producer','Release Controller'], note:'Do not represent this Command Centre deployment as connected until project scope is verified in the active Vercel account.' },
  { name:'Supabase', purpose:'Project, audit and operational data', status:'CONFIGURED', agents:['IRIS','VERA','Release Controller'], note:'Command Centre already contains Supabase support; production schema expansion requires review.' },
  { name:'HeyGen', purpose:'Avatar and presenter production', status:'NOT VERIFIED', agents:['HeyGen Specialist','Video Producer'], note:'Production connection must be technically verified before execution.' },
  { name:'Synthesia', purpose:'Presenter-led explainers and training', status:'NOT VERIFIED', agents:['Synthesia Specialist','Video Producer'], note:'Production connection must be technically verified before execution.' },
  { name:'Gemini video', purpose:'Generative cinematic B-roll', status:'NOT VERIFIED', agents:['Gemini Visual Producer'], note:'Treat as a production tool only after authenticated integration is verified.' },
  { name:'Canva', purpose:'Design and campaign artwork', status:'CONNECTED', agents:['Design Agent','Brand Guardian'], note:'Use only approved brand assets and templates.' },
];

export const coreWorkflow = ['INTENT','ORCHESTRATE','EVIDENCE','CREATE','EDIT','CHALLENGE','APPROVE','PRODUCE','VERIFY','RELEASE','MEASURE','LEARN'];
