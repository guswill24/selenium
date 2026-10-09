import { z } from 'zod';
import { data } from '../scenario/context.js';
import type { Alert, Route } from '../data/schemas.js';
import { HttpError } from '../utils/httpError.js';
import { listBuses } from './busService.js';

/**
 * Administration is a *demonstration*: the API validates permissions and data but
 * never stores records (serverless instances share no storage and the JSON fixtures
 * are read-only). The browser keeps the demo changes.
 */

const knownStopIds = () => new Set(data().stops.map((stop) => stop.id));

export const routeInputSchema = z
  .object({
    id: z
      .string({ error: 'El código es obligatorio.' })
      .trim()
      .toUpperCase()
      .regex(/^R\d{2,3}$/, 'El código debe tener el formato R seguido de 2 o 3 dígitos (ej.: R40).'),
    name: z
      .string({ error: 'El nombre es obligatorio.' })
      .trim()
      .min(3, 'El nombre debe tener al menos 3 caracteres.')
      .max(60, 'El nombre no puede superar 60 caracteres.'),
    color: z
      .string({ error: 'El color es obligatorio.' })
      .trim()
      .regex(/^#[0-9a-fA-F]{6}$/, 'El color debe ser un código hexadecimal (ej.: #0369a1).'),
    status: z.enum(['ACTIVE', 'DELAYED', 'CHANGED', 'SUSPENDED'], { error: 'El estado no es válido.' }),
    stops: z
      .array(
        z.object({
          stopId: z.string({ error: 'Selecciona un paradero.' }).trim().toUpperCase().min(1, 'Selecciona un paradero.'),
          minutesFromStart: z
            .number({ error: 'Los minutos deben ser un número.' })
            .int('Los minutos deben ser un número entero.')
            .min(0, 'Los minutos no pueden ser negativos.')
            .max(240, 'Los minutos no pueden superar 240.'),
        }),
        { error: 'La ruta debe tener paraderos.' },
      )
      .min(2, 'La ruta debe tener al menos 2 paraderos.')
      .max(12, 'La ruta no puede tener más de 12 paraderos.'),
  })
  .superRefine((route, context) => {
    const known = knownStopIds();
    const seen = new Set<string>();
    route.stops.forEach((stop, index) => {
      if (stop.stopId && !known.has(stop.stopId)) {
        context.addIssue({ code: 'custom', path: ['stops', index, 'stopId'], message: `El paradero ${stop.stopId} no existe.` });
      }
      if (seen.has(stop.stopId)) {
        context.addIssue({ code: 'custom', path: ['stops', index, 'stopId'], message: 'El paradero está repetido en la ruta.' });
      }
      seen.add(stop.stopId);

      const previous = route.stops[index - 1];
      if (index === 0 && stop.minutesFromStart !== 0) {
        context.addIssue({ code: 'custom', path: ['stops', 0, 'minutesFromStart'], message: 'El primer paradero debe estar en el minuto 0.' });
      }
      if (previous && stop.minutesFromStart <= previous.minutesFromStart) {
        context.addIssue({
          code: 'custom',
          path: ['stops', index, 'minutesFromStart'],
          message: 'Los minutos deben aumentar en cada paradero.',
        });
      }
    });
  });

export type RouteInput = z.infer<typeof routeInputSchema>;

/** Completes the derived fields exactly like a fixture route. */
export function toRoute(input: RouteInput): Route {
  const first = input.stops[0];
  const last = input.stops.at(-1);
  if (!first || !last) throw new Error('Validated route without stops');
  return {
    ...input,
    originStopId: first.stopId,
    destinationStopId: last.stopId,
    estimatedMinutes: last.minutesFromStart,
    active: input.status !== 'SUSPENDED',
  };
}

export interface DemoResult<T> {
  data: T;
  /** Always false: the change lives only in the browser that made it. */
  persisted: false;
}

export function createRoute(input: RouteInput): DemoResult<Route> {
  if (data().routes.some((route) => route.id === input.id)) {
    throw new HttpError(409, 'CONFLICT', `Ya existe una ruta con el código ${input.id}.`, [
      { field: 'id', message: `Ya existe una ruta con el código ${input.id}.` },
    ]);
  }
  return { data: toRoute(input), persisted: false };
}

export function updateRoute(id: string, input: RouteInput): DemoResult<Route> {
  if (input.id !== id) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Los datos enviados no son válidos.', [
      { field: 'id', message: 'El código de la ruta no se puede cambiar.' },
    ]);
  }
  return { data: toRoute(input), persisted: false };
}

export const ADMIN_ENTITIES = ['routes', 'stops', 'buses', 'alerts'] as const;
export type AdminEntity = (typeof ADMIN_ENTITIES)[number];

const entityIdPattern: Record<AdminEntity, RegExp> = {
  routes: /^R\d{2,3}$/,
  stops: /^S\d{2,3}$/,
  buses: /^BUS\d{3}$/,
  alerts: /^A\d{2,3}$/,
};

export function setActive(entity: AdminEntity, id: string, active: boolean): DemoResult<{ entity: AdminEntity; id: string; active: boolean }> {
  if (!entityIdPattern[entity].test(id)) {
    throw new HttpError(400, 'INVALID_ID', `El identificador "${id}" no es válido.`);
  }
  return { data: { entity, id, active }, persisted: false };
}

export interface AdminSummary {
  routes: { total: number; active: number };
  stops: { total: number; inMaintenance: number };
  buses: { total: number; running: number; outOfService: number };
  alerts: { active: number; byLevel: Record<Alert['level'], number> };
  history: { seedEntries: number };
  users: { total: number; locked: number };
  /** Derived from active alerts: any critical alert means the service is degraded. */
  serviceStatus: 'OPERATIONAL' | 'DEGRADED';
  /** Derived from the simulated data at tick 0 (not a real measurement). */
  punctuality: { running: number; onTime: number };
}

export function adminSummary(): AdminSummary {
  const activeAlerts = data().alerts.filter((alert) => alert.active);
  const byLevel: Record<Alert['level'], number> = { CRITICAL: 0, WARNING: 0, INFO: 0, NORMAL: 0 };
  for (const alert of activeAlerts) byLevel[alert.level] += 1;
  const running = listBuses(0).filter((bus) => bus.status !== 'OUT_OF_SERVICE');

  return {
    routes: { total: data().routes.length, active: data().routes.filter((route) => route.active).length },
    stops: { total: data().stops.length, inMaintenance: data().stops.filter((stop) => stop.status !== 'ACTIVE').length },
    buses: { total: data().buses.length, running: running.length, outOfService: data().buses.length - running.length },
    alerts: { active: activeAlerts.length, byLevel },
    history: { seedEntries: data().history.length },
    users: { total: data().users.length, locked: data().users.filter((user) => user.status === 'LOCKED').length },
    serviceStatus: byLevel.CRITICAL > 0 ? 'DEGRADED' : 'OPERATIONAL',
    punctuality: { running: running.length, onTime: running.filter((bus) => bus.delayMinutes === 0).length },
  };
}

export function listSchedules() {
  return data().schedules.map((schedule) => ({
    ...schedule,
    routeName: data().routes.find((route) => route.id === schedule.routeId)?.name ?? schedule.routeId,
  }));
}
