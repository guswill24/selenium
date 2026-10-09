import type { NextFunction, Request, Response } from 'express';
import { runWithScenario } from '../scenario/context.js';
import { MAX_DELAY_MS, SCENARIO_IDS, toConfig, type ScenarioConfig, type ScenarioId } from '../scenario/scenarios.js';
import { HttpError } from '../utils/httpError.js';

export const SCENARIO_HEADER = 'x-scenario';
export const DELAY_HEADER = 'x-response-delay';

function isScenarioId(value: string): value is ScenarioId {
  return (SCENARIO_IDS as readonly string[]).includes(value);
}

/** Reads the scenario sent by the client. Missing headers mean NORMAL; malformed ones are a 400. */
export function readScenarioHeaders(req: Request): ScenarioConfig {
  const rawScenario = (req.get(SCENARIO_HEADER) ?? 'NORMAL').trim().toUpperCase();
  if (!isScenarioId(rawScenario)) {
    throw new HttpError(400, 'INVALID_SCENARIO', `El escenario "${rawScenario}" no existe.`);
  }

  const rawDelay = req.get(DELAY_HEADER);
  let delay: number | undefined;
  if (rawDelay !== undefined && rawDelay.trim() !== '') {
    delay = Number(rawDelay);
    if (!Number.isInteger(delay) || delay < 0 || delay > MAX_DELAY_MS) {
      throw new HttpError(400, 'INVALID_SCENARIO', `El retraso debe ser un número entero entre 0 y ${MAX_DELAY_MS} ms.`);
    }
  }
  return toConfig(rawScenario, delay);
}

type EndpointKind = 'scenario' | 'health' | 'login' | 'logout' | 'data';

function endpointKind(path: string): EndpointKind {
  if (path.startsWith('/api/scenario')) return 'scenario';
  if (path === '/api/health') return 'health';
  if (path === '/api/auth/login') return 'login';
  if (path === '/api/auth/logout') return 'logout';
  return 'data';
}

/**
 * The failure a scenario forces on a request, or null. Deliberately centralized:
 * no controller or component knows about scenarios.
 * - `/api/scenario` is never affected (the way back to NORMAL must always work).
 * - Logout always works, so a student can always leave.
 */
function forcedFailure(scenario: ScenarioId, kind: EndpointKind, hasSession: boolean): HttpError | null {
  if (kind === 'scenario' || kind === 'logout') return null;

  switch (scenario) {
    case 'SERVICE_UNAVAILABLE':
      return new HttpError(503, 'SERVICE_UNAVAILABLE', 'El servicio no está disponible temporalmente. Intenta nuevamente más tarde.');
    case 'SERVER_ERROR':
      return kind === 'health' ? null : new HttpError(500, 'INTERNAL_ERROR', 'Ocurrió un error interno. Intenta nuevamente más tarde.');
    case 'INVALID_DATA':
      return kind === 'health' ? null : new HttpError(400, 'INVALID_DATA', 'Los datos de la solicitud no son válidos.');
    case 'UNAUTHORIZED':
      return kind === 'health' ? null : new HttpError(401, 'UNAUTHORIZED', 'No estás autorizado para realizar esta operación.');
    case 'SESSION_EXPIRED':
      return hasSession ? new HttpError(401, 'SESSION_EXPIRED', 'Tu sesión expiró. Inicia sesión nuevamente.') : null;
    default:
      return null;
  }
}

export function scenarioMiddleware(req: Request, res: Response, next: NextFunction): void {
  const kind = endpointKind(req.originalUrl.split('?')[0] ?? '');
  // The scenario endpoints parse the headers themselves (and must work even with bad ones).
  if (kind === 'scenario') {
    next();
    return;
  }

  const config = readScenarioHeaders(req);
  res.setHeader('X-Scenario-Applied', config.scenario);

  const proceed = () =>
    runWithScenario(config.scenario, () => {
      const failure = forcedFailure(config.scenario, kind, Boolean(req.get('authorization')));
      if (failure?.status === 503) res.setHeader('Retry-After', '30');
      next(failure ?? undefined);
    });

  if (config.responseDelay > 0) setTimeout(proceed, config.responseDelay);
  else proceed();
}
