import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { Notice } from '../components/feedback/Notice.tsx';
import { ApiErrorState } from '../components/feedback/ApiErrorState.tsx';
import { LoadingState } from '../components/feedback/LoadingState.tsx';
import { CheckboxField } from '../components/form/CheckboxField.tsx';
import { SelectField } from '../components/form/SelectField.tsx';
import { MapLegend } from '../components/map/MapLegend.tsx';
import { buildMapView, type StopRole } from '../components/map/mapModel.ts';
import { MapStopInfo } from '../components/map/MapStopInfo.tsx';
import { MapTextAlternative } from '../components/map/MapTextAlternative.tsx';
import { RouteMap } from '../components/map/RouteMap.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { PageHeader } from '../components/ui/PageHeader.tsx';
import { useQuery } from '../hooks/useQuery.ts';
import { fetchBuses, fetchPlaces, fetchRoutes, fetchStops, planTrip } from '../services/transitService.ts';

const stopRoleText: Record<StopRole, string> = {
  origin: 'Origen del recorrido',
  destination: 'Destino del recorrido',
  transfer: 'Punto de transbordo',
  path: 'Parada intermedia del recorrido',
  idle: '',
};

/**
 * Modes from the URL:
 * - `/map` overview · `/map?route=R12[&origin=S01&destination=S03]` one route
 * - `/map?origin=S01&destination=S05[&option=R18-R22]` itinerary from the planner
 * `&stop=S03` keeps the selected stop.
 */
export function MapPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const request = {
    routeId: searchParams.get('route') ?? '',
    origin: searchParams.get('origin') ?? '',
    destination: searchParams.get('destination') ?? '',
    optionId: searchParams.get('option') ?? '',
  };
  const selectedStopId = searchParams.get('stop') ?? '';
  // Same simulated minute as the real-time page ("Ver en el mapa" passes it along).
  const tickParam = Number(searchParams.get('tick') ?? 0);
  const tick = Number.isInteger(tickParam) && tickParam >= 0 && tickParam <= 1440 ? tickParam : 0;
  const isItinerary = !request.routeId && Boolean(request.origin && request.destination);

  const [showPlaces, setShowPlaces] = useState(true);
  const [showBuses, setShowBuses] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  const stopsQuery = useQuery('stops', () => fetchStops());
  const routesQuery = useQuery('routes', fetchRoutes);
  const placesQuery = useQuery('places', fetchPlaces);
  const busesQuery = useQuery(`buses:${tick}`, () => fetchBuses(tick));
  const planQuery = useQuery(isItinerary ? `plan:${request.origin}:${request.destination}` : null, () =>
    planTrip(request.origin, request.destination),
  );

  const queries = [stopsQuery, routesQuery, placesQuery, busesQuery, planQuery];
  const failed = queries.find((query) => query.status === 'error');
  const isLoading = queries.some((query) => query.status === 'loading');

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: key === 'stop' });
  };

  const header = <PageHeader title="Mapa" description="Mapa simulado del sistema: rutas, paraderos, buses y lugares de interés." />;

  if (failed?.status === 'error') {
    return (
      <div className="space-y-6" data-testid="page-map">
        {header}
        <ApiErrorState error={failed.error} onRetry={() => queries.forEach((query) => query.reload())} />
      </div>
    );
  }

  if (
    isLoading ||
    stopsQuery.status !== 'success' ||
    routesQuery.status !== 'success' ||
    placesQuery.status !== 'success' ||
    busesQuery.status !== 'success'
  ) {
    return (
      <div className="space-y-6" data-testid="page-map">
        {header}
        <LoadingState message="Cargando mapa…" />
      </div>
    );
  }

  const stops = stopsQuery.data;
  const routes = routesQuery.data;
  const view = buildMapView(request, {
    stops,
    routes,
    buses: busesQuery.data,
    plan: planQuery.status === 'success' ? planQuery.data : null,
  });
  const selectedStop = stops.find((stop) => stop.id === selectedStopId);

  return (
    <div className="space-y-6" data-testid="page-map">
      {header}

      <Card>
        <div className="flex flex-wrap items-end justify-between gap-4">
          {view.mode === 'itinerary' ? (
            <p className="text-sm font-medium text-slate-800">Mostrando un recorrido del planificador.</p>
          ) : (
            <div className="w-full max-w-xs">
              <SelectField
                id="map-route"
                testId="input-map-route"
                label="Ruta a destacar"
                placeholder="Todas las rutas activas"
                options={routes.map((route) => ({ value: route.id, label: `Ruta ${route.id} – ${route.name}${route.active ? '' : ' (suspendida)'}` }))}
                value={view.mode === 'route' ? request.routeId.toUpperCase() : ''}
                onChange={(event) => setSearchParams(event.target.value ? { route: event.target.value } : {})}
              />
            </div>
          )}
          {view.mode !== 'overview' && (
            <Button variant="secondary" onClick={() => setSearchParams({})} data-testid="btn-map-reset">
              Ver todas las rutas
            </Button>
          )}
        </div>
        <fieldset className="mt-4 flex flex-wrap gap-x-6 gap-y-2" data-testid="map-layers">
          <legend className="sr-only">Capas del mapa</legend>
          <CheckboxField id="toggle-map-buses" testId="toggle-map-buses" label="Buses" checked={showBuses} onChange={(event) => setShowBuses(event.target.checked)} />
          <CheckboxField id="toggle-map-places" testId="toggle-map-places" label="Lugares de interés" checked={showPlaces} onChange={(event) => setShowPlaces(event.target.checked)} />
          <CheckboxField id="toggle-map-labels" testId="toggle-map-labels" label="Nombres" checked={showLabels} onChange={(event) => setShowLabels(event.target.checked)} />
        </fieldset>
      </Card>

      {view.notice && <Notice tone="warning" title={view.notice.message} testId={view.notice.testId} />}

      <p className="font-medium text-slate-800" data-testid="map-summary" data-mode={view.mode}>
        {view.summary}
      </p>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* min-w-0: grid items default to min-width:auto, which would let the 720px map widen the page. */}
        <div className="min-w-0 space-y-4">
          {/* The drawing keeps a legible minimum width (640px); phones scroll inside this box, never the page. */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white" data-testid="map-container" tabIndex={-1}>
            <div className="min-w-[640px]">
              <RouteMap
                view={view}
                stops={stops}
                places={placesQuery.data}
                showPlaces={showPlaces}
                showBuses={showBuses}
                showLabels={showLabels}
                selectedStopId={selectedStopId}
                onSelectStop={(stopId) => setParam('stop', stopId === selectedStopId ? '' : stopId)}
              />
            </div>
          </div>
          <p className="text-xs text-slate-600">
            Selecciona un paradero con clic o con el teclado (Tab y Enter) para ver su información. Mapa ficticio, sin datos
            geográficos reales.
          </p>
          <MapTextAlternative view={view} stops={stops} routes={routes} />
        </div>

        <aside className="grid content-start gap-4 grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))]" aria-label="Información del mapa">
          {selectedStop ? (
            <MapStopInfo stop={selectedStop} roleLabel={stopRoleText[view.stopRoles[selectedStop.id] ?? 'idle']} onClose={() => setParam('stop', '')} />
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600" data-testid="map-stop-info-empty">
              Ningún paradero seleccionado.
            </p>
          )}
          <Card>
            <MapLegend routes={routes} />
          </Card>
        </aside>
      </div>
    </div>
  );
}
