export type AiProviderCommercial={
  code:string;
  provider:string;
  capability:string;
  requirement:'required'|'optional'|'suite-included'|'api-managed';
  clientAccount:string;
  publishedPrice:string;
  apiBilling:string;
  recommendedOrviaMode:string;
  partnerRoute:string;
  partnerStatus:'apply'|'reseller-available'|'contact'|'none-published';
  notes:string;
  verifiedAt:string;
};

export const AI_PROVIDER_COMMERCIAL:AiProviderCommercial[]=[
  {
    code:'OPENAI',
    provider:'OpenAI / ChatGPT',
    capability:'General reasoning, research, production, coding and image generation',
    requirement:'required',
    clientAccount:'ChatGPT Business recommended for client-facing workspace use; minimum two paid seats.',
    publishedPrice:'Standard: $20/seat/month annual or $25/seat/month monthly. Two-seat minimum.',
    apiBilling:'Separate. ChatGPT subscriptions do not include API usage.',
    recommendedOrviaMode:'Client-owned ChatGPT Business workspace + separately metered ORVIA-managed or client-owned API access.',
    partnerRoute:'OpenAI Partner Network — build, co-sell and deliver AI solutions.',
    partnerStatus:'apply',
    notes:'DALL·E/image generation should be treated as an OpenAI capability, not a separate customer subscription.',
    verifiedAt:'2026-10-01'
  },
  {
    code:'ANTHROPIC',
    provider:'Anthropic / Claude',
    capability:'Long-document review, independent challenge, policy analysis and drafting',
    requirement:'optional',
    clientAccount:'Claude Team recommended for organisational use; Claude Pro is suitable for an individual user.',
    publishedPrice:'Pro: $20/month. Team Standard: $20/seat/month annual or $25/seat/month monthly.',
    apiBilling:'Separate. Claude Pro does not include Claude API usage.',
    recommendedOrviaMode:'Client-owned Claude Team/Pro for direct user access + separate API account where IRIS calls Claude programmatically.',
    partnerRoute:'Claude Partner Network / Services Track.',
    partnerStatus:'apply',
    notes:'Use Claude as an interchangeable specialist worker behind the IRIS gateway.',
    verifiedAt:'2026-10-01'
  },
  {
    code:'GOOGLE',
    provider:'Google Workspace / Gemini',
    capability:'Workspace-grounded AI, Gmail, Docs, Drive and Gemini assistant',
    requirement:'suite-included',
    clientAccount:'Google Workspace plan with Gemini included.',
    publishedPrice:'UK Business Starter from £5.90/user/month annual (£7 flexible); Standard from £11.80/user/month annual.',
    apiBilling:'Gemini API/cloud usage is separate where programmatic model calls are required.',
    recommendedOrviaMode:'Reuse the client’s existing Workspace subscription where present; only add API billing for gateway execution.',
    partnerRoute:'Google Workspace reseller programme / Partner Sales Console.',
    partnerStatus:'reseller-available',
    notes:'Do not force a duplicate Gemini subscription if the customer already receives Gemini through Workspace.',
    verifiedAt:'2026-10-01'
  },
  {
    code:'MICROSOFT',
    provider:'Microsoft 365 / Copilot',
    capability:'Outlook, Calendar, Teams, SharePoint, Office apps, agents and work-grounded AI',
    requirement:'suite-included',
    clientAccount:'Qualifying Microsoft 365 plan; Copilot may be bundled or added depending on the customer licence.',
    publishedPrice:'Microsoft 365 Business Standard with Copilot: £18.10/user/month annual. Business Premium with Copilot: £24.60/user/month annual. Copilot Business standalone/add-on pricing varies by billing term and current offer.',
    apiBilling:'Graph/Microsoft service usage and any metered agent/Copilot services are governed separately from the end-user licence.',
    recommendedOrviaMode:'Prefer existing Microsoft 365 tenant and licences; connect ORVIA via approved tenant permissions and only add licences genuinely needed.',
    partnerRoute:'Microsoft Cloud Solution Provider (CSP) reseller relationship.',
    partnerStatus:'reseller-available',
    notes:'A CSP relationship can allow ORVIA to provision/manage subscriptions for customers, subject to partner approval and contract terms.',
    verifiedAt:'2026-10-01'
  },
  {
    code:'DOLA',
    provider:'Dola',
    capability:'Routine assistant, scheduling and low-risk delegated tasks',
    requirement:'optional',
    clientAccount:'Free tier can be used for limited manual access; Pro required for API access.',
    publishedPrice:'Free: $0 with limited daily messages. Pro: $20/month and includes API access. Enterprise: custom.',
    apiBilling:'Pro includes API access according to current published plan; enterprise integration terms are custom.',
    recommendedOrviaMode:'Keep optional. Use only where the verified account/API route adds value beyond Microsoft/Google/OpenAI capabilities.',
    partnerRoute:'Dola publishes a Partners link and Enterprise contact route; no public standard referral commission was found.',
    partnerStatus:'contact',
    notes:'Do not make Dola mandatory for a customer unless the workflow specifically needs it.',
    verifiedAt:'2026-10-01'
  }
];

export const AI_PROVIDER_COMMERCIAL_REVIEW_DAYS=30;
