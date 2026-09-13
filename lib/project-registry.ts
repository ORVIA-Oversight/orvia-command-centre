import type { ProjectRecord } from './projects';
import { projectGroups as baseGroups, projects as baseProjects } from './projects';

const extraProjects: ProjectRecord[] = [
  {
    slug: 'live-coach', name: 'ORVIA Live Coach', shortName: 'LIVE COACH', category: 'Commercial product', status: 'REVIEW REQUIRED',
    description: 'Separate ORVIA coaching/support product represented by its own GitHub codebase and now included in the master estate register.',
    github: 'https://github.com/ORVIA-Oversight/orvia-live-coach', parentWebsite: 'https://www.orvia.org.uk', visual: 'teal',
    workstreams: ['Live coaching', 'Human support workflow', 'Product acceptance', 'Commercial route'],
    nextActions: ['Verify the current product scope and live surface.', 'Confirm the customer journey and commercial offer.', 'Only promote capabilities supported by current evidence.'],
    commercialSurface: 'Dedicated product route once the current build, offer and customer journey are accepted.',
    evidenceNote: 'Dedicated ORVIA GitHub repository exists; production website/domain and commercial acceptance require verification.'
  },
  {
    slug: 'community-app', name: 'ORVIA Community App', shortName: 'COMMUNITY', category: 'Foundation / social impact', status: 'REVIEW REQUIRED',
    description: 'ORVIA community-facing application route recovered from the live GitHub estate and brought into Command for reconciliation.',
    github: 'https://github.com/ORVIA-Oversight/Community-App-', parentWebsite: 'https://www.orvia.org.uk', visual: 'warm',
    workstreams: ['Community access', 'Human connection', 'Foundation relationship', 'Safeguarding and governance'],
    nextActions: ['Review the current codebase and intended audience.', 'Confirm relationship to ORVIA Foundation.', 'Set evidence and safeguarding gates before any public expansion.'],
    commercialSurface: 'Community/social-impact route; exact public proposition requires review.',
    evidenceNote: 'A separate ORVIA GitHub repository exists; current production and product status have not yet been verified.'
  },
  {
    slug: 'care-assurance', name: 'ORVIA Care Assurance™', shortName: 'CARE', category: 'Commercial product', status: 'REVIEW REQUIRED',
    description: 'Care-assurance offer already present in the monday.com Products & Services estate and now represented in Command.',
    parentWebsite: 'https://www.orvia.org.uk', visual: 'navy',
    workstreams: ['Controlled pilot', 'Provider assurance', 'Evidence review', 'Commissioner/family routes'],
    nextActions: ['Reconcile the controlled pilot with the current public offer.', 'Confirm pricing and delivery boundaries.', 'Link operational evidence and acceptance criteria.'],
    commercialSurface: 'Provider, commissioner and family-facing assurance service within the ORVIA oversight model.',
    evidenceNote: 'Present in the live monday.com Products & Services board as ORVIA Care Assurance™ — Controlled Pilot.'
  },
  {
    slug: 'travel-ready', name: 'ORVIA Travel Ready™', shortName: 'TRAVEL', category: 'Commercial product', status: 'REVIEW REQUIRED',
    description: 'Travel-readiness product suite already represented in monday.com and now included in the wider ORVIA estate map.',
    parentWebsite: 'https://www.orvia.org.uk', visual: 'teal',
    workstreams: ['Travel readiness', 'Evidence preparation', 'Customer pathway', 'Checkout/fulfilment'],
    nextActions: ['Reconcile the current product suite and pricing.', 'Confirm live checkout/payment routes.', 'Keep claims evidence-based and clearly bounded.'],
    commercialSurface: 'Direct consumer/professional product route linked through ORVIA.',
    evidenceNote: 'Present in the live monday.com Products & Services board as ORVIA Travel Ready™ — Product Suite.'
  },
  {
    slug: 'location-intelligence', name: 'ORVIA Location Intelligence & Site Risk Review™', shortName: 'SITE RISK', category: 'Commercial product', status: 'REVIEW REQUIRED',
    description: 'Location-intelligence and site-risk review side project recovered from the active monday.com product estate.',
    parentWebsite: 'https://www.orvia.org.uk', visual: 'orange',
    workstreams: ['Location intelligence', 'Site risk review', 'Evidence synthesis', 'Commercial positioning'],
    nextActions: ['Define the accepted scope and buyer.', 'Confirm data sources and professional boundaries.', 'Decide whether this remains a side project or becomes a formal service line.'],
    commercialSurface: 'Potential professional/corporate service route subject to acceptance.',
    evidenceNote: 'Present in the live monday.com Products & Services board as an ORVIA side project; current public/live state is unverified.'
  },
  {
    slug: 'socials', name: 'ORVIA Socials', shortName: 'SOCIALS', category: 'Commercial product', status: 'PLANNED ONLY',
    description: 'ORVIA-owned social planning, approval and performance layer intended to coordinate approved content across ventures and external publishing tools.',
    parentWebsite: 'https://www.orvia.org.uk', visual: 'purple',
    workstreams: ['Plan', 'Create', 'Approve', 'Schedule', 'Measure'],
    nextActions: ['Connect the approved publishing networks.', 'Keep human approval before publishing.', 'Reuse verified ORVIA business intelligence instead of creating a duplicate truth store.'],
    commercialSurface: 'Internal/shared product with potential commercial add-on route; not yet accepted as live.',
    evidenceNote: 'Recorded in Hive/Supabase as PLANNED ONLY; external social publishing connections still require completion.'
  }
];

export const projects: ProjectRecord[] = [...baseProjects, ...extraProjects];
export const projectGroups = baseGroups;
export function getProject(slug: string) { return projects.find(project => project.slug === slug); }
