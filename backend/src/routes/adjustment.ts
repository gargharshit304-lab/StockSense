import { Router } from 'express';
import { adjustmentController } from '../controllers/adjustment';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createAdjustmentSchema,
  updateAdjustmentSchema,
  getAdjustmentSchema,
  listAdjustmentsSchema,
  validateAdjustmentSchema,
  cancelAdjustmentSchema,
} from '../validators/adjustment';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'),
  validate(createAdjustmentSchema),
  adjustmentController.create
);

router.get(
  '/',
  authenticate,
  validate(listAdjustmentsSchema),
  adjustmentController.list
);

router.get(
  '/:id',
  authenticate,
  validate(getAdjustmentSchema),
  adjustmentController.getOne
);

router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'),
  validate(updateAdjustmentSchema),
  adjustmentController.update
);

router.post(
  '/:id/validate',
  authenticate,
  authorize('ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'),
  validate(validateAdjustmentSchema),
  adjustmentController.validate
);

router.post(
  '/:id/cancel',
  authenticate,
  authorize('ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'),
  validate(cancelAdjustmentSchema),
  adjustmentController.cancel
);

export default router;