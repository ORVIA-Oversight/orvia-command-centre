import { NextRequest, NextResponse } from 'next/server';
import { decryptSecret, encryptSecret } from '@/lib/mail-crypto';
import { providerConfig } from '@/lib/mail-oauth';
import { getServerSupabase } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

async function usableToken(connection: any, supabase: any) {
  const expiresAt = connection.expires_at ? new Date(connection.expires_at).getTime() : 0;
  if (expiresAt > Date.now() + 120_000) return decryptSecret(connection.access_token_ciphertext);

  const config = providerConfig(connection.provider);
  const refreshToken = decryptSecret(connection.refresh_token_ciphertext);
  if (!refreshToken) throw new Error('Mailbox connection has expired and cannot refresh');

  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });
  if (connection.provider === 'microsoft') body.set('scope', config.scope);

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  });
  const payload = await response.json() as any;
  if (!response.ok || !payload.access_token) throw new Error(payload.error_description || 'Mailbox token refresh failed');

  const nextRefresh = payload.refresh_token || refreshToken;
  const nextExpiry = new Date(Date.now() + Number(payload.expires_in || 3600) * 1000).toISOString();
  await supabase.from('command_mail_connections').update({
    access_token_ciphertext: encryptSecret(payload.access_token),
    refresh_token_ciphertext: encryptSecret(nextRefresh),
    expires_at: nextExpiry,
    status: 'connected',
    last_error: null,
    updated_at: new Date().toISOString(),
  }).eq('id', connection.id);

  return payload.access_token as string;
}

function encodeRawEmail(to: string, subject: string, body: string) {
  const raw = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    body,
  ].join('\r\n');
  return Buffer.from(raw, 'utf8').toString('base64url');
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });

  const input = await req.json().catch(() => ({})) as {
    draft_id?: string;
    subject?: string;
    body?: string;
    confirm_human?: boolean;
  };

  const { data: item, error: itemError } = await supabase
    .from('command_mail_items')
    .select('*, command_mail_accounts(*)')
    .eq('id', params.id)
    .single();

  if (itemError || !item) return NextResponse.json({ error: 'Mail item not found' }, { status: 404 });
  if (!item.from_address) return NextResponse.json({ error: 'No reply recipient is available' }, { status: 400 });

  if (item.risk_level === 'red' && input.confirm_human !== true) {
    return NextResponse.json({
      error: 'Human confirmation is required for high-consequence correspondence',
      approval_required: true,
    }, { status: 409 });
  }

  let subject = input.subject || (item.subject ? `Re: ${item.subject}` : 'Re: Your email');
  let body = input.body || '';
  let draftId = input.draft_id || null;

  if (draftId) {
    const { data: draft } = await supabase
      .from('command_mail_drafts')
      .select('*')
      .eq('id', draftId)
      .eq('mail_item_id', item.id)
      .single();
    if (!draft) return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    subject = draft.subject || subject;
    body = draft.body;
  }

  if (!body.trim()) return NextResponse.json({ error: 'Reply body is empty' }, { status: 400 });

  const { data: connection } = await supabase
    .from('command_mail_connections')
    .select('*')
    .eq('account_id', item.account_id)
    .eq('provider', item.command_mail_accounts.provider)
    .eq('status', 'connected')
    .maybeSingle();

  if (!connection) return NextResponse.json({ error: 'Mailbox is not connected' }, { status: 409 });

  try {
    const token = await usableToken(connection, supabase);

    if (connection.provider === 'microsoft') {
      const response = await fetch(`https://graph.microsoft.com/v1.0/me/messages/${encodeURIComponent(item.provider_message_id)}/reply`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ comment: body }),
        cache: 'no-store',
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Microsoft send failed (${response.status}) ${text.slice(0, 180)}`);
      }
    } else {
      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          raw: encodeRawEmail(item.from_address, subject, body),
          threadId: item.thread_id || undefined,
        }),
        cache: 'no-store',
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Google send failed (${response.status}) ${text.slice(0, 180)}`);
      }
    }

    if (draftId) {
      await supabase.from('command_mail_drafts').update({ selected: true }).eq('id', draftId);
    }

    await Promise.all([
      supabase.from('command_mail_items').update({
        state: 'waiting',
        updated_at: new Date().toISOString(),
      }).eq('id', item.id),
      supabase.from('command_mail_actions').insert({
        mail_item_id: item.id,
        action_type: 'reply_sent',
        actor: 'john',
        detail: {
          provider: connection.provider,
          draft_id: draftId,
          subject,
          human_confirmed: input.confirm_human === true,
        },
      }),
    ]);

    return NextResponse.json({ sent: true, state: 'waiting' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Send failed';
    await supabase.from('command_mail_actions').insert({
      mail_item_id: item.id,
      action_type: 'reply_send_failed',
      actor: 'system',
      detail: { message },
    });
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
