import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import { planTrip, type TripPlan } from './services/plannerService.js';
import { startTestServer, type TestServer } from './test/httpTestServer.js';

let api: TestServer;

beforeAll(async () => {
  api = await startTestServer(createApp());
});

afterAll(() => api.close());

function summary(plan: TripPlan) {
  return plan.options.map((option) => ({
    id: option.id,
    totalMinutes: option.totalMinutes,
    totalStops: option.totalStops,
    transfers: option.transfers,
    via: option.transferStops.map((stop) => stop.stopId),
  }));
}

describe('planTrip', () => {
  it('recommends the fastest itinerary even when it is not the obvious one', () => {
    const plan = planTrip('S01', 'S05');

    // R18 S01→S07 (11) + R22 S07→S05 (16) + 1 transfer wait (5) = 32
    expect(summary(plan)).toEqual([
      { id: 'R18-R22', totalMinutes: 32, totalStops: 5, transfers: 1, via: ['S07'] },
      { id: 'R15-R22', totalMinutes: 39, totalStops: 5, transfers: 1, via: ['S03'] },
      { id: 'R12-R22', totalMinutes: 42, totalStops: 6, transfers: 1, via: ['S03'] },
    ]);
    expect(plan.options.map((option) => option.recommended)).toEqual([true, false, false]);
  });

  it('splits total time into travel and simulated waiting', () => {
    const [recommended] = planTrip('S01', 'S05').options;

    expect(recommended).toMatchObject({ travelMinutes: 27, waitingMinutes: 5, totalMinutes: 32 });
    expect(recommended?.legs.map((leg) => [leg.routeId, leg.fromStopId, leg.toStopId, leg.minutes])).toEqual([
      ['R18', 'S01', 'S07', 11],
      ['R22', 'S07', 'S05', 16],
    ]);
  });

  it('returns direct options tagged as such', () => {
    const plan = planTrip('S01', 'S03');

    expect(plan.options.map((option) => [option.id, option.totalMinutes, option.tags])).toEqual([
      ['R15', 9, ['DIRECT', 'FASTEST']],
      ['R12', 12, ['DIRECT']],
    ]);
  });

  it('supports up to two transfers', () => {
    expect(summary(planTrip('S02', 'S04'))).toEqual([
      { id: 'R12-R22-R18', totalMinutes: 32, totalStops: 4, transfers: 2, via: ['S03', 'S07'] },
    ]);
  });

  it.each([
    ['against the direction of every route', 'S03', 'S01'],
    ['to a stop under maintenance', 'S01', 'S08'],
    ['from the last stop of the network', 'S05', 'S01'],
  ])('returns no options %s', (_case, origin, destination) => {
    expect(planTrip(origin, destination).options).toEqual([]);
  });

  it('never reuses a route or revisits a stop', () => {
    for (const option of planTrip('S01', 'S05').options) {
      const routes = option.legs.map((leg) => leg.routeId);
      const stops = option.legs.flatMap((leg, index) => (index === 0 ? leg.stops : leg.stops.slice(1))).map((stop) => stop.stopId);
      expect(new Set(routes).size).toBe(routes.length);
      expect(new Set(stops).size).toBe(stops.length);
    }
  });
});

describe('GET /api/plan', () => {
  it('returns the plan with named endpoints', async () => {
    const { status, body } = await api.request('GET', '/api/plan?origin=s01&destination=s05');
    const plan = body.data as TripPlan;

    expect(status).toBe(200);
    expect(plan.origin).toEqual({ stopId: 'S01', name: 'Terminal Norte' });
    expect(plan.destination).toEqual({ stopId: 'S05', name: 'Hospital Central' });
    expect(plan.transferWaitMinutes).toBe(5);
    expect(plan.options[0]?.id).toBe('R18-R22');
  });

  it('validates parameters like the route search', async () => {
    const same = await api.request('GET', '/api/plan?origin=S01&destination=S01');
    const missing = await api.request('GET', '/api/plan?origin=S01');
    const unknown = await api.request('GET', '/api/plan?origin=S01&destination=S99');

    expect([same.status, missing.status, unknown.status]).toEqual([400, 400, 404]);
  });
});
