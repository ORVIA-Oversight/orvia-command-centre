export const ORVIA_SESSION_COOKIE = 'orvia_session';

export type OrviaSession = {
  sub: string;
  email: string;
  name: string;
  role: 'founder' | 'operator';
  exp: number;
};

const encoder = new TextEncoder();

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecode(value: string): ArrayBuffer {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((value.length + 3) % 4);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function signingKey(): Promise<CryptoKey | null> {
  const secret = process.env.ORVIA_SESSION_SECRET?.trim();
  if (!secret || secret.length < 32) return null;
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signSession(session: OrviaSession): Promise<string | null> {
  const key = await signingKey();
  if (!key) return null;
  const payload = base64UrlEncode(encoder.encode(JSON.stringify(session)));
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return `${payload}.${base64UrlEncode(new Uint8Array(signature))}`;
}

export async function verifySession(value: string | null | undefined): Promise<OrviaSession | null> {
  if (!value) return null;
  const [payload, signature] = value.split('.');
  if (!payload || !signature) return null;
  const key = await signingKey();
  if (!key) return null;
  try {
    const ok = await crypto.subtle.verify(
      'HMAC',
      key,
      base64UrlDecode(signature),
      encoder.encode(payload)
    );
    if (!ok) return null;
    const decoded = new TextDecoder().decode(base64UrlDecode(payload));
    const session = JSON.parse(decoded) as OrviaSession;
    if (!session?.sub || !session?.email || !session?.exp) return null;
    if (session.exp <= Math.floor(Date.now() / 1000)) return null;
    return session;
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAgeSeconds = 60 * 60 * 8) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeSeconds,
  };
}
