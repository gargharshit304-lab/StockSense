import { Router } from 'express';
import { stockController } from '../controllers/stock';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { listStockSchema, getStockSchema, updateStockSchema } from '../validators/stock';

const router = Router();

router.get(
  '/',
  authenticate,
  validate(listStockSchema),
  stockController.list
);

router.get(
  '/:productId/:locationId',
  authenticate,
  validate(getStockSchema),
  stockController.getOne
);

router.patch(
  '/:productId/:locationId',
  authenticate,
  authorize('ADMIN', 'INVENTORY_MANAGER'),
  validate(updateStockSchema),
  stockController.updateOnHand
);

export default router;