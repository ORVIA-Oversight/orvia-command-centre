export type BrandBuzzContext = {
  label?: string;
  source?: string;
  urgency?: string;
  reason?: string;
  score?: number;
};

const BRAND_TERMS = [
  'brand','branding','logo','logos','favicon','favicons','icon','icons','header','footer',
  'social','facebook','instagram','linkedin','youtube','tiktok','threads','campaign',
  'content','post','posts','caption','media','video','heygen','synthesia','prompteditor',
  'prompt editor','aria','voice','vapi','tone of voice','open graph','og image','og:',
  'website copy','case study','case studies','legal footer','company number','ico',
  'phone number','email address','armed forces','covenant','ers','asset','assets'
];

export function isBrandInstruction(value: unknown) {
  const text = String(value ?? '').toLowerCase();
  return BRAND_TERMS.some(term => text.includes(term));
}

export function readBuzzContext(body: any): BrandBuzzContext | null {
  const raw = body?.buzz ?? body?.signal ?? body?.pulse ?? body?.context?.buzz ?? body?.context?.signal ?? null;
  if (!raw) return null;
  if (typeof raw === 'string') return { label: raw, source: 'IRIS' };
  if (typeof raw !== 'object') return null;
  return {
    label: String(raw.label ?? raw.name ?? raw.type ?? '').trim() || undefined,
    source: String(raw.source ?? 'IRIS').trim() || undefined,
    urgency: String(raw.urgency ?? raw.priority ?? '').trim() || undefined,
    reason: String(raw.reason ?? raw.detail ?? raw.context ?? '').trim() || undefined,
    score: typeof raw.score === 'number' ? raw.score : undefined,
  };
}

export function buzzSummary(buzz: BrandBuzzContext | null) {
  if (!buzz) return 'none';
  const parts = [
    buzz.label && `label=${buzz.label}`,
    buzz.source && `source=${buzz.source}`,
    buzz.urgency && `urgency=${buzz.urgency}`,
    typeof buzz.score === 'number' && `score=${buzz.score}`,
    buzz.reason && `reason=${buzz.reason}`,
  ].filter(Boolean);
  return parts.length ? parts.join('; ') : 'present';
}

export function brandWorkType(instruction: string) {
  const text = instruction.toLowerCase();
  if (/(facebook|instagram|linkedin|youtube|tiktok|threads|social|post|caption)/.test(text)) return 'brand_social_instruction';
  if (/(voice|aria|vapi|call script|greeting|pronunciation)/.test(text)) return 'brand_voice_instruction';
  if (/(heygen|synthesia|video|media|avatar)/.test(text)) return 'brand_media_instruction';
  if (/(logo|favicon|icon|header|footer|open graph|og image|asset)/.test(text)) return 'brand_asset_instruction';
  if (/(website|web page|copy|case study)/.test(text)) return 'brand_web_instruction';
  return 'brand_control_instruction';
}

export function brandAssignment(instruction: string) {
  return isBrandInstruction(instruction) ? 'BRAND-01' : 'IRIS';
}
