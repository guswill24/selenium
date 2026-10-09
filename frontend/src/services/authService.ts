import type { ApiEnvelope } from '../types/api.ts';
import type { ProfileUpdate, Session, User } from '../types/auth.ts';
import type { SeedHistoryEntry } from '../types/history.ts';
import { apiRequest } from './apiClient.ts';

export async function login(username: string, password: string): Promise<Session> {
  const { data } = await apiRequest<ApiEnvelope<Session>>('/api/auth/login', {
    method: 'POST',
    body: { username, password },
  });
  return data;
}

export async function logout(): Promise<void> {
  await apiRequest('/api/auth/logout', { method: 'POST' });
}

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await apiRequest<ApiEnvelope<User>>('/api/auth/me');
  return data;
}

/** Initial (read-only) history of the signed-in user. */
export async function fetchSeedHistory(): Promise<SeedHistoryEntry[]> {
  const { data } = await apiRequest<ApiEnvelope<SeedHistoryEntry[]>>('/api/history');
  return data;
}

export async function updateProfile(update: ProfileUpdate): Promise<User> {
  const { data } = await apiRequest<ApiEnvelope<User>>('/api/profile', { method: 'PUT', body: update });
  return data;
}
