import type { ApiErrorBody, FieldError } from '../types/api.ts';

// Relative by default: works behind the Vite dev proxy and on Vercel (same origin).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

/** 401 codes that mean the session itself is no longer valid (UNAUTHORIZED does not end it). */
export const SESSION_ERROR_CODES = new Set(['UNAUTHENTICATED', 'INVALID_TOKEN', 'SESSION_EXPIRED']);

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: FieldError[];
  readonly requestId: string | undefined;

  constructor({ status, code, message, details = [], requestId }: ApiErrorBody) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }
}

let authToken: string | null = null;
let sessionInvalidHandler: ((error: ApiError) => void) | null = null;
let scenarioHeaders: Record<string, string> = {};

export function setAuthToken(token: string | null): void {
  authToken = token;
}

/**
 * Test scenario chosen in this browser, sent on every request. The server applies it
 * centrally; nothing else in the frontend needs to know which scenario is active.
 */
export function setScenarioHeaders(scenario: string, responseDelay: number): void {
  scenarioHeaders =
    scenario === 'NORMAL'
      ? {}
      : { 'X-Scenario': scenario, ...(scenario === 'SLOW_RESPONSE' && { 'X-Response-Delay': String(responseDelay) }) };
}

/** Called when an authenticated request is rejected because the session is no longer valid. */
export function onSessionInvalid(handler: ((error: ApiError) => void) | null): void {
  sessionInvalidHandler = handler;
}

function isApiErrorBody(value: unknown): value is { error: ApiErrorBody } {
  if (typeof value !== 'object' || value === null || !('error' in value)) return false;
  const error = (value as { error: unknown }).error;
  return typeof error === 'object' && error !== null && 'code' in error && 'message' in error;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
}

export async function apiRequest<T>(path: string, { method = 'GET', body }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json', ...scenarioHeaders };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      ...(body !== undefined && { body: JSON.stringify(body) }),
    });
  } catch {
    throw new ApiError({ status: 0, code: 'NETWORK_ERROR', message: 'No fue posible conectar con el servidor.' });
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new ApiError(
      isApiErrorBody(payload)
        ? payload.error
        : { status: response.status, code: 'UNEXPECTED_RESPONSE', message: 'El servidor respondió de forma inesperada.' },
    );
    if (authToken && response.status === 401 && SESSION_ERROR_CODES.has(error.code)) {
      sessionInvalidHandler?.(error);
    }
    throw error;
  }

  return payload as T;
}
