import { Router } from 'express';
import { warehouseController } from '../controllers/warehouse';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createWarehouseSchema,
  updateWarehouseSchema,
  getWarehouseSchema,
  listWarehousesSchema,
  deleteWarehouseSchema,
} from '../validators/warehouse';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'INVENTORY_MANAGER'),
  validate(createWarehouseSchema),
  warehouseController.create
);

router.get(
  '/',
  authenticate,
  validate(listWarehousesSchema),
  warehouseController.list
);

router.get(
  '/:id',
  authenticate,
  validate(getWarehouseSchema),
  warehouseController.getOne
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'INVENTORY_MANAGER'),
  validate(updateWarehouseSchema),
  warehouseController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN', 'INVENTORY_MANAGER'),
  validate(deleteWarehouseSchema),
  warehouseController.delete
);

export default router;