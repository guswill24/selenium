import type { KeyboardEvent } from 'react';
import type { Place, Stop } from '../../types/transit.ts';
import type { MapPath, MapView, StopRole } from './mapModel.ts';

const WIDTH = 1000;
const HEIGHT = 600;
const PLACE_LABEL_FLIP_X = 800;

const roleLabels: Record<StopRole, string> = {
  origin: 'Origen del recorrido',
  destination: 'Destino del recorrido',
  transfer: 'Punto de transbordo',
  path: 'Parte del recorrido',
  idle: '',
};

/** Role marker: letter + color, so the role never depends on color alone. */
const roleMarker: Partial<Record<StopRole, { letter: string; fill: string }>> = {
  origin: { letter: 'A', fill: '#1d4ed8' },
  destination: { letter: 'B', fill: '#b91c1c' },
  transfer: { letter: 'T', fill: '#b45309' },
};

const pathStyle: Record<MapPath['emphasis'], { width: number; opacity: number }> = {
  focus: { width: 11, opacity: 1 },
  normal: { width: 7, opacity: 0.9 },
  muted: { width: 5, opacity: 0.22 },
};

interface RouteMapProps {
  view: MapView;
  stops: Stop[];
  places: Place[];
  showPlaces: boolean;
  showBuses: boolean;
  showLabels: boolean;
  selectedStopId: string;
  onSelectStop: (stopId: string) => void;
}

function MapBackground() {
  return (
    <g aria-hidden="true">
      <defs>
        <pattern id="map-grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#d6e1dd" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width={WIDTH} height={HEIGHT} fill="#f1f6f4" />
      <rect width={WIDTH} height={HEIGHT} fill="url(#map-grid)" />
      <path d="M 0 560 C 200 520, 380 600, 560 570 S 860 500, 1000 540 L 1000 600 L 0 600 Z" fill="#cfe3f5" />
      <ellipse cx="215" cy="250" rx="70" ry="38" fill="#d5ecd4" />
      <text x="24" y="585" fontSize="16" fill="#2f5d86">
        Río simulado
      </text>
    </g>
  );
}

export function RouteMap({ view, stops, places, showPlaces, showBuses, showLabels, selectedStopId, onSelectStop }: RouteMapProps) {
  const handleKey = (event: KeyboardEvent<SVGGElement>, stopId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelectStop(stopId);
    }
  };

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-auto w-full"
      role="group"
      aria-labelledby="route-map-title route-map-desc"
      data-testid="route-map"
      data-mode={view.mode}
    >
      <title id="route-map-title">Mapa simulado de Mi Ruta</title>
      <desc id="route-map-desc">{view.summary}</desc>

      <MapBackground />

      <g data-testid="map-paths">
        {view.paths.map((path) => (
          <polyline
            key={path.key}
            points={path.points.map((point) => `${point.x},${point.y}`).join(' ')}
            fill="none"
            stroke={path.color}
            strokeWidth={pathStyle[path.emphasis].width}
            strokeOpacity={pathStyle[path.emphasis].opacity}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={path.dashed ? '14 10' : undefined}
            data-testid={path.emphasis === 'focus' ? `map-route-focus-${path.routeId}` : `map-route-${path.routeId}`}
            data-emphasis={path.emphasis}
          />
        ))}
      </g>

      {showPlaces && (
        <g data-testid="map-places">
          {places.map((place) => (
            <g key={place.id} transform={`translate(${place.coords.x} ${place.coords.y})`} data-testid={`map-place-${place.id}`}>
              <title>{`Lugar de interés: ${place.name}`}</title>
              <rect x="-8" y="-8" width="16" height="16" transform="rotate(45)" fill="#7c3aed" stroke="#ffffff" strokeWidth="2" />
              {showLabels && (
                <text
                  // Right of the marker; near the right edge, centered below it so the text is never clipped.
                  x={place.coords.x > PLACE_LABEL_FLIP_X ? 0 : 14}
                  y={place.coords.x > PLACE_LABEL_FLIP_X ? 30 : 5}
                  textAnchor={place.coords.x > PLACE_LABEL_FLIP_X ? 'middle' : 'start'}
                  fontSize="15"
                  fill="#4c1d95"
                  className="map-label"
                >
                  {place.name}
                </text>
              )}
            </g>
          ))}
        </g>
      )}

      <g data-testid="map-stops">
        {stops.map((stop) => {
          const role = view.stopRoles[stop.id] ?? 'idle';
          const marker = roleMarker[role];
          const isSelected = stop.id === selectedStopId;
          const inMaintenance = stop.status !== 'ACTIVE';
          const label = [
            `Paradero ${stop.name} (${stop.id})`,
            inMaintenance ? 'en mantenimiento' : 'operativo',
            roleLabels[role],
          ]
            .filter(Boolean)
            .join('. ');

          return (
            <g
              key={stop.id}
              transform={`translate(${stop.coords.x} ${stop.coords.y})`}
              role="button"
              tabIndex={0}
              aria-label={label}
              aria-pressed={isSelected}
              className="map-stop cursor-pointer"
              onClick={() => onSelectStop(stop.id)}
              onKeyDown={(event) => handleKey(event, stop.id)}
              data-testid={`map-stop-${stop.id}`}
              data-role={role}
              data-status={stop.status}
              data-selected={isSelected}
            >
              <circle className="map-stop-focus" r="26" fill="none" stroke="#0f172a" strokeWidth="3" />
              {isSelected && <circle r="22" fill="none" stroke="#0369a1" strokeWidth="4" />}
              {marker ? (
                <>
                  <circle r="16" fill={marker.fill} stroke="#ffffff" strokeWidth="3" />
                  <text textAnchor="middle" dominantBaseline="central" fontSize="16" fontWeight="700" fill="#ffffff">
                    {marker.letter}
                  </text>
                </>
              ) : (
                <circle
                  r={role === 'path' ? 11 : 9}
                  fill="#ffffff"
                  stroke="#1e293b"
                  strokeWidth="4"
                  strokeDasharray={inMaintenance ? '4 3' : undefined}
                />
              )}
              {showLabels && (
                <text y="36" textAnchor="middle" fontSize="18" fontWeight="600" fill="#0f172a" className="map-label" data-testid={`map-stop-label-${stop.id}`}>
                  {stop.name}
                  {inMaintenance ? ' (mant.)' : ''}
                </text>
              )}
            </g>
          );
        })}
      </g>

      {showBuses && (
        <g data-testid="map-buses">
          {view.visibleBuses.map((bus) =>
            bus.position ? (
              <g
                key={bus.id}
                transform={`translate(${bus.position.x} ${bus.position.y - 30})`}
                data-testid={`map-bus-${bus.id}`}
                data-route-id={bus.routeId}
                data-x={bus.position.x}
                data-y={bus.position.y}
              >
                <title>{`Bus ${bus.id}, ruta ${bus.routeId}`}</title>
                <rect x="-26" y="-13" width="52" height="26" rx="7" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
                <text textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="700" fill="#ffffff">
                  {bus.id.replace('BUS', '')}
                </text>
                <path d="M -5 13 L 0 22 L 5 13 Z" fill="#0f172a" />
              </g>
            ) : null,
          )}
        </g>
      )}
    </svg>
  );
}
