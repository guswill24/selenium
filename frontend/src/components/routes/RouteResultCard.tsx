import { CircleCheck, Clock, MapPin } from 'lucide-react';
import type { RouteSearchResult } from '../../types/transit.ts';
import { cn } from '../../utils/cn.ts';
import { formatMinutes, pluralize } from '../../utils/format.ts';
import { RouteStatusBadge } from '../transit/StatusBadges.tsx';
import { Badge } from '../ui/Badge.tsx';
import { Button } from '../ui/Button.tsx';

interface RouteResultCardProps {
  result: RouteSearchResult;
  isFastest: boolean;
  isSelected: boolean;
  onSelect: (routeId: string) => void;
}

export function RouteResultCard({ result, isFastest, isSelected, onSelect }: RouteResultCardProps) {
  const id = result.routeId;

  return (
    <article
      className={cn(
        'flex h-full flex-col gap-4 rounded-2xl border bg-white p-5 shadow-sm',
        isSelected ? 'border-brand-600 ring-2 ring-brand-600/30' : 'border-slate-200',
      )}
      data-testid={`route-card-${id}`}
      data-route-id={id}
      data-selected={isSelected}
      aria-labelledby={`route-title-${id}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: result.color }} aria-hidden="true" />
          <h3 id={`route-title-${id}`} className="text-lg font-bold text-slate-900" data-testid={`route-title-${id}`}>
            Ruta {id}
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {isFastest && (
            <Badge tone="info" data-testid={`route-fastest-${id}`}>
              Más rápida
            </Badge>
          )}
          <RouteStatusBadge status={result.status} testId={`route-status-${id}`} />
        </div>
      </div>

      <p className="text-sm text-slate-600" data-testid={`route-name-${id}`}>
        {result.name}
      </p>

      <p className="font-medium text-slate-900" data-testid={`route-path-${id}`}>
        {result.originName} → {result.destinationName}
      </p>

      <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-brand-700" aria-hidden="true" />
          <dt className="sr-only">Tiempo estimado</dt>
          <dd data-testid={`route-time-${id}`} data-minutes={result.estimatedMinutes}>
            Tiempo estimado: {formatMinutes(result.estimatedMinutes)}
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-brand-700" aria-hidden="true" />
          <dt className="sr-only">Paraderos</dt>
          <dd data-testid={`route-stops-${id}`} data-stop-count={result.stopCount}>
            {pluralize(result.stopCount, 'paradero', 'paraderos')}
          </dd>
        </div>
      </dl>

      <Button
        variant={isSelected ? 'primary' : 'secondary'}
        className="mt-auto"
        onClick={() => onSelect(id)}
        aria-pressed={isSelected}
        data-testid={`btn-select-route-${id}`}
      >
        {isSelected && <CircleCheck className="h-4 w-4" aria-hidden="true" />}
        {isSelected ? 'Ruta seleccionada' : 'Seleccionar ruta'}
      </Button>
    </article>
  );
}
