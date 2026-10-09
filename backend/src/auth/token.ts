import { createHmac, timingSafeEqual } from 'node:crypto';
import type { User } from '../data/schemas.js';

/**
 * Minimal stateless signed token: `base64url(payload).base64url(hmacSha256)`.
 * Stateless on purpose: serverless instances share no memory, so the server
 * cannot keep a session table. Consequence: logout cannot revoke a token.
 */
export interface TokenPayload {
  sub: string;
  role: User['role'];
  /** Issued at, epoch seconds. */
  iat: number;
  /** Expires at, epoch seconds. */
  exp: number;
}

export type TokenCheck = { ok: true; payload: TokenPayload } | { ok: false; reason: 'INVALID' | 'EXPIRED' };

interface TokenOptions {
  secret: string;
  ttlMinutes: number;
  now?: number;
}

function sign(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('base64url');
}

export function createToken(subject: Pick<TokenPayload, 'sub' | 'role'>, { secret, ttlMinutes, now = Date.now() }: TokenOptions): string {
  const iat = Math.floor(now / 1000);
  const payload: TokenPayload = { ...subject, iat, exp: iat + ttlMinutes * 60 };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${sign(encoded, secret)}`;
}

function isTokenPayload(value: unknown): value is TokenPayload {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.sub === 'string' &&
    (candidate.role === 'PASSENGER' || candidate.role === 'ADMIN') &&
    typeof candidate.iat === 'number' &&
    typeof candidate.exp === 'number'
  );
}

export function verifyToken(token: string, { secret, now = Date.now() }: Omit<TokenOptions, 'ttlMinutes'>): TokenCheck {
  const [encoded, signature, ...rest] = token.split('.');
  if (!encoded || !signature || rest.length > 0) return { ok: false, reason: 'INVALID' };

  const expected = Buffer.from(sign(encoded, secret));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return { ok: false, reason: 'INVALID' };
  }

  let payload: unknown;
  try {
    payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
  } catch {
    return { ok: false, reason: 'INVALID' };
  }
  if (!isTokenPayload(payload)) return { ok: false, reason: 'INVALID' };
  if (payload.exp <= Math.floor(now / 1000)) return { ok: false, reason: 'EXPIRED' };

  return { ok: true, payload };
}
