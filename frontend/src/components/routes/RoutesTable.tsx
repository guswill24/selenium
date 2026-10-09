import type { Route } from '../../types/transit.ts';
import { formatMinutes } from '../../utils/format.ts';
import { RouteStatusBadge } from '../transit/StatusBadges.tsx';

interface RoutesTableProps {
  routes: Route[];
}

export function RoutesTable({ routes }: RoutesTableProps) {
  return (
    // Focusable so keyboard users can scroll the table horizontally on narrow screens.
    <div className="overflow-x-auto rounded-lg" role="region" aria-label="Tabla de rutas" tabIndex={0} data-testid="routes-table-container">
      <table className="w-full min-w-[560px] text-left text-sm" data-testid="routes-table">
        <caption className="sr-only">Todas las rutas del sistema con su recorrido, duración y estado</caption>
        <thead className="border-b border-slate-200 text-xs text-slate-600 uppercase">
          <tr>
            <th scope="col" className="py-3 pr-4 font-semibold">Ruta</th>
            <th scope="col" className="py-3 pr-4 font-semibold">Recorrido</th>
            <th scope="col" className="py-3 pr-4 font-semibold">Paraderos</th>
            <th scope="col" className="py-3 pr-4 font-semibold">Duración</th>
            <th scope="col" className="py-3 font-semibold">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {routes.map((route) => (
            <tr key={route.id} data-testid={`route-row-${route.id}`} data-active={route.active}>
              <th scope="row" className="py-3 pr-4 font-semibold text-slate-900">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: route.color }} aria-hidden="true" />
                  {route.id}
                </span>
              </th>
              <td className="py-3 pr-4 text-slate-700">{route.stops.map((stop) => stop.name).join(' → ')}</td>
              <td className="py-3 pr-4 text-slate-700">{route.stopCount}</td>
              <td className="py-3 pr-4 text-slate-700">{formatMinutes(route.estimatedMinutes)}</td>
              <td className="py-3">
                <RouteStatusBadge status={route.status} testId={`route-row-status-${route.id}`} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
