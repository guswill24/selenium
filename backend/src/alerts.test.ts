import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import type { AlertView } from './services/alertService.js';
import { startTestServer, type TestServer } from './test/httpTestServer.js';

let api: TestServer;

beforeAll(async () => {
  api = await startTestServer(createApp());
});

afterAll(() => api.close());

async function alertIds(query: string): Promise<string[]> {
  const { body } = await api.request('GET', `/api/alerts${query}`);
  return (body.data as AlertView[]).map((alert) => alert.id);
}

describe('GET /api/alerts', () => {
  it('shows one active alert per level in the NORMAL data set, most severe first', async () => {
    const { body } = await api.request('GET', '/api/alerts');
    const alerts = body.data as AlertView[];

    expect(alerts.map((alert) => [alert.id, alert.level])).toEqual([
      ['A05', 'CRITICAL'],
      ['A04', 'WARNING'],
      ['A02', 'INFO'],
      ['A01', 'NORMAL'],
    ]);
  });

  it('includes the route name', async () => {
    const { body } = await api.request('GET', '/api/alerts?route=R22');

    expect(body.data).toEqual([expect.objectContaining({ id: 'A04', routeId: 'R22', routeName: 'Centro – Hospital' })]);
  });

  it('filters by level, type and route', async () => {
    expect(await alertIds('?level=CRITICAL')).toEqual(['A05']);
    expect(await alertIds('?type=INFORMATION')).toEqual(['A02', 'A01']);
    expect(await alertIds('?type=ROUTE_CHANGE&route=r22')).toEqual(['A04']);
    expect(await alertIds('?level=INFO&type=INTERRUPTION')).toEqual([]);
  });

  it('never lists inactive alerts', async () => {
    const ids = await alertIds('');

    expect(ids).not.toContain('A03');
    expect(ids).not.toContain('A06');
  });

  it('rejects unknown filter values', async () => {
    const { status, body } = await api.request('GET', '/api/alerts?level=URGENT&route=12');

    expect(status).toBe(400);
    expect((body.error as { details: { field: string }[] }).details.map((detail) => detail.field)).toEqual(['level', 'route']);
  });
});

describe('GET /api/alerts/:id', () => {
  it('returns inactive alerts too, flagged as such', async () => {
    const { status, body } = await api.request('GET', '/api/alerts/A06');

    expect(status).toBe(200);
    expect(body.data).toMatchObject({ id: 'A06', active: false, routeName: 'Terminal – Universidad' });
  });

  it('distinguishes malformed and unknown ids', async () => {
    expect((await api.request('GET', '/api/alerts/X1')).status).toBe(400);
    expect((await api.request('GET', '/api/alerts/A99')).status).toBe(404);
  });
});
