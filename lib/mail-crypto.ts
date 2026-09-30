import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

function keyBuffer() {
  const raw = process.env.MAIL_TOKEN_ENCRYPTION_KEY;
  if (!raw) throw new Error('MAIL_TOKEN_ENCRYPTION_KEY is not configured');
  try {
    const decoded = Buffer.from(raw, 'base64');
    if (decoded.length === 32) return decoded;
  } catch {}
  return createHash('sha256').update(raw).digest();
}

export function encryptSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', keyBuffer(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString('base64url'), tag.toString('base64url'), encrypted.toString('base64url')].join('.');
}

export function decryptSecret(payload?: string | null) {
  if (!payload) return '';
  const [ivRaw, tagRaw, dataRaw] = payload.split('.');
  const decipher = createDecipheriv('aes-256-gcm', keyBuffer(), Buffer.from(ivRaw, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagRaw, 'base64url'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataRaw, 'base64url')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}
