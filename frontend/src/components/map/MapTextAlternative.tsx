import type { Route, Stop } from '../../types/transit.ts';
import type { MapView } from './mapModel.ts';

interface MapTextAlternativeProps {
  view: MapView;
  stops: Stop[];
  routes: Route[];
}

const roleText = { origin: 'origen', destination: 'destino', transfer: 'transbordo' } as const;

/** Text equivalent of the map for screen readers and for assertions that do not depend on drawing. */
export function MapTextAlternative({ view, stops, routes }: MapTextAlternativeProps) {
  const name = (id: string) => stops.find((stop) => stop.id === id)?.name ?? id;

  return (
    <details className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm" data-testid="map-text-alternative">
      <summary className="cursor-pointer py-1 font-semibold text-slate-900">Descripción textual del mapa</summary>
      <div className="mt-3 space-y-3 text-slate-800">
        <p>{view.summary}</p>
        {view.pathStopIds.length > 0 ? (
          <ol className="list-decimal space-y-1 pl-5" data-testid="map-path-stops">
            {view.pathStopIds.map((id) => {
              const role = view.stopRoles[id];
              const suffix = role === 'origin' || role === 'destination' || role === 'transfer' ? ` (${roleText[role]})` : '';
              return (
                <li key={id} data-testid={`map-path-stop-${id}`}>
                  {name(id)} – {id}
                  {suffix}
                </li>
              );
            })}
          </ol>
        ) : (
          <ul className="space-y-1" data-testid="map-route-list">
            {routes
              .filter((route) => route.active)
              .map((route) => (
                <li key={route.id}>
                  Ruta {route.id}: {route.stops.map((stop) => stop.name).join(' → ')}
                </li>
              ))}
          </ul>
        )}
      </div>
    </details>
  );
}
