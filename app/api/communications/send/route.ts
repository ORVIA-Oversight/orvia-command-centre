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

function encodeRawEmail(from: string, to: string, cc: string | null, subject: string, body: string) {
  const raw = [
    `From: ${from}`,
    `To: ${to}`,
    cc ? `Cc: ${cc}` : null,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    body,
  ].filter(Boolean).join('\r\n');
  return Buffer.from(raw, 'utf8').toString('base64url');
}

export async function POST(req: NextRequest) {
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });

  const input = await req.json().catch(() => ({})) as {
    account_id?: string;
    to?: string;
    cc?: string;
    subject?: string;
    body?: string;
  };

  const accountId = String(input.account_id || '').trim();
  const to = String(input.to || '').trim();
  const cc = String(input.cc || '').trim();
  const subject = String(input.subject || '').trim();
  const body = String(input.body || '').trim();

  if (!accountId || !to || !subject || !body) {
    return NextResponse.json({ error: 'From account, recipient, subject and message are required' }, { status: 400 });
  }

  const { data: account } = await supabase
    .from('command_mail_accounts')
    .select('*')
    .eq('id', accountId)
    .single();

  if (!account) return NextResponse.json({ error: 'Mailbox account not found' }, { status: 404 });

  const { data: connection } = await supabase
    .from('command_mail_connections')
    .select('*')
    .eq('account_id', account.id)
    .eq('provider', account.provider)
    .eq('status', 'connected')
    .maybeSingle();

  if (!connection) return NextResponse.json({ error: 'Mailbox is not connected' }, { status: 409 });

  try {
    const token = await usableToken(connection, supabase);

    if (connection.provider === 'microsoft') {
      const message: any = {
        subject,
        body: { contentType: 'Text', content: body },
        toRecipients: [{ emailAddress: { address: to } }],
      };
      if (cc) {
        message.ccRecipients = cc.split(',').map((address) => ({ emailAddress: { address: address.trim() } })).filter((x) => x.emailAddress.address);
      }

      const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ message, saveToSentItems: true }),
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
          raw: encodeRawEmail(account.address, to, cc || null, subject, body),
        }),
        cache: 'no-store',
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Google send failed (${response.status}) ${text.slice(0, 180)}`);
      }
    }

    await supabase.from('command_mail_actions').insert({
      action_type: 'manual_email_sent',
      actor: 'john',
      detail: {
        account_id: account.id,
        from: account.address,
        to,
        cc: cc || null,
        subject,
        provider: connection.provider,
      },
    });

    return NextResponse.json({ sent: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Send failed';
    await supabase.from('command_mail_actions').insert({
      action_type: 'manual_email_send_failed',
      actor: 'system',
      detail: { account_id: account.id, to, subject, message },
    });
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
