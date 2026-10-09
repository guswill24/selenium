import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ApiError, onSessionInvalid, SESSION_ERROR_CODES, setAuthToken } from '../services/apiClient.ts';
import * as authService from '../services/authService.ts';
import type { ProfileUpdate, Session, User } from '../types/auth.ts';
import { readJson, readSession, removeKey, removeSession, storageKeys, writeJson, writeSession } from '../utils/storage.ts';
import { AuthContext, type AuthContextValue, type AuthStatus, type SessionNotice } from './authContext.ts';

/** Profile edits are stored per user in this browser only (fixtures are read-only). */
function withProfileOverlay(user: User): User {
  const overlay = readJson<ProfileUpdate>(storageKeys.profile(user.id));
  return overlay ? { ...user, ...overlay } : user;
}

interface StoredSessionState {
  session: Session | null;
  expired: boolean;
}

/** Reads the stored session once at startup; an expired one is discarded immediately. */
function readStoredSession(): StoredSessionState {
  const session = readJson<Session>(storageKeys.session);
  if (!session?.token || !session.user) return { session: null, expired: false };
  if (Date.parse(session.expiresAt) <= Date.now()) {
    removeKey(storageKeys.session);
    return { session: null, expired: true };
  }
  return { session, expired: false };
}

/**
 * The reason a session ended survives a page reload (per tab) until the login page shows it.
 * Otherwise a session that ends on a public page (the laboratory) would leave no explanation.
 */
function readPendingNotice(expiredAtStartup: boolean): SessionNotice {
  if (expiredAtStartup) return 'session-expired';
  const stored = readSession(storageKeys.authNotice);
  return stored === 'session-expired' || stored === 'logged-out' ? stored : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [{ session: initialSession, expired: initiallyExpired }] = useState(readStoredSession);
  const [status, setStatus] = useState<AuthStatus>(initialSession ? 'checking' : 'anonymous');
  const [session, setSession] = useState<Session | null>(initialSession);
  const [user, setUser] = useState<User | null>(null);
  const [notice, setNotice] = useState<SessionNotice>(() => readPendingNotice(initiallyExpired));
  const [justLoggedOut, setJustLoggedOut] = useState(false);

  const endSession = useCallback((reason: SessionNotice) => {
    removeKey(storageKeys.session);
    setAuthToken(null);
    setSession(null);
    setUser(null);
    setStatus('anonymous');
    setNotice(reason);
    setJustLoggedOut(reason === 'logged-out');
    if (reason) writeSession(storageKeys.authNotice, reason);
  }, []);

  // Restore a stored session and confirm it with the API.
  useEffect(() => {
    if (!initialSession) return;

    setAuthToken(initialSession.token);
    authService
      .fetchCurrentUser()
      .then((current) => {
        setUser(withProfileOverlay(current));
        setStatus('authenticated');
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 401 && SESSION_ERROR_CODES.has(error.code)) {
          endSession('session-expired');
          return;
        }
        // API unreachable, failing or refusing authorization: keep the locally stored session.
        setUser(withProfileOverlay(initialSession.user));
        setStatus('authenticated');
      });
  }, [initialSession, endSession]);

  // Any authenticated request rejected with an invalid session ends it.
  useEffect(() => {
    onSessionInvalid(() => endSession('session-expired'));
    return () => onSessionInvalid(null);
  }, [endSession]);

  // End the session exactly when the token expires, even if the user is idle.
  useEffect(() => {
    if (!session) return;
    const remaining = Date.parse(session.expiresAt) - Date.now();
    const timer = window.setTimeout(() => endSession('session-expired'), Math.max(remaining, 0));
    return () => window.clearTimeout(timer);
  }, [session, endSession]);

  const login = useCallback(async (username: string, password: string) => {
    const newSession = await authService.login(username, password);
    writeJson(storageKeys.session, newSession);
    setAuthToken(newSession.token);
    setSession(newSession);
    setUser(withProfileOverlay(newSession.user));
    setStatus('authenticated');
    setNotice(null);
    setJustLoggedOut(false);
    removeSession(storageKeys.authNotice);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Logout is client-side for stateless tokens; ignore API failures.
    }
    endSession('logged-out');
  }, [endSession]);

  const updateProfile = useCallback(
    async (update: ProfileUpdate) => {
      const updated = await authService.updateProfile(update);
      if (!user) return;
      const overlay: ProfileUpdate = { fullName: updated.fullName, email: updated.email, phone: updated.phone };
      writeJson(storageKeys.profile(user.id), overlay);
      setUser({ ...user, ...overlay });
    },
    [user],
  );

  const resetProfile = useCallback(() => {
    if (!user || !session) return;
    removeKey(storageKeys.profile(user.id));
    setUser(session.user);
  }, [user, session]);

  const clearNotice = useCallback(() => {
    setNotice(null);
    removeSession(storageKeys.authNotice);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, notice, justLoggedOut, login, logout, updateProfile, resetProfile, clearNotice }),
    [status, user, notice, justLoggedOut, login, logout, updateProfile, resetProfile, clearNotice],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
