import type { ReactNode } from 'react';
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router';
import type { RouteHandle } from '../components/layout/Breadcrumbs.tsx';
import { AppLayout } from '../layouts/AppLayout.tsx';
import { AuthLayout } from '../layouts/AuthLayout.tsx';
import { AdminPage } from '../pages/AdminPage.tsx';
import { AlertsPage } from '../pages/AlertsPage.tsx';
import { AppErrorPage } from '../pages/AppErrorPage.tsx';
import { DashboardPage } from '../pages/DashboardPage.tsx';
import { HistoryPage } from '../pages/HistoryPage.tsx';
import { LabPage } from '../pages/LabPage.tsx';
import { LivePage } from '../pages/LivePage.tsx';
import { LoginPage } from '../pages/LoginPage.tsx';
import { MapPage } from '../pages/MapPage.tsx';
import { MonitoringPage } from '../pages/MonitoringPage.tsx';
import { NotFoundPage } from '../pages/NotFoundPage.tsx';
import { PlannerPage } from '../pages/PlannerPage.tsx';
import { ProfilePage } from '../pages/ProfilePage.tsx';
import { RoutesPage } from '../pages/RoutesPage.tsx';
import { StopsPage } from '../pages/StopsPage.tsx';
import { RedirectIfAuthenticated, RequireAuth, RequireRole } from './guards.tsx';
import { getNavigationItem, navigationItems, type NavigationId, type NavigationItem } from './navigation.ts';

const homeHandle: RouteHandle = { crumb: 'Inicio' };

type ProtectedModuleId = Exclude<NavigationId, 'dashboard' | 'lab'>;

/** Every protected module and its page (the type makes a missing page a compile error). */
const pages: Record<ProtectedModuleId, ReactNode> = {
  routes: <RoutesPage />,
  stops: <StopsPage />,
  planner: <PlannerPage />,
  map: <MapPage />,
  live: <LivePage />,
  alerts: <AlertsPage />,
  history: <HistoryPage />,
  profile: <ProfilePage />,
  admin: <AdminPage />,
  monitoring: <MonitoringPage />,
};

function isProtectedModule(item: NavigationItem): item is NavigationItem & { id: ProtectedModuleId } {
  return item.id !== 'dashboard' && item.id !== 'lab';
}

const moduleRoutes: RouteObject[] = navigationItems.filter(isProtectedModule).map((item) => ({
  path: item.path.slice(1),
  element: item.requiredRole ? <RequireRole role={item.requiredRole}>{pages[item.id]}</RequireRole> : pages[item.id],
  handle: { crumb: item.label } satisfies RouteHandle,
}));

/**
 * Created on demand (not at import time): the router reads the address bar when it is
 * created, and `?scenario=` must be removed from it first (see main.tsx).
 */
export function createAppRouter() {
  return createBrowserRouter([
    {
      // Pathless root: its error boundary catches unexpected rendering failures of every page.
      errorElement: <AppErrorPage />,
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        {
          element: (
            <RedirectIfAuthenticated>
              <AuthLayout />
            </RedirectIfAuthenticated>
          ),
          children: [{ path: 'login', element: <LoginPage /> }],
        },
        {
          // Public on purpose: a scenario may break login, and the way back to NORMAL must stay reachable.
          element: <AppLayout />,
          handle: homeHandle,
          children: [{ path: 'lab', element: <LabPage />, handle: { crumb: getNavigationItem('lab').label } satisfies RouteHandle }],
        },
        {
          element: (
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          ),
          handle: homeHandle,
          children: [
            { path: 'dashboard', element: <DashboardPage /> },
            ...moduleRoutes,
            // Course reading material, linked from the sidebar footer (not a module of the system under test).
            // Loaded on demand: its text and image are not needed to start the app.
            {
              path: 'case-study',
              lazy: async () => ({ Component: (await import('../pages/CaseStudyPage.tsx')).CaseStudyPage }),
              handle: { crumb: 'Caso de estudio' } satisfies RouteHandle,
            },
            {
              path: 'selenium-guide',
              lazy: async () => ({ Component: (await import('../pages/SeleniumGuidePage.tsx')).SeleniumGuidePage }),
              handle: { crumb: 'Guía Selenium IDE' } satisfies RouteHandle,
            },
          ],
        },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ]);
}
