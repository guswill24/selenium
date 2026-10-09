import { data } from '../scenario/context.js';
import type { Route } from '../data/schemas.js';
import { notFoundError } from '../utils/httpError.js';

export interface RouteStopView {
  stopId: string;
  name: string;
  minutesFromStart: number;
}

export interface RouteView extends Omit<Route, 'stops'> {
  stops: RouteStopView[];
  stopCount: number;
}

function stopName(stopId: string): string {
  // Integrity validation guarantees every referenced stop exists.
  return data().stops.find((stop) => stop.id === stopId)?.name ?? stopId;
}

function toRouteView(route: Route): RouteView {
  return {
    ...route,
    stops: route.stops.map((routeStop) => ({ ...routeStop, name: stopName(routeStop.stopId) })),
    stopCount: route.stops.length,
  };
}

export function listRoutes(): RouteView[] {
  return data().routes.map(toRouteView);
}

export function getRoute(id: string): RouteView {
  const route = data().routes.find((candidate) => candidate.id === id);
  if (!route) throw notFoundError('La ruta', id);
  return toRouteView(route);
}
