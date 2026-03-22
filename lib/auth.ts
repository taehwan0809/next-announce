import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const SESSION_COOKIE_NAME = 'next-announce-session';
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 14;

type SessionPayload = {
  userId: string;
  expiresAt: number;
};

type OAuthStatePayload = {
  next: string;
  nonce: string;
};

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV !== 'production') {
    return 'dev-only-auth-secret-change-me';
  }

  throw new Error('AUTH_SECRET is not set.');
}

function createSignature(payload: string) {
  return createHmac('sha256', getAuthSecret()).update(payload).digest('base64url');
}

function encodeSignedPayload<T>(payload: T) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createSignature(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

function decodeSignedPayload<T>(token: string): T | null {
  const [encodedPayload, signature] = token.split('.');

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = createSignature(encodedPayload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  return JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as T;
}

function decodeSession(token: string): SessionPayload | null {
  const payload = decodeSignedPayload<SessionPayload>(token);

  if (!payload || payload.expiresAt <= Date.now()) {
    return null;
  }

  return payload;
}

export function buildSessionToken(userId: string) {
  return encodeSignedPayload<SessionPayload>({
    userId,
    expiresAt: Date.now() + SESSION_DURATION_MS,
  });
}

export function buildOAuthState(nextPath: string) {
  return encodeSignedPayload<OAuthStatePayload>({
    next: nextPath.startsWith('/') ? nextPath : '/dashboard',
    nonce: randomUUID(),
  });
}

export function parseOAuthState(state: string | null | undefined) {
  if (!state) {
    return '/dashboard';
  }

  const payload = decodeSignedPayload<OAuthStatePayload>(state);
  return payload?.next?.startsWith('/') ? payload.next : '/dashboard';
}

function getSessionCookieOptions(expiresAt?: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt ? new Date(expiresAt) : new Date(0),
  };
}

export function setSessionCookie(
  response: { cookies: { set: (name: string, value: string, options: ReturnType<typeof getSessionCookieOptions>) => void } },
  token: string
) {
  const session = decodeSession(token);

  response.cookies.set(
    SESSION_COOKIE_NAME,
    token,
    getSessionCookieOptions(session?.expiresAt)
  );
}

export function clearSessionCookie(
  response: { cookies: { set: (name: string, value: string, options: ReturnType<typeof getSessionCookieOptions>) => void } }
) {
  response.cookies.set(SESSION_COOKIE_NAME, '', getSessionCookieOptions());
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = decodeSession(token);

  if (!session) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      cognitoSub: true,
      emailVerified: true,
      createdAt: true,
    },
  });
}
