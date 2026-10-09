import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/httpError.js';

export function endpointNotFound(req: Request, _res: Response, next: NextFunction): void {
  next(new HttpError(404, 'ENDPOINT_NOT_FOUND', `El endpoint ${req.method} ${req.originalUrl} no existe.`));
}

function isJsonSyntaxError(error: unknown): boolean {
  return error instanceof SyntaxError && 'type' in error && error.type === 'entity.parse.failed';
}

function toHttpError(error: unknown): HttpError {
  if (error instanceof HttpError) return error;
  if (isJsonSyntaxError(error)) return new HttpError(400, 'INVALID_JSON', 'El cuerpo de la solicitud no es un JSON válido.');
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
