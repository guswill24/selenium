import { data, isNoResults } from '../scenario/context.js';
import type { PointOfInterest, Route, Stop } from '../data/schemas.js';
import { notFoundError } from '../utils/httpError.js';
import { normalizeText } from '../utils/text.js';

export interface StopView extends Stop {
  /** Routes (active or not) that stop here, in fixture order. */
  routeIds: string[];
}

export interface StopRouteView {
  id: string;
  name: string;
  status: Route['status'];
  active: boolean;
  /** Final stop of the route from this stop; null when this stop is the last one. */
  nextDestinationStopId: string | null;
}

export interface StopDetail extends StopView {
  routes: StopRouteView[];
  places: Pick<PointOfInterest, 'id' | 'name' | 'category'>[];
}

export interface StopFilters {
  q?: string | undefined;
  status?: Stop['status'] | undefined;
}

function routesThrough(stopId: string): Route[] {
  return data().routes.filter((route) => route.stops.some((routeStop) => routeStop.stopId === stopId));
}

function toStopView(stop: Stop): StopView {
  return { ...stop, routeIds: routesThrough(stop.id).map((route) => route.id) };
}

function matches(stop: Stop, query: string): boolean {
  return [stop.id, stop.name, stop.address, stop.zone].some((field) => normalizeText(field).includes(query));
}

/** Stops filtered by free text (id, name, address or zone; accent-insensitive) and status. */
export function listStops({ q, status }: StopFilters = {}): StopView[] {
  const query = q ? normalizeText(q) : '';
  // NO_RESULTS empties searches only; the unfiltered catalog (used by forms) stays available.
  if ((query || status) && isNoResults()) return [];
  return data().stops
    .filter((stop) => (!query || matches(stop, query)) && (!status || stop.status === status))
    .map(toStopView);
}

export function getStop(id: string): StopDetail {
  const stop = data().stops.find((candidate) => candidate.id === id);
  if (!stop) throw notFoundError('El paradero', id);

  const routes = routesThrough(stop.id).map((route) => {
    const last = route.stops.at(-1)?.stopId ?? null;
    return {
      id: route.id,
      name: route.name,
      status: route.status,
      active: route.active,
      nextDestinationStopId: last === stop.id ? null : last,
    };
  });
  const places = data().pointsOfInterest
    .filter((place) => place.nearStopId === stop.id)
    .map(({ id: placeId, name, category }) => ({ id: placeId, name, category }));

  return { ...toStopView(stop), routes, places };
}
