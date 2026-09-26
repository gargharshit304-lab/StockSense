import { Router } from 'express';
import { transferController } from '../controllers/transfer';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createTransferSchema,
  updateTransferSchema,
  getTransferSchema,
  listTransfersSchema,
  validateTransferSchema,
  cancelTransferSchema,
} from '../validators/transfer';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'),
  validate(createTransferSchema),
  transferController.create
);

router.get(
  '/',
  authenticate,
  validate(listTransfersSchema),
  transferController.list
);

router.get(
  '/:id',
  authenticate,
  validate(getTransferSchema),
  transferController.getOne
);

router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'),
  validate(updateTransferSchema),
  transferController.update
);

router.post(
  '/:id/validate',
  authenticate,
  authorize('ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'),
  validate(validateTransferSchema),
  transferController.validate
);

router.post(
  '/:id/cancel',
  authenticate,
  authorize('ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'),
  validate(cancelTransferSchema),
  transferController.cancel
);

export default router;