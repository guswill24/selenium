import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  testId?: string;
}

export function EmptyState({ title, description, action, testId = 'empty-state' }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"
      role="status"
      data-testid={testId}
    >
      <Inbox className="h-10 w-10 text-slate-400" aria-hidden="true" />
      <p className="text-base font-semibold text-slate-900" data-testid={`${testId}-title`}>
        {title}
      </p>
      {description && (
        <p className="max-w-md text-sm text-slate-600" data-testid={`${testId}-description`}>
          {description}
        </p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
