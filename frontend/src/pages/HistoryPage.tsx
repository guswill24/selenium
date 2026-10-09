import { RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { ApiErrorState } from '../components/feedback/ApiErrorState.tsx';
import { ConfirmDialog } from '../components/feedback/ConfirmDialog.tsx';
import { EmptyState } from '../components/feedback/EmptyState.tsx';
import { LoadingState } from '../components/feedback/LoadingState.tsx';
import { Notice } from '../components/feedback/Notice.tsx';
import { Badge } from '../components/ui/Badge.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { PageHeader } from '../components/ui/PageHeader.tsx';
import { useAuth } from '../hooks/useAuth.ts';
import { useQuery } from '../hooks/useQuery.ts';
import { fetchSeedHistory } from '../services/authService.ts';
import { clearHistory, deleteHistoryEntry, readHistory, restoreHistory } from '../services/historyStore.ts';
import { fetchStops } from '../services/transitService.ts';
import type { User } from '../types/auth.ts';
import type { HistoryEntry, HistorySource } from '../types/history.ts';
import { formatDateTime, formatMinutes, pluralize } from '../utils/format.ts';

const sourceLabels: Record<HistorySource, string> = {
  SEED: 'Historial inicial',
  ROUTES: 'Consulta de rutas',
  PLANNER: 'Planificador',
};

function repeatHref(entry: HistoryEntry): string {
  const trip = `origin=${entry.originStopId}&destination=${entry.destinationStopId}`;
  return entry.source === 'PLANNER' ? `/planner?${trip}` : `/routes?${trip}&selected=${entry.routeId}`;
}

function HistoryItem({ entry, onDelete }: { entry: HistoryEntry; onDelete: (entry: HistoryEntry) => void }) {
  const id = entry.id;
  return (
    <article className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" data-testid={`history-entry-${id}`} data-entry-id={id} data-source={entry.source}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-lg font-bold text-slate-900" data-testid={`history-route-${id}`}>
          {entry.routeId.includes('-') ? `Recorrido ${entry.routeId.split('-').join(' → ')}` : `Ruta ${entry.routeId}`}
        </h3>
        <Badge tone="neutral" data-testid={`history-source-${id}`}>
          {sourceLabels[entry.source]}
        </Badge>
      </div>
      <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
        <dt className="text-slate-600">Fecha</dt>
        <dd data-testid={`history-date-${id}`}>
          <time dateTime={entry.date}>{formatDateTime(entry.date)}</time>
        </dd>
        <dt className="text-slate-600">Origen</dt>
        <dd data-testid={`history-origin-${id}`} data-stop-id={entry.originStopId}>
          {entry.originName}
        </dd>
        <dt className="text-slate-600">Destino</dt>
        <dd data-testid={`history-destination-${id}`} data-stop-id={entry.destinationStopId}>
          {entry.destinationName}
        </dd>
        <dt className="text-slate-600">Tiempo estimado</dt>
        <dd data-testid={`history-time-${id}`} data-minutes={entry.estimatedMinutes}>
          {formatMinutes(entry.estimatedMinutes)}
        </dd>
      </dl>
      <div className="flex flex-wrap gap-3">
        <Link
          to={repeatHref(entry)}
          className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          data-testid={`history-repeat-${id}`}
        >
          Repetir consulta
        </Link>
        <Button variant="ghost" onClick={() => onDelete(entry)} aria-label={`Eliminar consulta ${id}`} data-testid={`btn-delete-history-${id}`}>
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Eliminar
        </Button>
      </div>
    </article>
  );
}

export function HistoryPage() {
  const { user } = useAuth();
  const currentUser = user as User; // guaranteed by the auth guard
  const seedQuery = useQuery(`history:${currentUser.id}`, fetchSeedHistory);
  const stopsQuery = useQuery('stops', () => fetchStops());
  // Bumped after every local change so the list is re-read from storage.
  const [version, setVersion] = useState(0);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [notice, setNotice] = useState<{ testId: string; message: string } | null>(null);

  if (seedQuery.status === 'error' || stopsQuery.status === 'error') {
    const failed = seedQuery.status === 'error' ? seedQuery : stopsQuery;
    return (
      <div className="space-y-6" data-testid="page-history">
        <PageHeader title="Historial" description="Rutas consultadas recientemente." />
        {failed.status === 'error' && <ApiErrorState error={failed.error} onRetry={failed.reload} />}
      </div>
    );
  }
  if (seedQuery.status !== 'success' || stopsQuery.status !== 'success') {
    return (
      <div className="space-y-6" data-testid="page-history">
        <PageHeader title="Historial" description="Rutas consultadas recientemente." />
        <LoadingState message="Cargando historial…" />
      </div>
    );
  }

  const stopName = (id: string) => stopsQuery.data.find((stop) => stop.id === id)?.name ?? id;
  const stored = readHistory(currentUser.id);
  const seedEntries: HistoryEntry[] = seedQuery.data
    .filter((entry) => !stored.hiddenSeedIds.includes(entry.id))
    .map((entry) => ({
      id: entry.id,
      date: entry.date,
      originStopId: entry.originStopId,
      originName: stopName(entry.originStopId),
      destinationStopId: entry.destinationStopId,
      destinationName: stopName(entry.destinationStopId),
      routeId: entry.routeId,
      estimatedMinutes: entry.estimatedMinutes,
      source: 'SEED',
    }));
  // Spread + sort (not toSorted): works on older browsers too, relevant for compatibility tests.
  const entries = [...stored.entries, ...seedEntries].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  const canRestore = stored.entries.length > 0 || stored.hiddenSeedIds.length > 0;

  const refresh = (next: { testId: string; message: string }) => {
    setVersion(version + 1);
    setNotice(next);
  };

  return (
    <div className="space-y-6" data-testid="page-history" data-version={version}>
      <PageHeader title="Historial" description="Rutas consultadas recientemente: fecha, origen, destino, ruta y tiempo estimado." />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-slate-700">
            Se guarda al <strong>seleccionar una ruta</strong> o <strong>elegir una opción</strong> del planificador. Los
            registros nuevos se conservan solo en este navegador.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => { restoreHistory(currentUser.id); refresh({ testId: 'history-restored', message: 'Se restauró el historial inicial.' }); }} disabled={!canRestore} data-testid="btn-restore-history">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Restaurar historial inicial
            </Button>
            <Button variant="danger" onClick={() => setIsConfirmOpen(true)} disabled={entries.length === 0} data-testid="btn-clear-history">
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Borrar historial
            </Button>
          </div>
        </div>
      </Card>

      {notice && <Notice tone="success" title={notice.message} testId={notice.testId} />}

      <section aria-labelledby="history-heading">
        <h2 id="history-heading" className="sr-only">
          Consultas realizadas
        </h2>
        {entries.length === 0 ? (
          <EmptyState
            testId="history-empty"
            title="Aún no hay consultas en tu historial"
            description="Selecciona una ruta en Rutas o elige una opción en el Planificador para registrarla aquí."
          />
        ) : (
          <div className="space-y-4" data-testid="history-list" data-count={entries.length}>
            <p className="font-medium text-slate-800" data-testid="history-count">
              {pluralize(entries.length, 'consulta', 'consultas')}
            </p>
            <ul className="grid gap-4 lg:grid-cols-2">
              {entries.map((entry) => (
                <li key={entry.id}>
                  <HistoryItem
                    entry={entry}
                    onDelete={(target) => {
                      deleteHistoryEntry(currentUser.id, target.id, target.source === 'SEED');
                      refresh({ testId: 'history-deleted', message: `Se eliminó la consulta ${target.id}.` });
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <ConfirmDialog
        open={isConfirmOpen}
        title="¿Borrar todo el historial?"
        message="Se eliminarán todas las consultas de este navegador. Podrás recuperar el historial inicial con “Restaurar historial inicial”."
        confirmLabel="Borrar historial"
        testId="confirm-clear-history"
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          clearHistory(currentUser.id, seedQuery.data.map((entry) => entry.id));
          setIsConfirmOpen(false);
          refresh({ testId: 'history-cleared', message: 'Se borró el historial.' });
        }}
      />
    </div>
  );
}
