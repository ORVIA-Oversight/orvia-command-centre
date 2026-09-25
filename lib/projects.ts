export type ProjectStatus =
  | 'LIVE VERIFIED'
  | 'LIVE — USER CONFIRMED'
  | 'CONNECTED'
  | 'CONFIGURED'
  | 'BUILT NOT DEPLOYED'
  | 'REVIEW REQUIRED'
  | 'PLANNED ONLY';

export type ProjectRecord = {
  slug: string;
  name: string;
  shortName: string;
  category: 'Core ORVIA' | 'Platform' | 'Commercial product' | 'Venture / experience' | 'Foundation / social impact' | 'Internal / shared engine';
  status: ProjectStatus;
  description: string;
  website?: string;
  websiteLabel?: string;
  github?: string;
  parentWebsite?: string;
  visual: 'site' | 'navy' | 'teal' | 'gold' | 'purple' | 'orange' | 'warm';
  workstreams: string[];
  nextActions: string[];
  commercialSurface: string;
  evidenceNote: string;
};

export const projects: ProjectRecord[] = [
  {
    slug: 'orvia-oversight', name: 'ORVIA Oversight', shortName: 'ORVIA', category: 'Core ORVIA', status: 'LIVE VERIFIED',
    description: 'The public master brand and route into ORVIA services, products and sector pathways.',
    website: 'https://www.orvia.org.uk', websiteLabel: 'orvia.org.uk', github: 'https://github.com/ORVIA-Oversight/orvia-public-website', visual: 'site',
    workstreams: ['Public website', 'Commercial architecture', 'Sector pathways', 'Trust and assurance', 'Cross-product navigation'],
    nextActions: ['Keep every dedicated sales platform linked back to ORVIA.', 'Maintain one coherent price and product story.', 'Use Command as the internal project register and control surface.'],
    commercialSurface: 'Master public website. Dedicated product/venture sales platforms should connect back to this site rather than compete with it.',
    evidenceNote: 'Public site repository and Vercel production project are connected.'
  },
  {
    slug: 'command-centre', name: 'ORVIA Command Centre', shortName: 'COMMAND', category: 'Core ORVIA', status: 'LIVE — USER CONFIRMED',
    description: 'Founder command environment: project control, live operating picture, evidence, controlled knowledge and IRIS entry point.',
    website: 'https://command.orvia.org.uk', websiteLabel: 'command.orvia.org.uk', github: 'https://github.com/ORVIA-Oversight/orvia-command-centre', parentWebsite: 'https://www.orvia.org.uk', visual: 'site',
    workstreams: ['Founder command', 'Project register', 'Controlled knowledge', 'Systems telemetry', 'IRIS routing', 'VERA evidence'],
    nextActions: ['Finish live IRIS wiring.', 'Complete Supabase/Hive live data feed.', 'Use this Projects area as the master view of the ORVIA estate.'],
    commercialSurface: 'Internal/private operating surface, not a public sales website.',
    evidenceNote: 'Custom domain was attached by the Founder; repository exists and this catalogue lives inside it.'
  },
  {
    slug: 'workspace-brain', name: 'ORVIA Workspace Access', shortName: 'ACCESS', category: 'Core ORVIA', status: 'LIVE VERIFIED',
    description: 'Current authenticated access/session gateway for ORVIA Command. The visible Founder workspace is being consolidated into Command; this service is not an orchestration authority.',
    website: 'https://workspace.orvia.org.uk', websiteLabel: 'workspace.orvia.org.uk', github: 'https://github.com/ORVIA-Oversight/orvia-brain-prototype', parentWebsite: 'https://www.orvia.org.uk', visual: 'site',
    workstreams: ['Authentication gateway', 'Session verification', 'Legacy Brain asset recovery', 'Controlled migration to Command/IRIS'],
    nextActions: ['Keep the existing login/session route stable while My Workspace moves into Command.', 'Harvest any useful legacy Brain prompts/schemas into IRIS/HIVE.', 'Archive Brain as a runtime once replacement authentication and routing are verified.'],
    commercialSurface: 'Private access infrastructure only. Command is the operational workspace; IRIS is the sole orchestration authority.',
    evidenceNote: 'workspace.orvia.org.uk remains the current session-verification dependency in Command middleware. Do not retire it until replacement authentication is live verified.'
  },
  {
    slug: 'iris', name: 'IRIS', shortName: 'IRIS', category: 'Internal / shared engine', status: 'LIVE — USER CONFIRMED',
    description: 'ORVIA intelligence conductor. IRIS interprets requests, routes work and coordinates evidence-led specialist activity; it is not the human decision-maker.',
    website: 'https://iris.orvia.org.uk', websiteLabel: 'iris.orvia.org.uk', github: 'https://github.com/ORVIA-Oversight/iris-by-orvia', parentWebsite: 'https://www.orvia.org.uk', visual: 'purple',
    workstreams: ['Intelligence', 'Routing', 'Agent/workforce coordination', 'Challenge', 'Synthesis'],
    nextActions: ['Connect Command project instructions to the live IRIS route.', 'Show machine receipts and truthful completion state.', 'Keep VERA and human approval boundaries explicit.'],
    commercialSurface: 'Shared ORVIA engine and explainer surface, not a separate legal business.',
    evidenceNote: 'Founder confirmed the dedicated IRIS site is live; Command integration remains subject to end-to-end acceptance.'
  },
  {
    slug: 'voice', name: 'ORVIA Voice / ARIA', shortName: 'VOICE', category: 'Commercial product', status: 'LIVE VERIFIED',
    description: 'ORVIA voice platform for inbound and outbound calls, ARIA, transcripts, summaries, actions, safeguarding flags, handoffs and customer workspace journeys.',
    website: 'https://orviavoice.co.uk', websiteLabel: 'orviavoice.co.uk', github: 'https://github.com/ORVIA-Oversight/orvia-voice', parentWebsite: 'https://www.orvia.org.uk', visual: 'site',
    workstreams: ['Inbound voice', 'Outbound revenue', 'ARIA', 'Transcripts and summaries', 'Actions and handoffs', 'Safeguarding'],
    nextActions: ['Keep pricing and product language aligned with orvia.org.uk.', 'Complete revenue acceptance path from real call to captured lead and follow-up.', 'Do not sell unverified capability.'],
    commercialSurface: 'Dedicated Voice sales platform, linked from and back to the ORVIA master site.',
    evidenceNote: 'Voice is a separate product/platform; current commercial material requires guardrails around unverified features.'
  },
  {
    slug: 'threshold', name: 'ORVIA Threshold', shortName: 'THRESHOLD', category: 'Commercial product', status: 'CONNECTED',
    description: 'Property evidence preparation for buyers and sellers: organise supplied paperwork, index evidence and surface questions or obvious gaps before conveyancing.',
    website: 'https://orvia-threshold.vercel.app', websiteLabel: 'Current Vercel build', parentWebsite: 'https://www.orvia.org.uk', visual: 'site',
    workstreams: ['Buyer Threshold', 'Seller Threshold', 'Estate-agent referral route', 'Evidence indexing', 'Checkout and fulfilment'],
    nextActions: ['Create the dedicated Threshold sales platform.', 'Attach a clean ORVIA subdomain after commercial acceptance.', 'Keep the boundary clear: preparation and evidence organisation, not legal advice.'],
    commercialSurface: 'A strong candidate for its own simple sales website because the buyer journey is bounded, low-cost and product-specific.',
    evidenceNote: 'A production Vercel project exists. Buyer and Seller product descriptions are evidenced; public route still needs the final commercial pass.'
  },
  {
    slug: 'business-in-a-box', name: 'ORVIA ONE — Business in a Box', shortName: 'ORVIA ONE', category: 'Commercial product', status: 'BUILT NOT DEPLOYED',
    description: 'Premium selective business creation model. The applicant brings their own idea; ORVIA challenges it through the Crucible before any build is accepted.',
    parentWebsite: 'https://www.orvia.org.uk', visual: 'gold',
    workstreams: ['Founder idea intake', 'ORVIA Crucible', 'Human selection gate', 'Business build', 'Digital workforce', 'IP/licensing', 'Launch and oversight'],
    nextActions: ['Give Business in a Box its own high-conversion sales platform.', 'Retain the rule that money does not buy selection.', 'Turn each approved venture into a governed project in Command.'],
    commercialSurface: 'Dedicated premium sales platform linked from ORVIA. Public story starts with the applicant’s own idea and the ORVIA Crucible.',
    evidenceNote: 'Canonical model and a developed website build exist; a verified dedicated production domain has not yet been recorded here.'
  },
  {
    slug: 'mia', name: 'MIA — Memory · Identity · Authenticity', shortName: 'MIA', category: 'Venture / experience', status: 'LIVE — USER CONFIRMED',
    description: 'Human continuity proposition spanning memories, scrapbook, life story, authorised family connection and carefully governed future representation.',
    website: 'https://mia.orvia.org.uk', websiteLabel: 'mia.orvia.org.uk', github: 'https://github.com/ORVIA-Oversight/orvia-mia', parentWebsite: 'https://www.orvia.org.uk', visual: 'warm',
    workstreams: ['Memories', 'Scrapbook', 'Life Story', 'Bridge / family connection', 'Presence', 'Guardian / safeguarding'],
    nextActions: ['Keep product claims at DESIGN until build evidence supports more.', 'Separate warm consumer storytelling from governed professional pathways.', 'Build safeguarding controls before any family-contact pilot.'],
    commercialSurface: 'Dedicated MIA brand/sales platform within ORVIA Oversight Ltd, linked through orvia.org.uk.',
    evidenceNote: 'Founder confirmed the MIA site is live. Internal product review still classifies core capabilities as design rather than verified product functionality.'
  },
  {
    slug: 'sanctum-88', name: 'Sanctum 88', shortName: 'S88', category: 'Venture / experience', status: 'BUILT NOT DEPLOYED',
    description: 'Premium private-membership, connection and compatibility concept with a high-touch onboarding and operator/IP model.',
    github: 'https://github.com/ORVIA-Oversight/santum88', parentWebsite: 'https://www.orvia.org.uk', visual: 'gold',
    workstreams: ['Private membership', 'Compatibility / Match', 'Premium onboarding', 'Events and experiences', 'Operator/IP model'],
    nextActions: ['Confirm the canonical spelling and dedicated domain.', 'Separate the public luxury story from protected member functions.', 'Complete legal, privacy, safeguarding and insurance gates before launch.'],
    commercialSurface: 'Dedicated premium sales/membership platform with ORVIA ownership and governance visible but not intrusive.',
    evidenceNote: 'Founder Workspace work and a dedicated GitHub repository exist. The canonical public domain is still to be confirmed in Command.'
  },
  {
    slug: 'saddle-and-sage', name: 'Saddle & Sage', shortName: 'S&S', category: 'Venture / experience', status: 'LIVE VERIFIED',
    description: 'Private equestrian and countryside experiences combining genuine stable life with a calm, high-touch luxury escape.',
    website: 'https://saddle-and-sage-experiences.orvia-oversi-9864.chatgpt.site', websiteLabel: 'Current live concept site', parentWebsite: 'https://www.orvia.org.uk', visual: 'site',
    workstreams: ['Stable Life', 'Country Calm', 'Full Saddle & Sage', 'Experience design', 'Venue/supplier network', 'Commercial model'],
    nextActions: ['Move the concept from ChatGPT Sites to a governed production sales platform when ready.', 'Finalise tariffs and operating/insurance model.', 'Decide the relationship to Business in a Box/IP licensing.'],
    commercialSurface: 'Its own high-end sales platform is appropriate because the experience brand needs a very different visual and emotional journey from corporate ORVIA.',
    evidenceNote: 'An active ChatGPT Sites build is verified in the ORVIA Library.'
  },
  {
    slug: 'reset-retreats', name: 'Reset Retreats', shortName: 'RESET', category: 'Venture / experience', status: 'REVIEW REQUIRED',
    description: 'Recovery, reset and new-experience concept. Historic controlled material parked it until the Command Centre was complete; recent website work means it now needs a formal unfreeze/re-baseline decision.',
    parentWebsite: 'https://www.orvia.org.uk', visual: 'teal',
    workstreams: ['Retreat product design', 'Venue network', 'Adventure experiences', 'Licensing/business model', 'Foundation relationship'],
    nextActions: ['Record whether Reset Retreats is now formally unfrozen.', 'Reconcile the recent website concept with the recovered controlled baseline.', 'Do not publish unsupported safeguarding, clinical or partnership claims.'],
    commercialSurface: 'Likely dedicated experience sales platform, while legal ownership and governance remain clearly ORVIA-linked.',
    evidenceNote: 'Recovered baseline explicitly parked the project until Command was complete and required named commercial/legal artefacts before launch.'
  },
  {
    slug: 'track-atac', name: 'ORVIA Track / ATAC', shortName: 'TRACK', category: 'Platform', status: 'BUILT NOT DEPLOYED',
    description: 'Separate operational platform for mapping, tracking, field control, operational awareness and control-room workflows.',
    parentWebsite: 'https://www.orvia.org.uk', visual: 'teal',
    workstreams: ['Mapping', 'Field tracking', 'Control room', 'Operational awareness', 'Admin/control workflows'],
    nextActions: ['Reconcile the existing Longmoor build with the later Power Apps version.', 'Define the canonical product name and repo.', 'Create a dedicated sales/demo surface only after acceptance.'],
    commercialSurface: 'Dedicated product/demo platform when accepted; ORVIA master site remains the discovery route.',
    evidenceNote: 'Current landscape defines Track/ATAC as a distinct operational platform; commercial acceptance is not yet recorded.'
  },
  {
    slug: 'ptt', name: 'ORVIA PTT', shortName: 'PTT', category: 'Platform', status: 'BUILT NOT DEPLOYED',
    description: 'Communications platform for push-to-talk, radio integration, control-room communications and transcription.',
    github: 'https://github.com/ORVIA-Oversight/orvia-ptt', parentWebsite: 'https://www.orvia.org.uk', visual: 'orange',
    workstreams: ['Push-to-talk', 'Radio integration', 'Talkgroups', 'Control room', 'Transcription'],
    nextActions: ['Move from POC to accepted product scope.', 'Define hardware/radio interoperability boundaries.', 'Build a sales/demo page only around verified capabilities.'],
    commercialSurface: 'Product-specific technical sales/demo surface when accepted.',
    evidenceNote: 'Dedicated repository and backend PTT tables exist; current product remains pre-acceptance.'
  },
  {
    slug: 'overwatch', name: 'ORVIA Overwatch', shortName: 'OVERWATCH', category: 'Platform', status: 'BUILT NOT DEPLOYED',
    description: 'ORVIA oversight product line focused on seeing the operating picture, understanding risk and supporting accountable human response.',
    github: 'https://github.com/ORVIA-Oversight/orvia-overwatch', parentWebsite: 'https://www.orvia.org.uk', visual: 'navy',
    workstreams: ['Operational oversight', 'Risk picture', 'Evidence', 'Human response', 'Commercial positioning'],
    nextActions: ['Confirm current build evidence and acceptance.', 'Keep language away from surveillance framing.', 'Define the buyer and dedicated sales journey.'],
    commercialSurface: 'Potential dedicated sales/demo platform once the current capability set is verified.',
    evidenceNote: 'Dedicated repository exists; current commercial readiness should be re-verified before public claims expand.'
  },
  {
    slug: 'foundation', name: 'ORVIA Foundation', shortName: 'FOUNDATION', category: 'Foundation / social impact', status: 'REVIEW REQUIRED',
    description: 'Human-first social-impact arm intended to support families and people regardless of background or diagnosis, funded alongside ORVIA commercial activity.',
    parentWebsite: 'https://www.orvia.org.uk', visual: 'warm',
    workstreams: ['Family support', 'Access and inclusion', 'Community initiatives', 'Funding model', 'Governance/legal structure'],
    nextActions: ['Verify and record the current legal/CIC status.', 'Define which ventures sit under Foundation versus ORVIA Oversight Ltd.', 'Create its own public site only once governance language is settled.'],
    commercialSurface: 'Dedicated public/social-impact site can sit alongside ORVIA, with clear legal identity and funding relationship.',
    evidenceNote: 'Earlier controlled material contained an unresolved charity-vs-CIC decision; current Founder position should be reconciled into the controlled record.'
  },
  {
    slug: 'clinical-hub', name: 'ORVIA Clinical Hub', shortName: 'CLINICAL', category: 'Commercial product', status: 'PLANNED ONLY',
    description: 'Proposed remote clinical advisory service supporting organisations with access to clinical advice and escalation pathways.',
    parentWebsite: 'https://www.orvia.org.uk', visual: 'teal',
    workstreams: ['Clinical advisory', 'On-call model', 'Sector packages', 'Clinician network', 'Governance and indemnity'],
    nextActions: ['Complete clinical governance and indemnity design.', 'Validate staffing/on-call economics.', 'Only then create the dedicated sales platform.'],
    commercialSurface: 'Dedicated professional sales platform after clinical governance acceptance.',
    evidenceNote: 'Concept/service model exists but has not been classified as live or accepted in this Command register.'
  },
  {
    slug: 'academy', name: 'ORVIA Academy', shortName: 'ACADEMY', category: 'Commercial product', status: 'REVIEW REQUIRED',
    description: 'Training and learning route within the wider ORVIA estate.',
    parentWebsite: 'https://www.orvia.org.uk', visual: 'purple',
    workstreams: ['Training catalogue', 'Immersive learning', 'Professional development', 'Quality assurance'],
    nextActions: ['Confirm the current Academy offer and ownership of each course.', 'Separate verified training from concepts.', 'Decide whether Academy needs its own sales platform.'],
    commercialSurface: 'Potential dedicated learning catalogue/checkout surface linked from ORVIA.',
    evidenceNote: 'Academy is present in the current ORVIA landscape but requires a fresh commercial/evidence classification.'
  },
  {
    slug: 'witness-room', name: 'ORVIA Witness Room', shortName: 'WITNESS', category: 'Platform', status: 'PLANNED ONLY',
    description: 'Planned governed human-profile / evidence interaction environment. It must remain distinct from ORVIA Voice.',
    parentWebsite: 'https://www.orvia.org.uk', visual: 'purple',
    workstreams: ['Witness/evidence experience', 'Governed avatars', 'Human profile tools', 'Safety and provenance'],
    nextActions: ['Define scope and evidence boundaries.', 'Keep separate from Voice and MIA unless architecture explicitly says otherwise.', 'Do not market before acceptance.'],
    commercialSurface: 'No public sales platform until scope, safeguards and evidence are accepted.',
    evidenceNote: 'Current landscape explicitly says Voice must not be merged with Witness Room.'
  },
  {
    slug: 'signal', name: 'ORVIA Signal', shortName: 'SIGNAL', category: 'Internal / shared engine', status: 'PLANNED ONLY',
    description: 'Shared ORVIA engine concept in the target landscape, intended as infrastructure rather than a standalone public business.',
    parentWebsite: 'https://www.orvia.org.uk', visual: 'orange',
    workstreams: ['Shared signals', 'Cross-product events', 'Evidence routing', 'Operational intelligence'],
    nextActions: ['Confirm canonical scope.', 'Avoid creating a duplicate platform where shared infrastructure is sufficient.', 'Expose through products rather than selling the engine itself.'],
    commercialSurface: 'Shared engine; not a standalone sales site unless strategy changes.',
    evidenceNote: 'Listed in the current target landscape as a shared engine/module candidate.'
  }
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export const projectGroups = [
  'Core ORVIA',
  'Commercial product',
  'Platform',
  'Venture / experience',
  'Foundation / social impact',
  'Internal / shared engine'
] as const;
