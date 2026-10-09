/**
 * Single source of truth for the test scenarios of the laboratory.
 * Each browser chooses its scenario; the client sends it on every request
 * (`X-Scenario`, `X-Response-Delay`) and the API applies it centrally.
 */
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

export const DEFAULT_SLOW_DELAY_MS = 3000;
export const MAX_DELAY_MS = 8000;
export const DELAY_OPTIONS_MS = [1000, 3000, 5000, 8000] as const;

export interface ScenarioDefinition {
  id: ScenarioId;
  label: string;
  description: string;
  /** HTTP status the affected requests receive. */
  httpStatus: number;
}

export const SCENARIOS: Record<ScenarioId, ScenarioDefinition> = {
  NORMAL: {
    id: 'NORMAL',
    label: 'NORMAL',
    description: 'El sistema funciona con los datos originales.',
    httpStatus: 200,
  },
  NO_RESULTS: {
    id: 'NO_RESULTS',
    label: 'SIN RESULTADOS',
    description: 'Las búsquedas (rutas, planificador, paraderos filtrados, cercanos, llegadas y alertas filtradas) no devuelven resultados. Los catálogos completos siguen disponibles.',
    httpStatus: 200,
  },
  INVALID_DATA: {
    id: 'INVALID_DATA',
    label: 'DATOS INVÁLIDOS',
    description: 'El servidor rechaza las solicitudes por considerar inválidos los datos recibidos.',
    httpStatus: 400,
  },
  SERVER_ERROR: {
    id: 'SERVER_ERROR',
    label: 'ERROR SERVIDOR',
    description: 'El servidor responde con un error interno a las solicitudes de datos y de inicio de sesión.',
    httpStatus: 500,
  },
  SERVICE_UNAVAILABLE: {
    id: 'SERVICE_UNAVAILABLE',
    label: 'SERVICIO NO DISPONIBLE',
    description: 'El servicio no está disponible, incluida la verificación de estado (/api/health).',
    httpStatus: 503,
  },
  SLOW_RESPONSE: {
    id: 'SLOW_RESPONSE',
    label: 'RESPUESTA LENTA',
    description: 'Todas las respuestas se retrasan el tiempo configurado.',
    httpStatus: 200,
  },
  ROUTE_CHANGED: {
    id: 'ROUTE_CHANGED',
    label: 'RUTA MODIFICADA',
    description: 'La ruta R12 cambia su recorrido y se publica una alerta de cambio de ruta.',
    httpStatus: 200,
  },
  BUS_DELAYED: {
    id: 'BUS_DELAYED',
    label: 'BUS RETRASADO',
    description: 'Los buses de la ruta R12 presentan retraso y se publica la alerta correspondiente.',
    httpStatus: 200,
  },
  INCONSISTENT_DATA: {
    id: 'INCONSISTENT_DATA',
    label: 'DATOS INCONSISTENTES',
    description: 'Los datos contienen contradicciones deliberadas entre distintas pantallas del sistema.',
    httpStatus: 200,
  },
  EMPTY_DATA: {
    id: 'EMPTY_DATA',
    label: 'DATOS VACÍOS',
    description: 'No hay rutas, paraderos, buses, alertas ni historial. Las cuentas de demostración siguen funcionando.',
    httpStatus: 200,
  },
  UNAUTHORIZED: {
    id: 'UNAUTHORIZED',
    label: 'NO AUTORIZADO',
    description: 'El servidor rechaza las solicitudes por falta de autorización, sin cerrar la sesión.',
    httpStatus: 401,
  },
  SESSION_EXPIRED: {
    id: 'SESSION_EXPIRED',
    label: 'SESIÓN EXPIRADA',
    description: 'Toda solicitud que incluya una sesión es rechazada como expirada, por lo que la sesión se cierra.',
    httpStatus: 401,
  },
};

export interface ScenarioConfig {
  scenario: ScenarioId;
  label: string;
  description: string;
  responseDelay: number;
  serviceAvailability: 'AVAILABLE' | 'ERROR' | 'UNAVAILABLE';
  routeDataConsistency: 'CONSISTENT' | 'INCONSISTENT';
  sessionState: 'VALID' | 'UNAUTHORIZED' | 'EXPIRED';
}

/** Expands a scenario into the centralized configuration described in the specification. */
export function toConfig(scenario: ScenarioId, requestedDelay?: number): ScenarioConfig {
  const { label, description } = SCENARIOS[scenario];
  return {
    scenario,
    label,
    description,
    responseDelay: scenario === 'SLOW_RESPONSE' ? (requestedDelay ?? DEFAULT_SLOW_DELAY_MS) : 0,
    serviceAvailability: scenario === 'SERVER_ERROR' ? 'ERROR' : scenario === 'SERVICE_UNAVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE',
    routeDataConsistency: scenario === 'INCONSISTENT_DATA' ? 'INCONSISTENT' : 'CONSISTENT',
    sessionState: scenario === 'UNAUTHORIZED' ? 'UNAUTHORIZED' : scenario === 'SESSION_EXPIRED' ? 'EXPIRED' : 'VALID',
  };
}
