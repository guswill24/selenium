import { useContext } from 'react';
import { ScenarioContext, type ScenarioContextValue } from '../context/scenarioContext.ts';

export function useScenario(): ScenarioContextValue {
  const context = useContext(ScenarioContext);
  if (!context) {
    throw new Error('useScenario must be used within a ScenarioProvider');
  }
  return context;
}
