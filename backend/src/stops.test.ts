import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import type { NearbyStopsResult } from './services/placeService.js';
import type { StopDetail, StopView } from './services/stopService.js';
import { startTestServer, type TestServer } from './test/httpTestServer.js';

let api: TestServer;

beforeAll(async () => {
  api = await startTestServer(createApp());
});

afterAll(() => api.close());

async function stopIds(query: string): Promise<string[]> {
  const { body } = await api.request('GET', `/api/stops${query}`);
  return (body.data as StopView[]).map((stop) => stop.id);
}

describe('GET /api/stops filters', () => {
  it('searches by name ignoring case and accents', async () => {
    expect(await stopIds('?q=BIBLIOTECA%20publica')).toEqual(['S07']);
  });

  it('searches by id, address and zone', async () => {
    expect(await stopIds('?q=s05')).toEqual(['S05']);
    expect(await stopIds('?q=carrera')).toEqual(['S03', 'S07']);
    expect(await stopIds('?q=oriente')).toEqual(['S05', 'S08']);
  });

  it('filters by status', async () => {
    expect(await stopIds('?status=MAINTENANCE')).toEqual(['S08']);
  });

  it('returns an empty list when nothing matches', async () => {
    const { status, body } = await api.request('GET', '/api/stops?q=aeropuerto');

    expect(status).toBe(200);
    expect(body).toEqual({ data: [], meta: { count: 0 } });
  });

  it('rejects an unknown status and a too long query', async () => {
    const invalidStatus = await api.request('GET', '/api/stops?status=OPEN');
    const longQuery = await api.request('GET', `/api/stops?q=${'a'.repeat(51)}`);

    expect(invalidStatus.status).toBe(400);
    expect(invalidStatus.body.error).toMatchObject({ details: [{ field: 'status' }] });
    expect(longQuery.status).toBe(400);
  });
});

describe('GET /api/stops/:id detail', () => {
  it('includes associated routes and nearby places', async () => {
    const { body } = await api.request('GET', '/api/stops/S03');
    const stop = body.data as StopDetail;

    expect(stop.routes).toEqual([
      { id: 'R12', name: 'Terminal – Centro', status: 'ACTIVE', active: true, nextDestinationStopId: null },
      { id: 'R15', name: 'Expreso Terminal – Centro', status: 'ACTIVE', active: true, nextDestinationStopId: null },
      { id: 'R22', name: 'Centro – Hospital', status: 'ACTIVE', active: true, nextDestinationStopId: 'S05' },
      { id: 'R30', name: 'Circular Nocturna', status: 'SUSPENDED', active: false, nextDestinationStopId: 'S08' },
    ]);
    expect(stop.places).toEqual([{ id: 'P02', name: 'Museo de la Ciudad', category: 'CULTURE' }]);
  });
});

describe('GET /api/stops/nearby', () => {
  it('returns the three closest stops to a simulated location', async () => {
    const { status, body } = await api.request('GET', '/api/stops/nearby?place=P02');
    const result = body.data as NearbyStopsResult;

    expect(status).toBe(200);
    expect(result.place.id).toBe('P02');
    expect(result.stops).toEqual([
      { stopId: 'S03', name: 'Centro', status: 'ACTIVE', accessible: true, distanceMeters: 430, walkingMinutes: 6 },
      { stopId: 'S08', name: 'Estadio Municipal', status: 'MAINTENANCE', accessible: false, distanceMeters: 990, walkingMinutes: 13 },
      // S02 (1236.9 m) and S07 (1242.0 m) both round to 1240 m: ties are broken by id.
      { stopId: 'S02', name: 'Plaza del Mercado', status: 'ACTIVE', accessible: true, distanceMeters: 1240, walkingMinutes: 16 },
    ]);
  });

  it('validates the location', async () => {
    const missing = await api.request('GET', '/api/stops/nearby');
    const malformed = await api.request('GET', '/api/stops/nearby?place=casa');
    const unknown = await api.request('GET', '/api/stops/nearby?place=P99');

    expect([missing.status, malformed.status, unknown.status]).toEqual([400, 400, 404]);
  });
});

describe('GET /api/places', () => {
  it('lists the simulated locations', async () => {
    const { body } = await api.request('GET', '/api/places');

    expect(body.meta).toEqual({ count: 5 });
  });
});
