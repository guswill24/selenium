import type { ApiEnvelope } from '../types/api.ts';
import type {
  Alert,
  AlertLevel,
  AlertType,
  Bus,
  NearbyStopsResult,
  Place,
  Route,
  RouteSearchResult,
  Stop,
  StopDetail,
  StopArrivals,
  StopStatus,
  TripPlan,
} from '../types/transit.ts';
import { apiRequest } from './apiClient.ts';

export interface StopFilters {
  q?: string;
  status?: StopStatus | '';
}

function queryString(params: Record<string, string | undefined>): string {
  const query = new URLSearchParams(Object.entries(params).filter((entry): entry is [string, string] => Boolean(entry[1])));
  const text = query.toString();
  return text ? `?${text}` : '';
}

export async function fetchStops({ q, status }: StopFilters = {}): Promise<Stop[]> {
  return (await apiRequest<ApiEnvelope<Stop[]>>(`/api/stops${queryString({ q, status })}`)).data;
}

export async function fetchStop(id: string): Promise<StopDetail> {
  return (await apiRequest<ApiEnvelope<StopDetail>>(`/api/stops/${encodeURIComponent(id)}`)).data;
}

export async function fetchNearbyStops(placeId: string): Promise<NearbyStopsResult> {
  return (await apiRequest<ApiEnvelope<NearbyStopsResult>>(`/api/stops/nearby${queryString({ place: placeId })}`)).data;
}

export async function fetchPlaces(): Promise<Place[]> {
  return (await apiRequest<ApiEnvelope<Place[]>>('/api/places')).data;
}

export async function fetchRoutes(): Promise<Route[]> {
  return (await apiRequest<ApiEnvelope<Route[]>>('/api/routes')).data;
}

export interface AlertFilters {
  level?: AlertLevel | '';
  type?: AlertType | '';
  route?: string;
}

export async function fetchAlerts({ level, type, route }: AlertFilters = {}): Promise<Alert[]> {
  return (await apiRequest<ApiEnvelope<Alert[]>>(`/api/alerts${queryString({ level, type, route })}`)).data;
}

export async function fetchBuses(tick = 0): Promise<Bus[]> {
  return (await apiRequest<ApiEnvelope<Bus[]>>(`/api/buses${queryString({ tick: String(tick) })}`)).data;
}

export async function fetchArrivals(stop: string, tick = 0): Promise<StopArrivals> {
  return (await apiRequest<ApiEnvelope<StopArrivals>>(`/api/arrivals${queryString({ stop, tick: String(tick) })}`)).data;
}

export async function planTrip(origin: string, destination: string): Promise<TripPlan> {
  return (await apiRequest<ApiEnvelope<TripPlan>>(`/api/plan${queryString({ origin, destination })}`)).data;
}

export async function searchRoutes(origin: string, destination: string): Promise<RouteSearchResult[]> {
  return (await apiRequest<ApiEnvelope<RouteSearchResult[]>>(`/api/routes${queryString({ origin, destination })}`)).data;
}
