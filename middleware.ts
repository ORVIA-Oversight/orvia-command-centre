import { NextRequest, NextResponse } from 'next/server';

const ORVIA_SESSION_COOKIE = 'orvia_session';
const WORKSPACE_LOGIN = 'https://workspace.orvia.org.uk/login';
const WORKSPACE_VERIFY = 'https://workspace.orvia.org.uk/api/auth/command-verify';

async function verifyCommandSession(token?: string) {
  if (!token) return null;
  try {
    const response = await fetch(WORKSPACE_VERIFY, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const data = await response.json() as { valid?: boolean; session?: { email?: string; role?: string } };
    return data.valid ? data.session ?? null : null;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const session = await verifyCommandSession(req.cookies.get(ORVIA_SESSION_COOKIE)?.value);
  if (session?.email) {
    const response = NextResponse.next();
    response.headers.set('x-orvia-user', session.email);
    if (session.role) response.headers.set('x-orvia-role', session.role);
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

  const requested = req.nextUrl.pathname + req.nextUrl.search;
  const returnTo = `/api/auth/command-return?path=${encodeURIComponent(requested)}`;
  const target = new URL(WORKSPACE_LOGIN);
  target.searchParams.set('returnTo', returnTo);
  return NextResponse.redirect(target);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|api/auth/handoff).*)'],
};
