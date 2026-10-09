import type { Request, Response } from 'express';
import { z } from 'zod';
import { readScenarioHeaders } from '../middleware/scenario.js';
import { DELAY_OPTIONS_MS, MAX_DELAY_MS, SCENARIO_IDS, SCENARIOS, toConfig } from '../scenario/scenarios.js';
import { sendData } from '../utils/respond.js';
import { parseBody } from '../utils/validate.js';

const scenarioBodySchema = z.object({
  scenario: z.enum(SCENARIO_IDS, { error: 'El escenario no existe.' }),
  responseDelay: z
    .number({ error: 'El retraso debe ser un número.' })
    .int('El retraso debe ser un número entero.')
    .min(0, 'El retraso no puede ser negativo.')
    .max(MAX_DELAY_MS, `El retraso no puede superar ${MAX_DELAY_MS} ms.`)
    .optional(),
});

const catalog = () => ({
  available: SCENARIO_IDS.map((id) => SCENARIOS[id]),
  delayOptions: DELAY_OPTIONS_MS,
});

/**
 * The scenario is chosen per browser, not stored on the server (serverless has no shared memory,
 * and one student's scenario must not affect another's). These endpoints report and validate it.
 */
export const scenarioController = {
  /** Configuration the server receives from this browser (from the request headers). */
  current: (req: Request, res: Response) => sendData(res, { ...readScenarioHeaders(req), ...catalog() }),

  /** Validates a scenario before the browser starts sending it. */
  validate: (req: Request, res: Response) => {
    const { scenario, responseDelay } = parseBody(scenarioBodySchema, req.body);
    sendData(res, { ...toConfig(scenario, responseDelay), ...catalog() });
  },
};
