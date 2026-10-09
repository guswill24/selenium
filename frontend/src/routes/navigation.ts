import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Bell,
  Bus,
  FlaskConical,
  History as HistoryIcon,
  LayoutDashboard,
  Map as MapIcon,
  MapPin,
  Navigation,
  Route,
  Settings,
  UserRound,
} from 'lucide-react';
import type { Role } from '../types/auth.ts';

export type NavigationId =
  | 'dashboard'
  | 'routes'
  | 'stops'
  | 'planner'
  | 'map'
  | 'live'
  | 'alerts'
  | 'history'
  | 'profile'
  | 'admin'
  | 'monitoring'
  | 'lab';

export interface NavigationItem {
  id: NavigationId;
  path: string;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Restricts the module to a role. Omitted means every signed-in user. */
  requiredRole?: Role;
}

export interface NavigationSection {
  id: string;
  label: string;
  items: NavigationItem[];
}

export const navigationSections: NavigationSection[] = [
  {
    id: 'mobility',
    label: 'Movilidad',
    items: [
      { id: 'dashboard', path: '/dashboard', label: 'Inicio', description: 'Resumen general del servicio.', icon: LayoutDashboard },
      { id: 'routes', path: '/routes', label: 'Rutas', description: 'Consulta de rutas por origen y destino.', icon: Route },
      { id: 'stops', path: '/stops', label: 'Paraderos', description: 'Paraderos, direcciones y rutas asociadas.', icon: MapPin },
      { id: 'planner', path: '/planner', label: 'Planificador', description: 'Planificación de recorridos con alternativas.', icon: Navigation },
      { id: 'map', path: '/map', label: 'Mapa', description: 'Mapa simulado del recorrido.', icon: MapIcon },
      { id: 'live', path: '/live', label: 'Tiempo real', description: 'Buses, ubicación simulada y tiempos de llegada.', icon: Bus },
      { id: 'alerts', path: '/alerts', label: 'Alertas', description: 'Retrasos, cambios de ruta e interrupciones.', icon: Bell },
      { id: 'history', path: '/history', label: 'Historial', description: 'Consultas realizadas por el usuario.', icon: HistoryIcon },
    ],
  },
  {
    id: 'account',
    label: 'Cuenta',
    items: [
      { id: 'profile', path: '/profile', label: 'Perfil', description: 'Información básica del usuario.', icon: UserRound },
    ],
  },
  {
    id: 'administration',
    label: 'Administración',
    items: [
      { id: 'admin', path: '/admin', label: 'Gestión de rutas', description: 'Rutas, paraderos, horarios, buses y alertas.', icon: Settings, requiredRole: 'ADMIN' },
      { id: 'monitoring', path: '/monitoring', label: 'Monitoreo', description: 'Indicadores simulados del servicio.', icon: Activity, requiredRole: 'ADMIN' },
    ],
  },
  {
    id: 'laboratory',
    label: 'Laboratorio',
    items: [
      { id: 'lab', path: '/lab', label: 'Escenarios de prueba', description: 'Control del comportamiento del sistema bajo prueba.', icon: FlaskConical },
    ],
  },
];

export const navigationItems: NavigationItem[] = navigationSections.flatMap((section) => section.items);

export function canAccess(item: NavigationItem, role: Role | undefined): boolean {
  return !item.requiredRole || item.requiredRole === role;
}

/** Sections visible for a role; sections left without items are dropped. */
export function sectionsForRole(role: Role | undefined): NavigationSection[] {
  return navigationSections
    .map((section) => ({ ...section, items: section.items.filter((item) => canAccess(item, role)) }))
    .filter((section) => section.items.length > 0);
}

export function getNavigationItem(id: NavigationId): NavigationItem {
  const item = navigationItems.find((candidate) => candidate.id === id);
  if (!item) {
    throw new Error(`Unknown navigation item: ${id}`);
  }
  return item;
}
