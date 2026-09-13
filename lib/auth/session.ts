export const ORVIA_SESSION_COOKIE = 'orvia_session';

export type OrviaSession = {
  sub: string;
  email: string;
  name: string;
  role: 'founder' | 'operator';
  exp: number;
};

const encoder = new TextEncoder();

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
    ['verify']
  );
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
