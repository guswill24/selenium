import { X } from 'lucide-react';
import { Link } from 'react-router';
import { useQuery } from '../../hooks/useQuery.ts';
import { fetchStop } from '../../services/transitService.ts';
import { ApiErrorState } from '../feedback/ApiErrorState.tsx';
import { LoadingState } from '../feedback/LoadingState.tsx';
import { RouteStatusBadge, StopStatusBadge } from '../transit/StatusBadges.tsx';
import { Button } from '../ui/Button.tsx';
import { Card } from '../ui/Card.tsx';
import { AccessibilityLabel } from './Accessibility.tsx';

const placeCategoryLabels: Record<string, string> = {
  PARK: 'Parque',
  CULTURE: 'Cultura',
  SHOPPING: 'Comercio',
  HEALTH: 'Salud',
  SPORTS: 'Deporte',
  EDUCATION: 'Educación',
};

interface StopDetailPanelProps {
  stopId: string;
  onClose: () => void;
}

export function StopDetailPanel({ stopId, onClose }: StopDetailPanelProps) {
  const query = useQuery(`stop:${stopId}`, () => fetchStop(stopId));

  return (
    <Card
      title="Detalle del paradero"
      data-testid="stop-detail"
      data-stop-id={stopId}
      data-state={query.status}
      actions={
        <Button variant="ghost" onClick={onClose} aria-label="Cerrar detalle del paradero" data-testid="btn-close-stop-detail">
          <X className="h-5 w-5" aria-hidden="true" />
        </Button>
      }
    >
      {query.status === 'loading' && <LoadingState message="Cargando paradero…" scope="stop-detail" />}
      {query.status === 'error' && <ApiErrorState error={query.error} onRetry={query.reload} scope="stop-detail" />}
      {query.status === 'success' && (
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-xl font-bold text-slate-900" data-testid="stop-detail-name">
                {query.data.name}
              </h3>
              <StopStatusBadge status={query.data.status} testId="stop-detail-status" />
            </div>
            <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
              <dt className="text-slate-600">Código</dt>
              <dd className="font-medium text-slate-900" data-testid="stop-detail-code">
                {query.data.id}
              </dd>
              <dt className="text-slate-600">Dirección</dt>
              <dd className="text-slate-900" data-testid="stop-detail-address">
                {query.data.address}
              </dd>
              <dt className="text-slate-600">Zona</dt>
              <dd className="text-slate-900" data-testid="stop-detail-zone">
                {query.data.zone}
              </dd>
              <dt className="text-slate-600">Accesibilidad</dt>
              <dd>
                <AccessibilityLabel accessible={query.data.accessible} testId="stop-detail-accessible" />
              </dd>
              <dt className="text-slate-600">Servicios</dt>
              <dd className="text-slate-900" data-testid="stop-detail-amenities">
                {query.data.amenities.length > 0 ? query.data.amenities.join(', ') : 'Sin servicios adicionales'}
              </dd>
            </dl>
          </div>

          <section aria-labelledby="stop-routes-heading">
            <h4 id="stop-routes-heading" className="mb-2 font-semibold text-slate-900">
              Rutas asociadas
            </h4>
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200" data-testid="stop-detail-routes">
              {query.data.routes.map((route) => (
                <li
                  key={route.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                  data-testid={`stop-detail-route-${route.id}`}
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">Ruta {route.id}</p>
                    <p className="text-sm text-slate-600">{route.name}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <RouteStatusBadge status={route.status} testId={`stop-detail-route-status-${route.id}`} />
                    {route.active && route.nextDestinationStopId && (
                      <Link
                        to={`/routes?origin=${query.data.id}&destination=${route.nextDestinationStopId}`}
                        className="rounded-lg px-2 py-1 text-sm font-semibold text-brand-800 underline-offset-2 hover:underline"
                        data-testid={`link-route-from-stop-${route.id}`}
                      >
                        Consultar ruta
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="stop-places-heading">
            <h4 id="stop-places-heading" className="mb-2 font-semibold text-slate-900">
              Lugares cercanos
            </h4>
            {query.data.places.length > 0 ? (
              <ul className="space-y-1 text-sm text-slate-800" data-testid="stop-detail-places">
                {query.data.places.map((place) => (
                  <li key={place.id} data-testid={`stop-detail-place-${place.id}`}>
                    {place.name} <span className="text-slate-600">({placeCategoryLabels[place.category] ?? place.category})</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-600" data-testid="stop-detail-places">
                No hay lugares registrados cerca de este paradero.
              </p>
            )}
          </section>
        </div>
      )}
    </Card>
  );
}
