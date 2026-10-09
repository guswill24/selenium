import { Plus, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { AdminRouteDetail } from '../components/admin/AdminRouteDetail.tsx';
import {
  AlertsAdminTable,
  BusesAdminTable,
  RoutesAdminTable,
  SchedulesAdminTable,
  StopsAdminTable,
} from '../components/admin/AdminTables.tsx';
import { mergeRoutes } from '../components/admin/adminModel.ts';
import { RouteForm } from '../components/admin/RouteForm.tsx';
import { ApiErrorState } from '../components/feedback/ApiErrorState.tsx';
import { ConfirmDialog } from '../components/feedback/ConfirmDialog.tsx';
import { LoadingState } from '../components/feedback/LoadingState.tsx';
import { Notice, type NoticeTone } from '../components/feedback/Notice.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { PageHeader } from '../components/ui/PageHeader.tsx';
import { useQuery } from '../hooks/useQuery.ts';
import { fetchAllAlerts, fetchSchedules, setEntityActive } from '../services/adminService.ts';
import { ApiError } from '../services/apiClient.ts';
import { countAdminChanges, readAdminDemo, resetAdminDemo, saveActiveOverride, saveAdminRoute } from '../services/adminStore.ts';
import { fetchBuses, fetchRoutes, fetchStops } from '../services/transitService.ts';
import type { AdminEntity, AdminRoute } from '../types/admin.ts';
import { cn } from '../utils/cn.ts';

const TABS = [
  { id: 'routes', label: 'Rutas' },
  { id: 'stops', label: 'Paraderos' },
  { id: 'schedules', label: 'Horarios' },
  { id: 'buses', label: 'Buses' },
  { id: 'alerts', label: 'Alertas' },
] as const;

type TabId = (typeof TABS)[number]['id'];

interface PageNotice {
  tone: NoticeTone;
  testId: string;
  title: string;
}

/** URL state: `?tab=routes&mode=create`, `?tab=routes&mode=edit&id=R12`, `?tab=routes&view=R12`. */
export function AdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: TabId = TABS.find((candidate) => candidate.id === searchParams.get('tab'))?.id ?? 'routes';
  const mode = searchParams.get('mode');
  const editId = searchParams.get('id') ?? '';
  const viewId = searchParams.get('view') ?? '';

  const [demo, setDemo] = useState(readAdminDemo);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<PageNotice | null>(null);
  const [isResetOpen, setIsResetOpen] = useState(false);

  const routesQuery = useQuery('routes', fetchRoutes);
  const stopsQuery = useQuery('stops', () => fetchStops());
  const busesQuery = useQuery('buses:0', () => fetchBuses(0));
  const alertsQuery = useQuery('admin:alerts', fetchAllAlerts);
  const schedulesQuery = useQuery('admin:schedules', fetchSchedules);
  const queries = [routesQuery, stopsQuery, busesQuery, alertsQuery, schedulesQuery];
  const failed = queries.find((query) => query.status === 'error');

  const goTo = (params: Record<string, string>) => setSearchParams({ tab, ...params });

  const header = (
    <PageHeader
      title="Gestión de rutas"
      description="Administración de rutas, paraderos, horarios, buses y alertas."
      actions={
        <Button variant="secondary" onClick={() => setIsResetOpen(true)} disabled={countAdminChanges(demo) === 0} data-testid="btn-admin-reset">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Restablecer datos de demostración
        </Button>
      }
    />
  );

  if (failed?.status === 'error') {
    return (
      <div className="space-y-6" data-testid="page-admin">
        {header}
        <ApiErrorState error={failed.error} onRetry={() => queries.forEach((query) => query.reload())} />
      </div>
    );
  }
  if (
    routesQuery.status !== 'success' ||
    stopsQuery.status !== 'success' ||
    busesQuery.status !== 'success' ||
    alertsQuery.status !== 'success' ||
    schedulesQuery.status !== 'success'
  ) {
    return (
      <div className="space-y-6" data-testid="page-admin">
        {header}
        <LoadingState message="Cargando administración…" />
      </div>
    );
  }

  const stops = stopsQuery.data;
  const stopName = (id: string) => stops.find((stop) => stop.id === id)?.name ?? id;
  const routeRows = mergeRoutes(routesQuery.data, demo);
  const takenIds = new Set(routeRows.map((row) => row.route.id));
  const editing = mode === 'edit' ? routeRows.find((row) => row.route.id === editId.toUpperCase())?.route : undefined;
  const viewing = routeRows.find((row) => row.route.id === viewId.toUpperCase())?.route;

  const handleSaved = (route: AdminRoute, isNew: boolean) => {
    setDemo(saveAdminRoute(route, isNew));
    goTo({ view: route.id });
    setNotice({
      tone: 'success',
      testId: 'admin-route-saved',
      title: isNew ? `Ruta ${route.id} creada (demostración, solo en este navegador).` : `Ruta ${route.id} actualizada (demostración, solo en este navegador).`,
    });
  };

  const handleToggle = async (entity: AdminEntity, id: string, nextActive: boolean, label: string) => {
    setBusyKey(`${entity}:${id}`);
    setNotice(null);
    try {
      await setEntityActive(entity, id, nextActive);
      setDemo(saveActiveOverride(entity, id, nextActive));
      // Gender-neutral wording: the same message serves "Ruta", "Paradero", "Alerta" and "BUS".
      setNotice({
        tone: 'success',
        testId: 'admin-status-changed',
        title: `${label}: ${nextActive ? 'activación' : 'desactivación'} guardada (demostración).`,
      });
    } catch (error) {
      setNotice({
        tone: 'error',
        testId: 'admin-status-error',
        title: error instanceof ApiError && error.status > 0 && error.status < 500 ? error.message : 'No fue posible guardar el cambio. Intenta nuevamente.',
      });
    } finally {
      setBusyKey(null);
    }
  };

  const toggleProps = { busyKey, onToggle: handleToggle };

  return (
    <div className="space-y-6" data-testid="page-admin" data-tab={tab}>
      {header}

      <Notice tone="info" title="Modo demostración" testId="admin-demo-notice">
        El servidor valida permisos y datos, pero no guarda los cambios. Se conservan solo en este navegador y no modifican la
        consulta pública de rutas. Cambios actuales: <span data-testid="admin-demo-changes">{countAdminChanges(demo)}</span>.
      </Notice>

      <nav aria-label="Secciones de administración" className="border-b border-slate-200" data-testid="admin-tabs">
        <ul className="flex flex-wrap gap-x-2">
          {TABS.map((candidate) => {
            const isCurrent = candidate.id === tab;
            return (
              <li key={candidate.id}>
                <Link
                  to={`/admin?tab=${candidate.id}`}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={cn(
                    'inline-flex border-b-2 px-3 py-2.5 text-sm font-semibold sm:px-4',
                    isCurrent ? 'border-brand-700 text-brand-800' : 'border-transparent text-slate-600 hover:text-slate-900',
                  )}
                  data-testid={`admin-tab-${candidate.id}`}
                >
                  {candidate.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {notice && <Notice tone={notice.tone} title={notice.title} testId={notice.testId} />}

      {tab === 'routes' && (
        <div className="space-y-6">
          {(mode === 'create' || editing) && (
            <RouteForm
              key={mode === 'create' ? 'create' : editing?.id}
              route={mode === 'create' ? null : (editing ?? null)}
              stops={stops}
              takenIds={takenIds}
              onSaved={handleSaved}
              onCancel={() => goTo({})}
            />
          )}
          {mode === 'edit' && !editing && <Notice tone="warning" title={`La ruta ${editId} no existe.`} testId="admin-route-not-found" />}
          {viewing && !mode && <AdminRouteDetail route={viewing} stopName={stopName} onClose={() => goTo({})} />}
          <Card
            title={`Rutas (${routeRows.length})`}
            actions={
              <Button onClick={() => { setNotice(null); goTo({ mode: 'create' }); }} data-testid="admin-route-create">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Crear ruta
              </Button>
            }
          >
            <RoutesAdminTable
              rows={routeRows}
              stopName={stopName}
              onView={(id) => goTo({ view: id })}
              onEdit={(id) => { setNotice(null); goTo({ mode: 'edit', id }); }}
              {...toggleProps}
            />
          </Card>
        </div>
      )}

      {tab === 'stops' && (
        <Card title={`Paraderos (${stops.length})`}>
          <StopsAdminTable stops={stops} demo={demo} {...toggleProps} />
        </Card>
      )}

      {tab === 'schedules' && (
        <Card title="Horarios (solo lectura)">
          <SchedulesAdminTable schedules={schedulesQuery.data} />
        </Card>
      )}

      {tab === 'buses' && (
        <Card title={`Buses (${busesQuery.data.length})`}>
          <BusesAdminTable buses={busesQuery.data} demo={demo} {...toggleProps} />
        </Card>
      )}

      {tab === 'alerts' && (
        <Card title={`Alertas (${alertsQuery.data.length})`}>
          <AlertsAdminTable alerts={alertsQuery.data} demo={demo} {...toggleProps} />
        </Card>
      )}

      <ConfirmDialog
        open={isResetOpen}
        title="¿Restablecer los datos de demostración?"
        message="Se descartarán las rutas creadas o editadas y los cambios de activación hechos en este navegador."
        confirmLabel="Restablecer"
        testId="confirm-admin-reset"
        onCancel={() => setIsResetOpen(false)}
        onConfirm={() => {
          setDemo(resetAdminDemo());
          setIsResetOpen(false);
          setSearchParams({ tab });
          setNotice({ tone: 'success', testId: 'admin-reset-done', title: 'Se restablecieron los datos de demostración.' });
        }}
      />
    </div>
  );
}
