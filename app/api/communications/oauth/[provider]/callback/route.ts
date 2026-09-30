import { NextRequest, NextResponse } from 'next/server';
import { encryptSecret } from '@/lib/mail-crypto';
import { commandBaseUrl, providerConfig, providerFromString } from '@/lib/mail-oauth';
import { getServerSupabase } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

type TokenPayload = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  id_token?: string;
  error?: string;
  error_description?: string;
};

async function exchangeCode(provider: 'microsoft' | 'google', code: string) {
  const config = providerConfig(provider);
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
    grant_type: 'authorization_code',
    code,
  });

  if (provider === 'microsoft') body.set('scope', config.scope);

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  });
  const data = await response.json() as TokenPayload;
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || 'Token exchange failed');
  }
  return data;
}

async function profile(provider: 'microsoft' | 'google', token: string) {
  if (provider === 'microsoft') {
    const response = await fetch('https://graph.microsoft.com/v1.0/me?$select=id,displayName,mail,userPrincipalName', {
      headers: { authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('Could not read Microsoft profile');
    const data = await response.json() as { id: string; displayName?: string; mail?: string; userPrincipalName?: string };
    return {
      id: data.id,
      displayName: data.displayName || data.mail || data.userPrincipalName || 'Microsoft account',
      email: data.mail || data.userPrincipalName || '',
    };
  }

  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Could not read Google profile');
  const data = await response.json() as { id: string; email: string; name?: string };
  return {
    id: data.id,
    displayName: data.name || data.email,
    email: data.email,
  };
}

export async function GET(req: NextRequest, { params }: { params: { provider: string } }) {
  const provider = providerFromString(params.provider);
  if (!provider) return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });

  const url = new URL(req.url);
  const error = url.searchParams.get('error');
  if (error) {
    return NextResponse.redirect(`${commandBaseUrl()}/communications?connection=cancelled`);
  }

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookieState = req.cookies.get('orvia_mail_oauth_state')?.value;
  const cookieProvider = req.cookies.get('orvia_mail_oauth_provider')?.value;

  if (!code || !state || !cookieState || state !== cookieState || cookieProvider !== provider) {
    return NextResponse.redirect(`${commandBaseUrl()}/communications?connection=invalid-state`);
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.redirect(`${commandBaseUrl()}/communications?connection=database-unavailable`);
  }

  try {
    const tokens = await exchangeCode(provider, code);
    const person = await profile(provider, tokens.access_token!);
    if (!person.email) throw new Error('Provider did not return an email address');

    const lower = person.email.toLowerCase();
    const accountType = lower.includes('john.mcgill1078')
      ? 'legacy'
      : lower.endsWith('@orvia.org.uk')
        ? 'business'
        : 'personal';

    const { data: account, error: accountError } = await supabase
      .from('command_mail_accounts')
      .upsert({
        provider,
        address: lower,
        display_name: person.displayName,
        account_type: accountType,
        business_area: lower.endsWith('@orvia.org.uk') ? 'ORVIA' : accountType === 'personal' ? 'Personal' : 'Legacy',
        status: 'connected',
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'address' })
      .select('*')
      .single();

    if (accountError || !account) throw accountError || new Error('Account registration failed');

    const { data: existing } = await supabase
      .from('command_mail_connections')
      .select('*')
      .eq('account_id', account.id)
      .eq('provider', provider)
      .maybeSingle();

    const refreshCiphertext = tokens.refresh_token
      ? encryptSecret(tokens.refresh_token)
      : existing?.refresh_token_ciphertext || null;

    const expiresAt = new Date(Date.now() + Number(tokens.expires_in || 3600) * 1000).toISOString();

    const { error: connectionError } = await supabase
      .from('command_mail_connections')
      .upsert({
        account_id: account.id,
        provider,
        provider_user_id: person.id,
        scopes: String(tokens.scope || '').split(' ').filter(Boolean),
        access_token_ciphertext: encryptSecret(tokens.access_token!),
        refresh_token_ciphertext: refreshCiphertext,
        expires_at: expiresAt,
        status: 'connected',
        last_error: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'account_id,provider' });

    if (connectionError) throw connectionError;

    const response = NextResponse.redirect(`${commandBaseUrl()}/communications?connection=connected&provider=${provider}`);
    response.cookies.delete('orvia_mail_oauth_state');
    response.cookies.delete('orvia_mail_oauth_provider');
    return response;
  } catch (err) {
    const message = encodeURIComponent(err instanceof Error ? err.message : 'Connection failed');
    return NextResponse.redirect(`${commandBaseUrl()}/communications?connection=error&detail=${message}`);
  }
}
