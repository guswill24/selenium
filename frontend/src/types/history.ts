export type HistorySource = 'SEED' | 'ROUTES' | 'PLANNER';

/** Seed entry as returned by GET /api/history. */
export interface SeedHistoryEntry {
  id: string;
  userId: string;
  date: string;
  originStopId: string;
  destinationStopId: string;
  routeId: string;
  estimatedMinutes: number;
}

export interface HistoryEntry {
  /** H01… for seed entries, L001… for entries recorded in this browser. */
  id: string;
  /** ISO 8601 with offset, e.g. 2026-03-02T07:40:00-05:00 */
  date: string;
  originStopId: string;
  originName: string;
  destinationStopId: string;
  destinationName: string;
  /** A route ("R12") or a planned trip ("R18-R22"). */
  routeId: string;
  estimatedMinutes: number;
  source: HistorySource;
}

export type NewHistoryEntry = Omit<HistoryEntry, 'id' | 'date' | 'source'> & { source: Exclude<HistorySource, 'SEED'> };
