import type { Request, Response } from 'express';
import { z } from 'zod';
import {
  ADMIN_ENTITIES,
  adminSummary,
  createRoute,
  listSchedules,
  routeInputSchema,
  setActive,
  updateRoute,
  type AdminEntity,
} from '../services/adminService.js';
import { listAllAlerts } from '../services/alertService.js';
import { HttpError } from '../utils/httpError.js';
import { sendData } from '../utils/respond.js';
import { parseBody } from '../utils/validate.js';

const statusBodySchema = z.object({
  active: z.boolean({ error: 'El campo active debe ser verdadero o falso.' }),
});

function readEntity(req: Request): AdminEntity {
  const entity = ADMIN_ENTITIES.find((candidate) => candidate === req.params.entity);
  if (!entity) throw new HttpError(404, 'ENDPOINT_NOT_FOUND', `El endpoint ${req.method} ${req.originalUrl} no existe.`);
  return entity;
}

export const adminController = {
  summary: (_req: Request, res: Response) => sendData(res, adminSummary()),

  schedules: (_req: Request, res: Response) => sendData(res, listSchedules()),

  alerts: (_req: Request, res: Response) => sendData(res, listAllAlerts()),

  createRoute: (req: Request, res: Response) => {
    const result = createRoute(parseBody(routeInputSchema, req.body));
    res.status(201).json({ data: result.data, meta: { persisted: result.persisted } });
  },

  updateRoute: (req: Request, res: Response) => {
    const result = updateRoute(String(req.params.id ?? '').toUpperCase(), parseBody(routeInputSchema, req.body));
    res.json({ data: result.data, meta: { persisted: result.persisted } });
  },

  setStatus: (req: Request, res: Response) => {
    const entity = readEntity(req);
    const { active } = parseBody(statusBodySchema, req.body);
    const result = setActive(entity, String(req.params.id ?? '').toUpperCase(), active);
    res.json({ data: result.data, meta: { persisted: result.persisted } });
  },
};
