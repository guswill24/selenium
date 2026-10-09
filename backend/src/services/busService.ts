import { data } from '../scenario/context.js';
import type { Bus, Route } from '../data/schemas.js';
import { notFoundError } from '../utils/httpError.js';
import { stopName } from './network.js';
import { isRunning, LAYOVER_MINUTES, phaseAt, simulatedClock, type LiveStatus } from './simulation.js';

export interface BusPosition {
  /** Minute along the route (0 = first stop). */
  minute: number;
  /** Stop the bus last passed and the next one it heads to (equal when at a stop). */
  fromStopId: string;
  toStopId: string;
  /** Map coordinates interpolated between both stops, rounded to one decimal. */
  x: number;
  y: number;
}

export interface BusView extends Omit<Bus, 'status'> {
  routeName: string;
  /** Live status at the requested tick. */
  status: LiveStatus;
  /** Null when the bus is not running (not drawn on the map). */
  position: BusPosition | null;
  /** Human-readable simulated location, e.g. "Entre Plaza del Mercado y Centro". */
  locationText: string;
  nextStopId: string | null;
  nextStopName: string | null;
  /** Minutes to the next stop including delay; null when not running. */
  etaMinutes: number | null;
  tick: number;
  lastUpdate: string;
  lastUpdateTime: string;
}

function coordsOf(stopId: string): { x: number; y: number } {
  const stop = data().stops.find((candidate) => candidate.id === stopId);
  if (!stop) throw new Error(`Unknown stop ${stopId}`);
  return stop.coords;
}

const round1 = (value: number) => Math.round(value * 10) / 10;

/** Linear interpolation of the bus along its route at a given minute. */
export function positionAt(route: Route, minute: number): BusPosition {
  const clamped = Math.min(Math.max(minute, 0), route.estimatedMinutes);

  // Exactly at a stop: both ends are that stop.
  const atStop = route.stops.find((stop) => stop.minutesFromStart === clamped);
  if (atStop) {
    const { x, y } = coordsOf(atStop.stopId);
    return { minute: clamped, fromStopId: atStop.stopId, toStopId: atStop.stopId, x, y };
  }

  // Otherwise strictly between two consecutive stops (minutes increase along the route).
  const nextIndex = route.stops.findIndex((stop) => stop.minutesFromStart > clamped);
  const from = route.stops[nextIndex - 1];
  const to = route.stops[nextIndex];
  if (!from || !to) throw new Error(`No segment for minute ${clamped} on ${route.id}`);

  const progress = (clamped - from.minutesFromStart) / (to.minutesFromStart - from.minutesFromStart);
  const a = coordsOf(from.stopId);
  const b = coordsOf(to.stopId);
  return {
    minute: clamped,
    fromStopId: from.stopId,
    toStopId: to.stopId,
    x: round1(a.x + (b.x - a.x) * progress),
    y: round1(a.y + (b.y - a.y) * progress),
  };
}

function locationText(position: BusPosition, atTerminal: boolean): string {
  if (atTerminal) return `En terminal ${stopName(position.fromStopId)}`;
  if (position.fromStopId === position.toStopId) return `En ${stopName(position.fromStopId)}`;
  return `Entre ${stopName(position.fromStopId)} y ${stopName(position.toStopId)}`;
}

/** State of one bus at a simulated tick. */
export function toBusView(bus: Bus, tick = 0): BusView {
  const route = data().routes.find((candidate) => candidate.id === bus.routeId);
  const clock = simulatedClock(tick);
  const base = {
    ...bus,
    routeName: route?.name ?? bus.routeId,
    tick,
    lastUpdate: clock.timestamp,
    lastUpdateTime: clock.time,
  };

  if (!isRunning(bus, route)) {
    return { ...base, status: 'OUT_OF_SERVICE', position: null, locationText: 'Fuera de servicio', nextStopId: null, nextStopName: null, etaMinutes: null };
  }

  const phase = phaseAt(bus, route, tick);
  const atTerminal = phase < LAYOVER_MINUTES;
  const minute = atTerminal ? 0 : phase - LAYOVER_MINUTES;
  const position = positionAt(route, minute);
  // Next stop strictly ahead (a route always has a later stop while the bus is running).
  const next = route.stops.find((stop) => stop.minutesFromStart > minute);
  const waitToDepart = atTerminal ? LAYOVER_MINUTES - phase : 0;

  return {
    ...base,
    status: atTerminal ? 'AT_TERMINAL' : 'IN_SERVICE',
    position,
    locationText: locationText(position, atTerminal),
    nextStopId: next?.stopId ?? null,
    nextStopName: next ? stopName(next.stopId) : null,
    etaMinutes: next ? waitToDepart + next.minutesFromStart - minute + bus.delayMinutes : null,
  };
}

export function listBuses(tick = 0): BusView[] {
  return data().buses.map((bus) => toBusView(bus, tick));
}

export function getBus(id: string, tick = 0): BusView {
  const bus = data().buses.find((candidate) => candidate.id === id);
  if (!bus) throw notFoundError('El bus', id);
  return toBusView(bus, tick);
}
