import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../services/apiClient.ts';
import { useScenario } from './useScenario.ts';

export type QueryState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: ApiError };

type SettledState<T> = Extract<QueryState<T>, { status: 'success' | 'error' }>;

function toApiError(error: unknown): ApiError {
  return error instanceof ApiError
    ? error
    : new ApiError({ status: 0, code: 'UNKNOWN_ERROR', message: 'Ocurrió un error inesperado.' });
}

/**
 * Loads data identified by `key`. A `null` key means "nothing to load" (idle).
 * Changing the key or calling `reload` fetches again; stale responses are ignored.
 */
export function useQuery<T>(key: string | null, fetcher: () => Promise<T>): QueryState<T> & { reload: () => void } {
  const [settled, setSettled] = useState<{ requestKey: string; state: SettledState<T> } | null>(null);
  const [reloadCount, setReloadCount] = useState(0);
  const fetcherRef = useRef(fetcher);
  // The active test scenario is part of the key: switching scenario refetches every mounted query.
  const { key: scenarioKey } = useScenario();
  const requestKey = key === null ? null : `${key}#${reloadCount}@${scenarioKey}`;

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    if (requestKey === null) return;
    let isCurrent = true;
    fetcherRef
      .current()
      .then((data) => isCurrent && setSettled({ requestKey, state: { status: 'success', data } }))
      .catch((error: unknown) => isCurrent && setSettled({ requestKey, state: { status: 'error', error: toApiError(error) } }));
    return () => {
      isCurrent = false;
    };
  }, [requestKey]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  let state: QueryState<T>;
  if (requestKey === null) state = { status: 'idle' };
  else if (settled?.requestKey === requestKey) state = settled.state;
  else state = { status: 'loading' };

  return { ...state, reload };
}
