import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const ORVIA_SESSION_COOKIE = 'orvia_session';
const WORKSPACE_VERIFY = 'https://workspace.orvia.org.uk/api/auth/command-verify';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token') || '';
  const rawPath = url.searchParams.get('path') || '/';
  const path = rawPath.startsWith('/') && !rawPath.startsWith('//') ? rawPath : '/';

  try {
    const verify = await fetch(WORKSPACE_VERIFY, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    const data = await verify.json().catch(() => ({})) as { valid?: boolean; commandToken?: string };

    if (!verify.ok || !data.valid || !data.commandToken) {
      const login = new URL('https://workspace.orvia.org.uk/login');
      login.searchParams.set('returnTo', `/api/auth/command-return?path=${encodeURIComponent(path)}`);
      login.searchParams.set('error', 'Command handoff expired or invalid');
      return NextResponse.redirect(login);
    }

    const response = NextResponse.redirect(new URL(path, url.origin));
    response.cookies.set(ORVIA_SESSION_COOKIE, data.commandToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8,
    });
    response.headers.set('cache-control', 'no-store');
    return response;
  } catch {
    const login = new URL('https://workspace.orvia.org.uk/login');
    login.searchParams.set('returnTo', `/api/auth/command-return?path=${encodeURIComponent(path)}`);
    login.searchParams.set('error', 'Command authentication service unavailable');
    return NextResponse.redirect(login);
  }
}
