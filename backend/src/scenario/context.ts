import { AsyncLocalStorage } from 'node:async_hooks';
import { fixtures } from '../data/fixtures.js';
import type { Fixtures } from '../data/schemas.js';
import { datasetFor } from './datasets.js';
import type { ScenarioId } from './scenarios.js';

interface ScenarioContext {
  scenario: ScenarioId;
  data: Readonly<Fixtures>;
}

/** Per-request scenario, so services stay unaware of how the scenario was chosen. */
const storage = new AsyncLocalStorage<ScenarioContext>();

export function runWithScenario<T>(scenario: ScenarioId, callback: () => T): T {
  return storage.run({ scenario, data: datasetFor(scenario) }, callback);
}

/** Data for the current request (original fixtures outside a request, e.g. in unit tests). */
export function data(): Readonly<Fixtures> {
  return storage.getStore()?.data ?? fixtures;
}

export function currentScenario(): ScenarioId {
  return storage.getStore()?.scenario ?? 'NORMAL';
}

/** NO_RESULTS: search/filter endpoints return nothing while full catalogs stay available. */
export function isNoResults(): boolean {
  return currentScenario() === 'NO_RESULTS';
}
