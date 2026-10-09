import type { Route } from '../../types/transit.ts';

interface MapLegendProps {
  routes: Route[];
}

function Marker({ letter, color }: { letter: string; color: string }) {
  return (
    <svg width="22" height="22" viewBox="-11 -11 22 22" aria-hidden="true">
      <circle r="10" fill={color} />
      <text textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="700" fill="#ffffff">
        {letter}
      </text>
    </svg>
  );
}

export function MapLegend({ routes }: MapLegendProps) {
  return (
    <section aria-labelledby="map-legend-title" data-testid="map-legend">
      <h2 id="map-legend-title" className="mb-2 text-sm font-semibold text-slate-900">
        Leyenda
      </h2>
      <ul className="grid gap-x-6 gap-y-2 text-sm text-slate-800 sm:grid-cols-2">
        <li className="flex items-center gap-2">
          <Marker letter="A" color="#04775b" /> Origen
        </li>
        <li className="flex items-center gap-2">
          <Marker letter="B" color="#b91c1c" /> Destino
        </li>
        <li className="flex items-center gap-2">
          <Marker letter="T" color="#b45309" /> Transbordo
        </li>
        <li className="flex items-center gap-2">
          <svg width="22" height="22" viewBox="-11 -11 22 22" aria-hidden="true">
            <circle r="7" fill="#ffffff" stroke="#1e293b" strokeWidth="3" strokeDasharray="3 2" />
          </svg>
          Paradero en mantenimiento (borde punteado)
        </li>
        <li className="flex items-center gap-2">
          <svg width="30" height="18" viewBox="0 0 30 18" aria-hidden="true">
            <rect x="1" y="1" width="28" height="16" rx="4" fill="#0f172a" />
          </svg>
          Bus (número de unidad)
        </li>
        <li className="flex items-center gap-2">
          <svg width="22" height="22" viewBox="-11 -11 22 22" aria-hidden="true">
            <rect x="-6" y="-6" width="12" height="12" transform="rotate(45)" fill="#7c3aed" />
          </svg>
          Lugar de interés
        </li>
        {routes.map((route) => (
          <li key={route.id} className="flex items-center gap-2" data-testid={`map-legend-route-${route.id}`}>
            <svg width="30" height="10" viewBox="0 0 30 10" aria-hidden="true">
              <line x1="2" y1="5" x2="28" y2="5" stroke={route.color} strokeWidth="5" strokeLinecap="round" strokeDasharray={route.active ? undefined : '6 4'} />
            </svg>
            Ruta {route.id}
            {route.active ? '' : ' (suspendida, línea punteada)'}
          </li>
        ))}
      </ul>
    </section>
  );
}
