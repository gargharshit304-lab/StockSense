import { Router } from 'express';
import { deliveryController } from '../controllers/delivery';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createDeliverySchema,
  updateDeliverySchema,
  getDeliverySchema,
  listDeliveriesSchema,
  validateDeliverySchema,
  cancelDeliverySchema,
} from '../validators/delivery';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'),
  validate(createDeliverySchema),
  deliveryController.create
);

router.get(
  '/',
  authenticate,
  validate(listDeliveriesSchema),
  deliveryController.list
);

router.get(
  '/:id',
  authenticate,
  validate(getDeliverySchema),
  deliveryController.getOne
);

router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'),
  validate(updateDeliverySchema),
  deliveryController.update
);

router.post(
  '/:id/validate',
  authenticate,
  authorize('ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'),
  validate(validateDeliverySchema),
  deliveryController.validate
);

router.post(
  '/:id/cancel',
  authenticate,
  authorize('ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'),
  validate(cancelDeliverySchema),
  deliveryController.cancel
);

export default router;