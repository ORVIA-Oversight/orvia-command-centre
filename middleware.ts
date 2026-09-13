import { NextRequest, NextResponse } from 'next/server';
import { ORVIA_SESSION_COOKIE, verifySession } from '@/lib/auth/session';

const WORKSPACE_LOGIN = 'https://workspace.orvia.org.uk/api/auth/login?returnTo=%2Fapi%2Fauth%2Fcommand-return';

export async function middleware(req: NextRequest) {
  const session = await verifySession(req.cookies.get(ORVIA_SESSION_COOKIE)?.value);
  if (session) {
    const response = NextResponse.next();
    response.headers.set('x-orvia-user', session.email);
    response.headers.set('x-orvia-role', session.role);
    return response;
  }

  const privateMode = process.env.COMMAND_PRIVATE_MODE === 'true';
  if (privateMode) {
    const username = process.env.COMMAND_USERNAME;
    const password = process.env.COMMAND_PASSWORD;
    const auth = req.headers.get('authorization');
    if (username && password && auth?.startsWith('Basic ')) {
      try {
        const decoded = atob(auth.slice(6));
        const split = decoded.indexOf(':');
        const u = split >= 0 ? decoded.slice(0, split) : decoded;
        const p = split >= 0 ? decoded.slice(split + 1) : '';
        if (u === username && p === password) return NextResponse.next();
      } catch {}
    }
  }

  const target = new URL(WORKSPACE_LOGIN);
  target.searchParams.set('commandReturn', req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(target);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt).*)'],
};
