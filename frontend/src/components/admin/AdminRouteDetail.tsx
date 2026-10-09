import { X } from 'lucide-react';
import type { AdminRoute } from '../../types/admin.ts';
import { formatMinutes, pluralize } from '../../utils/format.ts';
import { RouteStatusBadge } from '../transit/StatusBadges.tsx';
import { Button } from '../ui/Button.tsx';
import { Card } from '../ui/Card.tsx';

interface AdminRouteDetailProps {
  route: AdminRoute;
  stopName: (id: string) => string;
  onClose: () => void;
}

export function AdminRouteDetail({ route, stopName, onClose }: AdminRouteDetailProps) {
  return (
    <Card
      title={`Ruta ${route.id}`}
      data-testid="admin-route-detail"
      data-route-id={route.id}
      actions={
        <Button variant="ghost" onClick={onClose} aria-label="Cerrar detalle de la ruta" data-testid="btn-close-admin-route">
          <X className="h-5 w-5" aria-hidden="true" />
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-semibold text-slate-900" data-testid="admin-route-detail-name">
            {route.name}
          </p>
          <RouteStatusBadge status={route.status} testId="admin-route-detail-status" />
          <span className="text-sm text-slate-700" data-testid="admin-route-detail-active">
            {route.active ? 'Activa' : 'Inactiva'}
          </span>
        </div>
        <p className="text-sm text-slate-700" data-testid="admin-route-detail-summary">
          {stopName(route.originStopId)} → {stopName(route.destinationStopId)} · {formatMinutes(route.estimatedMinutes)} ·{' '}
          {pluralize(route.stops.length, 'paradero', 'paraderos')}
        </p>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-800" data-testid="admin-route-detail-stops">
          {route.stops.map((stop) => (
            <li key={stop.stopId} data-testid={`admin-route-detail-stop-${stop.stopId}`}>
              {stopName(stop.stopId)} ({stop.stopId}) · minuto {stop.minutesFromStart}
            </li>
          ))}
        </ol>
      </div>
    </Card>
  );
}
