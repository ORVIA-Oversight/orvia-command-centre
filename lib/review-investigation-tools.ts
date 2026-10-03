export type ReviewToolStage='core'|'specialist'|'research';
export type ReviewToolStatus='planned'|'pilot'|'connected';

export type ReviewInvestigationTool={
  id:string;
  name:string;
  stage:ReviewToolStage;
  status:ReviewToolStatus;
  purpose:string;
  inputs:string[];
  outputs:string[];
  routesTo:string[];
  licence:string;
  activation:string;
};

export const REVIEW_INVESTIGATION_TOOLS:ReviewInvestigationTool[]=[
  {
    id:'plaso',
    name:'Plaso / log2timeline',
    stage:'core',
    status:'planned',
    purpose:'Builds a forensic super-timeline from timestamped evidence so events from files, messages, logs and metadata can be compared in one chronology.',
    inputs:['files','filesystem metadata','logs','email/message exports'],
    outputs:['normalised timeline events','timestamp provenance','chronology anomalies'],
    routesTo:['Chronology Worker','Contradiction Worker','HIVE','VITA'],
    licence:'Apache-2.0',
    activation:'Use when a matter contains meaningful dates, sequences, competing chronologies or large digital evidence sets.'
  },
  {
    id:'timesketch',
    name:'Timesketch',
    stage:'core',
    status:'planned',
    purpose:'Collaborative forensic timeline analysis for searching, tagging, annotating and comparing large event chronologies.',
    inputs:['Plaso timelines','CSV/event data','investigator annotations'],
    outputs:['reviewed timeline','tagged events','cross-source correlations','investigator notes'],
    routesTo:['Chronology Worker','Issue Matrix','VITA','Report Worker'],
    licence:'Apache-2.0',
    activation:'Use after timeline generation where investigators need to interrogate sequence, clusters or conflicting dates.'
  },
  {
    id:'aleph',
    name:'Aleph / FollowTheMoney',
    stage:'core',
    status:'planned',
    purpose:'Maps people, companies, documents, assets and relationships so repeated entities and connections become visible across a case.',
    inputs:['documents','public records','entity extracts','structured datasets'],
    outputs:['entity graph','relationship links','duplicate entities','source-linked profiles'],
    routesTo:['Entity Worker','OSINT Worker','HIVE','VITA'],
    licence:'MIT (core components)',
    activation:'Use when a matter involves multiple people, organisations, corporate entities, relationships or public-source enrichment.'
  },
  {
    id:'dfir-iris',
    name:'DFIR-IRIS',
    stage:'core',
    status:'planned',
    purpose:'Investigation case-management model for evidence, tasks, notes, timelines and collaborative incident/investigation work.',
    inputs:['case records','evidence references','investigator notes','tasks'],
    outputs:['structured case state','investigation notes','case artefacts','task history'],
    routesTo:['IRIS Conductor','HIVE','Human Workspace'],
    licence:'LGPL-3.0',
    activation:'Use as a separate service/reference model for complex investigations; ORVIA IRIS remains the sole conductor and source of workflow truth.'
  },
  {
    id:'autopsy',
    name:'Autopsy + The Sleuth Kit',
    stage:'specialist',
    status:'planned',
    purpose:'Deep digital-forensics examination of disk images, file systems, deleted files and recovered artefacts.',
    inputs:['disk images','filesystem images','forensic copies'],
    outputs:['recovered artefacts','deleted-file findings','filesystem timeline','forensic report'],
    routesTo:['Digital Evidence Worker','HIVE','VITA','Human Specialist Review'],
    licence:'Open source',
    activation:'Specialist only. Invoke when authorised disk or filesystem evidence forms part of the matter.'
  },
  {
    id:'hayabusa',
    name:'Hayabusa',
    stage:'specialist',
    status:'planned',
    purpose:'Analyses Windows event logs rapidly and produces security/forensic timelines from EVTX evidence.',
    inputs:['Windows EVTX logs'],
    outputs:['event timeline','detections','CSV/Timesketch-ready output'],
    routesTo:['Digital Evidence Worker','Timesketch','VITA'],
    licence:'AGPL-3.0',
    activation:'Invoke only when Windows event logs are supplied or lawfully collected.'
  },
  {
    id:'velociraptor',
    name:'Velociraptor',
    stage:'specialist',
    status:'planned',
    purpose:'Authorised endpoint collection and forensic interrogation across computers where live or collected endpoint evidence is required.',
    inputs:['authorised endpoint artefacts','logs','forensic collections'],
    outputs:['collected artefacts','endpoint timelines','triage results'],
    routesTo:['Digital Evidence Worker','HIVE','Human Specialist Review'],
    licence:'Open source',
    activation:'High-control specialist route. Never used for uncontrolled or covert collection.'
  },
  {
    id:'volatility',
    name:'Volatility 3',
    stage:'specialist',
    status:'planned',
    purpose:'Memory-forensics framework for analysing RAM images and volatile artefacts.',
    inputs:['memory images'],
    outputs:['process/network/memory artefacts','forensic findings'],
    routesTo:['Digital Evidence Worker','HIVE','Human Specialist Review'],
    licence:'Volatility Software License',
    activation:'Invoke only where a memory image is legitimately available and relevant.'
  },
  {
    id:'oletools',
    name:'oletools',
    stage:'core',
    status:'planned',
    purpose:'Examines Microsoft Office file internals, document properties and embedded content for provenance and authenticity review.',
    inputs:['DOC','DOCX','XLS','XLSX','PPT','PPTX'],
    outputs:['document metadata','author/modifier fields','embedded-object findings','structural anomalies'],
    routesTo:['Metadata Worker','HIVE','Contradiction Worker','VITA'],
    licence:'BSD-style open source',
    activation:'Use automatically for supported Office evidence.'
  },
  {
    id:'spiderfoot',
    name:'SpiderFoot',
    stage:'research',
    status:'planned',
    purpose:'Automates lawful open-source research across domains, companies, infrastructure and other public-source indicators.',
    inputs:['authorised entities','domains','company identifiers','public-source targets'],
    outputs:['OSINT findings','source links','entity indicators'],
    routesTo:['Security & Intelligence Worker','HIVE','VITA'],
    licence:'MIT',
    activation:'Use for proportionate independent public-source research where the issue requires external corroboration.'
  },
  {
    id:'sherlock',
    name:'Sherlock',
    stage:'research',
    status:'planned',
    purpose:'Checks public username presence across supported services as a narrow identity-research tool.',
    inputs:['usernames'],
    outputs:['public profile matches','source URLs'],
    routesTo:['Security & Intelligence Worker','HIVE'],
    licence:'MIT',
    activation:'Use only when username correlation is relevant and proportionate.'
  },
  {
    id:'amass',
    name:'OWASP Amass',
    stage:'research',
    status:'planned',
    purpose:'Maps public domain and infrastructure relationships for company, website and technical-source investigations.',
    inputs:['domains','public infrastructure identifiers'],
    outputs:['domain relationships','subdomains','public infrastructure graph'],
    routesTo:['Security & Intelligence Worker','HIVE'],
    licence:'Apache-2.0',
    activation:'Use for authorised company/domain/infrastructure questions, not general person-searching.'
  }
];

export const REVIEW_PIPELINE=[
  'INTAKE & SCOPE',
  'HIVE PRESERVATION & HASHING',
  'TOOL ROUTING',
  'SPECIALIST ANALYSIS',
  'NORMALISED FINDINGS',
  'THREE SIDES REVIEW',
  'VITA CHALLENGE',
  'LEGAL / POLICY FRAMEWORK REVIEW',
  'DEREK FACT & CITATION VERIFICATION',
  'HUMAN REVIEW & SIGN-OFF',
  'FINAL REPORT'
] as const;
