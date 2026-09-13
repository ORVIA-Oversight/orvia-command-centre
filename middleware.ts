import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const privateMode = process.env.COMMAND_PRIVATE_MODE === 'true';
  if (!privateMode) return NextResponse.next();

  const username = process.env.COMMAND_USERNAME;
  const password = process.env.COMMAND_PASSWORD;
  if (!username || !password) {
    return new NextResponse('Command Centre access is not configured.', { status: 503 });
  }

  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Basic ')) {
    try {
      const decoded = atob(auth.slice(6));
      const split = decoded.indexOf(':');
      const u = split >= 0 ? decoded.slice(0, split) : decoded;
      const p = split >= 0 ? decoded.slice(split + 1) : '';
      if (u === username && p === password) return NextResponse.next();
    } catch {}
  }

  return new NextResponse('Authentication required.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="ORVIA Command Centre"' },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
