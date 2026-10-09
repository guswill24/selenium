import { RotateCw } from 'lucide-react';
import type { ApiError } from '../../services/apiClient.ts';
import { scopedTestId } from '../../utils/testIds.ts';
import { Button } from '../ui/Button.tsx';
import { ErrorDetails } from './ErrorDetails.tsx';
import { ErrorState } from './ErrorState.tsx';

interface ErrorPresentation {
  testId: string;
  title: string;
  description: string;
}

/** Maps an API failure to a friendly message and a stable, distinct test id. */
function present(error: ApiError): ErrorPresentation {
  if (error.status === 503) {
    return {
      testId: 'service-unavailable',
      title: 'Servicio no disponible',
      description: 'El servicio no está disponible temporalmente. Intenta nuevamente en unos minutos.',
    };
  }
  if (error.status >= 500) {
    return {
      testId: 'server-error',
      title: 'Error del servidor',
      description: 'Ocurrió un problema al procesar la solicitud. Intenta nuevamente más tarde.',
    };
  }
  if (error.status === 0) {
    return {
      testId: 'network-error',
      title: 'Sin conexión con el servidor',
      description: 'No fue posible conectar con el servidor. Verifica tu conexión e intenta nuevamente.',
    };
  }
  if (error.status === 404) {
    return { testId: 'not-found-error', title: 'Información no encontrada', description: error.message };
  }
  if (error.status === 401) {
    return { testId: 'unauthorized', title: 'No autorizado', description: error.message };
  }
  if (error.status === 403) {
    return { testId: 'forbidden', title: 'Acceso restringido', description: error.message };
  }
  if (error.code === 'INVALID_DATA') {
    return { testId: 'invalid-data', title: 'Datos inválidos', description: error.message };
  }
  return { testId: 'request-error', title: 'No fue posible completar la solicitud', description: error.message };
}

interface ApiErrorStateProps {
  error: ApiError;
  onRetry?: () => void;
  /** Prefix for secondary sections; the page's main error keeps the plain ids (see utils/testIds). */
  scope?: string;
}

export function ApiErrorState({ error, onRetry, scope }: ApiErrorStateProps) {
  const { testId, title, description } = present(error);
  const id = (base: string) => scopedTestId(scope, base);

  return (
    <div className="space-y-2" data-error-status={error.status} data-error-code={error.code}>
      <ErrorState
        testId={id(testId)}
        title={title}
        description={description}
        action={
          onRetry && (
            <Button variant="secondary" onClick={onRetry} data-testid={id('btn-retry')}>
              <RotateCw className="h-4 w-4" aria-hidden="true" />
              Reintentar
            </Button>
          )
        }
      />
      <ErrorDetails status={error.status} code={error.code} requestId={error.requestId} testId={id('error-details')} />
    </div>
  );
}
