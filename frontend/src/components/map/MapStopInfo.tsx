import { X } from 'lucide-react';
import { Link } from 'react-router';
import type { Stop } from '../../types/transit.ts';
import { AccessibilityLabel } from '../stops/Accessibility.tsx';
import { StopStatusBadge } from '../transit/StatusBadges.tsx';
import { Button } from '../ui/Button.tsx';

interface MapStopInfoProps {
  stop: Stop;
  roleLabel: string;
  onClose: () => void;
}

export function MapStopInfo({ stop, roleLabel, onClose }: MapStopInfoProps) {
  return (
    <section
      className="space-y-3 rounded-2xl border border-sky-200 bg-sky-50 p-5"
      aria-labelledby="map-stop-info-title"
      data-testid="map-stop-info"
      data-stop-id={stop.id}
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="map-stop-info-title" className="text-lg font-bold text-slate-900" data-testid="map-stop-info-name">
            {stop.name} ({stop.id})
          </h2>
          <StopStatusBadge status={stop.status} testId="map-stop-info-status" />
        </div>
        <Button variant="ghost" onClick={onClose} aria-label="Cerrar información del paradero" data-testid="btn-close-map-stop">
          <X className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>
      {roleLabel && (
        <p className="text-sm font-medium text-slate-800" data-testid="map-stop-info-role">
          {roleLabel}
        </p>
      )}
      <p className="text-sm text-slate-700" data-testid="map-stop-info-address">
        {stop.address}
      </p>
      <AccessibilityLabel accessible={stop.accessible} testId="map-stop-info-accessible" />
      <p className="text-sm text-slate-700" data-testid="map-stop-info-routes">
        Rutas: {stop.routeIds.length ? stop.routeIds.join(', ') : 'ninguna'}
      </p>
      <Link
        to={`/stops?selected=${stop.id}`}
        className="inline-flex min-h-6 items-center text-sm font-semibold text-brand-800 underline-offset-2 hover:underline"
        data-testid="link-map-stop-detail"
      >
        Ver detalle del paradero
      </Link>
    </section>
  );
}
