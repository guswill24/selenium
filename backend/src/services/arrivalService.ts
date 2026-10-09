import { data, isNoResults } from '../scenario/context.js';
import { isServiceable, requireStop } from './network.js';
import { isRunning, minutesUntil, simulatedClock, type SimulatedClock } from './simulation.js';

export interface Arrival {
  busId: string;
  routeId: string;
  routeName: string;
  /** Minutes until the bus reaches the stop, including delay. 0 = arriving now. */
  etaMinutes: number;
  delayMinutes: number;
}

export interface StopArrivals {
  stopId: string;
  stopName: string;
  /** False when the stop is not ACTIVE: no bus stops there, so there are no arrivals. */
  served: boolean;
  clock: SimulatedClock;
  arrivals: Arrival[];
}

/** Upcoming arrivals at a stop for every running bus whose route stops there, soonest first. */
export function arrivalsAt(stopId: string, tick = 0): StopArrivals {
  const stop = requireStop(stopId);
  const served = isServiceable(stopId);
  const arrivals: Arrival[] = [];

  if (served && !isNoResults()) {
    for (const bus of data().buses) {
      const route = data().routes.find((candidate) => candidate.id === bus.routeId);
      if (!isRunning(bus, route)) continue;
      const routeStop = route.stops.find((candidate) => candidate.stopId === stopId);
      if (!routeStop) continue;

      arrivals.push({
        busId: bus.id,
        routeId: route.id,
        routeName: route.name,
        etaMinutes: minutesUntil(bus, route, tick, routeStop.minutesFromStart) + bus.delayMinutes,
        delayMinutes: bus.delayMinutes,
      });
    }
  }

  return {
    stopId: stop.id,
    stopName: stop.name,
    served,
    clock: simulatedClock(tick),
    arrivals: arrivals.toSorted((a, b) => a.etaMinutes - b.etaMinutes || a.busId.localeCompare(b.busId)),
  };
}
