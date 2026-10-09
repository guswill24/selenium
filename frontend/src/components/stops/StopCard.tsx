import { MapPin } from 'lucide-react';
import type { Stop } from '../../types/transit.ts';
import { cn } from '../../utils/cn.ts';
import { StopStatusBadge } from '../transit/StatusBadges.tsx';
import { Button } from '../ui/Button.tsx';
import { AccessibilityLabel } from './Accessibility.tsx';

interface StopCardProps {
  stop: Stop;
  isSelected: boolean;
  onSelect: (stopId: string) => void;
}

export function StopCard({ stop, isSelected, onSelect }: StopCardProps) {
  const id = stop.id;

  return (
    <article
      className={cn(
        'flex h-full flex-col gap-3 rounded-2xl border bg-white p-5 shadow-sm',
        isSelected ? 'border-brand-600 ring-2 ring-brand-600/30' : 'border-slate-200',
      )}
      data-testid={`stop-card-${id}`}
      data-stop-id={id}
      data-selected={isSelected}
      aria-labelledby={`stop-name-${id}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 id={`stop-name-${id}`} className="text-lg font-bold text-slate-900" data-testid={`stop-name-${id}`}>
          {stop.name}
        </h3>
        <StopStatusBadge status={stop.status} testId={`stop-status-${id}`} />
      </div>
      <p className="text-sm text-slate-600">
        Código <span data-testid={`stop-code-${id}`}>{id}</span> · Zona {stop.zone}
      </p>
      <p className="flex items-start gap-2 text-sm text-slate-800" data-testid={`stop-address-${id}`}>
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" aria-hidden="true" />
        {stop.address}
      </p>
      <AccessibilityLabel accessible={stop.accessible} testId={`stop-accessible-${id}`} />
      <div>
        <p className="text-xs font-semibold text-slate-600 uppercase">Rutas</p>
        {stop.routeIds.length > 0 ? (
          <ul className="mt-1 flex flex-wrap gap-2" data-testid={`stop-routes-${id}`}>
            {stop.routeIds.map((routeId) => (
              <li
                key={routeId}
                className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-800"
                data-testid={`stop-route-${id}-${routeId}`}
              >
                {routeId}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-slate-600" data-testid={`stop-routes-${id}`}>
            Sin rutas asociadas
          </p>
        )}
      </div>
      <Button
        variant={isSelected ? 'primary' : 'secondary'}
        className="mt-auto"
        onClick={() => onSelect(id)}
        aria-pressed={isSelected}
        data-testid={`btn-view-stop-${id}`}
      >
        {isSelected ? 'Viendo detalle' : 'Ver detalle'}
      </Button>
    </article>
  );
}
