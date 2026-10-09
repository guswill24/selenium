import { Footprints, LocateFixed } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useQuery } from '../../hooks/useQuery.ts';
import { fetchNearbyStops, fetchPlaces } from '../../services/transitService.ts';
import { formatMinutes } from '../../utils/format.ts';
import { ApiErrorState } from '../feedback/ApiErrorState.tsx';
import { LoadingState } from '../feedback/LoadingState.tsx';
import { SelectField } from '../form/SelectField.tsx';
import { StopStatusBadge } from '../transit/StatusBadges.tsx';
import { Badge } from '../ui/Badge.tsx';
import { Button } from '../ui/Button.tsx';
import { Card } from '../ui/Card.tsx';

interface NearbyStopsCardProps {
  placeId: string;
  onPlaceChange: (placeId: string) => void;
  onViewStop: (stopId: string) => void;
}

/** Nearby stops from a simulated location (no real GPS): the user picks a known place. */
export function NearbyStopsCard({ placeId, onPlaceChange, onViewStop }: NearbyStopsCardProps) {
  const placesQuery = useQuery('places', fetchPlaces);
  const nearbyQuery = useQuery(placeId ? `nearby:${placeId}` : null, () => fetchNearbyStops(placeId));
  const [draft, setDraft] = useState(placeId);
  const [error, setError] = useState<string>();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft) {
      setError('Selecciona una ubicación simulada.');
      return;
    }
    setError(undefined);
    if (draft === placeId) nearbyQuery.reload();
    else onPlaceChange(draft);
  };

  return (
    <Card title="Paraderos cercanos" data-testid="nearby-stops-card">
      <p className="mb-4 text-sm text-slate-600">
        Elige una ubicación simulada para conocer los tres paraderos más cercanos. Las distancias se calculan sobre el mapa
        ficticio; no se usa GPS.
      </p>

      {placesQuery.status === 'loading' && <LoadingState message="Cargando ubicaciones…" scope="places" />}
      {placesQuery.status === 'error' && <ApiErrorState error={placesQuery.error} onRetry={placesQuery.reload} scope="places" />}
      {placesQuery.status === 'success' && (
        <form className="flex flex-wrap items-end gap-3" onSubmit={handleSubmit} noValidate aria-label="Buscar paraderos cercanos">
          <div className="min-w-0 flex-1 basis-60">
            <SelectField
              id="location"
              testId="input-location"
              label="Ubicación simulada"
              placeholder="Selecciona una ubicación"
              required
              options={placesQuery.data.map((place) => ({ value: place.id, label: place.name }))}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              error={error}
            />
          </div>
          <Button type="submit" isLoading={nearbyQuery.status === 'loading'} loadingText="Buscando…" data-testid="btn-find-nearby">
            <LocateFixed className="h-4 w-4" aria-hidden="true" />
            Buscar cercanos
          </Button>
        </form>
      )}

      <div className="mt-5" aria-live="polite">
        {nearbyQuery.status === 'loading' && <LoadingState message="Calculando distancias…" scope="nearby" />}
        {nearbyQuery.status === 'error' && <ApiErrorState error={nearbyQuery.error} onRetry={nearbyQuery.reload} scope="nearby" />}
        {nearbyQuery.status === 'success' && (
          <div data-testid="nearby-stops" data-place-id={nearbyQuery.data.place.id}>
            <p className="mb-3 text-sm font-medium text-slate-800" data-testid="nearby-stops-origin">
              Cerca de {nearbyQuery.data.place.name}
            </p>
            <ol className="space-y-3">
              {nearbyQuery.data.stops.map((stop, index) => (
                <li
                  key={stop.stopId}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4"
                  data-testid={`nearby-stop-${stop.stopId}`}
                  data-rank={index + 1}
                >
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-semibold text-slate-900">
                      {stop.name} <span className="font-normal text-slate-600">({stop.stopId})</span>
                      {index === 0 && (
                        <Badge tone="info" data-testid={`nearby-closest-${stop.stopId}`}>
                          Más cercano
                        </Badge>
                      )}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-700" data-testid={`nearby-distance-${stop.stopId}`}>
                      <Footprints className="h-4 w-4 text-brand-700" aria-hidden="true" />
                      {stop.distanceMeters} m · {formatMinutes(stop.walkingMinutes)} caminando
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StopStatusBadge status={stop.status} testId={`nearby-status-${stop.stopId}`} />
                    <Button variant="secondary" onClick={() => onViewStop(stop.stopId)} data-testid={`btn-nearby-view-${stop.stopId}`}>
                      Ver detalle
                    </Button>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </Card>
  );
}
