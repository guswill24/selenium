import { ErrorState } from '../components/feedback/ErrorState.tsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts';

/**
 * Router error boundary: an unexpected rendering failure shows a friendly message instead of
 * the framework's default screen (which includes the stack trace). The error itself is still
 * logged to the browser console for analysis.
 */
export function AppErrorPage() {
  useDocumentTitle('Error inesperado');
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <main className="w-full max-w-lg" data-testid="page-app-error">
        <h1 className="mb-4 text-center text-2xl font-bold text-slate-900">Error inesperado</h1>
        <ErrorState
          testId="app-error"
          title="La aplicación encontró un problema"
          description="Recarga la página o vuelve al inicio. Si el problema continúa, intenta más tarde."
          action={
            // A full page load (not client navigation) so the application starts from a clean state.
            <a
              href="/dashboard"
              className="inline-flex rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
              data-testid="btn-go-home"
            >
              Volver al inicio
            </a>
          }
        />
      </main>
    </div>
  );
}
