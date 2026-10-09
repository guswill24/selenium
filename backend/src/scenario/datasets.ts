import { deepFreeze, fixtures, parseFixtures } from '../data/fixtures.js';
import type { Fixtures } from '../data/schemas.js';
import type { ScenarioId } from './scenarios.js';

function cloneFixtures(): Fixtures {
  return structuredClone(fixtures) as Fixtures;
}

function mustFind<T extends { id: string }>(items: T[], id: string): T {
  const item = items.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`Scenario dataset: ${id} not found`);
  return item;
}

/** R12 detours through Avenida Las Palmas and skips Plaza del Mercado. */
function routeChanged(): Fixtures {
  const data = cloneFixtures();
  const r12 = mustFind(data.routes, 'R12');
  r12.status = 'CHANGED';
  r12.stops = [
    { stopId: 'S01', minutesFromStart: 0 },
    { stopId: 'S06', minutesFromStart: 5 },
    { stopId: 'S03', minutesFromStart: 15 },
  ];
  r12.estimatedMinutes = 15;
  data.alerts.push({
    id: 'A07',
    level: 'WARNING',
    type: 'ROUTE_CHANGE',
    routeId: 'R12',
    title: 'Desvío en ruta R12',
    message: 'La ruta R12 se desvía por Avenida Las Palmas y no se detiene en Plaza del Mercado.',
    active: true,
    publishedAt: '2026-03-02T07:20:00-05:00',
  });
  return data;
}

/** R12 buses run 8 minutes late; the matching alert A03 is published. */
function busDelayed(): Fixtures {
  const data = cloneFixtures();
  mustFind(data.routes, 'R12').status = 'DELAYED';
  for (const bus of data.buses.filter((candidate) => candidate.routeId === 'R12')) bus.delayMinutes = 8;
  mustFind(data.alerts, 'A03').active = true;
  return data;
}

/** Everything empty except the demo accounts (login keeps working). */
function emptyData(): Fixtures {
  const data = cloneFixtures();
  return { ...data, stops: [], routes: [], buses: [], alerts: [], schedules: [], history: [], pointsOfInterest: [] };
}

/**
 * Deliberate contradictions between screens. This dataset is NOT validated:
 * the whole point is that it breaks the integrity rules.
 */
function inconsistentData(): Fixtures {
  const data = cloneFixtures();
  // Route catalog says 12 minutes, but its own stop sequence (and every search) says 18.
  mustFind(data.routes, 'R18').estimatedMinutes = 12;
  // A negative delay produces an impossible ETA in real time.
  mustFind(data.buses, 'BUS103').delayMinutes = -4;
  // A delay alert for a route whose status and buses report no delay.
  data.alerts.push({
    id: 'A08',
    level: 'WARNING',
    type: 'DELAY',
    routeId: 'R22',
    title: 'Retraso en ruta R22',
    message: 'Ruta R22 presenta retraso de 15 minutos.',
    active: true,
    publishedAt: '2026-03-02T07:50:00-05:00',
  });
  return data;
}

const builders: Partial<Record<ScenarioId, { build: () => Fixtures; validate: boolean }>> = {
  ROUTE_CHANGED: { build: routeChanged, validate: true },
  BUS_DELAYED: { build: busDelayed, validate: true },
  EMPTY_DATA: { build: emptyData, validate: true },
  INCONSISTENT_DATA: { build: inconsistentData, validate: false },
};

const cache = new Map<ScenarioId, Readonly<Fixtures>>();

/** Dataset served for a scenario. Scenarios without their own data use the original fixtures. */
export function datasetFor(scenario: ScenarioId): Readonly<Fixtures> {
  const builder = builders[scenario];
  if (!builder) return fixtures;

  let dataset = cache.get(scenario);
  if (!dataset) {
    const built = builder.build();
    dataset = deepFreeze(builder.validate ? parseFixtures(built) : built);
    cache.set(scenario, dataset);
  }
  return dataset;
}

/** Builds every dataset once, so a broken scenario fails at startup instead of on a request. */
export function preloadDatasets(): void {
  for (const scenario of Object.keys(builders) as ScenarioId[]) datasetFor(scenario);
}
