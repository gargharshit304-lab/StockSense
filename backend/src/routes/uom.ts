import { Router } from 'express';
import { uomController } from '../controllers/uom';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createUomSchema,
  updateUomSchema,
  getUomSchema,
  listUomsSchema,
  deleteUomSchema,
} from '../validators/uom';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'INVENTORY_MANAGER'),
  validate(createUomSchema),
  uomController.create
);

router.get(
  '/',
  authenticate,
  validate(listUomsSchema),
  uomController.list
);

router.get(
  '/:id',
  authenticate,
  validate(getUomSchema),
  uomController.getOne
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'INVENTORY_MANAGER'),
  validate(updateUomSchema),
  uomController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN', 'INVENTORY_MANAGER'),
  validate(deleteUomSchema),
  uomController.delete
);

export default router;