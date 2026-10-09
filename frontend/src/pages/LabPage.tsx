import { FlaskConical, RotateCcw } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { ApiErrorState } from '../components/feedback/ApiErrorState.tsx';
import { LoadingState } from '../components/feedback/LoadingState.tsx';
import { Notice } from '../components/feedback/Notice.tsx';
import { SelectField } from '../components/form/SelectField.tsx';
import { Badge } from '../components/ui/Badge.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { PageHeader } from '../components/ui/PageHeader.tsx';
import { useQuery } from '../hooks/useQuery.ts';
import { useScenario } from '../hooks/useScenario.ts';
import { ApiError } from '../services/apiClient.ts';
import { fetchServerScenario, validateScenario } from '../services/scenarioApi.ts';
import { DEFAULT_DELAY_MS, DELAY_OPTIONS_MS, SCENARIO_IDS, scenarioLabels, type ScenarioId } from '../types/scenario.ts';
import { cn } from '../utils/cn.ts';

const availabilityText = { AVAILABLE: 'Disponible', ERROR: 'Con error', UNAVAILABLE: 'No disponible' } as const;
const consistencyText = { CONSISTENT: 'Consistentes', INCONSISTENT: 'Inconsistentes' } as const;
const sessionText = { VALID: 'Válida', UNAUTHORIZED: 'No autorizada', EXPIRED: 'Expirada' } as const;

function shareUrl(scenario: ScenarioId, delay: number): string {
  const query = scenario === 'SLOW_RESPONSE' ? `scenario=${scenario}&delay=${delay}` : `scenario=${scenario}`;
  return `${window.location.origin}/dashboard?${query}`;
}

