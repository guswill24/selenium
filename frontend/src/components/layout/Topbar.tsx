import { GraduationCap, Menu } from 'lucide-react';
import type { RefObject } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../hooks/useAuth.ts';
import { FontSizeControl } from './FontSizeControl.tsx';
import { ScenarioBadge } from './ScenarioBadge.tsx';
import { SIDEBAR_ID } from './Sidebar.tsx';
import { UserMenu } from './UserMenu.tsx';

interface TopbarProps {
  isMenuOpen: boolean;
  onOpenMenu: () => void;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
}

export function Topbar({ isMenuOpen, onOpenMenu, menuButtonRef }: TopbarProps) {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white" data-testid="topbar">
      {/* Wraps instead of overflowing when text is enlarged (WCAG 1.4.4): media queries do not react to text size. */}
      <div className="flex min-h-16 flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2 sm:px-6">
        <button
          ref={menuButtonRef}
          type="button"
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
          onClick={onOpenMenu}
          aria-label="Abrir menú de navegación"
          aria-expanded={isMenuOpen}
          aria-controls={SIDEBAR_ID}
          data-testid="btn-open-menu"
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>

        {/* The sidebar brand is hidden on small screens, so the name stays visible here. */}
        <span className="text-base font-extrabold tracking-wide text-slate-900 lg:hidden" data-testid="topbar-brand">
          MI RUTA
        </span>

        <span className="hidden min-w-0 items-center gap-2 text-sm font-semibold text-slate-800 sm:flex">
          <GraduationCap className="h-5 w-5 shrink-0 text-brand-700" aria-hidden="true" />
          <span className="truncate">Entorno educativo</span>
        </span>

        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          <FontSizeControl />
          <ScenarioBadge />
          {/* The laboratory is public: without a session, offer the way to sign in. */}
          {user ? (
            <UserMenu />
          ) : (
            <Link to="/login" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50" data-testid="link-topbar-login">
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
