import { Activity, Bell, Bus, Gauge, History as HistoryIcon, MapPin, RefreshCw, Route, Timer } from 'lucide-react';
import { useState } from 'react';
import { ApiErrorState } from '../components/feedback/ApiErrorState.tsx';
import { LoadingState } from '../components/feedback/LoadingState.tsx';
import { Notice } from '../components/feedback/Notice.tsx';
import { Badge } from '../components/ui/Badge.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { PageHeader } from '../components/ui/PageHeader.tsx';
import { StatCard } from '../components/ui/StatCard.tsx';
import { useApiHealth } from '../hooks/useApiHealth.ts';
import { useQuery } from '../hooks/useQuery.ts';
import { fetchAdminSummary } from '../services/adminService.ts';
import { countAdminChanges, readAdminDemo } from '../services/adminStore.ts';
import { countLocalHistoryEntries } from '../services/historyStore.ts';
import type { AdminSummary } from '../types/admin.ts';
import { ALERT_LEVELS, levelDisplay } from '../utils/alertDisplay.ts';

interface MeasuredSummary {
  summary: AdminSummary;
  /** Real round-trip time measured by this browser, not simulated. */
  elapsedMs: number;
}

async function measureSummary(): Promise<MeasuredSummary> {
  const start = performance.now();
  const summary = await fetchAdminSummary();
  return { summary, elapsedMs: Math.round(performance.now() - start) };
}

function SourceNote({ children, testId }: { children: string; testId: string }) {
  return (
    <p className="mt-1 text-xs text-slate-600" data-testid={testId}>
      {children}
    </p>
  );
}

export function MonitoringPage() {
  const [refreshCount, setRefreshCount] = useState(0);
  const query = useQuery(`admin:summary:${refreshCount}`, measureSummary);
  const apiHealth = useApiHealth();
  // Read on every render: cheap, and always reflects the latest local activity.
  const localQueries = countLocalHistoryEntries();
  const demoChanges = countAdminChanges(readAdminDemo());

  return (
    <div className="space-y-6" data-testid="page-monitoring">
      <PageHeader
        title="Monitoreo"
        description="Indicadores del servicio calculados a partir de los datos simulados."
        actions={
          <Button onClick={() => setRefreshCount((count) => count + 1)} isLoading={query.status === 'loading'} loadingText="Actualizando…" data-testid="btn-monitoring-refresh">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Actualizar
          </Button>
        }
      />

      <Notice tone="info" title="Sobre estos indicadores" testId="monitoring-disclaimer">
        Los conteos se derivan de los datos del servidor y el tiempo de respuesta lo mide este navegador. Los cambios de
        demostración hechos en administración no alteran estos conteos (se muestran aparte). Este panel no reemplaza pruebas de
        rendimiento ni de carga: para eso se requieren herramientas especializadas.
      </Notice>

      {query.status === 'loading' && <LoadingState message="Calculando indicadores…" />}
      {query.status === 'error' && <ApiErrorState error={query.error} onRetry={query.reload} />}
      {query.status === 'success' && (
        <MonitoringContent
          measured={query.data}
          apiHealth={apiHealth}
          localQueries={localQueries}
          demoChanges={demoChanges}
        />
      )}
    </div>
  );
}

interface MonitoringContentProps {
  measured: MeasuredSummary;
  apiHealth: ReturnType<typeof useApiHealth>;
  localQueries: number;
  demoChanges: number;
}

function MonitoringContent({ measured: { summary, elapsedMs }, apiHealth, localQueries, demoChanges }: MonitoringContentProps) {
  const degraded = summary.serviceStatus === 'DEGRADED';
  const punctuality = summary.punctuality.running === 0 ? 0 : Math.round((summary.punctuality.onTime / summary.punctuality.running) * 100);

  return (
    <div className="space-y-6" data-testid="monitoring-content">
      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(min(100%,22rem),1fr))]">
        <Card title="Estado del servicio" data-testid="monitoring-service">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone={degraded ? 'warning' : 'success'} data-testid="monitoring-service-status" data-status={summary.serviceStatus}>
              {degraded ? 'Operación con novedades' : 'Operación normal'}
            </Badge>
            <span className="text-sm text-slate-700">
              {degraded ? `${summary.alerts.byLevel.CRITICAL} alerta(s) crítica(s) activa(s).` : 'Sin alertas críticas.'}
            </span>
          </div>
          <SourceNote testId="monitoring-service-source">Derivado de las alertas activas.</SourceNote>
        </Card>
        <Card title="Disponibilidad de la API" data-testid="monitoring-api">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone={apiHealth === 'available' ? 'success' : apiHealth === 'loading' ? 'neutral' : 'danger'} data-testid="monitoring-api-health" data-state={apiHealth}>
              {apiHealth === 'available' ? 'Disponible' : apiHealth === 'loading' ? 'Verificando…' : 'No disponible'}
            </Badge>
            <span className="text-sm text-slate-700" data-testid="monitoring-response-time" data-ms={elapsedMs}>
              Tiempo de respuesta: {elapsedMs} ms
            </span>
          </div>
          <SourceNote testId="monitoring-response-source">
            Medición real de este navegador para GET /api/admin/summary. Varía entre equipos y ejecuciones.
          </SourceNote>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))]">
        <StatCard testId="monitoring-routes" icon={Route} label="Rutas activas" value={`${summary.routes.active} de ${summary.routes.total}`} />
        <StatCard testId="monitoring-stops" icon={MapPin} label="Paraderos operativos" value={`${summary.stops.total - summary.stops.inMaintenance} de ${summary.stops.total}`} hint={`${summary.stops.inMaintenance} en mantenimiento`} />
        <StatCard testId="monitoring-buses" icon={Bus} label="Buses en servicio" value={`${summary.buses.running} de ${summary.buses.total}`} hint={`${summary.buses.outOfService} fuera de servicio`} />
        <StatCard testId="monitoring-alerts" icon={Bell} label="Alertas activas" value={String(summary.alerts.active)} hint={ALERT_LEVELS.map((level) => `${levelDisplay[level].plural}: ${summary.alerts.byLevel[level]}`).join(' · ')} />
        <StatCard testId="monitoring-queries" icon={HistoryIcon} label="Consultas registradas" value={String(summary.history.seedEntries + localQueries)} hint={`${summary.history.seedEntries} del historial inicial + ${localQueries} en este navegador`} />
        <StatCard testId="monitoring-punctuality" icon={Timer} label="Puntualidad simulada" value={`${punctuality} %`} hint={`${summary.punctuality.onTime} de ${summary.punctuality.running} buses sin retraso (datos simulados, minuto 0)`} />
      </div>

      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(min(100%,22rem),1fr))]">
        <StatCard testId="monitoring-users" icon={Activity} label="Usuarios de demostración" value={String(summary.users.total)} hint={`${summary.users.locked} bloqueado(s)`} />
        <StatCard testId="monitoring-demo-changes" icon={Gauge} label="Cambios de demostración (administración)" value={String(demoChanges)} hint="Guardados solo en este navegador" />
      </div>
    </div>
  );
}
