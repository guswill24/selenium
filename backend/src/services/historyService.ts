import { data } from '../scenario/context.js';
import type { HistoryEntry } from '../data/schemas.js';

/** Seed history for a user, most recent first. Users never see other users' entries. */
export function listUserHistory(userId: string): HistoryEntry[] {
  return data().history
    .filter((entry) => entry.userId === userId)
    .toSorted((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}
