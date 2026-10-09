import { useCallback } from 'react';
import { recordHistory } from '../services/historyStore.ts';
import type { HistoryEntry, NewHistoryEntry } from '../types/history.ts';
import { useAuth } from './useAuth.ts';

/** Records a consultation for the signed-in user; returns the stored entry (null without a user). */
export function useRecordHistory(): (entry: NewHistoryEntry) => HistoryEntry | null {
  const { user } = useAuth();
  return useCallback((entry: NewHistoryEntry) => (user ? recordHistory(user.id, entry) : null), [user]);
}
