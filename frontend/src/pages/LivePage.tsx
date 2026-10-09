import { RefreshCw, RotateCcw } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { ApiErrorState } from '../components/feedback/ApiErrorState.tsx';
import { EmptyState } from '../components/feedback/EmptyState.tsx';
import { LoadingState } from '../components/feedback/LoadingState.tsx';
import { SelectField } from '../components/form/SelectField.tsx';
import { ArrivalsCard } from '../components/live/ArrivalsCard.tsx';
import { BusCard } from '../components/live/BusCard.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { PageHeader } from '../components/ui/PageHeader.tsx';
import { useQuery } from '../hooks/useQuery.ts';
import { fetchBuses, fetchStops } from '../services/transitService.ts';
import { pluralize } from '../utils/format.ts';

const MAX_TICK = 1440;

function parseTick(value: string | null): number {
  const tick = Number(value ?? 0);
  return Number.isInteger(tick) && tick >= 0 && tick <= MAX_TICK ? tick : 0;
}

/**
 * Deterministic "real time": `?tick=N` is the simulated minute. "Actualizar" asks for
 * the next tick, so every student sees exactly the same data after the same clicks.
 */
export function LivePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tick = parseTick(searchParams.get('tick'));
  const routeFilter = searchParams.get('route') ?? '';
  const arrivalsStopId = searchParams.get('stop') ?? '';

  const busesQuery = useQuery(`buses:${tick}`, () => fetchBuses(tick));
  const stopsQuery = useQuery('stops', () => fetchStops());

  const setParams = (changes: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setSearchParams(next);
  };

  const refresh = () => setParams({ tick: String(Math.min(tick + 1, MAX_TICK)) });

  const buses = busesQuery.status === 'success' ? busesQuery.data : [];
  const routeIds = [...new Set(buses.map((bus) => bus.routeId))].sort();
  const visibleBuses = routeFilter ? buses.filter((bus) => bus.routeId === routeFilter) : buses;
  const clock = buses[0];

  return (
    <div className="space-y-6" data-testid="page-live">
      <PageHeader title="Tiempo real" description="Ubicación simulada de los buses, tiempos estimados de llegada y retrasos." />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div aria-live="polite" data-testid="live-status" data-state={busesQuery.status} data-tick={tick}>
            <p className="text-lg font-bold text-slate-900" data-testid="live-clock">
              Hora simulada: {clock ? clock.lastUpdateTime : '—'}
            </p>
            <p className="text-sm text-slate-600" data-testid="live-tick">
              Actualización n.º {tick}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={refresh} isLoading={busesQuery.status === 'loading'} loadingText="Actualizando…" disabled={tick >= MAX_TICK} data-testid="btn-refresh">
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Actualizar
            </Button>
            <Button variant="secondary" onClick={() => setParams({ tick: '' })} disabled={tick === 0} data-testid="btn-reset-simulation">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reiniciar
            </Button>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-600">
          Simulación determinista: cada actualización avanza un minuto. No hay datos reales ni actualización automática.
        </p>
      </Card>

      <section aria-labelledby="buses-heading" aria-busy={busesQuery.status === 'loading'}>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-4">
          <h2 id="buses-heading" className="text-lg font-semibold text-slate-900">
            Buses
          </h2>
          <div className="w-full max-w-xs">
            <SelectField
              id="live-route"
              testId="input-live-route"
              label="Filtrar por ruta"
              placeholder="Todas las rutas"
              options={routeIds.map((id) => ({ value: id, label: `Ruta ${id}` }))}
              value={routeFilter}
              onChange={(event) => setParams({ route: event.target.value })}
            />
          </div>
        </div>

        {busesQuery.status === 'loading' && <LoadingState message="Actualizando información de buses…" />}
        {busesQuery.status === 'error' && <ApiErrorState error={busesQuery.error} onRetry={busesQuery.reload} />}
        {busesQuery.status === 'success' && visibleBuses.length === 0 && (
          <EmptyState testId="buses-empty" title="No hay buses para mostrar" description="No hay buses registrados para el filtro seleccionado." />
        )}
        {busesQuery.status === 'success' && visibleBuses.length > 0 && (
          <div data-testid="buses-list" data-count={visibleBuses.length}>
            <p className="mb-3 text-sm text-slate-700" data-testid="buses-count">
              {pluralize(visibleBuses.length, 'bus', 'buses')}
            </p>
            <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleBuses.map((bus) => (
                <li key={bus.id}>
                  <BusCard bus={bus} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {stopsQuery.status === 'success' && (
        <ArrivalsCard
          key={arrivalsStopId}
          stops={stopsQuery.data}
          stopId={arrivalsStopId}
          tick={tick}
          onStopChange={(stopId) => setParams({ stop: stopId })}
        />
      )}
      {stopsQuery.status === 'error' && <ApiErrorState error={stopsQuery.error} onRetry={stopsQuery.reload} scope="arrivals" />}
    </div>
  );
}
