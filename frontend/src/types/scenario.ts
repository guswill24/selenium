export const SCENARIO_IDS = [
  'NORMAL',
  'NO_RESULTS',
  'INVALID_DATA',
  'SERVER_ERROR',
  'SERVICE_UNAVAILABLE',
  'SLOW_RESPONSE',
  'ROUTE_CHANGED',
  'BUS_DELAYED',
  'INCONSISTENT_DATA',
  'EMPTY_DATA',
  'UNAUTHORIZED',
  'SESSION_EXPIRED',
] as const;

export type ScenarioId = (typeof SCENARIO_IDS)[number];

/** Labels as written in the specification's selector. */
export const scenarioLabels: Record<ScenarioId, string> = {
  NORMAL: 'NORMAL',
  NO_RESULTS: 'SIN RESULTADOS',
  INVALID_DATA: 'DATOS INVÁLIDOS',
  SERVER_ERROR: 'ERROR SERVIDOR',
  SERVICE_UNAVAILABLE: 'SERVICIO NO DISPONIBLE',
  SLOW_RESPONSE: 'RESPUESTA LENTA',
  ROUTE_CHANGED: 'RUTA MODIFICADA',
  BUS_DELAYED: 'BUS RETRASADO',
  INCONSISTENT_DATA: 'DATOS INCONSISTENTES',
  EMPTY_DATA: 'DATOS VACÍOS',
  UNAUTHORIZED: 'NO AUTORIZADO',
  SESSION_EXPIRED: 'SESIÓN EXPIRADA',
};

export const DELAY_OPTIONS_MS = [1000, 3000, 5000, 8000] as const;
export const DEFAULT_DELAY_MS = 3000;

export interface ScenarioSelection {
  scenario: ScenarioId;
  /** Only meaningful for SLOW_RESPONSE. */
  responseDelay: number;
}

export interface ScenarioDefinition {
  id: ScenarioId;
  label: string;
  description: string;
  httpStatus: number;
}

/** Configuration as received by the server (GET /api/scenario). */
export interface ServerScenarioConfig {
  scenario: ScenarioId;
  label: string;
  description: string;
  responseDelay: number;
  serviceAvailability: 'AVAILABLE' | 'ERROR' | 'UNAVAILABLE';
  routeDataConsistency: 'CONSISTENT' | 'INCONSISTENT';
  sessionState: 'VALID' | 'UNAUTHORIZED' | 'EXPIRED';
  available: ScenarioDefinition[];
  delayOptions: number[];
}

export function isScenarioId(value: string | null | undefined): value is ScenarioId {
  return (SCENARIO_IDS as readonly string[]).includes(value ?? '');
}
