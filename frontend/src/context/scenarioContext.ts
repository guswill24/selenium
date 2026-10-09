import { createContext } from 'react';
import type { ScenarioId, ScenarioSelection } from '../types/scenario.ts';

export interface ScenarioContextValue extends ScenarioSelection {
  /** Changes whenever the scenario changes; data queries include it in their key to refetch. */
  key: string;
  applyScenario: (scenario: ScenarioId, responseDelay?: number) => void;
}

export const ScenarioContext = createContext<ScenarioContextValue | null>(null);
