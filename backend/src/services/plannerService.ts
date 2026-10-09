import { isNoResults } from '../scenario/context.js';
import { activeRoutes, assertTripEndpoints, isServiceable, segmentOf, stopName, type RouteSegment } from './network.js';

/** Simulated waiting time added for every transfer. Fixed so results are reproducible. */
export const TRANSFER_WAIT_MINUTES = 5;
export const MAX_TRANSFERS = 2;
export const MAX_OPTIONS = 5;

export type TripTag = 'DIRECT' | 'FASTEST' | 'FEWEST_TRANSFERS';

export interface TripOption {
  /** Route ids joined by "-", e.g. "R18-R22". Stable and selector-friendly. */
  id: string;
  legs: RouteSegment[];
  transfers: number;
  transferStops: { stopId: string; name: string }[];
  travelMinutes: number;
  waitingMinutes: number;
  totalMinutes: number;
  /** Distinct stops along the whole trip, including origin and destination. */
  totalStops: number;
  recommended: boolean;
  tags: TripTag[];
}

export interface TripPlan {
  origin: { stopId: string; name: string };
  destination: { stopId: string; name: string };
  transferWaitMinutes: number;
  options: TripOption[];
}

/**
 * Depth-first enumeration of itineraries with at most MAX_TRANSFERS transfers.
 * A route is never reused and a stop is never revisited, so there are no loops.
 */
function enumerateItineraries(originId: string, destinationId: string): RouteSegment[][] {
  const itineraries: RouteSegment[][] = [];
  const routes = activeRoutes();

  const explore = (fromStopId: string, legs: RouteSegment[], usedRoutes: Set<string>, visited: Set<string>) => {
    if (legs.length > MAX_TRANSFERS) return;

    for (const route of routes) {
      if (usedRoutes.has(route.id)) continue;
      const boardIndex = route.stops.findIndex((stop) => stop.stopId === fromStopId);
      if (boardIndex < 0) continue;

      for (let alightIndex = boardIndex + 1; alightIndex < route.stops.length; alightIndex++) {
        const alightStopId = route.stops[alightIndex]?.stopId;
        if (!alightStopId || visited.has(alightStopId) || !isServiceable(alightStopId)) continue;

        const leg = segmentOf(route, boardIndex, alightIndex);
        if (alightStopId === destinationId) {
          itineraries.push([...legs, leg]);
        } else {
          explore(alightStopId, [...legs, leg], new Set([...usedRoutes, route.id]), new Set([...visited, alightStopId]));
        }
      }
    }
  };

  explore(originId, [], new Set(), new Set([originId]));
  return itineraries;
}

function toOption(legs: RouteSegment[]): Omit<TripOption, 'recommended' | 'tags'> {
  const transfers = legs.length - 1;
  const travelMinutes = legs.reduce((sum, leg) => sum + leg.minutes, 0);
  const waitingMinutes = transfers * TRANSFER_WAIT_MINUTES;
  return {
    id: legs.map((leg) => leg.routeId).join('-'),
    legs,
    transfers,
    transferStops: legs.slice(1).map((leg) => ({ stopId: leg.fromStopId, name: leg.fromName })),
    travelMinutes,
    waitingMinutes,
    totalMinutes: travelMinutes + waitingMinutes,
    totalStops: legs.reduce((sum, leg) => sum + leg.stopCount, 0) - transfers,
  };
}

/**
 * Plans a trip: the fastest itinerary is recommended; up to MAX_OPTIONS options are
 * returned, ordered by total time, then fewer transfers, then route ids.
 */
export function planTrip(originId: string, destinationId: string): TripPlan {
  assertTripEndpoints(originId, destinationId);

  const plan: TripPlan = {
    origin: { stopId: originId, name: stopName(originId) },
    destination: { stopId: destinationId, name: stopName(destinationId) },
    transferWaitMinutes: TRANSFER_WAIT_MINUTES,
    options: [],
  };
  if (isNoResults() || !isServiceable(originId) || !isServiceable(destinationId)) return plan;

  // Keep the fastest variant for each sequence of routes.
  const byRoutes = new Map<string, ReturnType<typeof toOption>>();
  for (const option of enumerateItineraries(originId, destinationId).map(toOption)) {
    const current = byRoutes.get(option.id);
    if (!current || option.totalMinutes < current.totalMinutes) byRoutes.set(option.id, option);
  }

  const sorted = [...byRoutes.values()]
    .toSorted((a, b) => a.totalMinutes - b.totalMinutes || a.transfers - b.transfers || a.id.localeCompare(b.id))
    .slice(0, MAX_OPTIONS);

  const transferCounts = sorted.map((option) => option.transfers);
  const fewestTransfers = Math.min(...transferCounts);
  // Only meaningful when options actually differ in number of transfers.
  const transfersDiffer = fewestTransfers !== Math.max(...transferCounts);
  plan.options = sorted.map((option, index) => {
    const tags: TripTag[] = [];
    if (option.transfers === 0) tags.push('DIRECT');
    if (index === 0) tags.push('FASTEST');
    if (transfersDiffer && option.transfers === fewestTransfers) tags.push('FEWEST_TRANSFERS');
    return { ...option, recommended: index === 0, tags };
  });
  return plan;
}
