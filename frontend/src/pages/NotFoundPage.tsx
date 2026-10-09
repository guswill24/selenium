import { Link } from 'react-router';
import { EmptyState } from '../components/feedback/EmptyState.tsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts';

export function NotFoundPage() {
  useDocumentTitle('Página no encontrada');
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <main className="w-full max-w-lg" data-testid="page-not-found">
        <h1 className="mb-4 text-center text-2xl font-bold text-slate-900">Página no encontrada</h1>
        <EmptyState
          title="La dirección solicitada no existe"
          description="Verifica la URL o vuelve al inicio."
          testId="not-found"
          action={
            <Link
              to="/dashboard"
              className="inline-flex rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
              data-testid="btn-go-home"
            >
              Volver al inicio
            </Link>
          }
        />
      </main>
    </div>
  );
}
