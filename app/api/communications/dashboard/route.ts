import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = getServerSupabase();
  const providerReadiness = {
    microsoft: Boolean(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET),
    google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    encryption: Boolean(process.env.MAIL_TOKEN_ENCRYPTION_KEY),
    ai: Boolean(process.env.OPENAI_API_KEY && process.env.MAIL_AI_MODEL),
  };

  if (!supabase) {
    return NextResponse.json({
      live: false,
      providerReadiness,
      counts: { needsJohn: 0, replyReady: 0, waiting: 0, automated: 0 },
      accounts: [],
      items: [],
      rules: [],
      voiceProfile: null,
      signature: null,
    });
  }

  const [accountsRes, connectionsRes, itemsRes, rulesRes, voiceRes, signatureRes] = await Promise.all([
    supabase.from('command_mail_accounts')
      .select('id,provider,address,display_name,account_type,business_area,status,last_sync_at,created_at,updated_at')
      .order('created_at', { ascending: true }),
    supabase.from('command_mail_connections')
      .select('id,account_id,provider,provider_user_id,expires_at,status,last_error,created_at,updated_at')
      .order('created_at', { ascending: true }),
    supabase.from('command_mail_items').select('*').order('received_at', { ascending: false }).limit(80),
    supabase.from('command_mail_rules').select('*').order('precedence', { ascending: true }),
    supabase.from('command_voice_profiles').select('*').eq('identity_key', 'john-mcgill').maybeSingle(),
    supabase.from('command_signatures').select('*').eq('identity_key', 'john-mcgill').maybeSingle(),
  ]);

  const items = itemsRes.data ?? [];
  const counts = {
    needsJohn: items.filter((x: any) => x.state === 'needs_john').length,
    replyReady: items.filter((x: any) => x.state === 'reply_ready').length,
    waiting: items.filter((x: any) => x.state === 'waiting').length,
    automated: items.filter((x: any) => ['filed', 'automated'].includes(x.state)).length,
  };

  return NextResponse.json({
    live: true,
    providerReadiness,
    counts,
    accounts: accountsRes.data ?? [],
    connections: connectionsRes.data ?? [],
    items,
    rules: rulesRes.data ?? [],
    voiceProfile: voiceRes.data ?? null,
    signature: signatureRes.data ?? null,
    diagnostics: {
      accountsError: accountsRes.error ? {
        code: accountsRes.error.code,
        message: accountsRes.error.message,
        details: accountsRes.error.details,
        hint: accountsRes.error.hint,
      } : null,
      connectionsError: connectionsRes.error ? {
        code: connectionsRes.error.code,
        message: connectionsRes.error.message,
        details: connectionsRes.error.details,
        hint: connectionsRes.error.hint,
      } : null,
      itemsError: itemsRes.error ? {
        code: itemsRes.error.code,
        message: itemsRes.error.message,
        details: itemsRes.error.details,
        hint: itemsRes.error.hint,
      } : null,
    },
  });
}
