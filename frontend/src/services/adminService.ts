import type { AdminEntity, AdminRoute, AdminSummary, RouteInput, Schedule } from '../types/admin.ts';
import type { ApiEnvelope } from '../types/api.ts';
import type { Alert } from '../types/transit.ts';
import { apiRequest } from './apiClient.ts';

/** Administration endpoints validate and authorize; they never persist (see docs/admin.md). */

export async function fetchAdminSummary(): Promise<AdminSummary> {
  return (await apiRequest<ApiEnvelope<AdminSummary>>('/api/admin/summary')).data;
}

export async function fetchSchedules(): Promise<Schedule[]> {
  return (await apiRequest<ApiEnvelope<Schedule[]>>('/api/admin/schedules')).data;
}

export async function fetchAllAlerts(): Promise<Alert[]> {
  return (await apiRequest<ApiEnvelope<Alert[]>>('/api/admin/alerts')).data;
}

export async function createRoute(input: RouteInput): Promise<AdminRoute> {
  return (await apiRequest<ApiEnvelope<AdminRoute>>('/api/admin/routes', { method: 'POST', body: input })).data;
}

export async function updateRoute(input: RouteInput): Promise<AdminRoute> {
  return (await apiRequest<ApiEnvelope<AdminRoute>>(`/api/admin/routes/${encodeURIComponent(input.id)}`, { method: 'PUT', body: input })).data;
}

export async function setEntityActive(entity: AdminEntity, id: string, active: boolean): Promise<void> {
  await apiRequest(`/api/admin/${entity}/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: { active } });
}
