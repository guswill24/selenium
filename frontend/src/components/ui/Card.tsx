import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn.ts';

interface CardProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  actions?: ReactNode;
}

export function Card({ title, actions, className, children, ...rest }: CardProps) {
  return (
    <section className={cn('rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6', className)} {...rest}>
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
