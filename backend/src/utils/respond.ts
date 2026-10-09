import type { Response } from 'express';

/** Uniform success envelope: `{ data, meta }`. Lists include their item count. */
export function sendData<T>(res: Response, data: T): void {
  const meta = Array.isArray(data) ? { count: data.length } : {};
  res.json({ data, meta });
}
