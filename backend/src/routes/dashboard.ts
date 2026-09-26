import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { dashboardSchema, dashboardFiltersSchema } from '../validators/dashboard';

const router = Router();

router.get(
  '/',
  authenticate,
  validate(dashboardSchema),
  dashboardController.getDashboard
);

router.get(
  '/filters',
  authenticate,
  validate(dashboardFiltersSchema),
  dashboardController.getFilters
);

export default router;