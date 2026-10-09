import type { BusStatus, RouteStatus, StopStatus } from '../../types/transit.ts';
import { Badge, type BadgeTone } from '../ui/Badge.tsx';

const routeStatus: Record<RouteStatus, { label: string; tone: BadgeTone }> = {
  ACTIVE: { label: 'Activa', tone: 'success' },
  DELAYED: { label: 'Con retraso', tone: 'warning' },
  CHANGED: { label: 'Modificada', tone: 'info' },
  SUSPENDED: { label: 'Suspendida', tone: 'danger' },
};

const stopStatus: Record<StopStatus, { label: string; tone: BadgeTone }> = {
  ACTIVE: { label: 'Operativo', tone: 'success' },
  MAINTENANCE: { label: 'En mantenimiento', tone: 'warning' },
  CLOSED: { label: 'Cerrado', tone: 'danger' },
};

const busStatus: Record<BusStatus, { label: string; tone: BadgeTone }> = {
  IN_SERVICE: { label: 'En recorrido', tone: 'success' },
  AT_TERMINAL: { label: 'En terminal', tone: 'info' },
  OUT_OF_SERVICE: { label: 'Fuera de servicio', tone: 'neutral' },
};

interface StatusBadgeProps<T> {
  status: T;
  testId: string;
}

/** Text label plus `data-status` with the raw value, so tests can assert either. */
export function RouteStatusBadge({ status, testId }: StatusBadgeProps<RouteStatus>) {
  const { label, tone } = routeStatus[status];
  return (
    <Badge tone={tone} data-testid={testId} data-status={status}>
      {label}
    </Badge>
  );
}

export function BusStatusBadge({ status, testId }: StatusBadgeProps<BusStatus>) {
  const { label, tone } = busStatus[status];
  return (
    <Badge tone={tone} data-testid={testId} data-status={status}>
      {label}
    </Badge>
  );
}

export function StopStatusBadge({ status, testId }: StatusBadgeProps<StopStatus>) {
  const { label, tone } = stopStatus[status];
  return (
    <Badge tone={tone} data-testid={testId} data-status={status}>
      {label}
    </Badge>
  );
}
