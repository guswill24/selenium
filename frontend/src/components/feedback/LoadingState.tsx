import { LoaderCircle } from 'lucide-react';
import { scopedTestId } from '../../utils/testIds.ts';

interface LoadingStateProps {
  message?: string;
  /**
   * Prefix for secondary sections. The page's main loading state keeps the plain
   * `loading-indicator`, so that selector is always unique on a page.
   */
  scope?: string;
}

export function LoadingState({ message = 'Cargando información…', scope }: LoadingStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-600"
      role="status"
      aria-live="polite"
      data-testid={scopedTestId(scope, 'loading-indicator')}
    >
      <LoaderCircle className="h-8 w-8 animate-spin text-brand-600" aria-hidden="true" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
