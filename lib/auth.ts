import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

const key = new TextEncoder().encode(JWT_SECRET);

export async function signToken() {
  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(key);
  return token;
}

export async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;

  if (!token) return false;

  try {
    await jwtVerify(token, key);
    return true;
  } catch (error) {
    return false;
  }
}
