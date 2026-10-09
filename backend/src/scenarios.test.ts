import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import { findIntegrityProblems } from './data/integrity.js';
import type { Fixtures } from './data/schemas.js';
import { datasetFor } from './scenario/datasets.js';
import type { ScenarioId } from './scenario/scenarios.js';
import { startTestServer, type TestServer } from './test/httpTestServer.js';

let api: TestServer;
let token: string;

beforeAll(async () => {
  api = await startTestServer(createApp());
  const { body } = await api.request('POST', '/api/auth/login', { body: { username: 'pasajero.demo', password: 'Pasajero2026!' } });
  token = (body.data as { token: string }).token;
});

afterAll(() => api.close());

function get(path: string, scenario: ScenarioId, options: { token?: string; delay?: number } = {}) {
  const headers: Record<string, string> = { 'X-Scenario': scenario };
  if (options.delay !== undefined) headers['X-Response-Delay'] = String(options.delay);
  return api.request('GET', path, { headers, ...(options.token && { token: options.token }) });
}

const data = <T>(response: { body: Record<string, unknown> }) => response.body.data as T;

describe('scenario endpoints', () => {
  it('reports NORMAL when the browser sends no scenario', async () => {
    const { status, body } = await api.request('GET', '/api/scenario');

    expect(status).toBe(200);
    expect(body.data).toMatchObject({
      scenario: 'NORMAL',
      responseDelay: 0,
      serviceAvailability: 'AVAILABLE',
      routeDataConsistency: 'CONSISTENT',
      sessionState: 'VALID',
    });
    expect((body.data as { available: unknown[] }).available).toHaveLength(12);
  });

  it('reflects the configuration received in the headers', async () => {
    const { body } = await get('/api/scenario', 'SLOW_RESPONSE', { delay: 1000 });

    expect(body.data).toMatchObject({ scenario: 'SLOW_RESPONSE', label: 'RESPUESTA LENTA', responseDelay: 1000 });
  });

  it('is never affected by the active scenario (the way back must always work)', async () => {
    for (const scenario of ['SERVER_ERROR', 'SERVICE_UNAVAILABLE', 'UNAUTHORIZED', 'INVALID_DATA'] as const) {
      expect((await get('/api/scenario', scenario)).status).toBe(200);
    }
  });

  it('validates a scenario with POST', async () => {
    const valid = await api.request('POST', '/api/scenario', { body: { scenario: 'SLOW_RESPONSE', responseDelay: 5000 } });
    const invalid = await api.request('POST', '/api/scenario', { body: { scenario: 'CHAOS', responseDelay: 99999 } });

    expect(valid.body.data).toMatchObject({ scenario: 'SLOW_RESPONSE', responseDelay: 5000 });
    expect(invalid.status).toBe(400);
    expect((invalid.body.error as { details: { field: string }[] }).details.map((detail) => detail.field)).toEqual(['scenario', 'responseDelay']);
  });

  it('rejects malformed scenario headers', async () => {
    const badScenario = await api.request('GET', '/api/routes', { headers: { 'X-Scenario': 'CHAOS' } });
    const badDelay = await api.request('GET', '/api/routes', { headers: { 'X-Scenario': 'SLOW_RESPONSE', 'X-Response-Delay': '9000' } });

    expect([badScenario.status, badDelay.status]).toEqual([400, 400]);
    expect(badScenario.body.error).toMatchObject({ code: 'INVALID_SCENARIO' });
  });
});

describe('forced failures', () => {
  it.each([
    ['SERVER_ERROR', 500, 'INTERNAL_ERROR'],
    ['SERVICE_UNAVAILABLE', 503, 'SERVICE_UNAVAILABLE'],
    ['INVALID_DATA', 400, 'INVALID_DATA'],
    ['UNAUTHORIZED', 401, 'UNAUTHORIZED'],
  ] as const)('%s → %i %s on data endpoints', async (scenario, status, code) => {
    const response = await get('/api/routes', scenario);

    expect(response.status).toBe(status);
    expect(response.body.error).toMatchObject({ code });
    expect(response.headers.get('x-scenario-applied')).toBe(scenario);
  });

  it('SERVICE_UNAVAILABLE also fails the health check and suggests a retry time', async () => {
    const response = await get('/api/health', 'SERVICE_UNAVAILABLE');

    expect(response.status).toBe(503);
    expect(response.headers.get('retry-after')).toBe('30');
  });

  it('SERVER_ERROR keeps the health check up (the process is alive) but breaks login', async () => {
    const health = await get('/api/health', 'SERVER_ERROR');
    const login = await api.request('POST', '/api/auth/login', {
      headers: { 'X-Scenario': 'SERVER_ERROR' },
      body: { username: 'pasajero.demo', password: 'Pasajero2026!' },
    });

    expect(health.status).toBe(200);
    expect(login.status).toBe(500);
  });

  it('SESSION_EXPIRED rejects only requests that carry a session', async () => {
    const withSession = await get('/api/routes', 'SESSION_EXPIRED', { token });
    const anonymous = await get('/api/routes', 'SESSION_EXPIRED');

    expect(withSession.status).toBe(401);
    expect(withSession.body.error).toMatchObject({ code: 'SESSION_EXPIRED' });
    expect(anonymous.status).toBe(200);
  });

  it('logout always works', async () => {
    for (const scenario of ['SERVER_ERROR', 'SERVICE_UNAVAILABLE', 'SESSION_EXPIRED'] as const) {
      const response = await api.request('POST', '/api/auth/logout', { headers: { 'X-Scenario': scenario }, token });
      expect(response.status).toBe(200);
    }
  });
});

