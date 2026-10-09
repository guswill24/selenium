import type { HistoryEntry, NewHistoryEntry } from '../types/history.ts';
import { readJson, writeJson } from '../utils/storage.ts';

/**
 * Per-user history kept in this browser (localStorage). The API fixtures are
 * read-only, so recorded entries and deletions never reach the server.
 */
interface StoredHistory {
  nextId: number;
  entries: HistoryEntry[];
  /** Seed entries (from the API) the user deleted. */
  hiddenSeedIds: string[];
}

export const MAX_LOCAL_ENTRIES = 50;

const key = (userId: string) => `mi-ruta:history:${userId}`;
const empty = (): StoredHistory => ({ nextId: 1, entries: [], hiddenSeedIds: [] });

export function readHistory(userId: string): StoredHistory {
  const stored = readJson<StoredHistory>(key(userId));
  return stored && Array.isArray(stored.entries) && Array.isArray(stored.hiddenSeedIds) ? stored : empty();
}

function save(userId: string, history: StoredHistory): void {
  writeJson(key(userId), history);
}

/** Local time with its UTC offset, e.g. 2026-03-02T07:40:12-05:00 (shown as the user's own clock). */
export function nowLocalIso(now = new Date()): string {
  const pad = (value: number) => String(Math.abs(value)).padStart(2, '0');
  const offset = -now.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
    `T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}` +
    `${sign}${pad(Math.trunc(offset / 60))}:${pad(offset % 60)}`
  );
}

function sameTrip(a: Pick<HistoryEntry, 'originStopId' | 'destinationStopId' | 'routeId'>, b: typeof a): boolean {
  return a.originStopId === b.originStopId && a.destinationStopId === b.destinationStopId && a.routeId === b.routeId;
}

/**
 * Records a consultation. Repeating the most recent one only refreshes its date,
 * so clicking the same selection twice does not create duplicates.
 */
export function recordHistory(userId: string, entry: NewHistoryEntry): HistoryEntry {
  const history = readHistory(userId);
  const [latest, ...rest] = history.entries;

  if (latest && sameTrip(latest, entry)) {
    const refreshed = { ...latest, date: nowLocalIso(), estimatedMinutes: entry.estimatedMinutes };
    save(userId, { ...history, entries: [refreshed, ...rest] });
    return refreshed;
  }

  const created: HistoryEntry = { ...entry, id: `L${String(history.nextId).padStart(3, '0')}`, date: nowLocalIso() };
  save(userId, {
    ...history,
    nextId: history.nextId + 1,
    entries: [created, ...history.entries].slice(0, MAX_LOCAL_ENTRIES),
  });
  return created;
}

export function deleteHistoryEntry(userId: string, entryId: string, isSeed: boolean): void {
  const history = readHistory(userId);
  save(
    userId,
    isSeed
      ? { ...history, hiddenSeedIds: [...new Set([...history.hiddenSeedIds, entryId])] }
      : { ...history, entries: history.entries.filter((entry) => entry.id !== entryId) },
  );
}

/** Removes local entries and hides every seed entry. Ids keep counting up (no reuse). */
export function clearHistory(userId: string, seedIds: string[]): void {
  const history = readHistory(userId);
  save(userId, { ...history, entries: [], hiddenSeedIds: seedIds });
}

/** Consultations recorded in this browser, across every user (monitoring). */
export function countLocalHistoryEntries(): number {
  try {
    let total = 0;
    for (let index = 0; index < window.localStorage.length; index++) {
      const storageKey = window.localStorage.key(index);
      if (storageKey?.startsWith('mi-ruta:history:')) {
        total += readHistory(storageKey.slice('mi-ruta:history:'.length)).entries.length;
      }
    }
    return total;
  } catch {
    return 0;
  }
}

/** Back to the initial state: only the seed history from the API. */
export function restoreHistory(userId: string): void {
  save(userId, empty());
}
