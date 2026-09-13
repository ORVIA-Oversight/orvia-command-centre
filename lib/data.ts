import type { DocumentRecord, Integration, Mention } from './types';

export const integrations: Integration[] = [
  { name: 'GitHub', category: 'Technical evidence', state: 'CONNECTED', note: 'Repository evidence and source control' },
  { name: 'Vercel', category: 'Deployment', state: 'CONNECTED', note: 'Production and preview deployments' },
  { name: 'Supabase', category: 'Backend / Hive', state: 'CONNECTED', note: 'Operational data and evidence index' },
  { name: 'monday.com', category: 'Work management', state: 'CONNECTED', note: 'Task and pipeline coordination' },
  { name: 'ORVIA Operations mailbox', category: 'Email', state: 'CONFIGURED', note: 'Operational communications' },
  { name: 'ORVIA Safeguarding mailbox', category: 'Email', state: 'CONFIGURED', note: 'Safeguarding communications' },
];

export const documents: DocumentRecord[] = [
  { reference: 'ORV-BRD-20260803-0001', title: 'Brand Identity and Architecture Standard', version: '1.2', status: 'Interim Approved', owner: 'John McGill', source: 'Master Register' },
  { reference: 'ORV-GEN-20260803-0002', title: 'Master Controlled Document Template', version: '1.0', status: 'Interim Approved', owner: 'John McGill', source: 'SharePoint' },
  { reference: 'ORV-GOV-20260803-0003', title: 'Universal AI and Tool Activation Instruction', version: '1.0', status: 'Active', owner: 'John McGill', source: 'Master Register' },
  { reference: 'DISCOVERED / UNREGISTERED', title: 'ORVIA Data Protection & NHS Assurance Pack', version: '3.0', status: 'Draft', owner: 'John McGill', source: 'Working Library' },
  { reference: 'DISCOVERED / UNREGISTERED', title: 'ORVIA Cyber Essentials Pre-Submission Audit', version: '—', status: 'Draft', owner: '—', source: 'Working Library' },
];

export const mentions: Mention[] = [
  { source: 'Feed not connected', title: 'Brand monitoring awaiting first live ingestion', snippet: 'No synthetic mention counts are displayed. Connect an authorised feed to populate this panel.', sentiment: 'Neutral', time: 'Awaiting feed' },
];