describe('SLOW_RESPONSE', () => {
  it('delays the response by the configured time', async () => {
    const start = performance.now();
    const response = await get('/api/health', 'SLOW_RESPONSE', { delay: 300 });
    const elapsed = performance.now() - start;

    expect(response.status).toBe(200);
    expect(elapsed).toBeGreaterThanOrEqual(290);
  });

  it('ignores the delay header in other scenarios', async () => {
    const start = performance.now();
    await get('/api/health', 'NORMAL', { delay: 2000 });

    expect(performance.now() - start).toBeLessThan(1000);
  });
});

describe('data scenarios', () => {
  it('NO_RESULTS empties searches but keeps full catalogs', async () => {
    const search = await get('/api/routes?origin=S01&destination=S03', 'NO_RESULTS');
    const plan = await get('/api/plan?origin=S01&destination=S05', 'NO_RESULTS');
    const filteredStops = await get('/api/stops?q=centro', 'NO_RESULTS');
    const nearby = await get('/api/stops/nearby?place=P02', 'NO_RESULTS');
    const arrivals = await get('/api/arrivals?stop=S03', 'NO_RESULTS');
    const catalog = await get('/api/stops', 'NO_RESULTS');

    expect(data<unknown[]>(search)).toEqual([]);
    expect(data<{ options: unknown[] }>(plan).options).toEqual([]);
    expect(data<unknown[]>(filteredStops)).toEqual([]);
    expect(data<{ stops: unknown[] }>(nearby).stops).toEqual([]);
    expect(data<{ arrivals: unknown[] }>(arrivals).arrivals).toEqual([]);
    expect(data<unknown[]>(catalog)).toHaveLength(8);
  });

  it('EMPTY_DATA empties every collection but login still works', async () => {
    for (const path of ['/api/routes', '/api/stops', '/api/buses', '/api/alerts', '/api/places']) {
      expect(data<unknown[]>(await get(path, 'EMPTY_DATA'))).toEqual([]);
    }
    const login = await api.request('POST', '/api/auth/login', {
      headers: { 'X-Scenario': 'EMPTY_DATA' },
      body: { username: 'pasajero.demo', password: 'Pasajero2026!' },
    });
    expect(login.status).toBe(200);
    expect((await get('/api/routes/R12', 'EMPTY_DATA')).status).toBe(404);
  });

  it('BUS_DELAYED adds the real 8-minute delay to R12 and publishes alert A03', async () => {
    const bus = await get('/api/buses/BUS102', 'BUS_DELAYED');
    const route = await get('/api/routes/R12', 'BUS_DELAYED');
    const alerts = await get('/api/alerts', 'BUS_DELAYED');

    expect(data(bus)).toMatchObject({ delayMinutes: 8, etaMinutes: 13 }); // 5 + 8
    expect(data(route)).toMatchObject({ status: 'DELAYED' });
    expect(data<{ id: string }[]>(alerts).map((alert) => alert.id)).toContain('A03');
  });

  it('ROUTE_CHANGED detours R12 and every screen agrees', async () => {
    const route = await get('/api/routes/R12', 'ROUTE_CHANGED');
    const direct = await get('/api/routes?origin=S02&destination=S03', 'ROUTE_CHANGED');
    const alerts = await get('/api/alerts?route=R12', 'ROUTE_CHANGED');

    expect(data<{ stops: { stopId: string }[] }>(route).stops.map((stop) => stop.stopId)).toEqual(['S01', 'S06', 'S03']);
    expect(data(route)).toMatchObject({ status: 'CHANGED', estimatedMinutes: 15 });
    expect(data<unknown[]>(direct)).toEqual([]); // Plaza del Mercado is no longer served
    expect(data<{ id: string }[]>(alerts).map((alert) => alert.id)).toEqual(['A07']);
  });

  it('INCONSISTENT_DATA shows contradictions between screens', async () => {
    const catalog = await get('/api/routes/R18', 'INCONSISTENT_DATA');
    const search = await get('/api/routes?origin=S01&destination=S04', 'INCONSISTENT_DATA');

    expect(data<{ estimatedMinutes: number }>(catalog).estimatedMinutes).toBe(12);
    expect(data<{ estimatedMinutes: number }[]>(search)[0]?.estimatedMinutes).toBe(18);
  });

  it('does not leak between concurrent requests with different scenarios', async () => {
    const [slow, normal] = await Promise.all([get('/api/buses/BUS102', 'BUS_DELAYED'), get('/api/buses/BUS102', 'NORMAL')]);

    expect(data<{ etaMinutes: number }>(slow).etaMinutes).toBe(13);
    expect(data<{ etaMinutes: number }>(normal).etaMinutes).toBe(5);
  });
});

describe('scenario datasets', () => {
  it.each(['ROUTE_CHANGED', 'BUS_DELAYED', 'EMPTY_DATA'] as const)('%s passes the integrity rules', (scenario) => {
    expect(findIntegrityProblems(datasetFor(scenario) as Fixtures)).toEqual([]);
  });

  it('INCONSISTENT_DATA breaks them on purpose', () => {
    expect(findIntegrityProblems(datasetFor('INCONSISTENT_DATA') as Fixtures)).toEqual(
      expect.arrayContaining([
        'R18: estimatedMinutes must match the last stop time',
        'A08: active delay alert but route R22 is not DELAYED',
      ]),
    );
  });
});
