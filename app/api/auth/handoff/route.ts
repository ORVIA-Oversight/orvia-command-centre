import { NextResponse } from 'next/server';
import { ORVIA_SESSION_COOKIE, sessionCookieOptions, signSession, verifySession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  const rawPath = url.searchParams.get('path') || '/';
  const path = rawPath.startsWith('/') && !rawPath.startsWith('//') ? rawPath : '/';

  const handoff = await verifySession(token);
  if (!handoff || handoff.purpose !== 'command_handoff') {
    const login = new URL('https://workspace.orvia.org.uk/login');
    login.searchParams.set('returnTo', `/api/auth/command-return?path=${encodeURIComponent(path)}`);
    login.searchParams.set('error', 'Command handoff expired or invalid');
    return NextResponse.redirect(login);
  }

  const session = await signSession({
    ...handoff,
    purpose: 'command_session',
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
  });
  if (!session) {
    return new NextResponse('Command authentication is not configured.', { status: 503 });
  }

  const response = NextResponse.redirect(new URL(path, url.origin));
  response.cookies.set(ORVIA_SESSION_COOKIE, session, sessionCookieOptions());
  return response;
}
