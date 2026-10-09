import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { saveScenario } from '../services/scenarioStore.ts';
import type { ScenarioId, ScenarioSelection } from '../types/scenario.ts';
import { ScenarioContext, type ScenarioContextValue } from './scenarioContext.ts';

interface ScenarioProviderProps {
  /** Resolved by `initScenario()` before the router is created (see main.tsx). */
  initial: ScenarioSelection;
  children: ReactNode;
}

export function ScenarioProvider({ initial, children }: ScenarioProviderProps) {
  const [selection, setSelection] = useState(initial);

  const applyScenario = useCallback((scenario: ScenarioId, responseDelay?: number) => {
    setSelection(saveScenario(scenario, responseDelay));
  }, []);

  const value = useMemo<ScenarioContextValue>(
    () => ({
      ...selection,
      key: selection.scenario === 'SLOW_RESPONSE' ? `${selection.scenario}:${selection.responseDelay}` : selection.scenario,
      applyScenario,
    }),
    [selection, applyScenario],
  );

  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>;
}
