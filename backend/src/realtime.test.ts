import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import type { StopArrivals } from './services/arrivalService.js';
import { getBus, type BusView } from './services/busService.js';
import { simulatedClock } from './services/simulation.js';
import { startTestServer, type TestServer } from './test/httpTestServer.js';

let api: TestServer;

beforeAll(async () => {
  api = await startTestServer(createApp());
});

afterAll(() => api.close());

describe('simulated clock', () => {
  it('starts at 07:30 and advances one minute per tick', () => {
    expect(simulatedClock(0)).toEqual({ tick: 0, timestamp: '2026-03-02T07:30:00-05:00', time: '07:30' });
    expect(simulatedClock(45)).toMatchObject({ time: '08:15' });
  });
});

describe('bus state per tick', () => {
  it('matches the specification example: BUS102, route R12, in service, ETA 5 minutes', () => {
    expect(getBus('BUS102', 0)).toMatchObject({
      routeId: 'R12',
      status: 'IN_SERVICE',
      locationText: 'Entre Plaza del Mercado y Centro',
      nextStopId: 'S03',
      etaMinutes: 5,
      lastUpdateTime: '07:30',
    });
  });

  it('advances one minute per tick and reduces the ETA accordingly', () => {
    const etas = [0, 1, 2, 3].map((tick) => getBus('BUS102', tick).etaMinutes);

    expect(etas).toEqual([5, 4, 3, 2]);
  });

  it('reports "at a stop" when the bus is exactly on its minute', () => {
    // BUS103 starts at minute 4 on R18; S06 is minute 5
    expect(getBus('BUS103', 1)).toMatchObject({ locationText: 'En Avenida Las Palmas', nextStopId: 'S07', etaMinutes: 6 });
  });

  it('loops: after the last stop the bus waits at the first stop and the ETA includes the wait', () => {
    // R12 cycle = 12 min + 3 layover = 15; BUS102 phase at tick 5 = (3 + 7 + 5) % 15 = 0
    expect(getBus('BUS102', 5)).toMatchObject({
      status: 'AT_TERMINAL',
      locationText: 'En terminal Terminal Norte',
      nextStopId: 'S02',
      etaMinutes: 9, // 3 waiting + 6 travelling
    });
  });

  it('keeps a bus that starts at the terminal waiting, then departs after the layover', () => {
    expect(getBus('BUS104', 0)).toMatchObject({ status: 'AT_TERMINAL', etaMinutes: 12 });
    expect(getBus('BUS104', 3)).toMatchObject({ status: 'IN_SERVICE', locationText: 'En Centro', etaMinutes: 9 });
  });

  it('never positions an out-of-service bus', () => {
    expect(getBus('BUS105', 10)).toMatchObject({ status: 'OUT_OF_SERVICE', position: null, etaMinutes: null });
  });

  it('is deterministic: the same tick always returns the same state', () => {
    expect(getBus('BUS101', 37)).toEqual(getBus('BUS101', 37));
  });
});

describe('GET /api/buses?tick', () => {
  it('defaults to tick 0 and accepts a tick', async () => {
    const initial = await api.request('GET', '/api/buses');
    const later = await api.request('GET', '/api/buses?tick=3');
    const bus = (response: typeof initial) => (response.body.data as BusView[]).find((item) => item.id === 'BUS102');

    expect(bus(initial)).toMatchObject({ tick: 0, etaMinutes: 5 });
    expect(bus(later)).toMatchObject({ tick: 3, etaMinutes: 2, lastUpdateTime: '07:33' });
  });

  it.each(['-1', '1.5', 'abc', '1441'])('rejects tick=%s', async (tick) => {
    const { status, body } = await api.request('GET', `/api/buses?tick=${tick}`);

    expect(status).toBe(400);
    expect(body.error).toMatchObject({ details: [{ field: 'tick' }] });
  });
});

describe('GET /api/arrivals', () => {
  it('lists upcoming buses at a stop, soonest first', async () => {
    const { status, body } = await api.request('GET', '/api/arrivals?stop=S03&tick=0');
    const data = body.data as StopArrivals;

    expect(status).toBe(200);
    expect(data).toMatchObject({ stopId: 'S03', stopName: 'Centro', served: true });
    expect(data.arrivals.map((arrival) => [arrival.busId, arrival.routeId, arrival.etaMinutes])).toEqual([
      ['BUS104', 'R22', 3],
      ['BUS102', 'R12', 5],
      ['BUS101', 'R12', 10],
    ]);
  });

  it('returns no arrivals for a stop under maintenance', async () => {
    const { body } = await api.request('GET', '/api/arrivals?stop=S08');

    expect(body.data).toMatchObject({ served: false, arrivals: [] });
  });

  it('validates the stop', async () => {
    const missing = await api.request('GET', '/api/arrivals');
    const unknown = await api.request('GET', '/api/arrivals?stop=S99');

    expect([missing.status, unknown.status]).toEqual([400, 404]);
  });
});
