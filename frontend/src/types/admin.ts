import type { AlertLevel, RouteStatus } from './transit.ts';

export type AdminEntity = 'routes' | 'stops' | 'buses' | 'alerts';

/** Route as stored/edited by administration (same shape as a fixture route). */
export interface AdminRoute {
  id: string;
  name: string;
  color: string;
  status: RouteStatus;
  originStopId: string;
  destinationStopId: string;
  estimatedMinutes: number;
  active: boolean;
  stops: { stopId: string; minutesFromStart: number }[];
}

export type RouteInput = Pick<AdminRoute, 'id' | 'name' | 'color' | 'status' | 'stops'>;

export interface Schedule {
  routeId: string;
  routeName: string;
  dayType: 'WEEKDAY' | 'WEEKEND';
  firstDeparture: string;
  lastDeparture: string;
  frequencyMinutes: number;
}

export interface AdminSummary {
  routes: { total: number; active: number };
  stops: { total: number; inMaintenance: number };
  buses: { total: number; running: number; outOfService: number };
  alerts: { active: number; byLevel: Record<AlertLevel, number> };
  history: { seedEntries: number };
  users: { total: number; locked: number };
  serviceStatus: 'OPERATIONAL' | 'DEGRADED';
  punctuality: { running: number; onTime: number };
}
