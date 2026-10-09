import { Clock } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useQuery } from '../../hooks/useQuery.ts';
import { fetchArrivals } from '../../services/transitService.ts';
import type { Stop } from '../../types/transit.ts';
import { busLabel, formatMinutes } from '../../utils/format.ts';
import { ApiErrorState } from '../feedback/ApiErrorState.tsx';
import { EmptyState } from '../feedback/EmptyState.tsx';
import { LoadingState } from '../feedback/LoadingState.tsx';
import { Notice } from '../feedback/Notice.tsx';
import { SelectField } from '../form/SelectField.tsx';
import { Button } from '../ui/Button.tsx';
import { Card } from '../ui/Card.tsx';

interface ArrivalsCardProps {
  stops: Stop[];
  stopId: string;
  tick: number;
  onStopChange: (stopId: string) => void;
}

/** ETA query for a stop (F10): which buses arrive and in how many minutes, at the current tick. */
export function ArrivalsCard({ stops, stopId, tick, onStopChange }: ArrivalsCardProps) {
  const query = useQuery(stopId ? `arrivals:${stopId}:${tick}` : null, () => fetchArrivals(stopId, tick));
  const [draft, setDraft] = useState(stopId);
  const [error, setError] = useState<string>();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft) {
      setError('Selecciona un paradero.');
      return;
    }
    setError(undefined);
    if (draft === stopId) query.reload();
    else onStopChange(draft);
  };

  return (
    <Card title="Consultar llegadas a un paradero" data-testid="arrivals-card">
      <form className="flex flex-wrap items-end gap-3" onSubmit={handleSubmit} noValidate aria-label="Consultar llegadas">
        <div className="min-w-0 flex-1 basis-60">
          <SelectField
            id="arrivals-stop"
            testId="input-arrivals-stop"
            label="Paradero"
            placeholder="Selecciona un paradero"
            required
            options={stops.map((stop) => ({ value: stop.id, label: `${stop.name} (${stop.id})` }))}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            error={error}
          />
        </div>
        <Button type="submit" isLoading={query.status === 'loading'} loadingText="Consultando…" data-testid="btn-check-arrivals">
          <Clock className="h-4 w-4" aria-hidden="true" />
          Consultar llegadas
        </Button>
      </form>

      <div className="mt-5" aria-live="polite">
        {query.status === 'loading' && <LoadingState message="Consultando llegadas…" scope="arrivals" />}
        {query.status === 'error' && <ApiErrorState error={query.error} onRetry={query.reload} scope="arrivals" />}
        {query.status === 'success' && !query.data.served && (
          <Notice tone="warning" title={`${query.data.stopName} no recibe buses en este momento`} testId="arrivals-not-served">
            El paradero no está operativo; ninguna ruta se detiene allí.
          </Notice>
        )}
        {query.status === 'success' && query.data.served && query.data.arrivals.length === 0 && (
          <EmptyState testId="arrivals-empty" title="No hay buses próximos" description={`Ningún bus en servicio se dirige a ${query.data.stopName}.`} />
        )}
        {query.status === 'success' && query.data.arrivals.length > 0 && (
          <div data-testid="arrivals-list" data-stop-id={query.data.stopId} data-count={query.data.arrivals.length}>
            <p className="mb-3 text-sm font-medium text-slate-800" data-testid="arrivals-title">
              Próximas llegadas a {query.data.stopName} · {query.data.clock.time}
            </p>
            <ol className="divide-y divide-slate-100 rounded-xl border border-slate-200">
              {query.data.arrivals.map((arrival) => (
                <li
                  key={arrival.busId}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
                  data-testid={`arrival-${arrival.busId}`}
                  data-route-id={arrival.routeId}
                >
                  <span className="font-medium text-slate-900">
                    {busLabel(arrival.busId)} · Ruta {arrival.routeId}
                  </span>
                  <span className="font-semibold text-slate-900" data-testid={`arrival-eta-${arrival.busId}`} data-minutes={arrival.etaMinutes}>
                    {arrival.etaMinutes === 0 ? 'Llegando' : formatMinutes(arrival.etaMinutes)}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </Card>
  );
}
