import { Navigation } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { ApiErrorState } from '../components/feedback/ApiErrorState.tsx';
import { EmptyState } from '../components/feedback/EmptyState.tsx';
import { LoadingState } from '../components/feedback/LoadingState.tsx';
import { Notice } from '../components/feedback/Notice.tsx';
import { TripOptionCard } from '../components/planner/TripOptionCard.tsx';
import { StopPairForm, type TripQuery } from '../components/transit/StopPairForm.tsx';
import { Card } from '../components/ui/Card.tsx';
import { PageHeader } from '../components/ui/PageHeader.tsx';
import { useQuery } from '../hooks/useQuery.ts';
import { useRecordHistory } from '../hooks/useRecordHistory.ts';
import { fetchStops, planTrip } from '../services/transitService.ts';
import type { TripOption, TripPlan } from '../types/transit.ts';
import { formatMinutes, pluralize } from '../utils/format.ts';

function mapHref(plan: TripPlan, optionId: string): string {
  return `/map?origin=${plan.origin.stopId}&destination=${plan.destination.stopId}&option=${optionId}`;
}

function PlanResults({ plan }: { plan: TripPlan }) {
  const [recommended, ...alternatives] = plan.options;
  const recordHistory = useRecordHistory();
  const [chosen, setChosen] = useState<{ optionId: string; entryId: string } | null>(null);

  // Choosing an option is the explicit action that records the trip in the history (F13).
  const choose = (option: TripOption) => {
    const entry = recordHistory({
      originStopId: plan.origin.stopId,
      originName: plan.origin.name,
      destinationStopId: plan.destination.stopId,
      destinationName: plan.destination.name,
      routeId: option.id,
      estimatedMinutes: option.totalMinutes,
      source: 'PLANNER',
    });
    if (entry) setChosen({ optionId: option.id, entryId: entry.id });
  };

  const cardProps = (option: TripOption) => ({
    option,
    transferWaitMinutes: plan.transferWaitMinutes,
    mapHref: mapHref(plan, option.id),
    isChosen: chosen?.optionId === option.id,
    onChoose: choose,
  });

  if (!recommended) {
    return (
      <EmptyState
        testId="no-results"
        title="No hay recorridos disponibles"
        description={`No es posible viajar desde ${plan.origin.name} hacia ${plan.destination.name} con la red actual, ni siquiera con transbordos.`}
      />
    );
  }

  return (
    <div className="space-y-6" data-testid="plan-results" data-count={plan.options.length}>
      <div className="space-y-1">
        <p className="font-medium text-slate-800" data-testid="plan-summary">
          {plan.origin.name} → {plan.destination.name}
        </p>
        <p className="text-sm text-slate-600" data-testid="plan-options-count">
          {pluralize(plan.options.length, 'opción encontrada', 'opciones encontradas')}. Cada transbordo incluye{' '}
          {formatMinutes(plan.transferWaitMinutes)} de espera simulada.
        </p>
      </div>

      <section aria-labelledby="recommended-heading" data-testid="trip-recommended" data-option-id={recommended.id}>
        <h2 id="recommended-heading" className="mb-3 text-lg font-semibold text-slate-900">
          Ruta recomendada
        </h2>
        <TripOptionCard {...cardProps(recommended)} />
      </section>

      {chosen && (
        <Notice tone="success" title={`Opción ${chosen.optionId} guardada en tu historial`} testId="history-saved-notice">
          <span data-testid="history-saved-entry" data-entry-id={chosen.entryId}>
            Puedes verla en la sección Historial.
          </span>
        </Notice>
      )}

      <section aria-labelledby="alternatives-heading" data-testid="trip-alternatives" data-count={alternatives.length}>
        <h2 id="alternatives-heading" className="mb-3 text-lg font-semibold text-slate-900">
          Alternativas
        </h2>
        {alternatives.length === 0 ? (
          <p className="text-sm text-slate-600" data-testid="trip-no-alternatives">
            No hay alternativas adicionales para este recorrido.
          </p>
        ) : (
          <ul className="grid gap-4 lg:grid-cols-2">
            {alternatives.map((option) => (
              <li key={option.id}>
                <TripOptionCard {...cardProps(option)} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/** State in the URL: `/planner?origin=S01&destination=S05`. */
export function PlannerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const origin = searchParams.get('origin') ?? '';
  const destination = searchParams.get('destination') ?? '';
  const hasTrip = Boolean(origin && destination);

  const stopsQuery = useQuery('stops', () => fetchStops());
  const planQuery = useQuery(hasTrip ? `plan:${origin}:${destination}` : null, () => planTrip(origin, destination));

  const submit = ({ origin: from, destination: to }: TripQuery) => {
    if (from === origin && to === destination) planQuery.reload();
    else setSearchParams({ origin: from, destination: to });
  };

  // One state at a time in the main flow: results only once the form (stops) is ready,
  // so the plain loading-indicator / server-error ids are unique on the page.
  const formReady = stopsQuery.status === 'success';

  return (
    <div className="space-y-6" data-testid="page-planner">
      <PageHeader
        title="Planificador"
        description="Encuentra la mejor forma de llegar a tu destino, incluso combinando rutas."
      />

      <Card title="Planificar recorrido">
        {stopsQuery.status === 'loading' && <LoadingState message="Cargando paraderos…" />}
        {stopsQuery.status === 'error' && <ApiErrorState error={stopsQuery.error} onRetry={stopsQuery.reload} />}
        {stopsQuery.status === 'success' && (
          <StopPairForm
            key={`${origin}:${destination}`}
            stops={stopsQuery.data}
            initialQuery={{ origin, destination }}
            isSubmitting={formReady && planQuery.status === 'loading'}
            onSubmit={submit}
            onClear={() => setSearchParams({})}
            formLabel="Planificar recorrido"
            formTestId="planner-form"
            submitLabel="Planificar recorrido"
            submitLoadingLabel="Planificando…"
            submitTestId="btn-plan-trip"
            submitIcon={Navigation}
            clearTestId="btn-clear-plan"
          />
        )}
      </Card>

      <section aria-label="Resultado de la planificación" aria-live="polite" aria-busy={formReady && planQuery.status === 'loading'}>
        {formReady && planQuery.status === 'loading' && <LoadingState message="Calculando recorridos…" />}
        {formReady && planQuery.status === 'error' && <ApiErrorState error={planQuery.error} onRetry={planQuery.reload} />}
        {formReady && planQuery.status === 'success' && <PlanResults key={`${origin}:${destination}`} plan={planQuery.data} />}
      </section>
    </div>
  );
}
