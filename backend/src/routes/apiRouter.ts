import { Router } from 'express';
import { authController, historyController, profileController } from '../controllers/accountControllers.js';
import {
  alertController,
  arrivalController,
  busController,
  placeController,
  plannerController,
  routeController,
  stopController,
} from '../controllers/catalogControllers.js';
import { adminController } from '../controllers/adminControllers.js';
import { scenarioController } from '../controllers/scenarioController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Test scenario laboratory (never affected by the active scenario).
apiRouter.get('/scenario', scenarioController.current);
apiRouter.post('/scenario', scenarioController.validate);

// Public catalog
apiRouter.get('/routes', routeController.list);
apiRouter.get('/routes/:id', routeController.detail);

apiRouter.get('/stops', stopController.list);
// Declared before /stops/:id so "nearby" is not captured as an id.
apiRouter.get('/stops/nearby', stopController.nearby);
apiRouter.get('/stops/:id', stopController.detail);

apiRouter.get('/places', placeController.list);

apiRouter.get('/plan', plannerController.plan);

apiRouter.get('/buses', busController.list);
apiRouter.get('/buses/:id', busController.detail);
apiRouter.get('/arrivals', arrivalController.list);

apiRouter.get('/alerts', alertController.list);
apiRouter.get('/alerts/:id', alertController.detail);

// Authentication and account
apiRouter.post('/auth/login', authController.login);
apiRouter.post('/auth/logout', authController.logout);
apiRouter.get('/auth/me', requireAuth, authController.me);
apiRouter.put('/profile', requireAuth, profileController.update);
apiRouter.get('/history', requireAuth, historyController.list);

// Administration (ADMIN only). Validates and authorizes; demo changes are not persisted.
const adminRouter = Router();
adminRouter.use(requireAuth, requireRole('ADMIN'));
adminRouter.get('/summary', adminController.summary);
adminRouter.get('/schedules', adminController.schedules);
adminRouter.get('/alerts', adminController.alerts);
adminRouter.post('/routes', adminController.createRoute);
adminRouter.put('/routes/:id', adminController.updateRoute);
adminRouter.patch('/:entity/:id/status', adminController.setStatus);
apiRouter.use('/admin', adminRouter);
