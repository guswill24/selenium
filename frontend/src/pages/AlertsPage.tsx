import { useSearchParams } from 'react-router';
import { AlertCard } from '../components/alerts/AlertCard.tsx';
import { ApiErrorState } from '../components/feedback/ApiErrorState.tsx';
import { EmptyState } from '../components/feedback/EmptyState.tsx';
import { LoadingState } from '../components/feedback/LoadingState.tsx';
import { SelectField } from '../components/form/SelectField.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { PageHeader } from '../components/ui/PageHeader.tsx';
import { useQuery } from '../hooks/useQuery.ts';
import { fetchAlerts, fetchRoutes } from '../services/transitService.ts';
import type { AlertLevel, AlertType } from '../types/transit.ts';
import { ALERT_LEVELS, ALERT_TYPES, levelDisplay, typeLabels } from '../utils/alertDisplay.ts';
import { cn } from '../utils/cn.ts';
import { pluralize } from '../utils/format.ts';

function pick<T extends string>(allowed: readonly T[], value: string | null): T | '' {
  return allowed.find((candidate) => candidate === value) ?? '';
}

/** Filters live in the URL: `/alerts?level=WARNING&type=ROUTE_CHANGE&route=R22`. */
export function AlertsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const level = pick<AlertLevel>(ALERT_LEVELS, searchParams.get('level'));
  const type = pick<AlertType>(ALERT_TYPES, searchParams.get('type'));
  const route = searchParams.get('route') ?? '';
  const hasFilters = Boolean(level || type || route);

  const allQuery = useQuery('alerts:all', () => fetchAlerts());
  const filteredQuery = useQuery(`alerts:${level}:${type}:${route}`, () => fetchAlerts({ level, type, route }));
  const routesQuery = useQuery('routes', fetchRoutes);

  const setFilter = (key: 'level' | 'type' | 'route', value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const counts = Object.fromEntries(
    ALERT_LEVELS.map((candidate) => [candidate, allQuery.status === 'success' ? allQuery.data.filter((alert) => alert.level === candidate).length : 0]),
  ) as Record<AlertLevel, number>;

  return (
    <div className="space-y-6" data-testid="page-alerts">
      <PageHeader title="Alertas" description="Retrasos, cambios de ruta, interrupciones e información importante del servicio." />

      {allQuery.status === 'success' && (
        <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(min(100%,11rem),1fr))]" role="group" aria-label="Filtrar por nivel" data-testid="alert-level-summary">
          {ALERT_LEVELS.map((candidate) => {
            const { plural, icon: Icon } = levelDisplay[candidate];
            const isActive = level === candidate;
            return (
              <button
                key={candidate}
                type="button"
                onClick={() => setFilter('level', isActive ? '' : candidate)}
                aria-pressed={isActive}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border border-l-4 bg-white p-4 text-left shadow-sm transition hover:bg-slate-50',
                  levelDisplay[candidate].borderClass,
                  isActive ? 'border-slate-400 ring-2 ring-brand-600/40' : 'border-slate-200',
                )}
                data-testid={`alert-level-filter-${candidate}`}
                data-count={counts[candidate]}
              >
                <Icon className="h-6 w-6 shrink-0 text-slate-700" aria-hidden="true" />
                <span>
                  <span className="block text-2xl font-bold text-slate-900" data-testid={`alert-count-${candidate}`}>
                    {counts[candidate]}
                  </span>
                  <span className="text-sm text-slate-700">{plural}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      <Card title="Filtros">
        <div className="grid gap-4 md:grid-cols-3">
          <SelectField
            id="alert-level"
            testId="input-alert-level"
            label="Nivel"
            placeholder="Todos los niveles"
            options={ALERT_LEVELS.map((value) => ({ value, label: levelDisplay[value].label }))}
            value={level}
            onChange={(event) => setFilter('level', event.target.value)}
          />
          <SelectField
            id="alert-type"
            testId="input-alert-type"
            label="Tipo"
            placeholder="Todos los tipos"
            options={ALERT_TYPES.map((value) => ({ value, label: typeLabels[value] }))}
            value={type}
            onChange={(event) => setFilter('type', event.target.value)}
          />
          <SelectField
            id="alert-route"
            testId="input-alert-route"
            label="Ruta"
            placeholder="Todas las rutas"
            options={routesQuery.status === 'success' ? routesQuery.data.map((item) => ({ value: item.id, label: `Ruta ${item.id}` })) : []}
            value={route}
            onChange={(event) => setFilter('route', event.target.value)}
          />
        </div>
        <Button variant="secondary" className="mt-4" onClick={() => setSearchParams({})} disabled={!hasFilters} data-testid="btn-clear-alert-filters">
          Limpiar filtros
        </Button>
      </Card>

      <section aria-labelledby="alerts-heading" aria-live="polite" aria-busy={filteredQuery.status === 'loading'}>
        <h2 id="alerts-heading" className="sr-only">
          Listado de alertas
        </h2>
        {filteredQuery.status === 'loading' && <LoadingState message="Cargando alertas…" />}
        {filteredQuery.status === 'error' && <ApiErrorState error={filteredQuery.error} onRetry={filteredQuery.reload} />}
        {filteredQuery.status === 'success' && filteredQuery.data.length === 0 && (
          <EmptyState
            testId="no-results"
            title={hasFilters ? 'No hay alertas con estos filtros' : 'No hay alertas activas'}
            description={hasFilters ? 'Prueba con otra combinación de filtros.' : 'El servicio opera sin novedades.'}
          />
        )}
        {filteredQuery.status === 'success' && filteredQuery.data.length > 0 && (
          <div className="space-y-4" data-testid="alerts-list" data-count={filteredQuery.data.length}>
            <p className="font-medium text-slate-800" data-testid="alerts-count">
              {pluralize(filteredQuery.data.length, 'alerta activa', 'alertas activas')}
            </p>
            <ul className="space-y-4">
              {filteredQuery.data.map((alert) => (
                <li key={alert.id}>
                  <AlertCard alert={alert} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
