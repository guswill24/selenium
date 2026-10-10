import { Bus } from 'lucide-react';
import { Outlet } from 'react-router';
import { FontSizeControl } from '../components/layout/FontSizeControl.tsx';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-900">
      <header className="flex justify-end px-4 pt-4">
        <FontSizeControl tone="dark" />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10" data-testid="auth-layout">
        <div className="w-full max-w-md">
          <div className="mb-6 flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white">
              <Bus className="h-8 w-8" aria-hidden="true" />
            </span>
            <p className="mt-3 text-2xl font-extrabold tracking-wide text-white">MI RUTA</p>
            <p className="text-sm text-slate-300">Laboratorio de Calidad de Software</p>
          </div>
          <Outlet />
        </div>
      </main>
      <footer className="px-4 py-4 text-center text-xs text-slate-400">
        Entorno educativo · Credenciales y datos ficticios
      </footer>
    </div>
  );
}
