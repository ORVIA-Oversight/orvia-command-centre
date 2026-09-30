import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

function fallbackDrafts(item: any) {
  const topic = item.subject || 'your email';
  const summary = item.summary || item.preview || '';
  return [
    {
      option_label: 'A',
      tone: 'John / professional',
      recommended: true,
      subject: item.subject ? `Re: ${item.subject}` : 'Re: Your email',
      body: `Thanks for getting in touch regarding ${topic}.\n\nI have reviewed this. ${summary ? 'I have the context and will deal with the point you have raised.' : 'I have picked this up and will deal with it.'}\n\nI will come back to you with the next step shortly.\n\nRegards,\nJohn`,
    },
    {
      option_label: 'B',
      tone: 'John / warmer',
      recommended: false,
      subject: item.subject ? `Re: ${item.subject}` : 'Re: Your email',
      body: `Thanks for getting in touch.\n\nI have had a look at ${topic} and I understand what you are asking. I want to make sure we deal with it properly rather than give you a rushed answer.\n\nI will come back to you with the next step shortly.\n\nBest,\nJohn`,
    },
    {
      option_label: 'C',
      tone: 'John / concise',
      recommended: false,
      subject: item.subject ? `Re: ${item.subject}` : 'Re: Your email',
      body: `Thanks — I have this.\n\nI am reviewing ${topic} and will come back to you with the action or decision required.\n\nJohn`,
    },
  ];
}

function outputText(payload: any) {
  if (typeof payload?.output_text === 'string') return payload.output_text;
  const parts = Array.isArray(payload?.output) ? payload.output : [];
  for (const part of parts) {
    const content = Array.isArray(part?.content) ? part.content : [];
    for (const block of content) {
      if (typeof block?.text === 'string') return block.text;
    }
  }
  return '';
}

async function aiDrafts(item: any, voice: any) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.MAIL_AI_MODEL;
  if (!apiKey || !model) return null;

  const prompt = [
    'You are the ORVIA Command Communications drafting agent.',
    'Prepare exactly three email reply options for John McGill.',
    'Return only valid JSON: {"drafts":[{"option_label":"A","tone":"...","recommended":true,"subject":"...","body":"..."}, ...]}.',
    'Do not invent commitments, dates, prices, facts or decisions.',
    'If the message requires a decision not supplied, say so in the draft rather than guessing.',
    'Keep legal, safeguarding, HR, complaints, contractual and significant financial matters approval-only.',
    `John voice profile: ${JSON.stringify(voice?.profile_json || {})}`,
    `Message: ${JSON.stringify({
      from: item.from_name || item.from_address,
      subject: item.subject,
      summary: item.summary || item.preview,
      area: item.business_area,
      risk: item.risk_level,
    })}`,
  ].join('\n');

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ model, input: prompt }),
    cache: 'no-store',
  });

  if (!response.ok) return null;
  const payload = await response.json();
  const text = outputText(payload);
  if (!text) return null;

  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed?.drafts) && parsed.drafts.length === 3 ? parsed.drafts : null;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      const parsed = JSON.parse(match[0]);
      return Array.isArray(parsed?.drafts) && parsed.drafts.length === 3 ? parsed.drafts : null;
    } catch {
      return null;
    }
  }
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  const { data, error } = await supabase
    .from('command_mail_drafts')
    .select('*')
    .eq('mail_item_id', params.id)
    .order('option_label');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ drafts: data || [] });
}

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });

  const [{ data: item, error: itemError }, { data: voice }] = await Promise.all([
    supabase.from('command_mail_items').select('*').eq('id', params.id).single(),
    supabase.from('command_voice_profiles').select('*').eq('identity_key', 'john-mcgill').maybeSingle(),
  ]);

  if (itemError || !item) return NextResponse.json({ error: 'Mail item not found' }, { status: 404 });

  const { data: existing } = await supabase
    .from('command_mail_drafts')
    .select('*')
    .eq('mail_item_id', params.id)
    .order('option_label');
  if ((existing || []).length >= 3) return NextResponse.json({ drafts: existing });

  const generated = await aiDrafts(item, voice) || fallbackDrafts(item);
  await supabase.from('command_mail_drafts').delete().eq('mail_item_id', params.id);

  const records = generated.map((draft: any, index: number) => ({
    mail_item_id: params.id,
    option_label: draft.option_label || String.fromCharCode(65 + index),
    tone: draft.tone || 'John Voice',
    subject: draft.subject || (item.subject ? `Re: ${item.subject}` : 'Re: Your email'),
    body: draft.body || '',
    recommended: Boolean(draft.recommended ?? index === 0),
  }));

  const { data, error } = await supabase
    .from('command_mail_drafts')
    .insert(records)
    .select('*')
    .order('option_label');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ drafts: data || [], ai: Boolean(process.env.OPENAI_API_KEY && process.env.MAIL_AI_MODEL) });
}
