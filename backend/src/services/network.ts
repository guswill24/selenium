import { data } from '../scenario/context.js';
import type { Route, Stop } from '../data/schemas.js';
import { HttpError, notFoundError } from '../utils/httpError.js';
import type { RouteStopView } from './routeService.js';

/** A contiguous piece of one route, from a boarding stop to an alighting stop. */
export interface RouteSegment {
  routeId: string;
  routeName: string;
  color: string;
  status: Route['status'];
  fromStopId: string;
  fromName: string;
  toStopId: string;
  toName: string;
  /** Travel time between both stops. */
  minutes: number;
  /** Stops in the segment, including both ends. */
  stopCount: number;
  stops: RouteStopView[];
}

export function stopName(id: string): string {
  return data().stops.find((stop) => stop.id === id)?.name ?? id;
}

export function requireStop(id: string): Stop {
  const stop = data().stops.find((candidate) => candidate.id === id);
  if (!stop) throw notFoundError('El paradero', id);
  return stop;
}

/** A route only serves (boards/alights at) stops that are ACTIVE. */
export function isServiceable(stopId: string): boolean {
  return data().stops.find((stop) => stop.id === stopId)?.status === 'ACTIVE';
}

export function activeRoutes(): Route[] {
  return data().routes.filter((route) => route.active);
}

export function segmentOf(route: Route, fromIndex: number, toIndex: number): RouteSegment {
  const stops = route.stops.slice(fromIndex, toIndex + 1);
  const first = stops[0];
  const last = stops.at(-1);
  if (!first || !last || toIndex <= fromIndex) throw new Error(`Invalid segment ${route.id}[${fromIndex}..${toIndex}]`);

  return {
    routeId: route.id,
    routeName: route.name,
    color: route.color,
    status: route.status,
    fromStopId: first.stopId,
    fromName: stopName(first.stopId),
    toStopId: last.stopId,
    toName: stopName(last.stopId),
    minutes: last.minutesFromStart - first.minutesFromStart,
    stopCount: stops.length,
    stops: stops.map((routeStop) => ({ ...routeStop, name: stopName(routeStop.stopId) })),
  };
}

/** Validates a trip request: both stops exist and differ. */
export function assertTripEndpoints(originId: string, destinationId: string): void {
  requireStop(originId);
  requireStop(destinationId);
  if (originId === destinationId) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Los datos enviados no son válidos.', [
      { field: 'destination', message: 'El origen y el destino deben ser diferentes.' },
    ]);
  }
}
