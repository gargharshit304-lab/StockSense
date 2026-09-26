import { Router } from 'express';
import { productCategoryController } from '../controllers/productCategory';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createProductCategorySchema,
  updateProductCategorySchema,
  getProductCategorySchema,
  listProductCategoriesSchema,
  deleteProductCategorySchema,
} from '../validators/productCategory';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'INVENTORY_MANAGER'),
  validate(createProductCategorySchema),
  productCategoryController.create
);

router.get(
  '/',
  authenticate,
  validate(listProductCategoriesSchema),
  productCategoryController.list
);

router.get(
  '/:id',
  authenticate,
  validate(getProductCategorySchema),
  productCategoryController.getOne
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'INVENTORY_MANAGER'),
  validate(updateProductCategorySchema),
  productCategoryController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN', 'INVENTORY_MANAGER'),
  validate(deleteProductCategorySchema),
  productCategoryController.delete
);

export default router;