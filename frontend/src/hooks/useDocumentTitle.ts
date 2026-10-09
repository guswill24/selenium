import { useEffect } from 'react';

export const APP_TITLE = 'Mi Ruta';

/**
 * Each screen gets its own document title, e.g. "Rutas · Mi Ruta" (WCAG 2.4.2),
 * which also lets automated tests check where they are (`assertTitle`).
 */
export function useDocumentTitle(pageTitle: string | undefined): void {
  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} · ${APP_TITLE}` : `${APP_TITLE} – Laboratorio de Calidad de Software`;
  }, [pageTitle]);
}
