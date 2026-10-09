import { ServerCrash } from 'lucide-react';
import type { ReactNode } from 'react';

interface ErrorStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  testId?: string;
}

/** Friendly error message. Technical details are exposed separately, never as the main message. */
export function ErrorState({ title, description, action, testId = 'error-state' }: ErrorStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center"
      role="alert"
      data-testid={testId}
    >
      <ServerCrash className="h-10 w-10 text-red-600" aria-hidden="true" />
      <p className="text-base font-semibold text-red-900" data-testid={`${testId}-title`}>
        {title}
      </p>
      {description && (
        <p className="max-w-md text-sm text-red-800" data-testid={`${testId}-description`}>
          {description}
        </p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
