import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { Express } from 'express';

export interface TestResponse {
  status: number;
  headers: Headers;
  body: Record<string, unknown>;
}

export interface TestServer {
  request(
    method: string,
    path: string,
    options?: { body?: unknown; token?: string; rawBody?: string; headers?: Record<string, string> },
  ): Promise<TestResponse>;
  close(): Promise<void>;
}

/** Starts an app on an ephemeral port and returns a tiny JSON client for integration tests. */
export async function startTestServer(app: Express): Promise<TestServer> {
  const server: Server = app.listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  return {
    async request(method, path, { body, token, rawBody, headers: extraHeaders = {} } = {}) {
      const headers: Record<string, string> = { ...extraHeaders };
      if (body !== undefined || rawBody !== undefined) headers['Content-Type'] = 'application/json';
      if (token) headers.Authorization = `Bearer ${token}`;

      const payload = rawBody ?? (body === undefined ? undefined : JSON.stringify(body));
      const response = await fetch(`${baseUrl}${path}`, { method, headers, ...(payload !== undefined && { body: payload }) });
      return { status: response.status, headers: response.headers, body: (await response.json()) as Record<string, unknown> };
    },
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}
