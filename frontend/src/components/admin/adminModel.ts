import type { AdminDemoState } from '../../services/adminStore.ts';
import type { AdminRoute } from '../../types/admin.ts';
import type { Alert, Bus, Route, Stop, StopStatus } from '../../types/transit.ts';

export type RowOrigin = 'server' | 'edited' | 'new';

export interface AdminRouteRow {
  route: AdminRoute;
  origin: RowOrigin;
}

function toAdminRoute(route: Route): AdminRoute {
  return {
    id: route.id,
    name: route.name,
    color: route.color,
    status: route.status,
    originStopId: route.originStopId,
    destinationStopId: route.destinationStopId,
    estimatedMinutes: route.estimatedMinutes,
    active: route.active,
    stops: route.stops.map(({ stopId, minutesFromStart }) => ({ stopId, minutesFromStart })),
  };
}

/** Server catalog + demo edits + demo-created routes, with activation overrides applied. */
export function mergeRoutes(serverRoutes: Route[], demo: AdminDemoState): AdminRouteRow[] {
  const rows: AdminRouteRow[] = serverRoutes.map((route) => {
    const edited = demo.routes[route.id];
    return { route: edited ?? toAdminRoute(route), origin: edited ? 'edited' : 'server' };
  });
  for (const id of demo.createdRouteIds) {
    const created = demo.routes[id];
    if (created) rows.push({ route: created, origin: 'new' });
  }
  return rows.map((row) => {
    const override = demo.active.routes[row.route.id];
    return override === undefined ? row : { ...row, route: { ...row.route, active: override } };
  });
}

export function effectiveStopStatus(stop: Stop, demo: AdminDemoState): StopStatus {
  const override = demo.active.stops[stop.id];
  if (override === undefined) return stop.status;
  return override ? 'ACTIVE' : 'MAINTENANCE';
}

export function isBusActive(bus: Bus, demo: AdminDemoState): boolean {
  return demo.active.buses[bus.id] ?? bus.status !== 'OUT_OF_SERVICE';
}

export function isAlertActive(alert: Alert, demo: AdminDemoState): boolean {
  return demo.active.alerts[alert.id] ?? alert.active;
}
