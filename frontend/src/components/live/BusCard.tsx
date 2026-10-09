import { CircleCheck, Clock, MapPin, Navigation, TriangleAlert } from 'lucide-react';
import { Link } from 'react-router';
import type { Bus } from '../../types/transit.ts';
import { busLabel, formatMinutes } from '../../utils/format.ts';
import { BusStatusBadge } from '../transit/StatusBadges.tsx';

interface BusCardProps {
  bus: Bus;
}

export function BusCard({ bus }: BusCardProps) {
  const id = bus.id;
  const running = bus.status !== 'OUT_OF_SERVICE';

  return (
    <article
      className="flex h-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      data-testid={`bus-card-${id}`}
      data-bus-id={id}
      data-route-id={bus.routeId}
      data-status={bus.status}
      aria-labelledby={`bus-name-${id}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 id={`bus-name-${id}`} className="text-lg font-bold text-slate-900" data-testid={`bus-name-${id}`}>
            {busLabel(id)}
          </h3>
          <p className="text-xs text-slate-600">
            Placa <span data-testid={`bus-plate-${id}`}>{bus.plate}</span>
          </p>
        </div>
        <BusStatusBadge status={bus.status} testId={`bus-status-${id}`} />
      </div>

      <p className="font-medium text-slate-900" data-testid={`bus-route-${id}`}>
        Ruta {bus.routeId} · {bus.routeName}
      </p>

      <dl className="space-y-2 text-sm text-slate-800">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" aria-hidden="true" />
          <dt className="sr-only">Ubicación simulada</dt>
          <dd data-testid={`bus-location-${id}`}>{bus.locationText}</dd>
        </div>
        <div className="flex items-start gap-2">
          <Navigation className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" aria-hidden="true" />
          <dt className="sr-only">Próximo paradero</dt>
          <dd data-testid={`bus-next-stop-${id}`} data-stop-id={bus.nextStopId ?? ''}>
            Próximo paradero: {bus.nextStopName ?? 'No disponible'}
          </dd>
        </div>
        <div className="flex items-start gap-2">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" aria-hidden="true" />
          <dt className="sr-only">Tiempo estimado de llegada</dt>
          <dd className="font-semibold" data-testid={`bus-eta-${id}`} data-minutes={bus.etaMinutes ?? ''}>
            ETA: {bus.etaMinutes === null ? 'No disponible' : formatMinutes(bus.etaMinutes)}
          </dd>
        </div>
        <div className="flex items-start gap-2">
          {bus.delayMinutes > 0 ? (
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
          ) : (
            <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" aria-hidden="true" />
          )}
          <dt className="sr-only">Retraso</dt>
          <dd data-testid={`bus-delay-${id}`} data-delay={bus.delayMinutes}>
            {bus.delayMinutes > 0 ? `Retraso: ${formatMinutes(bus.delayMinutes)}` : 'Sin retraso'}
          </dd>
        </div>
      </dl>

      <p className="text-xs text-slate-600" data-testid={`bus-updated-${id}`} data-timestamp={bus.lastUpdate}>
        Última actualización: {bus.lastUpdateTime}
      </p>

      {running && (
        <Link
          to={`/map?route=${bus.routeId}&tick=${bus.tick}`}
          className="mt-auto inline-flex min-h-6 items-center text-sm font-semibold text-brand-800 underline-offset-2 hover:underline"
          data-testid={`link-bus-map-${id}`}
        >
          Ver en el mapa
        </Link>
      )}
    </article>
  );
}
