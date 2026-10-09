import { describe, expect, it } from 'vitest';
import { fixtures } from '../data/fixtures.js';
import { getBus, positionAt } from './busService.js';

const r12 = fixtures.routes.find((route) => route.id === 'R12');
if (!r12) throw new Error('R12 fixture missing');

describe('positionAt', () => {
  // R12: S01 (100,100) @0 → S02 (260,170) @6 → S03 (430,280) @12
  it('is at the first stop at minute 0', () => {
    expect(positionAt(r12, 0)).toEqual({ minute: 0, fromStopId: 'S01', toStopId: 'S01', x: 100, y: 100 });
  });

  it('interpolates between two stops', () => {
    // minute 3 is halfway between S01 and S02
    expect(positionAt(r12, 3)).toEqual({ minute: 3, fromStopId: 'S01', toStopId: 'S02', x: 180, y: 135 });
  });

  it('is exactly at an intermediate stop on its minute', () => {
    expect(positionAt(r12, 6)).toEqual({ minute: 6, fromStopId: 'S02', toStopId: 'S02', x: 260, y: 170 });
  });

  it('clamps to the last stop beyond the route duration', () => {
    expect(positionAt(r12, 99)).toMatchObject({ minute: 12, fromStopId: 'S03', toStopId: 'S03', x: 430, y: 280 });
  });
});

describe('bus positions', () => {
  it('places BUS102 (R12, minute 7) between S02 and S03', () => {
    // 1/6 of the way from S02 (260,170) to S03 (430,280)
    expect(getBus('BUS102').position).toEqual({ minute: 7, fromStopId: 'S02', toStopId: 'S03', x: 288.3, y: 188.3 });
  });

  it('keeps a bus at its terminal at minute 0', () => {
    expect(getBus('BUS104').position).toMatchObject({ minute: 0, fromStopId: 'S03', x: 430, y: 280 });
  });

  it('does not position an out-of-service bus', () => {
    expect(getBus('BUS105').position).toBeNull();
  });
});
