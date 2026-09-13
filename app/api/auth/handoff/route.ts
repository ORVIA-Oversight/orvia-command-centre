import { NextResponse } from 'next/server';
import { ORVIA_SESSION_COOKIE, sessionCookieOptions, signSession, verifySession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  const rawPath = url.searchParams.get('path') || '/';
  const path = rawPath.startsWith('/') && !rawPath.startsWith('//') ? rawPath : '/';

  const handoff = await verifySession(token);
  if (!handoff) {
    return NextResponse.redirect(new URL('https://workspace.orvia.org.uk/login?error=Command%20handoff%20expired%20or%20invalid'));
  }

  const session = await signSession({
    ...handoff,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
  });
  if (!session) {
    return new NextResponse('Command authentication is not configured.', { status: 503 });
  }

  const response = NextResponse.redirect(new URL(path, url.origin));
  response.cookies.set(ORVIA_SESSION_COOKIE, session, sessionCookieOptions());
  return response;
}
