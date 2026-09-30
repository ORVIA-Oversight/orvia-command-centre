import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { providerConfig, providerFromString } from '@/lib/mail-oauth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { provider: string } }) {
  const provider = providerFromString(params.provider);
  if (!provider) return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });

  try {
    const config = providerConfig(provider);
    const state = randomBytes(24).toString('base64url');
    const url = new URL(config.authorizeUrl);
    url.searchParams.set('client_id', config.clientId);
    url.searchParams.set('redirect_uri', config.redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', config.scope);
    url.searchParams.set('state', state);

    if (provider === 'microsoft') {
      url.searchParams.set('response_mode', 'query');
      url.searchParams.set('prompt', 'select_account');
    } else {
      url.searchParams.set('access_type', 'offline');
      url.searchParams.set('prompt', 'consent');
      url.searchParams.set('include_granted_scopes', 'true');
    }

    const response = NextResponse.redirect(url);
    response.cookies.set('orvia_mail_oauth_state', state, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    });
    response.cookies.set('orvia_mail_oauth_provider', provider, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    });
    return response;
  } catch (error) {
    return NextResponse.redirect(new URL('/communications?connection=not-configured', req.url));
  }
}
