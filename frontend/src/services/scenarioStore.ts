import { DEFAULT_DELAY_MS, DELAY_OPTIONS_MS, isScenarioId, type ScenarioId, type ScenarioSelection } from '../types/scenario.ts';
import { readJson, writeJson } from '../utils/storage.ts';
import { setScenarioHeaders } from './apiClient.ts';

const STORAGE_KEY = 'mi-ruta:scenario';

function normalizeDelay(value: unknown): number {
  const delay = Number(value);
  return (DELAY_OPTIONS_MS as readonly number[]).includes(delay) ? delay : DEFAULT_DELAY_MS;
}

/**
 * Must run BEFORE the router is created: the router reads the address bar once at creation.
 * Priority: `?scenario=…&delay=…` in the URL (then removed from the address bar),
 * then the value stored in this browser, then NORMAL.
 */
export function initScenario(): ScenarioSelection {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get('scenario')?.toUpperCase();

  let selection: ScenarioSelection;
  if (isScenarioId(fromUrl)) {
    selection = { scenario: fromUrl, responseDelay: normalizeDelay(params.get('delay')) };
    writeJson(STORAGE_KEY, selection);
    params.delete('scenario');
    params.delete('delay');
    const query = params.toString();
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);
  } else {
    const stored = readJson<ScenarioSelection>(STORAGE_KEY);
    selection = isScenarioId(stored?.scenario)
      ? { scenario: stored.scenario, responseDelay: normalizeDelay(stored.responseDelay) }
      : { scenario: 'NORMAL', responseDelay: DEFAULT_DELAY_MS };
  }

  setScenarioHeaders(selection.scenario, selection.responseDelay);
  return selection;
}

export function saveScenario(scenario: ScenarioId, responseDelay?: number): ScenarioSelection {
  const selection = { scenario, responseDelay: normalizeDelay(responseDelay) };
  writeJson(STORAGE_KEY, selection);
  setScenarioHeaders(selection.scenario, selection.responseDelay);
  return selection;
}
