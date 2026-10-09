import type { ApiEnvelope } from '../types/api.ts';
import type { ScenarioId, ServerScenarioConfig } from '../types/scenario.ts';
import { apiRequest } from './apiClient.ts';

/** What the server receives from this browser (read from the request headers). */
export async function fetchServerScenario(): Promise<ServerScenarioConfig> {
  return (await apiRequest<ApiEnvelope<ServerScenarioConfig>>('/api/scenario')).data;
}

/** Asks the server to validate a scenario before this browser starts sending it. */
export async function validateScenario(scenario: ScenarioId, responseDelay?: number): Promise<ServerScenarioConfig> {
  const body = scenario === 'SLOW_RESPONSE' ? { scenario, responseDelay } : { scenario };
  return (await apiRequest<ApiEnvelope<ServerScenarioConfig>>('/api/scenario', { method: 'POST', body })).data;
}
