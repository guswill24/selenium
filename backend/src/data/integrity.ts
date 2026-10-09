import type { Fixtures } from './schemas.js';

/**
 * Cross-file consistency rules that a per-record schema cannot express.
 * Returns a list of human-readable problems; an empty list means the fixtures are consistent.
 */
export function findIntegrityProblems(fixtures: Fixtures): string[] {
  const problems: string[] = [];
  const stopIds = new Set(fixtures.stops.map((stop) => stop.id));
  const routeIds = new Set(fixtures.routes.map((route) => route.id));
  const userIds = new Set(fixtures.users.map((user) => user.id));

  const collections: [string, { id: string }[]][] = [
    ['stops', fixtures.stops],
    ['routes', fixtures.routes],
    ['buses', fixtures.buses],
    ['alerts', fixtures.alerts],
    ['users', fixtures.users],
    ['history', fixtures.history],
    ['pointsOfInterest', fixtures.pointsOfInterest],
  ];
  for (const [name, items] of collections) {
    const seen = new Set<string>();
    for (const item of items) {
      if (seen.has(item.id)) problems.push(`${name}: duplicated id ${item.id}`);
      seen.add(item.id);
    }
  }

  const usernames = new Set<string>();
  for (const user of fixtures.users) {
    if (usernames.has(user.username)) problems.push(`users: duplicated username ${user.username}`);
    usernames.add(user.username);
  }

  for (const route of fixtures.routes) {
    const first = route.stops[0];
    const last = route.stops.at(-1);
    if (first?.stopId !== route.originStopId) problems.push(`${route.id}: first stop must be originStopId ${route.originStopId}`);
    if (last?.stopId !== route.destinationStopId) problems.push(`${route.id}: last stop must be destinationStopId ${route.destinationStopId}`);
    if (first?.minutesFromStart !== 0) problems.push(`${route.id}: first stop must have minutesFromStart 0`);
    if (last?.minutesFromStart !== route.estimatedMinutes) problems.push(`${route.id}: estimatedMinutes must match the last stop time`);
    if (new Set(route.stops.map((stop) => stop.stopId)).size !== route.stops.length) problems.push(`${route.id}: repeated stop in sequence`);

    route.stops.forEach((stop, index) => {
      if (!stopIds.has(stop.stopId)) problems.push(`${route.id}: unknown stop ${stop.stopId}`);
      const previous = route.stops[index - 1];
      if (previous && stop.minutesFromStart <= previous.minutesFromStart) {
        problems.push(`${route.id}: minutesFromStart must increase (${previous.stopId} -> ${stop.stopId})`);
      }
    });

    if (route.active !== (route.status !== 'SUSPENDED')) problems.push(`${route.id}: active flag contradicts status ${route.status}`);
  }

  for (const bus of fixtures.buses) {
    const route = fixtures.routes.find((candidate) => candidate.id === bus.routeId);
    if (!route) {
      problems.push(`${bus.id}: unknown route ${bus.routeId}`);
      continue;
    }
    if (bus.startMinute > route.estimatedMinutes) problems.push(`${bus.id}: startMinute beyond route duration`);
    if (!route.active && bus.status === 'IN_SERVICE') problems.push(`${bus.id}: in service on inactive route ${route.id}`);
  }

  for (const alert of fixtures.alerts) {
    if (alert.routeId && !routeIds.has(alert.routeId)) problems.push(`${alert.id}: unknown route ${alert.routeId}`);
    // An active delay alert must agree with the route data shown elsewhere (live ETAs, route status).
    const route = fixtures.routes.find((candidate) => candidate.id === alert.routeId);
    if (alert.active && alert.type === 'DELAY' && route?.status !== 'DELAYED') {
      problems.push(`${alert.id}: active delay alert but route ${alert.routeId ?? '(none)'} is not DELAYED`);
    }
  }

  for (const schedule of fixtures.schedules) {
    if (!routeIds.has(schedule.routeId)) problems.push(`schedule: unknown route ${schedule.routeId}`);
    if (schedule.firstDeparture >= schedule.lastDeparture) problems.push(`schedule ${schedule.routeId}/${schedule.dayType}: first departure must precede last`);
  }

  for (const entry of fixtures.history) {
    if (!userIds.has(entry.userId)) problems.push(`${entry.id}: unknown user ${entry.userId}`);
    const route = fixtures.routes.find((candidate) => candidate.id === entry.routeId);
    if (!route) {
      problems.push(`${entry.id}: unknown route ${entry.routeId}`);
      continue;
    }
    const originIndex = route.stops.findIndex((stop) => stop.stopId === entry.originStopId);
    const destinationIndex = route.stops.findIndex((stop) => stop.stopId === entry.destinationStopId);
    if (originIndex < 0 || destinationIndex <= originIndex) {
      problems.push(`${entry.id}: route ${route.id} does not go from ${entry.originStopId} to ${entry.destinationStopId}`);
    }
  }

  for (const place of fixtures.pointsOfInterest) {
    if (!stopIds.has(place.nearStopId)) problems.push(`${place.id}: unknown stop ${place.nearStopId}`);
  }

  return problems;
}
