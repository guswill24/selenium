// localStorage can be unavailable (private mode, blocked storage). Every access is guarded
// so the app keeps working without persistence instead of crashing.

export function readJson<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Persistence is best-effort in this educational app.
  }
}

export function removeKey(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore: nothing to clean up if storage is unavailable.
  }
}

/** Per-tab storage (cleared when the tab closes). Same guards as localStorage. */
export function readSession(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeSession(key: string, value: string): void {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Best-effort only.
  }
}

export function removeSession(key: string): void {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Nothing to clean up if storage is unavailable.
  }
}

export const storageKeys = {
  session: 'mi-ruta:session',
  profile: (userId: string) => `mi-ruta:profile:${userId}`,
  dismissedServiceAlert: 'mi-ruta:dismissed-service-alert',
  authNotice: 'mi-ruta:auth-notice',
  fontScale: 'mi-ruta:font-scale',
} as const;
