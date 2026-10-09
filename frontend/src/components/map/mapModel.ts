import type { Bus, Route, Stop, TripPlan } from '../../types/transit.ts';
import { formatMinutes, pluralize } from '../../utils/format.ts';

export type MapMode = 'overview' | 'route' | 'itinerary';
export type StopRole = 'origin' | 'destination' | 'transfer' | 'path' | 'idle';
export type PathEmphasis = 'focus' | 'normal' | 'muted';

export interface Point {
  x: number;
  y: number;
}

export interface MapPath {
  key: string;
  routeId: string;
  color: string;
  points: Point[];
  emphasis: PathEmphasis;
  dashed: boolean;
}

export interface MapNotice {
  testId: string;
  message: string;
}

export interface MapView {
  mode: MapMode;
  paths: MapPath[];
  stopRoles: Record<string, StopRole>;
  /** Ordered stops of the highlighted trip (empty in overview). Used by the text alternative. */
  pathStopIds: string[];
  visibleBuses: Bus[];
  summary: string;
  notice: MapNotice | null;
}

export interface MapRequest {
  routeId: string;
  origin: string;
  destination: string;
  optionId: string;
}

interface MapData {
  stops: Stop[];
  routes: Route[];
  buses: Bus[];
  plan: TripPlan | null;
}

function pointsFor(stopIds: string[], stops: Stop[]): Point[] {
  return stopIds.flatMap((id) => {
    const stop = stops.find((candidate) => candidate.id === id);
    return stop ? [stop.coords] : [];
  });
}

function routePath(route: Route, stops: Stop[], emphasis: PathEmphasis, stopIds = route.stops.map((stop) => stop.stopId)): MapPath {
  return {
    key: `${route.id}-${emphasis}-${stopIds[0] ?? ''}`,
    routeId: route.id,
    color: route.color,
    points: pointsFor(stopIds, stops),
    emphasis,
    dashed: !route.active,
  };
}

function stopName(stops: Stop[], id: string): string {
  return stops.find((stop) => stop.id === id)?.name ?? id;
}

function positionedBuses(buses: Bus[], routeIds?: string[]): Bus[] {
  return buses.filter((bus) => bus.position && (!routeIds || routeIds.includes(bus.routeId)));
}

function contextPaths(routes: Route[], stops: Stop[], exclude: string[]): MapPath[] {
  return routes.filter((route) => route.active && !exclude.includes(route.id)).map((route) => routePath(route, stops, 'muted'));
}

function overview({ stops, routes, buses }: MapData, notice: MapNotice | null = null): MapView {
  const active = routes.filter((route) => route.active);
  const visibleBuses = positionedBuses(buses);
  return {
    mode: 'overview',
    paths: active.map((route) => routePath(route, stops, 'normal')),
    stopRoles: {},
    pathStopIds: [],
    visibleBuses,
    summary: `Vista general: ${pluralize(active.length, 'ruta activa', 'rutas activas')}, ${pluralize(stops.length, 'paradero', 'paraderos')} y ${pluralize(visibleBuses.length, 'bus en servicio', 'buses en servicio')}.`,
    notice,
  };
}

function routeView(data: MapData, route: Route, origin: string, destination: string): MapView {
  const { stops, routes, buses } = data;
  const ids = route.stops.map((stop) => stop.stopId);
  const from = ids.indexOf(origin);
  const to = ids.indexOf(destination);
  const hasSegment = from >= 0 && to > from;
  const segmentIds = hasSegment ? ids.slice(from, to + 1) : ids;

  const paths = [
    ...contextPaths(routes, stops, [route.id]),
    ...(hasSegment ? [routePath(route, stops, 'muted')] : []),
    routePath(route, stops, 'focus', segmentIds),
  ];
  const first = segmentIds[0] ?? '';
  const last = segmentIds.at(-1) ?? '';
  const stopRoles: Record<string, StopRole> = Object.fromEntries(segmentIds.map((id) => [id, 'path' as StopRole]));
  stopRoles[first] = 'origin';
  stopRoles[last] = 'destination';

  const minutes =
    (route.stops.find((stop) => stop.stopId === last)?.minutesFromStart ?? 0) -
    (route.stops.find((stop) => stop.stopId === first)?.minutesFromStart ?? 0);

  return {
    mode: 'route',
    paths,
    stopRoles,
    pathStopIds: segmentIds,
    visibleBuses: positionedBuses(buses, [route.id]),
    summary: `Ruta ${route.id}${route.active ? '' : ' (suspendida)'}: ${stopName(stops, first)} → ${stopName(stops, last)} · ${formatMinutes(minutes)} · ${pluralize(segmentIds.length, 'paradero', 'paraderos')}.`,
    notice: null,
  };
}

function itineraryView(data: MapData, plan: TripPlan, optionId: string): MapView {
  const { stops, routes, buses } = data;
  const requested = plan.options.find((option) => option.id === optionId);
  const option = requested ?? plan.options[0];
  if (!option) {
    return {
      ...overview(data),
      notice: { testId: 'map-no-itinerary', message: `No hay recorridos disponibles desde ${plan.origin.name} hacia ${plan.destination.name}.` },
    };
  }

  const legRouteIds = option.legs.map((leg) => leg.routeId);
  const legPaths: MapPath[] = option.legs.map((leg) => ({
    key: `${leg.routeId}-leg-${leg.fromStopId}`,
    routeId: leg.routeId,
    color: leg.color,
    points: pointsFor(leg.stops.map((stop) => stop.stopId), stops),
    emphasis: 'focus',
    dashed: false,
  }));
  const pathStopIds = option.legs.flatMap((leg, index) => (index === 0 ? leg.stops : leg.stops.slice(1)).map((stop) => stop.stopId));
  const stopRoles: Record<string, StopRole> = Object.fromEntries(pathStopIds.map((id) => [id, 'path' as StopRole]));
  for (const transfer of option.transferStops) stopRoles[transfer.stopId] = 'transfer';
  stopRoles[plan.origin.stopId] = 'origin';
  stopRoles[plan.destination.stopId] = 'destination';

  const transfers = option.transferStops.length
    ? ` · Transbordo en ${option.transferStops.map((stop) => stop.name).join(' y ')}`
    : ' · Sin transbordos';

  return {
    mode: 'itinerary',
    paths: [...contextPaths(routes, stops, legRouteIds), ...legPaths],
    stopRoles,
    pathStopIds,
    visibleBuses: positionedBuses(buses, legRouteIds),
    summary: `Recorrido ${legRouteIds.join(' → ')}: ${plan.origin.name} → ${plan.destination.name} · ${formatMinutes(option.totalMinutes)}${transfers}.`,
    notice: requested || !optionId ? null : { testId: 'map-option-not-found', message: `La opción ${optionId} no existe; se muestra la recomendada.` },
  };
}

/** Decides what the map highlights from the URL request. Pure: same input, same view. */
export function buildMapView(request: MapRequest, data: MapData): MapView {
  if (data.plan) return itineraryView(data, data.plan, request.optionId);

  if (request.routeId) {
    const route = data.routes.find((candidate) => candidate.id === request.routeId.toUpperCase());
    return route
      ? routeView(data, route, request.origin, request.destination)
      : overview(data, { testId: 'map-route-not-found', message: `La ruta ${request.routeId} no existe; se muestra la vista general.` });
  }

  return overview(data);
}
