interface ErrorDetailsProps {
  status: number;
  code: string;
  requestId: string | undefined;
  testId?: string;
}

/**
 * Collapsed technical details of a failed request. They stay out of the friendly message
 * but remain available for analysis (never stack traces or internals).
 */
export function ErrorDetails({ status, code, requestId, testId = 'error-details' }: ErrorDetailsProps) {
  return (
    <details className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs text-slate-700" data-testid={testId}>
      <summary className="cursor-pointer py-1 font-medium">Detalles técnicos</summary>
      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
        <dt>Estado HTTP</dt>
        <dd data-testid={`${testId}-status`}>{status || 'Sin respuesta'}</dd>
        <dt>Código</dt>
        <dd data-testid={`${testId}-code`}>{code}</dd>
        <dt>Solicitud</dt>
        <dd className="break-all" data-testid={`${testId}-request-id`}>
          {requestId ?? 'No disponible'}
        </dd>
      </dl>
    </details>
  );
}
