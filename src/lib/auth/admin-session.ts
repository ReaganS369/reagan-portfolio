/** @format */

export const ADMIN_SESSION_COOKIE = 'admin_session';

const SESSION_PAYLOAD = 'nngtw-admin-authenticated';

export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: ADMIN_SESSION_MAX_AGE,
  };
}

async function hmacSha256Base64Url(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(message),
  );
  const bytes = new Uint8Array(signature);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

export async function createAdminSessionToken(password: string): Promise<string> {
  return hmacSha256Base64Url(password, SESSION_PAYLOAD);
}

export async function verifyAdminSessionToken(
  password: string,
  token: string | undefined,
): Promise<boolean> {
  if (!token) {
    return false;
  }

  const expected = await createAdminSessionToken(password);
  return timingSafeEqualString(token, expected);
}
