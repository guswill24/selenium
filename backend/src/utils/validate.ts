import type { ZodType } from 'zod';
import { HttpError, type FieldError } from './httpError.js';

/**
 * Parses a request body or query. Invalid input becomes a 400 with exactly one entry
 * per invalid field: the first failing rule (e.g. "required" wins over "invalid format").
 */
export function parseBody<T>(schema: ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body ?? {});
  if (result.success) return result.data;

  const byField = new Map<string, FieldError>();
  for (const issue of result.error.issues) {
    const field = issue.path.join('.') || 'body';
    if (!byField.has(field)) byField.set(field, { field, message: issue.message });
  }
  throw new HttpError(400, 'VALIDATION_ERROR', 'Los datos enviados no son válidos.', [...byField.values()]);
}
