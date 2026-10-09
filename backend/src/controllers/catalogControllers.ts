import type { Request, Response } from 'express';
import { z } from 'zod';
import { alertIdSchema, busIdSchema, routeIdSchema, stopIdSchema } from '../data/schemas.js';
import { getAlert, listActiveAlerts } from '../services/alertService.js';
import { arrivalsAt } from '../services/arrivalService.js';
import { MAX_TICK } from '../services/simulation.js';
import { getBus, listBuses } from '../services/busService.js';
import { findNearbyStops, listPlaces } from '../services/placeService.js';
import { planTrip } from '../services/plannerService.js';
import { searchRoutes } from '../services/routeSearchService.js';
import { getRoute, listRoutes } from '../services/routeService.js';
import { getStop, listStops } from '../services/stopService.js';
import { sendData } from '../utils/respond.js';
import { parseBody } from '../utils/validate.js';
import { readIdParam } from './params.js';

function stopQueryParam(label: 'origen' | 'destino') {
  const required = `Selecciona un paradero de ${label}.`;
  return z
    .string({ error: required })
    .trim()
    .toUpperCase()
    .min(1, required)
    .regex(/^S\d{2,3}$/, `El ${label} no es un paradero válido.`);
}

/** Shared by direct route search and trip planning. */
const tripQuerySchema = z.object({
  origin: stopQueryParam('origen'),
  destination: stopQueryParam('destino'),
});

const stopListQuerySchema = z.object({
  q: z.string({ error: 'La búsqueda debe ser un texto.' }).max(50, 'La búsqueda no puede superar 50 caracteres.').optional(),
  status: z
    .enum(['ACTIVE', 'MAINTENANCE', 'CLOSED'], { error: 'El estado debe ser ACTIVE, MAINTENANCE o CLOSED.' })
    .optional(),
});

const nearbyQuerySchema = z.object({
  place: z
    .string({ error: 'Selecciona una ubicación simulada.' })
    .trim()
    .toUpperCase()
    .min(1, 'Selecciona una ubicación simulada.')
    .regex(/^P\d{2,3}$/, 'La ubicación no es válida.'),
});

export const routeController = {
  /** Without query parameters lists every route; with `origin`/`destination` searches direct routes. */
  list: (req: Request, res: Response) => {
    if (req.query.origin === undefined && req.query.destination === undefined) {
      sendData(res, listRoutes());
      return;
    }
    const { origin, destination } = parseBody(tripQuerySchema, req.query);
    sendData(res, searchRoutes(origin, destination));
  },
  detail: (req: Request, res: Response) => sendData(res, getRoute(readIdParam(req, routeIdSchema, 'una ruta'))),
};

export const plannerController = {
  plan: (req: Request, res: Response) => {
    const { origin, destination } = parseBody(tripQuerySchema, req.query);
    sendData(res, planTrip(origin, destination));
  },
};

export const stopController = {
  list: (req: Request, res: Response) => sendData(res, listStops(parseBody(stopListQuerySchema, req.query))),
  detail: (req: Request, res: Response) => sendData(res, getStop(readIdParam(req, stopIdSchema, 'un paradero'))),
  nearby: (req: Request, res: Response) => sendData(res, findNearbyStops(parseBody(nearbyQuerySchema, req.query).place)),
};

export const placeController = {
  list: (_req: Request, res: Response) => sendData(res, listPlaces()),
};

const tickSchema = z.coerce
  .number({ error: `El tick debe ser un número entero entre 0 y ${MAX_TICK}.` })
  .int(`El tick debe ser un número entero entre 0 y ${MAX_TICK}.`)
  .min(0, `El tick debe ser un número entero entre 0 y ${MAX_TICK}.`)
  .max(MAX_TICK, `El tick debe ser un número entero entre 0 y ${MAX_TICK}.`)
  .default(0);

const busQuerySchema = z.object({ tick: tickSchema });

const arrivalsQuerySchema = z.object({
  stop: z
    .string({ error: 'Selecciona un paradero.' })
    .trim()
    .toUpperCase()
    .min(1, 'Selecciona un paradero.')
    .regex(/^S\d{2,3}$/, 'El paradero no es válido.'),
  tick: tickSchema,
});

export const busController = {
  list: (req: Request, res: Response) => sendData(res, listBuses(parseBody(busQuerySchema, req.query).tick)),
  detail: (req: Request, res: Response) => {
    const id = readIdParam(req, busIdSchema, 'un bus');
    sendData(res, getBus(id, parseBody(busQuerySchema, req.query).tick));
  },
};

export const arrivalController = {
  list: (req: Request, res: Response) => {
    const { stop, tick } = parseBody(arrivalsQuerySchema, req.query);
    sendData(res, arrivalsAt(stop, tick));
  },
};

const alertQuerySchema = z.object({
  level: z
    .enum(['NORMAL', 'INFO', 'WARNING', 'CRITICAL'], { error: 'El nivel debe ser NORMAL, INFO, WARNING o CRITICAL.' })
    .optional(),
  type: z
    .enum(['DELAY', 'ROUTE_CHANGE', 'INTERRUPTION', 'INFORMATION'], {
      error: 'El tipo debe ser DELAY, ROUTE_CHANGE, INTERRUPTION o INFORMATION.',
    })
    .optional(),
  route: z
    .string({ error: 'La ruta no es válida.' })
    .trim()
    .toUpperCase()
    .regex(/^R\d{2,3}$/, 'La ruta no es válida.')
    .optional(),
});

export const alertController = {
  list: (req: Request, res: Response) => {
    const { level, type, route } = parseBody(alertQuerySchema, req.query);
    sendData(res, listActiveAlerts({ level, type, routeId: route }));
  },
  detail: (req: Request, res: Response) => sendData(res, getAlert(readIdParam(req, alertIdSchema, 'una alerta'))),
};
