import { FlaskConical } from 'lucide-react';
import { Link } from 'react-router';
import { useScenario } from '../../hooks/useScenario.ts';
import { scenarioLabels } from '../../types/scenario.ts';
import { cn } from '../../utils/cn.ts';

/** Always-visible active scenario; a non-NORMAL scenario is highlighted (text + color). */
export function ScenarioBadge({ testId = 'scenario-badge' }: { testId?: string }) {
  const { scenario, responseDelay } = useScenario();
  const isNormal = scenario === 'NORMAL';
  const text = scenario === 'SLOW_RESPONSE' ? `${scenarioLabels[scenario]} (${responseDelay} ms)` : scenarioLabels[scenario];

  return (
    <Link
      to="/lab"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold',
        isNormal ? 'border-brand-200 bg-brand-50 text-brand-800 hover:bg-brand-100' : 'border-amber-300 bg-amber-100 text-amber-950 hover:bg-amber-200',
      )}
      data-testid={testId}
      data-scenario={scenario}
      aria-label={`Escenario actual: ${text}. Ir al laboratorio de escenarios`}
    >
      <FlaskConical className="h-4 w-4" aria-hidden="true" />
      <span className="hidden lg:inline">Escenario:</span>
      <span data-testid={`${testId}-value`}>{text}</span>
    </Link>
  );
}
