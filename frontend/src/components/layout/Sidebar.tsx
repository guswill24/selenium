import { BookOpenText, ExternalLink, Presentation, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router';
import { useAuth } from '../../hooks/useAuth.ts';
import { useMediaQuery } from '../../hooks/useMediaQuery.ts';
import { sectionsForRole } from '../../routes/navigation.ts';
import { cn } from '../../utils/cn.ts';
import { AboutButton } from './AboutDialog.tsx';
import { Brand } from './Brand.tsx';

interface SidebarProps {
  isOpen: boolean;
  /** `restoreFocus` returns focus to the menu button (dismiss without navigating). */
  onClose: (restoreFocus: boolean) => void;
}

export const SIDEBAR_ID = 'app-sidebar';
const DESKTOP_QUERY = '(min-width: 1024px)';

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const sections = sectionsForRole(user?.role);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const isDrawerOpen = isOpen && !isDesktop;
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isDrawerOpen) return;

    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape inside an open modal (e.g. "Acerca de") closes only that modal, not the drawer behind it.
      if (event.key === 'Escape' && !document.querySelector('dialog[open]')) onClose(true);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, onClose]);

  return (
    <>
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50"
          aria-hidden="true"
          data-testid="sidebar-backdrop"
          onClick={() => onClose(true)}
        />
      )}
      <aside
        id={SIDEBAR_ID}
        // Off-screen drawer must not be reachable by keyboard or screen readers.
        inert={!isDesktop && !isOpen}
        className={cn(
          // No slide animation on purpose: state changes are instant, so tests that resize the
          // window or toggle the menu never observe an intermediate position.
          'fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85vw] flex-col bg-slate-900',
          'lg:static lg:z-auto lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        data-testid="sidebar"
        data-state={isDesktop || isOpen ? 'open' : 'closed'}
      >
        <div className="flex items-center justify-between gap-2 py-5 pr-3 pl-5">
          <Brand />
          <button
            ref={closeButtonRef}
            type="button"
            className="shrink-0 rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white lg:hidden"
            onClick={() => onClose(true)}
            aria-label="Cerrar menú de navegación"
            data-testid="btn-close-menu"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* min-h-0 lets the list shrink and scroll, so the footer links stay inside short (phone) screens. */}
        <nav aria-label="Navegación principal" className="min-h-0 flex-1 overflow-y-auto px-3 pb-6" data-testid="main-nav">
          {sections.map((section) => (
            <div key={section.id} className="mt-4 first:mt-0">
              <h2 className="px-3 pb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">{section.label}</h2>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.id}>
                    <NavLink
                      to={item.path}
                      onClick={() => onClose(false)}
                      data-testid={`nav-${item.id}`}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-brand-700 text-white'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                        )
                      }
                    >
                      <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-800 px-3 py-3">
          <NavLink
            to="/case-study"
            onClick={() => onClose(false)}
            data-testid="nav-case-study"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-brand-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white',
              )
            }
          >
            <BookOpenText className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span>Caso de estudio</span>
          </NavLink>
          {/* Static deck served from /presentacion/, outside the SPA router. */}
          <a
            href="/presentacion/index.html"
            target="_blank"
            rel="noopener"
            onClick={() => onClose(false)}
            data-testid="nav-presentation"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <Presentation className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span>Presentación</span>
            <ExternalLink className="ml-auto h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="sr-only">(se abre en una pestaña nueva)</span>
          </a>
          <AboutButton
            testId="nav-about"
            showIcon
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          />
        </div>

        <p className="border-t border-slate-800 px-5 py-4 text-xs text-slate-400">
          Entorno educativo. Todos los datos son ficticios.
        </p>
      </aside>
    </>
  );
}
