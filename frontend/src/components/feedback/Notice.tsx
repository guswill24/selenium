import type { LucideIcon } from 'lucide-react';
import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../utils/cn.ts';

export type NoticeTone = 'info' | 'success' | 'warning' | 'error';

const toneConfig: Record<NoticeTone, { icon: LucideIcon; label: string; classes: string }> = {
  info: { icon: Info, label: 'Información', classes: 'border-sky-200 bg-sky-50 text-sky-900' },
  success: { icon: CircleCheck, label: 'Éxito', classes: 'border-brand-200 bg-brand-50 text-brand-900' },
  warning: { icon: TriangleAlert, label: 'Advertencia', classes: 'border-amber-200 bg-amber-50 text-amber-900' },
  error: { icon: CircleAlert, label: 'Error', classes: 'border-red-200 bg-red-50 text-red-900' },
};

interface NoticeProps {
  tone: NoticeTone;
  title: string;
  children?: ReactNode;
  testId: string;
}

/**
 * Inline message. Errors are announced assertively, the rest politely.
 * The container text includes a screen-reader prefix ("Error: …"); assert on
 * `<testId>-title` for the visible title only.
 */
export function Notice({ tone, title, children, testId }: NoticeProps) {
  const { icon: Icon, label, classes } = toneConfig[tone];

  return (
    <div
      className={cn('flex gap-3 rounded-xl border p-4', classes)}
      role={tone === 'error' ? 'alert' : 'status'}
      data-testid={testId}
      data-tone={tone}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 text-sm">
        <p className="font-semibold">
          <span className="sr-only">{label}: </span>
          <span data-testid={`${testId}-title`}>{title}</span>
        </p>
        {children && <div className="mt-1">{children}</div>}
      </div>
    </div>
  );
}
