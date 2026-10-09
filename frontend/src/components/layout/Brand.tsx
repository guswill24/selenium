import { Bus } from 'lucide-react';
import { Link } from 'react-router';

export function Brand() {
  return (
    <Link to="/dashboard" className="flex min-w-0 items-center gap-3 rounded-lg" data-testid="brand-link" aria-label="Mi Ruta, ir al inicio">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
        <Bus className="h-6 w-6" aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="text-lg font-extrabold tracking-wide text-white">MI RUTA</span>
        <span className="truncate text-xs text-slate-300">Laboratorio de Calidad de Software</span>
      </span>
    </Link>
  );
}
