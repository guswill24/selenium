import { Search } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { ApiErrorState } from '../components/feedback/ApiErrorState.tsx';
import { Notice } from '../components/feedback/Notice.tsx';
import { EmptyState } from '../components/feedback/EmptyState.tsx';
import { LoadingState } from '../components/feedback/LoadingState.tsx';
import { RouteDetail } from '../components/routes/RouteDetail.tsx';
import { RouteResultCard } from '../components/routes/RouteResultCard.tsx';
import { RoutesTable } from '../components/routes/RoutesTable.tsx';
import { StopPairForm, type TripQuery } from '../components/transit/StopPairForm.tsx';
import { Card } from '../components/ui/Card.tsx';
import { PageHeader } from '../components/ui/PageHeader.tsx';
import { useQuery } from '../hooks/useQuery.ts';
import { useRecordHistory } from '../hooks/useRecordHistory.ts';
import { fetchRoutes, fetchStops, searchRoutes } from '../services/transitService.ts';
import type { RouteSearchResult, Stop } from '../types/transit.ts';
import { pluralize } from '../utils/format.ts';

function stopLabel(stops: Stop[], id: string): string {
  return stops.find((stop) => stop.id === id)?.name ?? id;
}

/**
 * Search state lives in the URL (`?origin=S01&destination=S03&selected=R12`),
 * so any result can be opened directly, reloaded or shared as test evidence.
 */
export function RoutesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const origin = searchParams.get('origin') ?? '';
  const destination = searchParams.get('destination') ?? '';
  const selectedId = searchParams.get('selected');
  const hasSearch = Boolean(origin && destination);

  const stopsQuery = useQuery('stops', () => fetchStops());
  const routesQuery = useQuery('routes', fetchRoutes);
  const searchQuery = useQuery(hasSearch ? `search:${origin}:${destination}` : null, () => searchRoutes(origin, destination));

  const recordHistory = useRecordHistory();
  // Only set right after the user selects a route, so the notice never describes an older action.
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);

  const runSearch = ({ origin: from, destination: to }: TripQuery) => {
    setSavedEntryId(null);
    if (from === origin && to === destination) {
      searchQuery.reload();
      return;
    }
    setSearchParams({ origin: from, destination: to });
  };

  // Selecting a route (F07) is the explicit action that records a consultation in the history (F13).
  const selectRoute = (routeId: string) => {
    setSearchParams({ origin, destination, selected: routeId }, { replace: true });
    const result = searchQuery.status === 'success' ? searchQuery.data.find((item) => item.routeId === routeId) : undefined;
    if (!result) return;
    const entry = recordHistory({
      originStopId: result.originStopId,
      originName: result.originName,
      destinationStopId: result.destinationStopId,
      destinationName: result.destinationName,
      routeId: result.routeId,
      estimatedMinutes: result.estimatedMinutes,
      source: 'ROUTES',
    });
    setSavedEntryId(entry?.id ?? null);
  };

  const stops = stopsQuery.status === 'success' ? stopsQuery.data : [];
  const results: RouteSearchResult[] = searchQuery.status === 'success' ? searchQuery.data : [];
  const selected = results.find((result) => result.routeId === selectedId);

  // One state at a time in the main flow: results only once the form (stops) is ready,
  // so the plain loading-indicator / server-error ids are unique on the page.
  const formReady = stopsQuery.status === 'success';

  return (
    <div className="space-y-6" data-testid="page-routes">
      <PageHeader title="Rutas" description="Consulta las rutas directas entre dos paraderos." />

      <Card title="Buscar ruta">
        {stopsQuery.status === 'loading' && <LoadingState message="Cargando paraderos…" />}
        {stopsQuery.status === 'error' && <ApiErrorState error={stopsQuery.error} onRetry={stopsQuery.reload} />}
        {stopsQuery.status === 'success' && (
          <StopPairForm
            key={`${origin}:${destination}`}
            stops={stops}
            initialQuery={{ origin, destination }}
            isSubmitting={formReady && searchQuery.status === 'loading'}
            onSubmit={runSearch}
            onClear={() => {
              setSavedEntryId(null);
              setSearchParams({});
            }}
            formLabel="Buscar ruta"
            formTestId="route-search-form"
            submitLabel="Buscar ruta"
            submitLoadingLabel="Buscando…"
            submitTestId="btn-search-route"
            submitIcon={Search}
            clearTestId="btn-clear-search"
          />
        )}
      </Card>

      <section aria-labelledby="results-heading" aria-live="polite" aria-busy={formReady && searchQuery.status === 'loading'}>
        <h2 id="results-heading" className="sr-only">
          Resultados de la búsqueda
        </h2>
        {formReady && searchQuery.status === 'loading' && <LoadingState message="Buscando rutas…" />}
        {formReady && searchQuery.status === 'error' && <ApiErrorState error={searchQuery.error} onRetry={searchQuery.reload} />}
        {formReady && searchQuery.status === 'success' && results.length === 0 && (
          <EmptyState
            testId="no-results"
            title="No se encontraron rutas"
            description={`No hay rutas directas desde ${stopLabel(stops, origin)} hacia ${stopLabel(stops, destination)}. Prueba con otro destino o usa el planificador para recorridos con transbordo.`}
          />
        )}
        {formReady && searchQuery.status === 'success' && results.length > 0 && (
          <div className="space-y-4" data-testid="route-results" data-state="success" data-count={results.length}>
            <p className="font-medium text-slate-800" data-testid="results-count">
              {pluralize(results.length, 'ruta encontrada', 'rutas encontradas')}
            </p>
            <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {results.map((result, index) => (
                <li key={result.routeId}>
                  <RouteResultCard
                    result={result}
                    isFastest={index === 0 && results.length > 1}
                    isSelected={result.routeId === selectedId}
                    onSelect={selectRoute}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {selected && savedEntryId && (
        <Notice tone="success" title="Consulta guardada en tu historial" testId="history-saved-notice">
          <span data-testid="history-saved-entry" data-entry-id={savedEntryId}>
            Puedes verla en la sección Historial.
          </span>
        </Notice>
      )}
      {selected && <RouteDetail result={selected} />}

      <Card title="Todas las rutas" data-testid="all-routes">
        {routesQuery.status === 'loading' && <LoadingState message="Cargando rutas…" scope="all-routes" />}
        {routesQuery.status === 'error' && <ApiErrorState error={routesQuery.error} onRetry={routesQuery.reload} scope="all-routes" />}
        {routesQuery.status === 'success' && routesQuery.data.length === 0 && (
          <EmptyState title="No hay rutas registradas" />
        )}
        {routesQuery.status === 'success' && routesQuery.data.length > 0 && <RoutesTable routes={routesQuery.data} />}
      </Card>
    </div>
  );
}
