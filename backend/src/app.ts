import express, { type Express } from 'express';
import { endpointNotFound, errorHandler } from './middleware/errorHandler.js';
import { requestContext } from './middleware/requestContext.js';
import { scenarioMiddleware } from './middleware/scenario.js';
import { apiRouter } from './routes/apiRouter.js';
import { preloadDatasets } from './scenario/datasets.js';

export function createApp(): Express {
  // Fail fast at startup if a scenario dataset is inconsistent.
  preloadDatasets();

  const app = express();

  app.disable('x-powered-by');
  app.use(requestContext);
  app.use(express.json({ limit: '100kb' }));

  app.use('/api', scenarioMiddleware);
  app.use('/api', apiRouter);
  app.use('/api', endpointNotFound);
  app.use(errorHandler);

  return app;
}

export const app = createApp();
