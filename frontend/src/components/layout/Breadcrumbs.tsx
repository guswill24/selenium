import { ChevronRight } from 'lucide-react';
import { Link, useMatches } from 'react-router';
import { slugify } from '../../utils/testIds.ts';

export interface RouteHandle {
  crumb: string;
}

function hasCrumb(handle: unknown): handle is RouteHandle {
  return typeof handle === 'object' && handle !== null && 'crumb' in handle && typeof handle.crumb === 'string';
}

export function Breadcrumbs() {
  const crumbs = useMatches()
    .filter((match) => hasCrumb(match.handle))
    .map((match) => ({ path: match.pathname, label: (match.handle as RouteHandle).crumb }));

  if (crumbs.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Ruta de navegación" data-testid="breadcrumbs">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-600">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={crumb.path} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden="true" />}
              {isLast ? (
                <span aria-current="page" className="font-medium text-slate-900" data-testid="breadcrumb-current">
                  {crumb.label}
                </span>
              ) : (
                <Link to={crumb.path} className="inline-flex min-h-6 items-center rounded hover:text-brand-700 hover:underline" data-testid={`breadcrumb-link-${slugify(crumb.label)}`}>
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
