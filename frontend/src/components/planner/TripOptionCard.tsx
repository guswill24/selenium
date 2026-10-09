import { CircleCheck, Clock, MapPin, Repeat } from 'lucide-react';
import { Fragment } from 'react';
import { Link } from 'react-router';
import type { TripOption, TripTag } from '../../types/transit.ts';
import { cn } from '../../utils/cn.ts';
import { formatMinutes, pluralize } from '../../utils/format.ts';
import { Badge, type BadgeTone } from '../ui/Badge.tsx';
import { Button } from '../ui/Button.tsx';

const tagDisplay: Record<TripTag, { label: string; tone: BadgeTone }> = {
  FASTEST: { label: 'Más rápida', tone: 'info' },
  DIRECT: { label: 'Directa', tone: 'neutral' },
  FEWEST_TRANSFERS: { label: 'Menos transbordos', tone: 'neutral' },
};

function transfersLabel(transfers: number): string {
  return transfers === 0 ? 'Sin transbordos' : pluralize(transfers, 'transbordo', 'transbordos');
}

interface TripOptionCardProps {
  option: TripOption;
  transferWaitMinutes: number;
  mapHref: string;
  isChosen: boolean;
  onChoose: (option: TripOption) => void;
}

export function TripOptionCard({ option, transferWaitMinutes, mapHref, isChosen, onChoose }: TripOptionCardProps) {
  const id = option.id;

  return (
    <article
      className={cn(
        'space-y-4 rounded-2xl border bg-white p-5 shadow-sm',
        option.recommended ? 'border-brand-600 ring-2 ring-brand-600/30' : 'border-slate-200',
      )}
      data-testid={`trip-option-${id}`}
      data-option-id={id}
      data-recommended={option.recommended}
      data-total-minutes={option.totalMinutes}
      data-transfers={option.transfers}
      aria-labelledby={`trip-routes-${id}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 id={`trip-routes-${id}`} className="text-lg font-bold text-slate-900" data-testid={`trip-routes-${id}`}>
          {option.legs.map((leg) => `Ruta ${leg.routeId}`).join(' → ')}
        </h3>
        <div className="flex flex-wrap gap-2">
          {option.recommended && (
            <Badge tone="success" data-testid={`trip-recommended-badge-${id}`}>
              Recomendada
            </Badge>
          )}
          {option.tags.map((tag) => (
            <Badge key={tag} tone={tagDisplay[tag].tone} data-testid={`trip-tag-${id}-${tag}`}>
              {tagDisplay[tag].label}
            </Badge>
          ))}
        </div>
      </div>

      <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-800">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-brand-700" aria-hidden="true" />
          <dt className="sr-only">Tiempo estimado</dt>
          <dd data-testid={`trip-time-${id}`} data-minutes={option.totalMinutes}>
            Tiempo estimado: {formatMinutes(option.totalMinutes)}
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-brand-700" aria-hidden="true" />
          <dt className="sr-only">Paradas</dt>
          <dd data-testid={`trip-stops-${id}`} data-stop-count={option.totalStops}>
            {pluralize(option.totalStops, 'parada', 'paradas')}
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <Repeat className="h-4 w-4 text-brand-700" aria-hidden="true" />
          <dt className="sr-only">Transbordos</dt>
          <dd data-testid={`trip-transfers-${id}`} data-transfers={option.transfers}>
            {transfersLabel(option.transfers)}
          </dd>
        </div>
      </dl>

      {option.transfers > 0 && (
        <p className="text-xs text-slate-600" data-testid={`trip-breakdown-${id}`}>
          {formatMinutes(option.travelMinutes)} de viaje + {formatMinutes(option.waitingMinutes)} de espera simulada
        </p>
      )}

      <ol className="space-y-2 border-l-2 border-slate-200 pl-4" data-testid={`trip-legs-${id}`} aria-label="Tramos del recorrido">
        {option.legs.map((leg, index) => (
          <Fragment key={`${leg.routeId}-${leg.fromStopId}`}>
            {index > 0 && (
              <li
                className="flex items-center gap-2 text-sm font-medium text-amber-900"
                data-testid={`trip-transfer-${id}-${leg.fromStopId}`}
              >
                <Repeat className="h-4 w-4" aria-hidden="true" />
                Transbordo en {leg.fromName} · espera estimada {formatMinutes(transferWaitMinutes)}
              </li>
            )}
            <li className="text-sm" data-testid={`trip-leg-${id}-${leg.routeId}`}>
              <p className="flex items-center gap-2 font-semibold text-slate-900">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: leg.color }} aria-hidden="true" />
                <span data-testid={`trip-leg-title-${id}-${leg.routeId}`}>
                  Ruta {leg.routeId}: {leg.fromName} → {leg.toName}
                </span>
              </p>
              <p className="text-slate-600" data-testid={`trip-leg-detail-${id}-${leg.routeId}`}>
                {formatMinutes(leg.minutes)} · {pluralize(leg.stopCount, 'parada', 'paradas')}
              </p>
            </li>
          </Fragment>
        ))}
      </ol>

      <div className="flex flex-wrap gap-3">
        <Button
          variant={isChosen ? 'primary' : 'secondary'}
          onClick={() => onChoose(option)}
          aria-pressed={isChosen}
          data-testid={`btn-choose-trip-${id}`}
        >
          {isChosen && <CircleCheck className="h-4 w-4" aria-hidden="true" />}
          {isChosen ? 'Opción elegida' : 'Elegir esta opción'}
        </Button>
        <Link
          to={mapHref}
          className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          data-testid={`link-trip-map-${id}`}
        >
          Ver en el mapa
        </Link>
      </div>
    </article>
  );
}
