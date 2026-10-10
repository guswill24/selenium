import { useCallback, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useMatches } from 'react-router';
import { ServiceAlertBanner } from '../components/alerts/ServiceAlertBanner.tsx';
import { ArrivalBus } from '../components/layout/ArrivalBus.tsx';
import { Breadcrumbs, type RouteHandle } from '../components/layout/Breadcrumbs.tsx';
import { LearningNoticeDialog } from '../components/layout/LearningNoticeDialog.tsx';
import { useLearningNotice } from '../hooks/useLearningNotice.ts';
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts';
import { Sidebar } from '../components/layout/Sidebar.tsx';
import { Topbar } from '../components/layout/Topbar.tsx';

export function AppLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const learningNotice = useLearningNotice();
  const { pathname } = useLocation();
  const previousPathname = useRef(pathname);
  // The deepest breadcrumb names the current screen ("Rutas", "Gestión de rutas"…).
  const currentCrumb = useMatches()
    .map((match) => match.handle)
    .filter((handle): handle is RouteHandle => typeof handle === 'object' && handle !== null && 'crumb' in handle)
    .at(-1)?.crumb;
  useDocumentTitle(currentCrumb);

  // After client-side navigation, start the new page at the top and move focus to the main
  // region so keyboard and screen reader users start at the new page content.
  useEffect(() => {
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname;
      window.scrollTo(0, 0);
      mainRef.current?.focus({ preventScroll: true });
    }
  }, [pathname]);

  const closeMenu = useCallback((restoreFocus: boolean) => {
    setIsMenuOpen(false);
    if (restoreFocus) {
      menuButtonRef.current?.focus();
    }
  }, []);

  return (
    <div className="flex min-h-screen">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-lg bg-white px-4 py-2 font-semibold text-brand-800 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        data-testid="skip-link"
      >
        Saltar al contenido principal
      </a>

      <Sidebar isOpen={isMenuOpen} onClose={closeMenu} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar isMenuOpen={isMenuOpen} onOpenMenu={() => setIsMenuOpen(true)} menuButtonRef={menuButtonRef} />
        <ServiceAlertBanner />
        <main
          id="main-content"
          ref={mainRef}
          tabIndex={-1}
          className="flex-1 px-4 py-6 focus:outline-none sm:px-6 lg:px-8"
          data-testid="main-content"
        >
          <div className="mx-auto w-full max-w-7xl space-y-6">
            <Breadcrumbs />
            <Outlet />
          </div>
        </main>
        <footer className="border-t border-slate-200 bg-white px-4 py-4 text-center text-xs text-slate-600 sm:px-6" data-testid="app-footer">
          Mi Ruta – Laboratorio de Calidad de Software · UNAD · Datos simulados con fines educativos
        </footer>
      </div>

      {/* The welcome bus waits until the learning notice is accepted, so both animations never overlap. */}
      <ArrivalBus paused={learningNotice.open} />
      <LearningNoticeDialog open={learningNotice.open} onAccept={learningNotice.accept} />
    </div>
  );
}
