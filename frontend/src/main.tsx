import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { AuthProvider } from './context/AuthProvider.tsx';
import { ScenarioProvider } from './context/ScenarioProvider.tsx';
import { createAppRouter } from './routes/router.tsx';
import { initScenario } from './services/scenarioStore.ts';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root not found');
}

// Order matters: resolve `?scenario=` and clean the address bar before the router reads it.
const initialScenario = initScenario();
const router = createAppRouter();

createRoot(rootElement).render(
  <StrictMode>
    <ScenarioProvider initial={initialScenario}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ScenarioProvider>
  </StrictMode>,
);
