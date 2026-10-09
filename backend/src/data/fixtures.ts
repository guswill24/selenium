// JSON files in /data are read-only fixtures. They are bundled with the API
// (static imports) so they work the same locally and on Vercel serverless functions.
import alerts from '../../../data/alerts.json' with { type: 'json' };
import buses from '../../../data/buses.json' with { type: 'json' };
import history from '../../../data/history.json' with { type: 'json' };
import pointsOfInterest from '../../../data/points-of-interest.json' with { type: 'json' };
import routes from '../../../data/routes.json' with { type: 'json' };
import schedules from '../../../data/schedules.json' with { type: 'json' };
import stops from '../../../data/stops.json' with { type: 'json' };
import users from '../../../data/users.json' with { type: 'json' };
import { findIntegrityProblems } from './integrity.js';
import { fixturesSchema, type Fixtures } from './schemas.js';

export const rawFixtures: unknown = { stops, routes, buses, alerts, schedules, users, history, pointsOfInterest };

export class FixtureValidationError extends Error {
  constructor(readonly problems: string[]) {
    super(`Invalid fixtures:\n- ${problems.join('\n- ')}`);
    this.name = 'FixtureValidationError';
  }
}

/** Validates shape and cross-references. Throws with every problem found. */
export function parseFixtures(input: unknown): Fixtures {
  const result = fixturesSchema.safeParse(input);
  if (!result.success) {
    throw new FixtureValidationError(
      result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
    );
  }

  const problems = findIntegrityProblems(result.data);
  if (problems.length > 0) {
    throw new FixtureValidationError(problems);
  }

  return result.data;
}

export function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

/**
 * Validated fixtures, deeply frozen so no request can mutate shared data.
 * Fails fast at startup if the JSON files are inconsistent.
 */
export const fixtures: Readonly<Fixtures> = deepFreeze(parseFixtures(rawFixtures));
