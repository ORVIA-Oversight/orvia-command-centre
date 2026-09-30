export type WorkforceDepartment={
  id:string;
  label:string;
  description:string;
  accent:string;
  agents:string[];
};

export const WORKFORCE_DEPARTMENTS:WorkforceDepartment[]=[
  {
    id:'executive',
    label:'Executive',
    description:'Managing Director support, orchestration, challenge and verification.',
    accent:'#6A2E7C',
    agents:['IRIS','VITA-01','VERA-01']
  },
  {
    id:'admin-people',
    label:'Admin & People',
    description:'People, recruitment, administration, onboarding and internal coordination.',
    accent:'#2F7F86',
    agents:['PEOPLE-01','RECRUIT-01','ADMIN-01']
  },
  {
    id:'growth',
    label:'Sales & Growth',
    description:'Sales, marketing, finance, commercial development and customer growth.',
    accent:'#F0A51A',
    agents:['SALES-01','FINANCE-01','BRAND-01','OUT_HSC','OUT_LEGAL','OUT_PROPERTY','OUT_HOSP','OUT_FIELD']
  },
  {
    id:'intelligence',
    label:'Intelligence & Assurance',
    description:'Governance, evidence, safeguarding, legal, records, risk and independent challenge.',
    accent:'#0B2D5C',
    agents:['SAFEGUARD-01','LEGAL-01','RECORDS-01','IT-01','OUT_SECURITY']
  },
  {
    id:'operations',
    label:'Operations & Communications',
    description:'Contact, voice, client communications, workflow delivery and operational support.',
    accent:'#E34B23',
    agents:['VOICE-01','CONTACT-01']
  },
  {
    id:'external',
    label:'External AI Workers',
    description:'Provider workers used by IRIS for controlled delegated execution.',
    accent:'#7B8794',
    agents:['M365-WORKER','CHATGPT-WORKER','CLAUDE-WORKER','DOLA-WORKER','SINTRA-WORKER','VIKTOR-WORKER','MEDIA-WORKER']
  }
];

export const WORKFORCE_ROLE_SEEDS=[
  {
    code:'PEOPLE-01',
    display_name:'ORVIA Chief of People',
    agent_type:'specialist',
    purpose:'Own people operations, workforce planning, employee lifecycle, training coordination and HR administration while keeping employment decisions human-authorised.',
    operating_scope:'Internal people operations and HR coordination. May prepare, organise, draft and delegate. No autonomous dismissal, disciplinary outcome or contractual change.',
    risk_ceiling:'high',
    metadata:{workforce_profile:'people',department:'admin-people',persona:'human'}
  },
  {
    code:'RECRUIT-01',
    display_name:'ORVIA Recruitment Coordinator',
    agent_type:'specialist',
    purpose:'Coordinate recruitment campaigns, candidate administration, interview preparation, onboarding checklists and recruitment follow-up.',
    operating_scope:'Recruitment administration and coordination only. Selection and employment decisions remain human-authorised.',
    risk_ceiling:'medium',
    metadata:{workforce_profile:'recruitment',department:'admin-people',persona:'human'}
  },
  {
    code:'ADMIN-01',
    display_name:'ORVIA Executive Administration',
    agent_type:'specialist',
    purpose:'Coordinate diary, meeting preparation, routine administration, reminders, filing, follow-up and internal task routing.',
    operating_scope:'Routine internal administration and coordination. Consequential external commitments remain human-gated.',
    risk_ceiling:'low',
    metadata:{workforce_profile:'administration',department:'admin-people',persona:'human'}
  }
];

export function departmentForAgent(code:string){
  return WORKFORCE_DEPARTMENTS.find(d=>d.agents.includes(code));
}
