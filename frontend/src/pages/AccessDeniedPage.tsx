import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router';

export function AccessDeniedPage() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-12 text-center"
      role="alert"
      data-testid="access-denied"
    >
      <ShieldAlert className="h-10 w-10 text-amber-700" aria-hidden="true" />
      <h1 className="text-xl font-bold text-amber-950">Acceso denegado</h1>
      <p className="max-w-md text-sm text-amber-900">
        Tu rol no tiene permisos para ver esta sección. Si crees que es un error, contacta al administrador.
      </p>
      <Link
        to="/dashboard"
        className="mt-2 inline-flex rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
        data-testid="btn-go-home"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
