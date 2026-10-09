import { X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useQuery } from '../../hooks/useQuery.ts';
import { fetchAlerts } from '../../services/transitService.ts';
import { levelDisplay } from '../../utils/alertDisplay.ts';
import { cn } from '../../utils/cn.ts';
import { readSession, storageKeys, writeSession } from '../../utils/storage.ts';

const bannerTone = {
  CRITICAL: 'border-red-300 bg-red-50 text-red-950',
  WARNING: 'border-amber-300 bg-amber-50 text-amber-950',
} as const;

/**
 * Most severe active alert (critical or warning), shown on every page except /alerts.
 * Dismissing hides it for the current browser tab only.
 */
export function ServiceAlertBanner() {
  const { pathname } = useLocation();
  const query = useQuery('alerts:banner', () => fetchAlerts());
  const [dismissedId, setDismissedId] = useState(() => readSession(storageKeys.dismissedServiceAlert));

  // Supplementary information: on failure the page itself stays usable, so nothing is shown here.
  if (query.status !== 'success' || pathname === '/alerts') return null;

  const alert = query.data.find((candidate) => candidate.level === 'CRITICAL' || candidate.level === 'WARNING');
  if (!alert || alert.id === dismissedId || (alert.level !== 'CRITICAL' && alert.level !== 'WARNING')) return null;

  const { label, icon: Icon } = levelDisplay[alert.level];
  const others = query.data.length - 1;

  const dismiss = () => {
    writeSession(storageKeys.dismissedServiceAlert, alert.id);
    setDismissedId(alert.id);
  };

  return (
    <section
      className={cn('border-b px-4 py-3 sm:px-6', bannerTone[alert.level])}
      aria-label="Aviso del servicio"
      data-testid="alert-service"
      data-alert-id={alert.id}
      data-level={alert.level}
    >
      <div className="mx-auto flex max-w-7xl items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-semibold">
            <span className="sr-only">Alerta {label.toLowerCase()}: </span>
            <span data-testid="alert-service-title">{alert.title}</span>
          </p>
          <p data-testid="alert-service-message">{alert.message}</p>
          <Link to="/alerts" className="mt-1 inline-flex min-h-6 items-center font-semibold underline underline-offset-2" data-testid="link-service-alerts">
            {others > 0 ? `Ver todas las alertas (${others} más)` : 'Ver alertas'}
          </Link>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-md p-1.5 hover:bg-black/10"
          aria-label="Cerrar aviso del servicio"
          data-testid="btn-dismiss-service-alert"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