export function LabPage() {
  const { scenario, responseDelay, applyScenario } = useScenario();
  const serverQuery = useQuery('scenario:server', fetchServerScenario);
  const [draft, setDraft] = useState<{ scenario: ScenarioId; delay: number }>({ scenario, delay: responseDelay || DEFAULT_DELAY_MS });
  const [isApplying, setIsApplying] = useState(false);
  const [result, setResult] = useState<{ tone: 'success' | 'error'; testId: string; title: string } | null>(null);

  const apply = async (target: ScenarioId, delay: number) => {
    setIsApplying(true);
    setResult(null);
    try {
      // The server validates first; only then does this browser start sending the new scenario.
      const confirmed = await validateScenario(target, delay);
      applyScenario(confirmed.scenario, confirmed.responseDelay || delay);
      setDraft({ scenario: confirmed.scenario, delay: confirmed.responseDelay || delay });
      setResult({
        tone: 'success',
        testId: 'scenario-applied',
        title:
          confirmed.scenario === 'SLOW_RESPONSE'
            ? `Escenario ${confirmed.label} activado (${confirmed.responseDelay} ms).`
            : `Escenario ${confirmed.label} activado.`,
      });
    } catch (error) {
      setResult({
        tone: 'error',
        testId: 'scenario-error',
        title: error instanceof ApiError && error.status > 0 ? error.message : 'No fue posible contactar al servidor para validar el escenario.',
      });
    } finally {
      setIsApplying(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void apply(draft.scenario, draft.delay);
  };

  const currentText = scenario === 'SLOW_RESPONSE' ? `${scenarioLabels[scenario]} · ${responseDelay} ms` : scenarioLabels[scenario];

  return (
    <div className="space-y-6" data-testid="page-lab">
      <PageHeader
        title="Laboratorio de escenarios de prueba"
        description="Cambia el comportamiento del sistema bajo prueba sin modificar el código fuente."
      />

      <Notice tone="info" title="El escenario se aplica solo a este navegador" testId="lab-scope-notice">
        Se guarda en este navegador y se envía al servidor en cada solicitud. No afecta a otros estudiantes. Esta página es pública:
        siempre podrás volver al escenario NORMAL, incluso si el escenario activo impide iniciar sesión.
      </Notice>

      <Card title="Escenario actual" data-testid="lab-current">
        <div className="flex flex-wrap items-center gap-3">
          <FlaskConical className="h-6 w-6 text-brand-700" aria-hidden="true" />
          <p className="text-2xl font-bold text-slate-900" data-testid="lab-current-scenario" data-scenario={scenario} data-delay={scenario === 'SLOW_RESPONSE' ? responseDelay : 0}>
            {currentText}
          </p>
        </div>
        <p className="mt-3 text-sm text-slate-700">
          Enlace para activar este escenario directamente:{' '}
          <code className="break-all rounded bg-slate-100 px-1.5 py-0.5 text-slate-900" data-testid="lab-share-url">
            {shareUrl(scenario, responseDelay)}
          </code>
        </p>
      </Card>

      <Card title="Cambiar escenario">
        <form className="space-y-5" onSubmit={handleSubmit} noValidate aria-label="Cambiar escenario" data-testid="scenario-form">
          <div className="grid gap-5 md:grid-cols-2">
            <SelectField
              id="scenario"
              testId="input-scenario"
              label="Escenario"
              placeholder="Selecciona un escenario"
              required
              options={SCENARIO_IDS.map((id) => ({ value: id, label: scenarioLabels[id] }))}
              value={draft.scenario}
              onChange={(event) => setDraft((current) => ({ ...current, scenario: (event.target.value || 'NORMAL') as ScenarioId }))}
            />
            <SelectField
              id="response-delay"
              testId="input-response-delay"
              label="Retraso de respuesta (solo RESPUESTA LENTA)"
              placeholder="Selecciona un retraso"
              options={DELAY_OPTIONS_MS.map((delay) => ({ value: String(delay), label: `${delay} ms` }))}
              value={String(draft.delay)}
              disabled={draft.scenario !== 'SLOW_RESPONSE'}
              onChange={(event) => setDraft((current) => ({ ...current, delay: Number(event.target.value) || DEFAULT_DELAY_MS }))}
            />
          </div>
          {result && <Notice tone={result.tone} title={result.title} testId={result.testId} />}
          <div className="flex flex-wrap gap-3">
            <Button type="submit" isLoading={isApplying} loadingText="Aplicando…" data-testid="btn-apply-scenario">
              Aplicar escenario
            </Button>
            <Button variant="secondary" onClick={() => void apply('NORMAL', DEFAULT_DELAY_MS)} disabled={isApplying || scenario === 'NORMAL'} data-testid="btn-reset-scenario">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Volver a NORMAL
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Configuración recibida por el servidor" data-testid="lab-server-config">
        {serverQuery.status === 'loading' && <LoadingState message="Consultando al servidor…" />}
        {serverQuery.status === 'error' && <ApiErrorState error={serverQuery.error} onRetry={serverQuery.reload} />}
        {serverQuery.status === 'success' && (
          <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
            <dt className="text-slate-600">currentScenario</dt>
            <dd className="font-semibold text-slate-900" data-testid="lab-server-scenario">{serverQuery.data.scenario}</dd>
            <dt className="text-slate-600">responseDelay</dt>
            <dd data-testid="lab-server-delay">{serverQuery.data.responseDelay} ms</dd>
            <dt className="text-slate-600">serviceAvailability</dt>
            <dd data-testid="lab-server-availability" data-value={serverQuery.data.serviceAvailability}>
              {availabilityText[serverQuery.data.serviceAvailability]}
            </dd>
            <dt className="text-slate-600">routeDataConsistency</dt>
            <dd data-testid="lab-server-consistency" data-value={serverQuery.data.routeDataConsistency}>
              {consistencyText[serverQuery.data.routeDataConsistency]}
            </dd>
            <dt className="text-slate-600">sessionState</dt>
            <dd data-testid="lab-server-session" data-value={serverQuery.data.sessionState}>
              {sessionText[serverQuery.data.sessionState]}
            </dd>
          </dl>
        )}
      </Card>

      {serverQuery.status === 'success' && (
        <section aria-labelledby="catalog-heading">
          <h2 id="catalog-heading" className="mb-3 text-lg font-semibold text-slate-900">
            Escenarios disponibles
          </h2>
          <ul className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))]" data-testid="scenario-catalog">
            {serverQuery.data.available.map((definition) => {
              const isActive = definition.id === scenario;
              return (
                <li key={definition.id}>
                  <article
                    className={cn('flex h-full flex-col gap-3 rounded-2xl border bg-white p-5 shadow-sm', isActive ? 'border-brand-600 ring-2 ring-brand-600/30' : 'border-slate-200')}
                    data-testid={`scenario-card-${definition.id}`}
                    data-active={isActive}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-900">{definition.label}</h3>
                      <Badge tone={definition.httpStatus >= 400 ? 'danger' : 'neutral'} data-testid={`scenario-http-${definition.id}`}>
                        HTTP {definition.httpStatus}
                      </Badge>
                    </div>
                    <p className="text-xs font-mono text-slate-600">{definition.id}</p>
                    <p className="text-sm text-slate-700" data-testid={`scenario-description-${definition.id}`}>
                      {definition.description}
                    </p>
                    <Button
                      variant={isActive ? 'primary' : 'secondary'}
                      className="mt-auto"
                      onClick={() => void apply(definition.id, draft.delay)}
                      disabled={isApplying || isActive}
                      aria-label={isActive ? `${definition.label}: escenario activo` : `Activar escenario ${definition.label}`}
                      data-testid={`btn-activate-${definition.id}`}
                    >
                      {isActive ? 'Activo' : 'Activar'}
                    </Button>
                  </article>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
