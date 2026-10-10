import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { Notice } from '../components/feedback/Notice.tsx';
import { Badge } from '../components/ui/Badge.tsx';
import { Card } from '../components/ui/Card.tsx';
import { PageHeader } from '../components/ui/PageHeader.tsx';
import { useApiHealth, type ApiHealthState } from '../hooks/useApiHealth.ts';
import { useAuth } from '../hooks/useAuth.ts';
import { useQuery } from '../hooks/useQuery.ts';
import { fetchAlerts } from '../services/transitService.ts';
import { canAccess, navigationItems } from '../routes/navigation.ts';

const healthLabels: Record<ApiHealthState, string> = {
  loading: 'Verificando…',
  available: 'Disponible',
  unavailable: 'No disponible',
};

const healthTones = { loading: 'neutral', available: 'success', unavailable: 'danger' } as const;

export function DashboardPage() {
  const apiHealth = useApiHealth();
  const alertsQuery = useQuery('alerts:dashboard', () => fetchAlerts());
  const { user } = useAuth();
  const modules = navigationItems.filter((item) => item.id !== 'dashboard' && canAccess(item, user?.role));

  return (
    <div className="space-y-6" data-testid="dashboard">
      <PageHeader
        title="Inicio"
        description="Consulta rutas, paraderos y tiempos de llegada en un sistema de transporte simulado."
      />

      {user && (
        <p className="text-lg text-slate-800" data-testid="welcome-message">
          Hola, <span className="font-semibold">{user.fullName}</span>
        </p>
      )}

      <Notice tone="info" title="Sistema bajo prueba (SUT)" testId="sut-notice">
        Esta aplicación es un entorno controlado para practicar pruebas de software. Los datos, buses y rutas son
        ficticios y deterministas.
      </Notice>

      <Card title="Estado del servicio" data-testid="service-status">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-slate-700">
          <div className="flex items-center gap-3">
            <span>API de Mi Ruta:</span>
            <Badge tone={healthTones[apiHealth]} role="status" data-testid="api-health" data-state={apiHealth}>
              {healthLabels[apiHealth]}
            </Badge>
          </div>
          {alertsQuery.status === 'success' && (
            <div className="flex items-center gap-3">
              <span>
                Alertas activas:{' '}
                <span className="font-semibold text-slate-900" data-testid="dashboard-alerts-count">
                  {alertsQuery.data.length}
                </span>
              </span>
              <Link to="/alerts" className="inline-flex min-h-6 items-center font-semibold text-brand-800 underline-offset-2 hover:underline" data-testid="link-dashboard-alerts">
                Ver alertas
              </Link>
            </div>
          )}
          {alertsQuery.status === 'error' && (
            // Secondary data: a short message instead of a full error block; the code stays observable.
            <p
              className="text-red-800"
              role="alert"
              data-testid="dashboard-alerts-error"
              data-error-status={alertsQuery.error.status}
              data-error-code={alertsQuery.error.code}
            >
              No fue posible consultar las alertas activas.
            </p>
          )}
        </div>
      </Card>

      <section aria-labelledby="modules-heading">
        <h2 id="modules-heading" className="mb-3 text-lg font-semibold text-slate-900">
          Módulos
        </h2>
        <ul className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))]" data-testid="module-list">
          {modules.map((item) => (
            <li key={item.id}>
              <Link
                to={item.path}
                className="group flex h-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow"
                data-testid={`module-card-${item.id}`}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2 font-semibold text-slate-900">
                    {/* Long names ("Planificador") wrap instead of pushing the arrow out with enlarged text. */}
                    <span className="min-w-0 [overflow-wrap:anywhere]">{item.label}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-brand-700" aria-hidden="true" />
                  </span>
                  <span className="mt-1 block text-sm text-slate-600 [overflow-wrap:anywhere]">{item.description}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
