export type ErrorCode =
  | 'INVALID_ID'
  | 'INVALID_JSON'
  | 'VALIDATION_ERROR'
  | 'USER_NOT_FOUND'
  | 'WRONG_PASSWORD'
  | 'ACCOUNT_LOCKED'
  | 'UNAUTHENTICATED'
  | 'INVALID_TOKEN'
  | 'SESSION_EXPIRED'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'INVALID_SCENARIO'
  | 'INVALID_DATA'
  | 'UNAUTHORIZED'
  | 'SERVICE_UNAVAILABLE'
  | 'NOT_FOUND'
  | 'ENDPOINT_NOT_FOUND'
  | 'INTERNAL_ERROR';

export interface FieldError {
  field: string;
  message: string;
}

/** Expected, user-facing API error. Anything else is treated as an internal error. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    message: string,
    readonly details?: FieldError[],
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export function notFoundError(resource: string, id: string): HttpError {
  return new HttpError(404, 'NOT_FOUND', `${resource} ${id} no existe.`);
}

export function invalidIdError(resource: string, id: string): HttpError {
  return new HttpError(400, 'INVALID_ID', `El identificador "${id}" no es válido para ${resource}.`);
}
