import 'server-only';

export type OrviaReachChannel =
  | 'web'
  | 'search'
  | 'github'
  | 'youtube'
  | 'rss'
  | 'twitter'
  | 'reddit'
  | 'linkedin'
  | 'facebook'
  | 'instagram';

export type OrviaReachSource = {
  title: string;
  url: string;
  source: string;
  snippet?: string | null;
  publishedAt?: string | null;
};

export type OrviaReachSearchResult = {
  query: string;
  sources: OrviaReachSource[];
  backend?: string | null;
  warnings?: string[];
};

function baseUrl() {
  return String(process.env.ORVIA_REACH_BASE_URL || '').trim().replace(/\/$/, '');
}

export function orviaReachConfigured() {
  return Boolean(baseUrl() && process.env.ORVIA_REACH_API_KEY);
}

export async function searchOrviaReach(input: {
  query: string;
  channels?: OrviaReachChannel[];
  maxResults?: number;
}): Promise<OrviaReachSearchResult> {
  const query = String(input.query || '').trim();
  if (!query) throw new Error('Research query is required.');
  if (query.length > 2000) throw new Error('Research query is too long.');

  const endpoint = baseUrl();
  const key = process.env.ORVIA_REACH_API_KEY;
  if (!endpoint || !key) {
    throw new Error('ORVIA Reach is not activated yet.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch(`${endpoint}/v1/search`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${key}`,
        'x-orvia-client': 'command'
      },
      body: JSON.stringify({
        query,
        channels: input.channels || ['search', 'web'],
        max_results: Math.min(Math.max(input.maxResults || 10, 1), 25),
        provenance_required: true
      }),
      cache: 'no-store',
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`ORVIA Reach returned ${response.status}.`);
    }

    const data = await response.json() as any;
    const raw = Array.isArray(data?.sources) ? data.sources : [];

    const sources: OrviaReachSource[] = raw
      .map((item: any) => ({
        title: String(item?.title || item?.name || item?.url || 'Source').trim(),
        url: String(item?.url || '').trim(),
        source: String(item?.source || item?.channel || 'web').trim(),
        snippet: item?.snippet ? String(item.snippet).trim() : null,
        publishedAt: item?.published_at ? String(item.published_at) : null
      }))
      .filter((item: OrviaReachSource) => /^https?:\/\//i.test(item.url));

    return {
      query,
      sources,
      backend: data?.backend ? String(data.backend) : null,
      warnings: Array.isArray(data?.warnings) ? data.warnings.map(String) : []
    };
  } finally {
    clearTimeout(timeout);
  }
}
