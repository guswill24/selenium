import { Link } from 'react-router';
import type { Alert } from '../../types/transit.ts';
import { levelDisplay, typeLabels } from '../../utils/alertDisplay.ts';
import { cn } from '../../utils/cn.ts';
import { formatDateTime } from '../../utils/format.ts';
import { Badge } from '../ui/Badge.tsx';

export function AlertLevelBadge({ alert, testId }: { alert: Alert; testId: string }) {
  const { label, tone, icon: Icon } = levelDisplay[alert.level];
  return (
    <Badge tone={tone} className="gap-1" data-testid={testId} data-level={alert.level}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </Badge>
  );
}

export function AlertCard({ alert }: { alert: Alert }) {
  const id = alert.id;

  return (
    <article
      className={cn('space-y-3 rounded-2xl border border-l-4 border-slate-200 bg-white p-5 shadow-sm', levelDisplay[alert.level].borderClass)}
      data-testid={`alert-card-${id}`}
      data-alert-id={id}
      data-level={alert.level}
      data-type={alert.type}
      aria-labelledby={`alert-title-${id}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <AlertLevelBadge alert={alert} testId={`alert-level-${id}`} />
        <Badge tone="neutral" data-testid={`alert-type-${id}`} data-type={alert.type}>
          {typeLabels[alert.type]}
        </Badge>
      </div>
      <h3 id={`alert-title-${id}`} className="text-lg font-bold text-slate-900" data-testid={`alert-title-${id}`}>
        {alert.title}
      </h3>
      <p className="text-slate-800" data-testid={`alert-message-${id}`}>
        {alert.message}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
        <span data-testid={`alert-route-${id}`} data-route-id={alert.routeId ?? ''}>
          {alert.routeId ? (
            <Link
              to={`/map?route=${alert.routeId}`}
              className="font-semibold text-brand-800 underline-offset-2 hover:underline"
              data-testid={`alert-route-link-${id}`}
            >
              Ruta {alert.routeId} · {alert.routeName}
            </Link>
          ) : (
            'Todo el sistema'
          )}
        </span>
        <time dateTime={alert.publishedAt} data-testid={`alert-date-${id}`}>
          Publicada: {formatDateTime(alert.publishedAt)}
        </time>
      </div>
    </article>
  );
}
