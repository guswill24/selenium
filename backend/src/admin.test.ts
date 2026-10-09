import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import type { AdminSummary } from './services/adminService.js';
import { startTestServer, type TestServer } from './test/httpTestServer.js';

let api: TestServer;
let adminToken: string;
let passengerToken: string;

async function tokenFor(username: string, password: string): Promise<string> {
  const { body } = await api.request('POST', '/api/auth/login', { body: { username, password } });
  return (body.data as { token: string }).token;
}

beforeAll(async () => {
  api = await startTestServer(createApp());
  adminToken = await tokenFor('admin.demo', 'Admin2026!');
  passengerToken = await tokenFor('pasajero.demo', 'Pasajero2026!');
});

afterAll(() => api.close());

const validRoute = {
  id: 'r40',
  name: 'Universidad – Hospital',
  color: '#15803d',
  status: 'ACTIVE',
  stops: [
    { stopId: 'S04', minutesFromStart: 0 },
    { stopId: 'S07', minutesFromStart: 8 },
    { stopId: 'S05', minutesFromStart: 20 },
  ],
};

describe('admin authorization (NF11)', () => {
  it.each([
    ['GET', '/api/admin/summary'],
    ['GET', '/api/admin/schedules'],
    ['GET', '/api/admin/alerts'],
    ['POST', '/api/admin/routes'],
    ['PUT', '/api/admin/routes/R12'],
    ['PATCH', '/api/admin/routes/R12/status'],
  ])('%s %s: 401 without session, 403 for a passenger', async (method, path) => {
    const body = method === 'GET' ? undefined : {};
    const anonymous = await api.request(method, path, { body });
    const passenger = await api.request(method, path, { body, token: passengerToken });

    expect(anonymous.status).toBe(401);
    expect(passenger.status).toBe(403);
    expect(passenger.body.error).toMatchObject({ code: 'FORBIDDEN' });
  });
});

describe('POST /api/admin/routes (F14)', () => {
  it('creates a route with derived fields and reports it is not persisted', async () => {
    const { status, body } = await api.request('POST', '/api/admin/routes', { token: adminToken, body: validRoute });

    expect(status).toBe(201);
    expect(body.meta).toEqual({ persisted: false });
    expect(body.data).toMatchObject({
      id: 'R40',
      originStopId: 'S04',
      destinationStopId: 'S05',
      estimatedMinutes: 20,
      active: true,
    });
  });

  it('really does not persist: the public catalog is unchanged', async () => {
    await api.request('POST', '/api/admin/routes', { token: adminToken, body: validRoute });
    const { status } = await api.request('GET', '/api/routes/R40');

    expect(status).toBe(404);
  });

  it('rejects an id that already exists with 409', async () => {
    const { status, body } = await api.request('POST', '/api/admin/routes', { token: adminToken, body: { ...validRoute, id: 'R12' } });

    expect(status).toBe(409);
    expect(body.error).toMatchObject({ code: 'CONFLICT', details: [{ field: 'id' }] });
  });

  it('reports one message per invalid field', async () => {
    const { status, body } = await api.request('POST', '/api/admin/routes', {
      token: adminToken,
      body: { id: 'X1', name: 'A', color: 'azul', status: 'OPEN', stops: [{ stopId: 'S01', minutesFromStart: 0 }] },
    });
    const fields = (body.error as { details: { field: string }[] }).details.map((detail) => detail.field);

    expect(status).toBe(400);
    expect(fields).toEqual(['id', 'name', 'color', 'status', 'stops']);
  });

  it('validates the stop sequence', async () => {
    const { status, body } = await api.request('POST', '/api/admin/routes', {
      token: adminToken,
      body: {
        ...validRoute,
        stops: [
          { stopId: 'S04', minutesFromStart: 2 },
          { stopId: 'S99', minutesFromStart: 8 },
          { stopId: 'S04', minutesFromStart: 5 },
        ],
      },
    });

    expect(status).toBe(400);
    expect(body.error).toMatchObject({
      details: [
        { field: 'stops.0.minutesFromStart', message: 'El primer paradero debe estar en el minuto 0.' },
        { field: 'stops.1.stopId', message: 'El paradero S99 no existe.' },
        { field: 'stops.2.stopId', message: 'El paradero está repetido en la ruta.' },
        { field: 'stops.2.minutesFromStart', message: 'Los minutos deben aumentar en cada paradero.' },
      ],
    });
  });
});

