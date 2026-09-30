import { NextResponse } from 'next/server';
import { decryptSecret, encryptSecret } from '@/lib/mail-crypto';
import { providerConfig } from '@/lib/mail-oauth';
import { classifyMail } from '@/lib/mail-classifier';
import { getServerSupabase } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type Connection = {
  id: string;
  account_id: string;
  provider: 'microsoft' | 'google';
  access_token_ciphertext: string;
  refresh_token_ciphertext?: string | null;
  expires_at?: string | null;
  status: string;
};

async function refreshToken(connection: Connection) {
  const config = providerConfig(connection.provider);
  const refreshToken = decryptSecret(connection.refresh_token_ciphertext);
  if (!refreshToken) throw new Error('No refresh token is available for this mailbox');

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
  const data = await response.json() as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
    error_description?: string;
  };
  if (!response.ok || !data.access_token) throw new Error(data.error_description || 'Token refresh failed');

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresAt: new Date(Date.now() + Number(data.expires_in || 3600) * 1000).toISOString(),
  };
}

async function getAccessToken(connection: Connection, supabase: any) {
  const expiresAt = connection.expires_at ? new Date(connection.expires_at).getTime() : 0;
  if (expiresAt > Date.now() + 120_000) return decryptSecret(connection.access_token_ciphertext);

  const refreshed = await refreshToken(connection);
  await supabase.from('command_mail_connections').update({
    access_token_ciphertext: encryptSecret(refreshed.accessToken),
    refresh_token_ciphertext: encryptSecret(refreshed.refreshToken),
    expires_at: refreshed.expiresAt,
    status: 'connected',
    last_error: null,
    updated_at: new Date().toISOString(),
  }).eq('id', connection.id);
  return refreshed.accessToken;
}

async function microsoftMessages(token: string) {
  const url = new URL('https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages');
  url.searchParams.set('$top', '50');
  url.searchParams.set('$orderby', 'receivedDateTime desc');
  url.searchParams.set('$select', 'id,conversationId,subject,bodyPreview,receivedDateTime,from,importance,isRead,hasAttachments');
  const response = await fetch(url, {
    headers: { authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Microsoft inbox sync failed (${response.status})`);
  const data = await response.json() as { value?: any[] };
  return (data.value || []).map((message) => ({
    provider_message_id: message.id,
    thread_id: message.conversationId || message.id,
    from_address: message.from?.emailAddress?.address || '',
    from_name: message.from?.emailAddress?.name || '',
    subject: message.subject || '',
    preview: message.bodyPreview || '',
    received_at: message.receivedDateTime || new Date().toISOString(),
    raw_meta: {
      importance: message.importance,
      is_read: message.isRead,
      has_attachments: message.hasAttachments,
      provider: 'microsoft',
    },
  }));
}

function headerValue(headers: any[] | undefined, name: string) {
  return headers?.find((header) => String(header.name).toLowerCase() === name.toLowerCase())?.value || '';
}

async function googleMessages(token: string) {
  const list = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=35&q=newer_than%3A30d', {
    headers: { authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!list.ok) throw new Error(`Google inbox sync failed (${list.status})`);
  const listData = await list.json() as { messages?: Array<{ id: string; threadId: string }> };

  const detail = await Promise.all((listData.messages || []).map(async (message) => {
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
      { headers: { authorization: `Bearer ${token}` }, cache: 'no-store' },
    );
    if (!response.ok) return null;
    const data = await response.json() as any;
    const headers = data.payload?.headers || [];
    const fromRaw = headerValue(headers, 'From');
    const match = fromRaw.match(/^(.*)<([^>]+)>$/);
    return {
      provider_message_id: data.id,
      thread_id: data.threadId || data.id,
      from_address: match ? match[2].trim() : fromRaw.trim(),
      from_name: match ? match[1].replace(/"/g, '').trim() : '',
      subject: headerValue(headers, 'Subject'),
      preview: data.snippet || '',
      received_at: data.internalDate ? new Date(Number(data.internalDate)).toISOString() : new Date().toISOString(),
      raw_meta: {
        labels: data.labelIds || [],
        provider: 'google',
      },
    };
  }));

  return detail.filter(Boolean) as any[];
}

export async function POST() {
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });

  const { data: connections, error } = await supabase
    .from('command_mail_connections')
    .select('*, command_mail_accounts(*)')
    .eq('status', 'connected');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const result: Array<{ address: string; imported: number; error?: string }> = [];

  for (const row of connections || []) {
    const connection = row as Connection & { command_mail_accounts: any };
    const account = connection.command_mail_accounts;
    try {
      const token = await getAccessToken(connection, supabase);
      const providerMessages = connection.provider === 'microsoft'
        ? await microsoftMessages(token)
        : await googleMessages(token);

      const records = providerMessages.map((message) => {
        const classification = classifyMail({
          subject: message.subject,
          preview: message.preview,
          fromAddress: message.from_address,
          accountType: account.account_type,
        });
        return {
          account_id: account.id,
          ...message,
          ...classification,
          confidence: 0.72,
          summary: message.preview ? message.preview.slice(0, 420) : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });

      if (records.length) {
        const { error: insertError } = await supabase
          .from('command_mail_items')
          .upsert(records, {
            onConflict: 'account_id,provider_message_id',
            ignoreDuplicates: true,
          });
        if (insertError) throw insertError;
      }

      await supabase.from('command_mail_accounts').update({
        last_sync_at: new Date().toISOString(),
        status: 'connected',
        updated_at: new Date().toISOString(),
      }).eq('id', account.id);

      result.push({ address: account.address, imported: records.length });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sync failed';
      await supabase.from('command_mail_connections').update({
        status: 'error',
        last_error: message,
        updated_at: new Date().toISOString(),
      }).eq('id', connection.id);
      result.push({ address: account?.address || 'Unknown account', imported: 0, error: message });
    }
  }

  return NextResponse.json({ synced: result, at: new Date().toISOString() });
}
