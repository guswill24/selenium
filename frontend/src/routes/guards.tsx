import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { LoadingState } from '../components/feedback/LoadingState.tsx';
import { useAuth } from '../hooks/useAuth.ts';
import { AccessDeniedPage } from '../pages/AccessDeniedPage.tsx';
import type { Role } from '../types/auth.ts';

/** Location the user tried to open before being sent to login. */
export interface LoginRedirectState {
  from?: string;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { status, justLoggedOut } = useAuth();
  const location = useLocation();

  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <LoadingState message="Verificando sesión…" />
      </div>
    );
  }

  if (status === 'anonymous') {
    // After an explicit logout the next login starts at the dashboard, not the last page.
    const state: LoginRedirectState = justLoggedOut ? {} : { from: `${location.pathname}${location.search}` };
    return <Navigate to="/login" replace state={state} />;
  }

  return children;
}

export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { user } = useAuth();
  return user?.role === role ? children : <AccessDeniedPage />;
}

export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();
  const from = (location.state as LoginRedirectState | null)?.from;

  return status === 'authenticated' ? <Navigate to={from ?? '/dashboard'} replace /> : children;
}
