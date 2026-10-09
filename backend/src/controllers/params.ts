import type { Request } from 'express';
import type { ZodType } from 'zod';
import { invalidIdError } from '../utils/httpError.js';

/** Reads `req.params.id` and rejects malformed ids with 400 before any lookup (which may 404). */
export function readIdParam(req: Request, schema: ZodType<string>, resource: string): string {
  const raw = String(req.params.id ?? '').toUpperCase();
  if (!schema.safeParse(raw).success) {
    throw invalidIdError(resource, String(req.params.id));
  }
  return raw;
}
