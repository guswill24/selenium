import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { Request, Response } from 'express';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { createApp } from './app.js';
import { errorHandler, toHttpError } from './middleware/errorHandler.js';

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  server = createApp().listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

async function get(path: string) {
  const response = await fetch(`${baseUrl}${path}`);
  return { status: response.status, headers: response.headers, body: (await response.json()) as Record<string, unknown> };
}

function dataOf<T>(body: Record<string, unknown>): T {
  return body.data as T;
}

describe('GET /api/health', () => {
  it('responds with status ok', async () => {
    const { status, body } = await get('/api/health');

    expect(status).toBe(200);
    expect(body).toEqual({ status: 'ok' });
  });

  it('sets request id and disables caching', async () => {
    const { headers } = await get('/api/health');

    expect(headers.get('x-request-id')).toMatch(/^[0-9a-f-]{36}$/);
    expect(headers.get('cache-control')).toBe('no-store');
    expect(headers.get('x-powered-by')).toBeNull();
  });
});

describe('catalog endpoints', () => {
  it.each([
    ['/api/routes', 5],
    ['/api/stops', 8],
    ['/api/buses', 5],
  ])('%s lists every fixture with its count', async (path, expected) => {
    const { status, body } = await get(path);

    expect(status).toBe(200);
    expect(dataOf<unknown[]>(body)).toHaveLength(expected);
    expect(body.meta).toEqual({ count: expected });
  });

  it('returns a route with named stops', async () => {
    const { status, body } = await get('/api/routes/R12');

    expect(status).toBe(200);
    expect(dataOf(body)).toMatchObject({
      id: 'R12',
      estimatedMinutes: 12,
      stopCount: 3,
      stops: [
        { stopId: 'S01', name: 'Terminal Norte', minutesFromStart: 0 },
        { stopId: 'S02', name: 'Plaza del Mercado', minutesFromStart: 6 },
        { stopId: 'S03', name: 'Centro', minutesFromStart: 12 },
      ],
    });
  });

  it('returns a stop with its associated routes', async () => {
    const { body } = await get('/api/stops/S03');

    expect(dataOf(body)).toMatchObject({ id: 'S03', name: 'Centro', routeIds: ['R12', 'R15', 'R22', 'R30'] });
  });

  it('returns a bus with its route name', async () => {
    const { body } = await get('/api/buses/BUS102');

    expect(dataOf(body)).toMatchObject({ id: 'BUS102', routeId: 'R12', routeName: 'Terminal – Centro' });
  });

  it('accepts lowercase ids', async () => {
    const { status } = await get('/api/routes/r18');

    expect(status).toBe(200);
  });

  it('lists only active alerts, most severe first', async () => {
    const { body } = await get('/api/alerts');
    const alerts = dataOf<{ id: string; level: string }[]>(body);

    expect(alerts.map((alert) => alert.id)).toEqual(['A05', 'A04', 'A02', 'A01']);
  });
});

describe('controlled errors', () => {
  it('responds 404 for a well-formed id that does not exist', async () => {
    const { status, body } = await get('/api/routes/R99');

    expect(status).toBe(404);
    expect(body.error).toMatchObject({ status: 404, code: 'NOT_FOUND', message: 'La ruta R99 no existe.' });
  });

  it('responds 400 for a malformed id', async () => {
    const { status, body } = await get('/api/stops/centro');

    expect(status).toBe(400);
    expect(body.error).toMatchObject({ status: 400, code: 'INVALID_ID' });
  });

  it('responds 404 for an unknown endpoint', async () => {
    const { status, body } = await get('/api/unknown');

    expect(status).toBe(404);
    expect(body.error).toMatchObject({ code: 'ENDPOINT_NOT_FOUND' });
  });

  it('responds 400 for a malformed JSON body without leaking internals', async () => {
    const response = await fetch(`${baseUrl}/api/health`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ invalid',
    });
    const body = (await response.json()) as { error: Record<string, unknown> };

    expect(response.status).toBe(400);
    expect(body.error).toMatchObject({ code: 'INVALID_JSON' });
    expect(JSON.stringify(body)).not.toContain('at ');
  });

  it('includes the request id in error responses', async () => {
    const { headers, body } = await get('/api/buses/BUS999');

    expect((body.error as { requestId: string }).requestId).toBe(headers.get('x-request-id'));
  });

  it('uses the same envelope keys for every error, without internals', async () => {
    const { body } = await get('/api/unknown');

    expect(Object.keys(body)).toEqual(['error']);
    expect(Object.keys(body.error as object).sort()).toEqual(['code', 'message', 'requestId', 'status']);
  });

  it('responds 413 for a body over the size limit instead of a server error', async () => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'x'.repeat(200 * 1024), password: 'x' }),
    });
    const body = (await response.json()) as { error: Record<string, unknown> };

    expect(response.status).toBe(413);
    expect(body.error).toMatchObject({ status: 413, code: 'PAYLOAD_TOO_LARGE' });
  });
});

describe('errorHandler with unexpected failures', () => {
  function fakeResponse() {
    const res = { locals: { requestId: 'req-1' }, statusCode: 0, body: undefined as unknown };
    return Object.assign(res, {
      status(code: number) {
        res.statusCode = code;
        return this;
      },
      json(payload: unknown) {
        res.body = payload;
        return this;
      },
    });
  }

  it('hides the message and stack of an unexpected error behind a generic 500', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const res = fakeResponse();

    errorHandler(new TypeError('Cannot read properties of undefined (reading "secret")'), {} as Request, res as unknown as Response, () => undefined);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      error: { status: 500, code: 'INTERNAL_ERROR', message: 'Ocurrió un error interno. Intenta nuevamente más tarde.', requestId: 'req-1' },
    });
    expect(JSON.stringify(res.body)).not.toMatch(/secret|TypeError|at /);
    expect(consoleSpy).toHaveBeenCalledOnce();
    consoleSpy.mockRestore();
  });

  it('treats thrown non-Error values as internal errors', () => {
    expect(toHttpError('boom')).toMatchObject({ status: 500, code: 'INTERNAL_ERROR' });
    expect(toHttpError({ type: 'entity.parse.failed', status: 400 })).toMatchObject({ status: 500 });
  });
});
