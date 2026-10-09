import { data, isNoResults } from '../scenario/context.js';
import type { Alert } from '../data/schemas.js';
import { notFoundError } from '../utils/httpError.js';

export interface AlertView extends Alert {
  routeName: string | null;
}

export interface AlertFilters {
  level?: Alert['level'] | undefined;
  type?: Alert['type'] | undefined;
  routeId?: string | undefined;
}

const severity: Record<Alert['level'], number> = { CRITICAL: 0, WARNING: 1, INFO: 2, NORMAL: 3 };

function toAlertView(alert: Alert): AlertView {
  const route = alert.routeId ? data().routes.find((candidate) => candidate.id === alert.routeId) : undefined;
  return { ...alert, routeName: route?.name ?? null };
}

/** Active alerts matching the filters, most severe first, then most recent. Deterministic order. */
export function listActiveAlerts({ level, type, routeId }: AlertFilters = {}): AlertView[] {
  if ((level || type || routeId) && isNoResults()) return [];
  return data().alerts
    .filter(
      (alert) =>
        alert.active &&
        (!level || alert.level === level) &&
        (!type || alert.type === type) &&
        (!routeId || alert.routeId === routeId),
    )
    .toSorted(
      (a, b) => severity[a.level] - severity[b.level] || b.publishedAt.localeCompare(a.publishedAt) || a.id.localeCompare(b.id),
    )
    .map(toAlertView);
}

/** Every alert, active or not, in fixture order (administration view). */
export function listAllAlerts(): AlertView[] {
  return data().alerts.map(toAlertView);
}

/** Any alert by id, including inactive ones (their detail shows they ended). */
export function getAlert(id: string): AlertView {
  const alert = data().alerts.find((candidate) => candidate.id === id);
  if (!alert) throw notFoundError('La alerta', id);
  return toAlertView(alert);
}
