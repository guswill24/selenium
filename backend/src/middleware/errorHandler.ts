import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/httpError.js';

export function endpointNotFound(req: Request, _res: Response, next: NextFunction): void {
  next(new HttpError(404, 'ENDPOINT_NOT_FOUND', `El endpoint ${req.method} ${req.originalUrl} no existe.`));
}

/** Client errors raised by the JSON body parser (malformed JSON, body too large, bad charset…). */
function bodyParserErrorType(error: unknown): string | null {
  if (!(error instanceof Error) || !('type' in error) || typeof error.type !== 'string') return null;
  const status = 'status' in error ? error.status : undefined;
  return typeof status === 'number' && status >= 400 && status < 500 ? error.type : null;
}

/** Exported for tests: maps any thrown value to a safe, user-facing HttpError. */
export function toHttpError(error: unknown): HttpError {
  if (error instanceof HttpError) return error;
  const bodyErrorType = bodyParserErrorType(error);
  if (bodyErrorType === 'entity.too.large') {
    return new HttpError(413, 'PAYLOAD_TOO_LARGE', 'El cuerpo de la solicitud supera el tamaño máximo permitido.');
  }
  if (bodyErrorType) return new HttpError(400, 'INVALID_JSON', 'El cuerpo de la solicitud no es un JSON válido.');
  return new HttpError(500, 'INTERNAL_ERROR', 'Ocurrió un error interno. Intenta nuevamente más tarde.');
}

/**
 * Converts every error into the uniform envelope `{ error: { status, code, message, requestId } }`.
 * Internal details (stack traces) are logged, never sent to the client.
 */
// Express identifies error handlers by their four-argument signature, so `_next` must stay.
export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  const httpError = toHttpError(error);
  if (httpError.status >= 500) {
    console.error('[mi-ruta] Unhandled error', error);
  }

  res.status(httpError.status).json({
    error: {
      status: httpError.status,
      code: httpError.code,
      message: httpError.message,
      ...(httpError.details && { details: httpError.details }),
      requestId: res.locals.requestId as string | undefined,
    },
  });
}
