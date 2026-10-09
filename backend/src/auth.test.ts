import express from 'express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import { createToken } from './auth/token.js';
import { config } from './config.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requireAuth, requireRole } from './middleware/auth.js';
import { startTestServer, type TestServer } from './test/httpTestServer.js';

let api: TestServer;

beforeAll(async () => {
  api = await startTestServer(createApp());
});

afterAll(() => api.close());

async function loginAs(username: string, password: string): Promise<string> {
  const { body } = await api.request('POST', '/api/auth/login', { body: { username, password } });
  return (body.data as { token: string }).token;
}

describe('POST /api/auth/login', () => {
  it('logs in a passenger and never returns the password', async () => {
    const { status, body } = await api.request('POST', '/api/auth/login', {
      body: { username: 'pasajero.demo', password: 'Pasajero2026!' },
    });
    const data = body.data as { token: string; expiresAt: string; user: Record<string, unknown> };

    expect(status).toBe(200);
    expect(data.token).toMatch(/^[\w-]+\.[\w-]+$/);
    expect(data.user).toMatchObject({ id: 'U01', role: 'PASSENGER', fullName: 'Paula Pasajera (demo)' });
    expect(data.user).not.toHaveProperty('password');
    expect(Date.parse(data.expiresAt)).toBeGreaterThan(Date.now());
  });

  it('accepts the username regardless of case and surrounding spaces', async () => {
    const { status } = await api.request('POST', '/api/auth/login', {
      body: { username: '  Admin.Demo ', password: 'Admin2026!' },
    });

    expect(status).toBe(200);
  });

  it('reports every missing field', async () => {
    const { status, body } = await api.request('POST', '/api/auth/login', { body: { username: '', password: '' } });

    expect(status).toBe(400);
    expect(body.error).toMatchObject({
      code: 'VALIDATION_ERROR',
      details: [
        { field: 'username', message: 'El usuario es obligatorio.' },
        { field: 'password', message: 'La contraseña es obligatoria.' },
      ],
    });
  });

  it('treats a missing body as missing fields', async () => {
    const { status } = await api.request('POST', '/api/auth/login');

    expect(status).toBe(400);
  });

  it.each([
    ['unknown user', { username: 'nadie.demo', password: 'x' }, 401, 'USER_NOT_FOUND'],
    ['wrong password', { username: 'pasajero.demo', password: 'incorrecta' }, 401, 'WRONG_PASSWORD'],
    ['locked account', { username: 'bloqueado.demo', password: 'Bloqueado2026!' }, 403, 'ACCOUNT_LOCKED'],
  ])('rejects %s', async (_case, credentials, expectedStatus, expectedCode) => {
    const { status, body } = await api.request('POST', '/api/auth/login', { body: credentials });

    expect(status).toBe(expectedStatus);
    expect(body.error).toMatchObject({ code: expectedCode });
  });
});

describe('protected endpoints', () => {
  it('returns the current user with a valid session', async () => {
    const token = await loginAs('pasajero.demo', 'Pasajero2026!');
    const { status, body } = await api.request('GET', '/api/auth/me', { token });

    expect(status).toBe(200);
    expect(body.data).toMatchObject({ id: 'U01', username: 'pasajero.demo' });
  });

  it('distinguishes missing, invalid and expired sessions', async () => {
    const expired = createToken(
      { sub: 'U01', role: 'PASSENGER' },
      { secret: config.authSecret, ttlMinutes: 1, now: Date.now() - 2 * 60_000 },
    );

    const missing = await api.request('GET', '/api/auth/me');
    const invalid = await api.request('GET', '/api/auth/me', { token: 'not.valid' });
    const outdated = await api.request('GET', '/api/auth/me', { token: expired });

    expect([missing.status, invalid.status, outdated.status]).toEqual([401, 401, 401]);
    expect(missing.body.error).toMatchObject({ code: 'UNAUTHENTICATED' });
    expect(invalid.body.error).toMatchObject({ code: 'INVALID_TOKEN' });
    expect(outdated.body.error).toMatchObject({ code: 'SESSION_EXPIRED' });
  });

  it('returns only the history of the signed-in user', async () => {
    const token = await loginAs('pasajero.demo', 'Pasajero2026!');
    const { body } = await api.request('GET', '/api/history', { token });
    const entries = body.data as { id: string; userId: string }[];

    expect(entries.map((entry) => entry.id)).toEqual(['H02', 'H01']);
    expect(entries.every((entry) => entry.userId === 'U01')).toBe(true);
  });

  it('logout always succeeds (stateless token is discarded by the client)', async () => {
    const { status, body } = await api.request('POST', '/api/auth/logout');

    expect(status).toBe(200);
    expect(body.data).toEqual({ loggedOut: true });
  });
});

describe('PUT /api/profile', () => {
  it('validates and returns the updated profile', async () => {
    const token = await loginAs('pasajero.demo', 'Pasajero2026!');
    const update = { fullName: 'Paula Pérez', email: 'paula@example.com', phone: '310 555 0101' };
    const { status, body } = await api.request('PUT', '/api/profile', { token, body: update });

    expect(status).toBe(200);
    expect(body.data).toMatchObject({ id: 'U01', username: 'pasajero.demo', ...update });
  });

  it('rejects invalid fields with one message per field', async () => {
    const token = await loginAs('pasajero.demo', 'Pasajero2026!');
    const { status, body } = await api.request('PUT', '/api/profile', {
      token,
      body: { fullName: 'P', email: 'no-es-correo', phone: 'abc' },
    });
    const details = (body.error as { details: { field: string }[] }).details;

    expect(status).toBe(400);
    expect(details.map((detail) => detail.field)).toEqual(['fullName', 'email', 'phone']);
  });

  it('requires a session', async () => {
    const { status } = await api.request('PUT', '/api/profile', { body: {} });

    expect(status).toBe(401);
  });
});

describe('requireRole', () => {
  it('allows the role and forbids everyone else', async () => {
    const app = express();
    app.get('/admin-only', requireAuth, requireRole('ADMIN'), (_req, res) => {
      res.json({ data: 'ok' });
    });
    app.use(errorHandler);
    const server = await startTestServer(app);

    const admin = createToken({ sub: 'U02', role: 'ADMIN' }, { secret: config.authSecret, ttlMinutes: 5 });
    const passenger = createToken({ sub: 'U01', role: 'PASSENGER' }, { secret: config.authSecret, ttlMinutes: 5 });

    expect((await server.request('GET', '/admin-only', { token: admin })).status).toBe(200);
    const forbidden = await server.request('GET', '/admin-only', { token: passenger });
    expect(forbidden.status).toBe(403);
    expect(forbidden.body.error).toMatchObject({ code: 'FORBIDDEN' });

    await server.close();
  });
});
