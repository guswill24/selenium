import { useEffect, useState } from 'react';
import { apiRequest } from '../services/apiClient.ts';

export type ApiHealthState = 'loading' | 'available' | 'unavailable';

interface HealthResponse {
  status: string;
}

export function useApiHealth(): ApiHealthState {
  const [state, setState] = useState<ApiHealthState>('loading');

  useEffect(() => {
    let isActive = true;

    apiRequest<HealthResponse>('/api/health')
      .then((data) => isActive && setState(data.status === 'ok' ? 'available' : 'unavailable'))
      .catch(() => isActive && setState('unavailable'));

    return () => {
      isActive = false;
    };
  }, []);

  return state;
}
