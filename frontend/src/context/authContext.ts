import { createContext } from 'react';
import type { ProfileUpdate, User } from '../types/auth.ts';

export type AuthStatus = 'checking' | 'authenticated' | 'anonymous';

/** One-shot message shown on the login page after the session ends. */
export type SessionNotice = 'session-expired' | 'logged-out' | null;

export interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  notice: SessionNotice;
  /**
   * True only right after an explicit logout in this page load (not persisted). Used to send the
   * user to the dashboard on the next login instead of back to the page they logged out from.
   */
  justLoggedOut: boolean;
  /**
   * True right after a successful login (not after restoring a stored session) until the welcome
   * micro-interaction has played. Not persisted.
   */
  justLoggedIn: boolean;
  acknowledgeLogin: () => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (update: ProfileUpdate) => Promise<void>;
  resetProfile: () => void;
  clearNotice: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
