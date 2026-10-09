import { describe, expect, it } from 'vitest';
import { FixtureValidationError, fixtures, parseFixtures, rawFixtures } from './fixtures.js';
import type { Fixtures } from './schemas.js';

function cloneFixtures(): Fixtures {
  return structuredClone(fixtures) as Fixtures;
}

function problemsOf(input: unknown): string[] {
  try {
    parseFixtures(input);
    return [];
  } catch (error) {
    if (error instanceof FixtureValidationError) return error.problems;
    throw error;
  }
}

describe('fixtures', () => {
  it('are valid and consistent', () => {
    expect(problemsOf(rawFixtures)).toEqual([]);
  });

  it('contain the entities required by the laboratory', () => {
    const ids = (items: { id: string }[]) => items.map((item) => item.id);

    expect(ids(fixtures.routes)).toEqual(expect.arrayContaining(['R12', 'R18', 'R22']));
    expect(ids(fixtures.stops)).toEqual(expect.arrayContaining(['S01', 'S02', 'S03', 'S04', 'S05']));
    expect(ids(fixtures.buses)).toEqual(expect.arrayContaining(['BUS101', 'BUS102', 'BUS103']));
    expect(new Set(fixtures.users.map((user) => user.role))).toEqual(new Set(['PASSENGER', 'ADMIN']));
    expect(new Set(fixtures.alerts.map((alert) => alert.level))).toEqual(new Set(['NORMAL', 'INFO', 'WARNING', 'CRITICAL']));
    expect(new Set(fixtures.alerts.map((alert) => alert.type))).toEqual(
      new Set(['DELAY', 'ROUTE_CHANGE', 'INTERRUPTION', 'INFORMATION']),
    );
  });

  it('keep the reference examples from the specification', () => {
    const route = (id: string) => fixtures.routes.find((candidate) => candidate.id === id);

    expect(route('R12')).toMatchObject({ originStopId: 'S01', destinationStopId: 'S03', estimatedMinutes: 12 });
    expect(route('R18')).toMatchObject({ originStopId: 'S01', destinationStopId: 'S04', estimatedMinutes: 18 });
    expect(route('R22')).toMatchObject({ originStopId: 'S03', destinationStopId: 'S05', estimatedMinutes: 25 });
    expect(fixtures.buses.find((bus) => bus.id === 'BUS102')?.routeId).toBe('R12');
  });

  it('allow transfers between active routes (needed by the planner)', () => {
    const activeRoutes = fixtures.routes.filter((route) => route.active);
    const stopUsage = new Map<string, number>();
    for (const route of activeRoutes) {
      for (const { stopId } of route.stops) stopUsage.set(stopId, (stopUsage.get(stopId) ?? 0) + 1);
    }

    expect(stopUsage.get('S03')).toBeGreaterThanOrEqual(2);
    expect(stopUsage.get('S07')).toBeGreaterThanOrEqual(2);
  });

  it('are deeply frozen', () => {
    expect(Object.isFrozen(fixtures.routes[0]?.stops[0])).toBe(true);
  });
});

describe('fixture validation', () => {
  it('rejects a route that references an unknown stop', () => {
    const data = cloneFixtures();
    data.routes[0]!.stops[1]!.stopId = 'S99';

    expect(problemsOf(data)).toContain('R12: unknown stop S99');
  });

  it('rejects duplicated ids', () => {
    const data = cloneFixtures();
    data.stops.push({ ...data.stops[0]! });

    expect(problemsOf(data)).toContain('stops: duplicated id S01');
  });

  it('rejects travel times that do not increase', () => {
    const data = cloneFixtures();
    data.routes[0]!.stops[1]!.minutesFromStart = 20;

    expect(problemsOf(data)).toContain('R12: minutesFromStart must increase (S02 -> S03)');
  });

  it('rejects an active delay alert on a route that is not delayed', () => {
    const data = cloneFixtures();
    data.alerts.find((alert) => alert.id === 'A03')!.active = true;

    expect(problemsOf(data)).toContain('A03: active delay alert but route R12 is not DELAYED');
  });

  it('rejects records with an invalid shape', () => {
    const data = cloneFixtures() as unknown as { users: { email: string }[] };
    data.users[0]!.email = 'real.person@gmail.com';

    expect(problemsOf(data)).toContain('users.0.email: Demo emails must use @mi-ruta.demo');
  });
});
