import { useSearchParams } from 'react-router';
import { ApiErrorState } from '../components/feedback/ApiErrorState.tsx';
import { EmptyState } from '../components/feedback/EmptyState.tsx';
import { LoadingState } from '../components/feedback/LoadingState.tsx';
import { NearbyStopsCard } from '../components/stops/NearbyStopsCard.tsx';
import { StopCard } from '../components/stops/StopCard.tsx';
import { StopDetailPanel } from '../components/stops/StopDetailPanel.tsx';
import { StopSearchForm } from '../components/stops/StopSearchForm.tsx';
import { Card } from '../components/ui/Card.tsx';
import { PageHeader } from '../components/ui/PageHeader.tsx';
import { useQuery } from '../hooks/useQuery.ts';
import { fetchStops, type StopFilters } from '../services/transitService.ts';
import type { StopStatus } from '../types/transit.ts';
import { pluralize } from '../utils/format.ts';

const STOP_STATUSES: StopStatus[] = ['ACTIVE', 'MAINTENANCE', 'CLOSED'];

function parseStatus(value: string | null): StopStatus | '' {
  return STOP_STATUSES.find((status) => status === value) ?? '';
}

/** State in the URL: `?q=centro&status=ACTIVE&selected=S03&near=P02`. */
export function StopsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const status = parseStatus(searchParams.get('status'));
  const selectedId = searchParams.get('selected') ?? '';
  const nearPlaceId = searchParams.get('near') ?? '';

  const stopsQuery = useQuery(`stops:${q}:${status}`, () => fetchStops({ q, status }));

  const updateParams = (changes: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setSearchParams(next);
  };

  const search = (filters: Required<StopFilters>) => {
    if (filters.q === q && filters.status === status) stopsQuery.reload();
    else updateParams({ q: filters.q, status: filters.status, selected: '' });
  };

  const viewStop = (stopId: string) => {
    updateParams({ selected: stopId });
    // Bring the detail into view on small screens, where it renders below the list.
    requestAnimationFrame(() => document.querySelector('[data-testid="stop-detail"]')?.scrollIntoView({ block: 'start' }));
  };

  const hasFilters = Boolean(q || status);

  return (
    <div className="space-y-6" data-testid="page-stops">
      <PageHeader title="Paraderos" description="Consulta paraderos, su ubicación, estado y rutas asociadas." />

      <Card title="Buscar paradero">
        <StopSearchForm
          key={`${q}:${status}`}
          initialFilters={{ q, status }}
          isSearching={stopsQuery.status === 'loading'}
          onSearch={search}
          onClear={() => setSearchParams({})}
        />
      </Card>

      {selectedId && <StopDetailPanel key={selectedId} stopId={selectedId} onClose={() => updateParams({ selected: '' })} />}

      <section aria-labelledby="stops-heading" aria-live="polite" aria-busy={stopsQuery.status === 'loading'}>
        <h2 id="stops-heading" className="sr-only">
          Listado de paraderos
        </h2>
        {stopsQuery.status === 'loading' && <LoadingState message="Cargando paraderos…" />}
        {stopsQuery.status === 'error' && <ApiErrorState error={stopsQuery.error} onRetry={stopsQuery.reload} />}
        {stopsQuery.status === 'success' && stopsQuery.data.length === 0 && (
          <EmptyState
            testId="no-results"
            title="No se encontraron paraderos"
            description={hasFilters ? 'Ningún paradero coincide con los filtros aplicados. Prueba con otro término.' : 'No hay paraderos registrados.'}
          />
        )}
        {stopsQuery.status === 'success' && stopsQuery.data.length > 0 && (
          <div className="space-y-4" data-testid="stops-list" data-count={stopsQuery.data.length}>
            <p className="font-medium text-slate-800" data-testid="stops-count">
              {pluralize(stopsQuery.data.length, 'paradero encontrado', 'paraderos encontrados')}
            </p>
            <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {stopsQuery.data.map((stop) => (
                <li key={stop.id}>
                  <StopCard stop={stop} isSelected={stop.id === selectedId} onSelect={viewStop} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <NearbyStopsCard
        key={nearPlaceId}
        placeId={nearPlaceId}
        onPlaceChange={(placeId) => updateParams({ near: placeId })}
        onViewStop={viewStop}
      />
    </div>
  );
}
