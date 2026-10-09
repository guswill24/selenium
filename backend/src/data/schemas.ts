import { z } from 'zod';

const id = (prefix: string) => z.string().regex(new RegExp(`^${prefix}\\d{2,3}$`), `Expected an id like ${prefix}01`);

export const stopIdSchema = id('S');
export const routeIdSchema = id('R');
export const busIdSchema = z.string().regex(/^BUS\d{3}$/, 'Expected an id like BUS101');
export const userIdSchema = id('U');
export const alertIdSchema = id('A');

const coordsSchema = z.object({
  x: z.number().int().min(0).max(1000),
  y: z.number().int().min(0).max(600),
});

const isoDateTime = z.iso.datetime({ offset: true });
const clockTime = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Expected HH:mm');

export const stopSchema = z.object({
  id: stopIdSchema,
  name: z.string().min(1),
  address: z.string().min(1),
  zone: z.enum(['Norte', 'Sur', 'Centro', 'Oriente', 'Occidente']),
  status: z.enum(['ACTIVE', 'MAINTENANCE', 'CLOSED']),
  accessible: z.boolean(),
  amenities: z.array(z.string().min(1)),
  coords: coordsSchema,
});

export const routeStopSchema = z.object({
  stopId: stopIdSchema,
  minutesFromStart: z.number().int().min(0),
});

export const routeSchema = z.object({
  id: routeIdSchema,
  name: z.string().min(1),
  originStopId: stopIdSchema,
  destinationStopId: stopIdSchema,
  stops: z.array(routeStopSchema).min(2),
  estimatedMinutes: z.number().int().positive(),
  status: z.enum(['ACTIVE', 'DELAYED', 'CHANGED', 'SUSPENDED']),
  color: z.string().regex(/^#[0-9a-f]{6}$/i, 'Expected a hex color'),
  active: z.boolean(),
});

export const busSchema = z.object({
  id: busIdSchema,
  plate: z.string().regex(/^MRT-\d{3}$/, 'Expected a fictitious plate like MRT-101'),
  routeId: routeIdSchema,
  capacity: z.number().int().positive(),
  status: z.enum(['IN_SERVICE', 'AT_TERMINAL', 'OUT_OF_SERVICE']),
  /** Minute along the route at simulation tick 0. */
  startMinute: z.number().int().min(0),
  delayMinutes: z.number().int().min(0),
});

export const alertSchema = z.object({
  id: alertIdSchema,
  level: z.enum(['NORMAL', 'INFO', 'WARNING', 'CRITICAL']),
  type: z.enum(['DELAY', 'ROUTE_CHANGE', 'INTERRUPTION', 'INFORMATION']),
  routeId: routeIdSchema.nullable(),
  title: z.string().min(1),
  message: z.string().min(1),
  active: z.boolean(),
  publishedAt: isoDateTime,
});

export const scheduleSchema = z.object({
  routeId: routeIdSchema,
  dayType: z.enum(['WEEKDAY', 'WEEKEND']),
  firstDeparture: clockTime,
  lastDeparture: clockTime,
  frequencyMinutes: z.number().int().positive(),
});

export const userSchema = z.object({
  id: userIdSchema,
  username: z.string().regex(/^[a-z]+\.demo$/, 'Demo usernames must end with .demo'),
  /** Demo-only plain text password. Never use real credentials. */
  password: z.string().min(8),
  role: z.enum(['PASSENGER', 'ADMIN']),
  status: z.enum(['ACTIVE', 'LOCKED']),
  fullName: z.string().min(1),
  email: z.email().refine((value) => value.endsWith('@mi-ruta.demo'), 'Demo emails must use @mi-ruta.demo'),
  phone: z.string().min(1),
});

export const historyEntrySchema = z.object({
  id: id('H'),
  userId: userIdSchema,
  date: isoDateTime,
  originStopId: stopIdSchema,
  destinationStopId: stopIdSchema,
  routeId: routeIdSchema,
  estimatedMinutes: z.number().int().positive(),
});

export const pointOfInterestSchema = z.object({
  id: id('P'),
  name: z.string().min(1),
  category: z.enum(['PARK', 'CULTURE', 'SHOPPING', 'HEALTH', 'SPORTS', 'EDUCATION']),
  nearStopId: stopIdSchema,
  coords: coordsSchema,
});

export const fixturesSchema = z.object({
  stops: z.array(stopSchema),
  routes: z.array(routeSchema),
  buses: z.array(busSchema),
  alerts: z.array(alertSchema),
  schedules: z.array(scheduleSchema),
  users: z.array(userSchema),
  history: z.array(historyEntrySchema),
  pointsOfInterest: z.array(pointOfInterestSchema),
});

export type Stop = z.infer<typeof stopSchema>;
export type Route = z.infer<typeof routeSchema>;
export type RouteStop = z.infer<typeof routeStopSchema>;
export type Bus = z.infer<typeof busSchema>;
export type Alert = z.infer<typeof alertSchema>;
export type Schedule = z.infer<typeof scheduleSchema>;
export type User = z.infer<typeof userSchema>;
export type HistoryEntry = z.infer<typeof historyEntrySchema>;
export type PointOfInterest = z.infer<typeof pointOfInterestSchema>;
export type Fixtures = z.infer<typeof fixturesSchema>;
