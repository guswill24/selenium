import { Eye, Pencil } from 'lucide-react';
import type { ReactNode } from 'react';
import type { AdminDemoState } from '../../services/adminStore.ts';
import type { AdminEntity, Schedule } from '../../types/admin.ts';
import type { Alert, Bus, Stop } from '../../types/transit.ts';
import { levelDisplay, typeLabels } from '../../utils/alertDisplay.ts';
import { busLabel, formatMinutes } from '../../utils/format.ts';
import { RouteStatusBadge, StopStatusBadge } from '../transit/StatusBadges.tsx';
import { Badge } from '../ui/Badge.tsx';
import { Button } from '../ui/Button.tsx';
import { ActiveToggle } from './ActiveToggle.tsx';
import { effectiveStopStatus, isAlertActive, isBusActive, type AdminRouteRow, type RowOrigin } from './adminModel.ts';

export interface ToggleHandler {
  busyKey: string | null;
  onToggle: (entity: AdminEntity, id: string, nextActive: boolean, label: string) => void;
}

interface TableProps {
  testId: string;
  caption: string;
  headers: string[];
  wide?: boolean;
  children: ReactNode;
}

// Tables keep a readable minimum width and scroll inside their container on narrow screens.
function Table({ testId, caption, headers, wide = false, children }: TableProps) {
  return (
    <div className="overflow-x-auto" data-testid={`${testId}-container`}>
      <table className={`w-full ${wide ? 'min-w-[720px]' : 'min-w-[600px]'} text-left text-sm`} data-testid={testId}>
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b border-slate-200 text-xs text-slate-600 uppercase">
          <tr>
            {headers.map((header) => (
              <th key={header} scope="col" className="py-3 pr-4 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  );
}

function ActiveLabel({ active, testId }: { active: boolean; testId: string }) {
  return (
    <span className={active ? 'font-semibold text-brand-800' : 'font-semibold text-slate-600'} data-testid={testId} data-active={active}>
      {active ? 'Sí' : 'No'}
    </span>
  );
}

const originLabels: Record<RowOrigin, string | null> = { server: null, edited: 'Editada (demo)', new: 'Nueva (demo)' };

interface RoutesAdminTableProps extends ToggleHandler {
  rows: AdminRouteRow[];
  stopName: (id: string) => string;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
}

export function RoutesAdminTable({ rows, stopName, onView, onEdit, busyKey, onToggle }: RoutesAdminTableProps) {
  return (
    <Table testId="admin-routes-table" caption="Rutas del sistema" wide headers={['Código', 'Nombre', 'Recorrido', 'Paraderos', 'Duración', 'Estado', 'Activa', 'Acciones']}>
      {rows.map(({ route, origin }) => (
        <tr key={route.id} data-testid={`admin-route-row-${route.id}`} data-origin={origin} data-active={route.active}>
          <th scope="row" className="py-3 pr-4 font-semibold text-slate-900">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: route.color }} aria-hidden="true" />
              {route.id}
            </span>
          </th>
          <td className="py-3 pr-4">
            <span data-testid={`admin-route-name-${route.id}`}>{route.name}</span>
            {originLabels[origin] && (
              <Badge tone="info" className="ml-2" data-testid={`admin-route-origin-${route.id}`}>
                {originLabels[origin]}
              </Badge>
            )}
          </td>
          <td className="py-3 pr-4 text-slate-700" data-testid={`admin-route-path-${route.id}`}>
            {stopName(route.originStopId)} → {stopName(route.destinationStopId)}
          </td>
          <td className="py-3 pr-4 text-slate-700" data-testid={`admin-route-stops-${route.id}`}>
            {route.stops.length}
          </td>
          <td className="py-3 pr-4 text-slate-700" data-testid={`admin-route-time-${route.id}`} data-minutes={route.estimatedMinutes}>
            {formatMinutes(route.estimatedMinutes)}
          </td>
          <td className="py-3 pr-4">
            <RouteStatusBadge status={route.status} testId={`admin-route-status-${route.id}`} />
          </td>
          <td className="py-3 pr-4">
            <ActiveLabel active={route.active} testId={`admin-route-active-${route.id}`} />
          </td>
          <td className="py-3">
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" className="px-2 py-1.5" onClick={() => onView(route.id)} aria-label={`Ver ruta ${route.id}`} data-testid={`admin-route-view-${route.id}`}>
                <Eye className="h-4 w-4" aria-hidden="true" />
                Ver
              </Button>
              <Button variant="ghost" className="px-2 py-1.5" onClick={() => onEdit(route.id)} aria-label={`Editar ruta ${route.id}`} data-testid={`admin-route-edit-${route.id}`}>
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Editar
              </Button>
              <ActiveToggle
                active={route.active}
                label={`ruta ${route.id}`}
                testId={`admin-route-toggle-${route.id}`}
                isBusy={busyKey === `routes:${route.id}`}
                onToggle={() => onToggle('routes', route.id, !route.active, `Ruta ${route.id}`)}
              />
            </div>
          </td>
        </tr>
      ))}
    </Table>
  );
}

export function StopsAdminTable({ stops, demo, busyKey, onToggle }: ToggleHandler & { stops: Stop[]; demo: AdminDemoState }) {
  return (
    <Table testId="admin-stops-table" caption="Paraderos del sistema" headers={['Código', 'Nombre', 'Dirección', 'Zona', 'Estado', 'Acciones']}>
      {stops.map((stop) => {
        const status = effectiveStopStatus(stop, demo);
        const active = status === 'ACTIVE';
        return (
          <tr key={stop.id} data-testid={`admin-stop-row-${stop.id}`} data-active={active}>
            <th scope="row" className="py-3 pr-4 font-semibold text-slate-900">{stop.id}</th>
            <td className="py-3 pr-4">{stop.name}</td>
            <td className="py-3 pr-4 text-slate-700">{stop.address}</td>
            <td className="py-3 pr-4 text-slate-700">{stop.zone}</td>
            <td className="py-3 pr-4">
              <StopStatusBadge status={status} testId={`admin-stop-status-${stop.id}`} />
            </td>
            <td className="py-3">
              <ActiveToggle
                active={active}
                label={`paradero ${stop.id}`}
                testId={`admin-stop-toggle-${stop.id}`}
                isBusy={busyKey === `stops:${stop.id}`}
                activateText="Habilitar"
                deactivateText="Poner en mantenimiento"
                onToggle={() => onToggle('stops', stop.id, !active, `Paradero ${stop.id}`)}
              />
            </td>
          </tr>
        );
      })}
    </Table>
  );
}

export function BusesAdminTable({ buses, demo, busyKey, onToggle }: ToggleHandler & { buses: Bus[]; demo: AdminDemoState }) {
  return (
    <Table testId="admin-buses-table" caption="Buses del sistema" headers={['Unidad', 'Placa', 'Ruta', 'Capacidad', 'En servicio', 'Acciones']}>
      {buses.map((bus) => {
        const active = isBusActive(bus, demo);
        return (
          <tr key={bus.id} data-testid={`admin-bus-row-${bus.id}`} data-active={active}>
            <th scope="row" className="py-3 pr-4 font-semibold text-slate-900">{busLabel(bus.id)}</th>
            <td className="py-3 pr-4 text-slate-700">{bus.plate}</td>
            <td className="py-3 pr-4 text-slate-700">Ruta {bus.routeId}</td>
            <td className="py-3 pr-4 text-slate-700">{bus.capacity} pasajeros</td>
            <td className="py-3 pr-4">
              <ActiveLabel active={active} testId={`admin-bus-active-${bus.id}`} />
            </td>
            <td className="py-3">
              <ActiveToggle
                active={active}
                label={`bus ${bus.id}`}
                testId={`admin-bus-toggle-${bus.id}`}
                isBusy={busyKey === `buses:${bus.id}`}
                activateText="Poner en servicio"
                deactivateText="Retirar de servicio"
                onToggle={() => onToggle('buses', bus.id, !active, busLabel(bus.id))}
              />
            </td>
          </tr>
        );
      })}
    </Table>
  );
}

export function AlertsAdminTable({ alerts, demo, busyKey, onToggle }: ToggleHandler & { alerts: Alert[]; demo: AdminDemoState }) {
  return (
    <Table testId="admin-alerts-table" caption="Alertas del sistema" headers={['Código', 'Nivel', 'Tipo', 'Título', 'Activa', 'Acciones']}>
      {alerts.map((alert) => {
        const active = isAlertActive(alert, demo);
        return (
          <tr key={alert.id} data-testid={`admin-alert-row-${alert.id}`} data-active={active}>
            <th scope="row" className="py-3 pr-4 font-semibold text-slate-900">{alert.id}</th>
            <td className="py-3 pr-4">
              <Badge tone={levelDisplay[alert.level].tone}>{levelDisplay[alert.level].label}</Badge>
            </td>
            <td className="py-3 pr-4 text-slate-700">{typeLabels[alert.type]}</td>
            <td className="py-3 pr-4">{alert.title}</td>
            <td className="py-3 pr-4">
              <ActiveLabel active={active} testId={`admin-alert-active-${alert.id}`} />
            </td>
            <td className="py-3">
              <ActiveToggle
                active={active}
                label={`alerta ${alert.id}`}
                testId={`admin-alert-toggle-${alert.id}`}
                isBusy={busyKey === `alerts:${alert.id}`}
                onToggle={() => onToggle('alerts', alert.id, !active, `Alerta ${alert.id}`)}
              />
            </td>
          </tr>
        );
      })}
    </Table>
  );
}

const dayLabels: Record<Schedule['dayType'], string> = { WEEKDAY: 'Lunes a viernes', WEEKEND: 'Sábados y domingos' };

export function SchedulesAdminTable({ schedules }: { schedules: Schedule[] }) {
  return (
    <Table testId="admin-schedules-table" caption="Horarios por ruta" headers={['Ruta', 'Días', 'Primera salida', 'Última salida', 'Frecuencia']}>
      {schedules.map((schedule) => (
        <tr key={`${schedule.routeId}-${schedule.dayType}`} data-testid={`admin-schedule-row-${schedule.routeId}-${schedule.dayType}`}>
          <th scope="row" className="py-3 pr-4 font-semibold text-slate-900">
            Ruta {schedule.routeId} <span className="font-normal text-slate-600">· {schedule.routeName}</span>
          </th>
          <td className="py-3 pr-4 text-slate-700">{dayLabels[schedule.dayType]}</td>
          <td className="py-3 pr-4 text-slate-700">{schedule.firstDeparture}</td>
          <td className="py-3 pr-4 text-slate-700">{schedule.lastDeparture}</td>
          <td className="py-3 pr-4 text-slate-700">Cada {formatMinutes(schedule.frequencyMinutes)}</td>
        </tr>
      ))}
    </Table>
  );
}
