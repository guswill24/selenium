import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import type { RouteSearchResult } from './services/routeSearchService.js';
import { startTestServer, type TestServer } from './test/httpTestServer.js';

let api: TestServer;

beforeAll(async () => {
  api = await startTestServer(createApp());
});

afterAll(() => api.close());

async function search(query: string) {
  const response = await api.request('GET', `/api/routes?${query}`);
  return { ...response, results: response.body.data as RouteSearchResult[] };
}

describe('GET /api/routes?origin&destination', () => {
  it('returns every direct alternative, fastest first', async () => {
    const { status, results, body } = await search('origin=S01&destination=S03');

    expect(status).toBe(200);
    expect(body.meta).toEqual({ count: 2 });
    expect(results.map((result) => [result.routeId, result.estimatedMinutes, result.stopCount])).toEqual([
      ['R15', 9, 2],
      ['R12', 12, 3],
    ]);
  });

  it('computes time and stops for a partial segment of a route', async () => {
    const { results } = await search('origin=S07&destination=S05');

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      routeId: 'R22',
      originName: 'Biblioteca Pública',
      destinationName: 'Hospital Central',
      estimatedMinutes: 16,
      stopCount: 3,
    });
    expect(results[0]?.stops.map((stop) => stop.stopId)).toEqual(['S07', 'S08', 'S05']);
  });

  it('returns no results when no route goes in that direction', async () => {
    const { status, results } = await search('origin=S03&destination=S01');

    expect(status).toBe(200);
    expect(results).toEqual([]);
  });

  it('ignores inactive routes', async () => {
    const { results } = await search('origin=S02&destination=S03');

    expect(results.map((result) => result.routeId)).toEqual(['R12']);
  });

  it('returns no results for a stop under maintenance', async () => {
    const { results } = await search('origin=S03&destination=S08');

    expect(results).toEqual([]);
  });

  it('accepts lowercase ids', async () => {
    const { results } = await search('origin=s01&destination=s04');

    expect(results.map((result) => result.routeId)).toEqual(['R18']);
  });

  it('rejects missing and malformed parameters with field details', async () => {
    const { status, body } = await search('origin=&destination=centro');

    expect(status).toBe(400);
    expect(body.error).toMatchObject({
      code: 'VALIDATION_ERROR',
      details: [
        { field: 'origin', message: 'Selecciona un paradero de origen.' },
        { field: 'destination', message: 'El destino no es un paradero válido.' },
      ],
    });
  });

  it('rejects the same origin and destination', async () => {
    const { status, body } = await search('origin=S01&destination=S01');

    expect(status).toBe(400);
    expect(body.error).toMatchObject({ details: [{ field: 'destination' }] });
  });

  it('responds 404 for a stop that does not exist', async () => {
    const { status, body } = await search('origin=S01&destination=S99');

    expect(status).toBe(404);
    expect(body.error).toMatchObject({ code: 'NOT_FOUND', message: 'El paradero S99 no existe.' });
  });
});