describe('PUT /api/admin/routes/:id (F15)', () => {
  it('validates an edit and derives the new duration', async () => {
    const { status, body } = await api.request('PUT', '/api/admin/routes/R12', {
      token: adminToken,
      body: {
        id: 'R12',
        name: 'Terminal – Centro (modificada)',
        color: '#0369a1',
        status: 'CHANGED',
        stops: [
          { stopId: 'S01', minutesFromStart: 0 },
          { stopId: 'S02', minutesFromStart: 7 },
          { stopId: 'S03', minutesFromStart: 14 },
        ],
      },
    });

    expect(status).toBe(200);
    expect(body.data).toMatchObject({ id: 'R12', status: 'CHANGED', estimatedMinutes: 14 });
  });

  it('does not allow changing the id', async () => {
    const { status, body } = await api.request('PUT', '/api/admin/routes/R12', { token: adminToken, body: { ...validRoute, id: 'R41' } });

    expect(status).toBe(400);
    expect(body.error).toMatchObject({ details: [{ field: 'id', message: 'El código de la ruta no se puede cambiar.' }] });
  });
});

describe('PATCH /api/admin/:entity/:id/status', () => {
  it.each([
    ['routes', 'R22'],
    ['stops', 'S08'],
    ['buses', 'BUS105'],
    ['alerts', 'A03'],
  ])('toggles %s %s', async (entity, id) => {
    const { status, body } = await api.request('PATCH', `/api/admin/${entity}/${id}/status`, { token: adminToken, body: { active: true } });

    expect(status).toBe(200);
    expect(body).toEqual({ data: { entity, id, active: true }, meta: { persisted: false } });
  });

  it('validates the body, the id and the entity', async () => {
    const badBody = await api.request('PATCH', '/api/admin/routes/R12/status', { token: adminToken, body: { active: 'yes' } });
    const badId = await api.request('PATCH', '/api/admin/stops/R12/status', { token: adminToken, body: { active: false } });
    const badEntity = await api.request('PATCH', '/api/admin/users/U01/status', { token: adminToken, body: { active: false } });

    expect([badBody.status, badId.status, badEntity.status]).toEqual([400, 400, 404]);
  });
});

describe('GET /api/admin/summary', () => {
  it('derives every indicator from the data', async () => {
    const { body } = await api.request('GET', '/api/admin/summary', { token: adminToken });

    expect(body.data as AdminSummary).toEqual({
      routes: { total: 5, active: 4 },
      stops: { total: 8, inMaintenance: 1 },
      buses: { total: 5, running: 4, outOfService: 1 },
      alerts: { active: 4, byLevel: { CRITICAL: 1, WARNING: 1, INFO: 1, NORMAL: 1 } },
      history: { seedEntries: 3 },
      users: { total: 3, locked: 1 },
      serviceStatus: 'DEGRADED',
      punctuality: { running: 4, onTime: 4 },
    });
  });

  it('lists every alert, including inactive ones', async () => {
    const { body } = await api.request('GET', '/api/admin/alerts', { token: adminToken });

    expect((body.data as { id: string; active: boolean }[]).map((alert) => `${alert.id}:${alert.active}`)).toEqual([
      'A01:true',
      'A02:true',
      'A03:false',
      'A04:true',
      'A05:true',
      'A06:false',
    ]);
  });

  it('lists schedules with route names', async () => {
    const { body } = await api.request('GET', '/api/admin/schedules', { token: adminToken });

    expect(body.meta).toEqual({ count: 7 });
    expect((body.data as { routeName: string }[])[0]).toMatchObject({ routeId: 'R12', dayType: 'WEEKDAY', routeName: 'Terminal – Centro' });
  });
});
