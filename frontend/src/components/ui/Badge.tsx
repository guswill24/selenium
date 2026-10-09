import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn.ts';

export type BadgeTone = 'neutral' | 'success' | 'info' | 'warning' | 'danger';

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100 text-slate-800 ring-slate-300',
  success: 'bg-brand-50 text-brand-800 ring-brand-300',
  info: 'bg-sky-50 text-sky-800 ring-sky-300',
  warning: 'bg-amber-50 text-amber-900 ring-amber-300',
  danger: 'bg-red-50 text-red-800 ring-red-300',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

/** Status label. Always carries text so meaning never depends on color alone. */
export function Badge({ tone = 'neutral', className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset', toneClasses[tone], className)}
      data-tone={tone}
      {...rest}
    >
      {children}
    </span>
  );
}
