import type { AdminEntity, AdminRoute } from '../types/admin.ts';
import { readJson, removeKey, writeJson } from '../utils/storage.ts';

/**
 * Demo changes made in administration, kept in this browser only. The server
 * validated each change but does not store it; the public catalog is unaffected.
 */
export interface AdminDemoState {
  /** Created or edited routes, by id. */
  routes: Record<string, AdminRoute>;
  /** Ids of routes created here (not in the server catalog). */
  createdRouteIds: string[];
  /** Activation overrides per entity and id. */
  active: Record<AdminEntity, Record<string, boolean>>;
}

const KEY = 'mi-ruta:admin-demo';

const empty = (): AdminDemoState => ({
  routes: {},
  createdRouteIds: [],
  active: { routes: {}, stops: {}, buses: {}, alerts: {} },
});

export function readAdminDemo(): AdminDemoState {
  const stored = readJson<AdminDemoState>(KEY);
  return stored?.routes && stored.active && Array.isArray(stored.createdRouteIds) ? { ...empty(), ...stored, active: { ...empty().active, ...stored.active } } : empty();
}

export function saveAdminRoute(route: AdminRoute, isNew: boolean): AdminDemoState {
  const state = readAdminDemo();
  const next: AdminDemoState = {
    ...state,
    routes: { ...state.routes, [route.id]: route },
    createdRouteIds: isNew ? [...new Set([...state.createdRouteIds, route.id])] : state.createdRouteIds,
  };
  writeJson(KEY, next);
  return next;
}

export function saveActiveOverride(entity: AdminEntity, id: string, active: boolean): AdminDemoState {
  const state = readAdminDemo();
  const next: AdminDemoState = { ...state, active: { ...state.active, [entity]: { ...state.active[entity], [id]: active } } };
  writeJson(KEY, next);
  return next;
}

export function resetAdminDemo(): AdminDemoState {
  removeKey(KEY);
  return empty();
}

export function countAdminChanges(state: AdminDemoState): number {
  return Object.keys(state.routes).length + Object.values(state.active).reduce((sum, overrides) => sum + Object.keys(overrides).length, 0);
}
