import { describe, expect, it } from 'vitest';
import { createToken, verifyToken } from './token.js';

const secret = 'test-secret';
const now = Date.UTC(2026, 2, 2, 12, 0, 0);

describe('token', () => {
  it('round-trips a valid token', () => {
    const token = createToken({ sub: 'U01', role: 'PASSENGER' }, { secret, ttlMinutes: 60, now });

    expect(verifyToken(token, { secret, now })).toEqual({
      ok: true,
      payload: { sub: 'U01', role: 'PASSENGER', iat: now / 1000, exp: now / 1000 + 3600 },
    });
  });

  it('reports expiry once the ttl has elapsed', () => {
    const token = createToken({ sub: 'U01', role: 'PASSENGER' }, { secret, ttlMinutes: 1, now });

    expect(verifyToken(token, { secret, now: now + 59_000 }).ok).toBe(true);
    expect(verifyToken(token, { secret, now: now + 60_000 })).toEqual({ ok: false, reason: 'EXPIRED' });
  });

  it('rejects a token signed with another secret', () => {
    const token = createToken({ sub: 'U01', role: 'PASSENGER' }, { secret: 'other', ttlMinutes: 60, now });

    expect(verifyToken(token, { secret, now })).toEqual({ ok: false, reason: 'INVALID' });
  });

  it('rejects a tampered payload (privilege escalation attempt)', () => {
    const token = createToken({ sub: 'U01', role: 'PASSENGER' }, { secret, ttlMinutes: 60, now });
    const [, signature] = token.split('.');
    const forged = Buffer.from(JSON.stringify({ sub: 'U01', role: 'ADMIN', iat: 0, exp: 9_999_999_999 })).toString('base64url');

    expect(verifyToken(`${forged}.${signature}`, { secret, now })).toEqual({ ok: false, reason: 'INVALID' });
  });

  it.each(['', 'abc', 'a.b.c', '.'])('rejects malformed token %j', (token) => {
    expect(verifyToken(token, { secret, now }).ok).toBe(false);
  });
});
