import { Router } from 'express';
import { receiptController } from '../controllers/receipt';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createReceiptSchema,
  updateReceiptSchema,
  getReceiptSchema,
  listReceiptsSchema,
  validateReceiptSchema,
  cancelReceiptSchema,
} from '../validators/receipt';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'),
  validate(createReceiptSchema),
  receiptController.create
);

router.get(
  '/',
  authenticate,
  validate(listReceiptsSchema),
  receiptController.list
);

router.get(
  '/:id',
  authenticate,
  validate(getReceiptSchema),
  receiptController.getOne
);

router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'),
  validate(updateReceiptSchema),
  receiptController.update
);

router.post(
  '/:id/validate',
  authenticate,
  authorize('ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'),
  validate(validateReceiptSchema),
  receiptController.validate
);

router.post(
  '/:id/cancel',
  authenticate,
  authorize('ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'),
  validate(cancelReceiptSchema),
  receiptController.cancel
);

export default router;