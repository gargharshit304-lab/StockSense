import { Router } from 'express';
import authRoutes from './auth';
import productCategoryRoutes from './productCategory';
import uomRoutes from './uom';
import warehouseRoutes from './warehouse';
import locationRoutes from './location';
import partnerRoutes from './partner';
import productRoutes from './product';
import stockRoutes from './stock';

const router = Router();

router.use('/auth', authRoutes);

router.use('/product-categories', productCategoryRoutes);
router.use('/uoms', uomRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/locations', locationRoutes);
router.use('/partners', partnerRoutes);
router.use('/products', productRoutes);
router.use('/stock', stockRoutes);

export default router;