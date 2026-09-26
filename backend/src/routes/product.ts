import { Router } from 'express';
import { productController } from '../controllers/product';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createProductSchema,
  updateProductSchema,
  getProductSchema,
  listProductsSchema,
  deleteProductSchema,
} from '../validators/product';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'INVENTORY_MANAGER'),
  validate(createProductSchema),
  productController.create
);

router.get(
  '/',
  authenticate,
  validate(listProductsSchema),
  productController.list
);

router.get(
  '/:id',
  authenticate,
  validate(getProductSchema),
  productController.getOne
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'INVENTORY_MANAGER'),
  validate(updateProductSchema),
  productController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN', 'INVENTORY_MANAGER'),
  validate(deleteProductSchema),
  productController.delete
);

export default router;