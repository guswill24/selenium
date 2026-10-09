import { LogOut } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../hooks/useAuth.ts';
import { roleLabels } from '../../types/auth.ts';

export function UserMenu() {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
  };

  return (
    <div className="flex items-center gap-2" data-testid="user-menu">
      <Link
        to="/profile"
        className="hidden min-w-0 flex-col items-end rounded-lg px-2 py-1 leading-tight hover:bg-slate-100 md:flex"
        data-testid="current-user"
      >
        <span className="max-w-48 truncate text-sm font-semibold text-slate-900" data-testid="current-user-name">
          {user.fullName}
        </span>
        <span className="text-xs text-slate-600" data-testid="current-user-role" data-role={user.role}>
          {roleLabels[user.role]}
        </span>
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-60"
        aria-label="Cerrar sesión"
        data-testid="btn-logout"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Salir</span>
      </button>
    </div>
  );
}
