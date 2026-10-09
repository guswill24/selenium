import { data, isNoResults } from '../scenario/context.js';
import type { PointOfInterest, Stop } from '../data/schemas.js';
import { notFoundError } from '../utils/httpError.js';

/** Simulated geography: 1 map unit = 5 meters; walking speed 80 meters per minute. */
export const METERS_PER_MAP_UNIT = 5;
export const WALKING_METERS_PER_MINUTE = 80;

export interface NearbyStop {
  stopId: string;
  name: string;
  status: Stop['status'];
  accessible: boolean;
  /** Rounded to the nearest 10 meters. */
  distanceMeters: number;
  /** Rounded up to whole minutes. */
  walkingMinutes: number;
}

export interface NearbyStopsResult {
  place: PointOfInterest;
  stops: NearbyStop[];
}

export function listPlaces(): PointOfInterest[] {
  return [...data().pointsOfInterest];
}

function distanceMeters(from: { x: number; y: number }, to: { x: number; y: number }): number {
  const units = Math.hypot(from.x - to.x, from.y - to.y);
  return Math.round((units * METERS_PER_MAP_UNIT) / 10) * 10;
}

/** The `limit` closest stops to a simulated location (a point of interest). No real GPS involved. */
export function findNearbyStops(placeId: string, limit = 3): NearbyStopsResult {
  const place = data().pointsOfInterest.find((candidate) => candidate.id === placeId);
  if (!place) throw notFoundError('La ubicación', placeId);

  if (isNoResults()) return { place, stops: [] };

  const stops = data().stops
    .map((stop) => {
      const meters = distanceMeters(place.coords, stop.coords);
      return {
        stopId: stop.id,
        name: stop.name,
        status: stop.status,
        accessible: stop.accessible,
        distanceMeters: meters,
        walkingMinutes: Math.max(1, Math.ceil(meters / WALKING_METERS_PER_MINUTE)),
      };
    })
    .toSorted((a, b) => a.distanceMeters - b.distanceMeters || a.stopId.localeCompare(b.stopId))
    .slice(0, limit);

  return { place, stops };
}
