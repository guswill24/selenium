import { CircleCheck, Info, OctagonAlert, TriangleAlert, type LucideIcon } from 'lucide-react';
import type { BadgeTone } from '../components/ui/Badge.tsx';
import type { AlertLevel, AlertType } from '../types/transit.ts';

export interface LevelDisplay {
  label: string;
  plural: string;
  tone: BadgeTone;
  icon: LucideIcon;
  /** Left border, a visual cue that always accompanies text and icon. */
  borderClass: string;
}

/** Ordered from most to least severe. */
export const ALERT_LEVELS: AlertLevel[] = ['CRITICAL', 'WARNING', 'INFO', 'NORMAL'];

export const levelDisplay: Record<AlertLevel, LevelDisplay> = {
  CRITICAL: { label: 'Crítica', plural: 'Críticas', tone: 'danger', icon: OctagonAlert, borderClass: 'border-l-red-600' },
  WARNING: { label: 'Advertencia', plural: 'Advertencias', tone: 'warning', icon: TriangleAlert, borderClass: 'border-l-amber-500' },
  INFO: { label: 'Informativa', plural: 'Informativas', tone: 'info', icon: Info, borderClass: 'border-l-sky-600' },
  NORMAL: { label: 'Normal', plural: 'Normales', tone: 'success', icon: CircleCheck, borderClass: 'border-l-brand-600' },
};

export const ALERT_TYPES: AlertType[] = ['DELAY', 'ROUTE_CHANGE', 'INTERRUPTION', 'INFORMATION'];

export const typeLabels: Record<AlertType, string> = {
  DELAY: 'Retraso',
  ROUTE_CHANGE: 'Cambio de ruta',
  INTERRUPTION: 'Interrupción',
  INFORMATION: 'Información',
};
