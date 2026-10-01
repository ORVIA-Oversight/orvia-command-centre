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
  const folderIds = ['inbox', 'junkemail'];
  const batches = [];
  for (const folderId of folderIds) {
    const url = new URL('https://graph.microsoft.com/v1.0/me/mailFolders/' + folderId + '/messages');
    url.searchParams.set('$top', '50');
    url.searchParams.set('$orderby', 'receivedDateTime desc');
    url.searchParams.set('$select', 'id,conversationId,subject,bodyPreview,receivedDateTime,from,importance,isRead,hasAttachments');
    const response = await fetch(url, { headers: { authorization: 'Bearer ' + token }, cache: 'no-store' });
    if (!response.ok) throw new Error('Microsoft ' + folderId + ' sync failed (' + response.status + ')');
    const data = await response.json() as { value?: any[] };
    batches.push(...(data.value || []).map((message) => ({
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
        source_folder: folderId === 'junkemail' ? 'junk' : 'inbox',
      },
    })));
  }
  return batches;
}

function headerValue(headers: any[] | undefined, name: string) {
  return headers?.find((header) => String(header.name).toLowerCase() === name.toLowerCase())?.value || '';
}

async function googleMessages(token: string) {
  async function listByLabel(labelId: string, sourceFolder: string) {
    const url = new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages');
    url.searchParams.set('maxResults', '50');
    url.searchParams.set('q', 'newer_than:30d');
    url.searchParams.set('labelIds', labelId);
    url.searchParams.set('includeSpamTrash', 'true');
    const response = await fetch(url, { headers: { authorization: 'Bearer ' + token }, cache: 'no-store' });
    if (!response.ok) throw new Error('Google ' + sourceFolder + ' sync failed (' + response.status + ')');
    const data = await response.json() as { messages?: Array<{ id: string; threadId: string }> };
    return (data.messages || []).map((message) => ({ ...message, sourceFolder }));
  }

  const inbox = await listByLabel('INBOX', 'inbox');
  const spam = await listByLabel('SPAM', 'spam');
  const merged = Array.from(new Map([...inbox, ...spam].map((message) => [message.id, message])).values());

  const detail = await Promise.all(merged.map(async (message) => {
    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/' + message.id + '?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date',
      { headers: { authorization: 'Bearer ' + token }, cache: 'no-store' },
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
        source_folder: message.sourceFolder,
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

  const result: Array<{ address: string; checked: number; inserted: number; updated: number; error?: string }> = [];

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

      let inserted = 0;
      let updated = 0;

      if (records.length) {
        const providerIds = records.map((record) => record.provider_message_id).filter(Boolean);
        const { data: existingItems, error: existingError } = await supabase
          .from('command_mail_items')
          .select('id,provider_message_id')
          .eq('account_id', account.id)
          .in('provider_message_id', providerIds);

        if (existingError) throw existingError;

        const existingByProviderId = new Map(
          (existingItems || []).map((row: any) => [row.provider_message_id, row.id]),
        );

        const toInsert = records.filter((record) => !existingByProviderId.has(record.provider_message_id));
        const toUpdate = records.filter((record) => existingByProviderId.has(record.provider_message_id));

        if (toInsert.length) {
          const { error: insertError } = await supabase
            .from('command_mail_items')
            .insert(toInsert);
          if (insertError) throw insertError;
          inserted = toInsert.length;
        }

        for (const record of toUpdate) {
          const id = existingByProviderId.get(record.provider_message_id);
          const { error: updateError } = await supabase
            .from('command_mail_items')
            .update({
              from_address: record.from_address,
              from_name: record.from_name,
              subject: record.subject,
              preview: record.preview,
              received_at: record.received_at,
              raw_meta: record.raw_meta,
              classification: record.classification,
              business_area: record.business_area,
              priority: record.priority,
              state: record.state,
              risk_level: record.risk_level,
              assigned_agent: record.assigned_agent,
              requires_human: record.requires_human,
              confidence: record.confidence,
              summary: record.summary,
              updated_at: new Date().toISOString(),
            })
            .eq('id', id);
          if (updateError) throw updateError;
          updated += 1;
        }
      }

      await supabase.from('command_mail_accounts').update({
        last_sync_at: new Date().toISOString(),
        status: 'connected',
        updated_at: new Date().toISOString(),
      }).eq('id', account.id);

      await supabase.from('command_mail_actions').insert({
        action_type: 'mail_sync',
        actor: 'system',
        detail: {
          account_id: account.id,
          address: account.address,
          provider: connection.provider,
          checked: records.length,
          inserted,
          updated,
        },
      });

      result.push({ address: account.address, checked: records.length, inserted, updated });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sync failed';
      await supabase.from('command_mail_connections').update({
        status: 'error',
        last_error: message,
        updated_at: new Date().toISOString(),
      }).eq('id', connection.id);
      result.push({ address: account?.address || 'Unknown account', checked: 0, inserted: 0, updated: 0, error: message });
    }
  }

  return NextResponse.json({ synced: result, at: new Date().toISOString() });
}
