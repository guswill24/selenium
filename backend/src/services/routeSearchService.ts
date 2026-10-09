import type { Route } from '../data/schemas.js';
import { isNoResults } from '../scenario/context.js';
import { activeRoutes, assertTripEndpoints, isServiceable, segmentOf } from './network.js';
import type { RouteStopView } from './routeService.js';

export interface RouteSearchResult {
  routeId: string;
  name: string;
  color: string;
  status: Route['status'];
  originStopId: string;
  originName: string;
  destinationStopId: string;
  destinationName: string;
  /** Travel time between the searched stops (not the whole route). */
  estimatedMinutes: number;
  /** Stops travelled, including origin and destination. */
  stopCount: number;
  stops: RouteStopView[];
}

/**
 * Direct routes (no transfers) from origin to destination, fastest first.
 * Only active routes count, and a route never serves a stop that is not ACTIVE
 * (for example S08 under maintenance), so such searches return no results.
 */
export function searchRoutes(originId: string, destinationId: string): RouteSearchResult[] {
  assertTripEndpoints(originId, destinationId);
  if (isNoResults() || !isServiceable(originId) || !isServiceable(destinationId)) return [];

  return activeRoutes()
    .flatMap((route) => {
      const originIndex = route.stops.findIndex((stop) => stop.stopId === originId);
      const destinationIndex = route.stops.findIndex((stop) => stop.stopId === destinationId);
      if (originIndex < 0 || destinationIndex <= originIndex) return [];

      const segment = segmentOf(route, originIndex, destinationIndex);
      return [
        {
          routeId: segment.routeId,
          name: segment.routeName,
          color: segment.color,
          status: segment.status,
          originStopId: segment.fromStopId,
          originName: segment.fromName,
          destinationStopId: segment.toStopId,
          destinationName: segment.toName,
          estimatedMinutes: segment.minutes,
          stopCount: segment.stopCount,
          stops: segment.stops,
        },
      ];
    })
    .toSorted((a, b) => a.estimatedMinutes - b.estimatedMinutes || a.routeId.localeCompare(b.routeId));
}
