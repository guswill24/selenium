import { Link } from 'react-router';
import type { RouteSearchResult } from '../../types/transit.ts';
import { formatMinutes, pluralize } from '../../utils/format.ts';
import { Card } from '../ui/Card.tsx';

interface RouteDetailProps {
  result: RouteSearchResult;
}

/** Trip segment of the selected route, stop by stop, with minutes from the chosen origin. */
export function RouteDetail({ result }: RouteDetailProps) {
  const originMinute = result.stops[0]?.minutesFromStart ?? 0;

  return (
    <Card title={`Recorrido seleccionado: Ruta ${result.routeId}`} data-testid="route-detail" data-route-id={result.routeId}>
      <p className="text-sm text-slate-700" data-testid="route-detail-summary">
        {result.originName} → {result.destinationName} · {formatMinutes(result.estimatedMinutes)} ·{' '}
        {pluralize(result.stopCount, 'paradero', 'paraderos')}
      </p>
      <ol className="mt-4 space-y-0" data-testid="route-detail-stops" aria-label={`Paraderos de la ruta ${result.routeId}`}>
        {result.stops.map((stop, index) => {
          const isEndpoint = index === 0 || index === result.stops.length - 1;
          return (
            <li key={stop.stopId} className="relative flex gap-4 pb-5 last:pb-0" data-testid={`route-detail-stop-${stop.stopId}`}>
              {index < result.stops.length - 1 && (
                <span className="absolute top-4 left-[7px] h-full w-0.5" style={{ backgroundColor: result.color }} aria-hidden="true" />
              )}
              <span
                className="relative z-10 mt-1 h-4 w-4 shrink-0 rounded-full border-2 bg-white"
                style={{ borderColor: result.color, backgroundColor: isEndpoint ? result.color : undefined }}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="font-medium text-slate-900">
                  {stop.name} <span className="text-slate-500">({stop.stopId})</span>
                </p>
                <p className="text-sm text-slate-600">
                  {index === 0 ? 'Punto de partida' : `+${formatMinutes(stop.minutesFromStart - originMinute)}`}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
      <Link
        to={`/map?route=${result.routeId}&origin=${result.originStopId}&destination=${result.destinationStopId}`}
        className="mt-5 inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        data-testid="link-route-map"
      >
        Ver en el mapa
      </Link>
    </Card>
  );
}
