import type { Bus, Route } from '../data/schemas.js';

/**
 * Deterministic real-time simulation. Nothing depends on the real clock:
 * the client asks for a `tick` (1 tick = 1 simulated minute) and the same tick
 * always produces the same state.
 *
 * Each bus loops on its route: it waits LAYOVER_MINUTES at the first stop,
 * travels to the last stop, and starts over (the return trip is not modelled).
 */
export const LAYOVER_MINUTES = 3;
export const MAX_TICK = 1440;

/** Simulated clock origin: 07:30 local time (UTC-05:00). */
const SIMULATION_START_UTC = Date.UTC(2026, 2, 2, 12, 30);
const UTC_OFFSET_MINUTES = -5 * 60;

export type LiveStatus = 'IN_SERVICE' | 'AT_TERMINAL' | 'OUT_OF_SERVICE';

export interface SimulatedClock {
  tick: number;
  /** ISO 8601 with the simulated local offset, e.g. 2026-03-02T07:35:00-05:00 */
  timestamp: string;
  /** HH:mm local time, e.g. 07:35 */
  time: string;
}

export function simulatedClock(tick: number): SimulatedClock {
  const local = new Date(SIMULATION_START_UTC + (tick + UTC_OFFSET_MINUTES) * 60_000);
  const iso = local.toISOString().slice(0, 19);
  return { tick, timestamp: `${iso}-05:00`, time: iso.slice(11, 16) };
}

export function cycleLength(route: Route): number {
  return route.estimatedMinutes + LAYOVER_MINUTES;
}

/**
 * Position in the loop at a tick: 0..LAYOVER-1 waiting at the first stop,
 * LAYOVER..cycle-1 travelling (minute on route = phase - LAYOVER).
 * A bus that starts IN_SERVICE is at `startMinute` on tick 0.
 */
export function phaseAt(bus: Bus, route: Route, tick: number): number {
  const offset = bus.status === 'AT_TERMINAL' ? 0 : LAYOVER_MINUTES + bus.startMinute;
  return (offset + tick) % cycleLength(route);
}

export function isRunning(bus: Bus, route: Route | undefined): route is Route {
  return Boolean(route?.active) && bus.status !== 'OUT_OF_SERVICE';
}

/** Minutes (without delay) until the bus reaches `stopMinute` on its route; 0 means it is there now. */
export function minutesUntil(bus: Bus, route: Route, tick: number, stopMinute: number): number {
  const cycle = cycleLength(route);
  const phase = phaseAt(bus, route, tick);
  return (LAYOVER_MINUTES + stopMinute - phase + cycle) % cycle;
}
