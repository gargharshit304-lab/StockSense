import { Router } from 'express';
import authRoutes from './auth';
import productCategoryRoutes from './productCategory';
import uomRoutes from './uom';
import warehouseRoutes from './warehouse';
import locationRoutes from './location';
import partnerRoutes from './partner';
import productRoutes from './product';
import stockRoutes from './stock';
import receiptRoutes from './receipt';
import deliveryRoutes from './delivery';
import transferRoutes from './transfer';
import adjustmentRoutes from './adjustment';
import moveHistoryRoutes from './moveHistory';
import dashboardRoutes from './dashboard';
import notificationRoutes from './notification';

const router = Router();

router.use('/auth', authRoutes);

router.use('/product-categories', productCategoryRoutes);
router.use('/uoms', uomRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/locations', locationRoutes);
router.use('/partners', partnerRoutes);
router.use('/products', productRoutes);
router.use('/stock', stockRoutes);
router.use('/receipts', receiptRoutes);
router.use('/deliveries', deliveryRoutes);
router.use('/transfers', transferRoutes);
router.use('/adjustments', adjustmentRoutes);
router.use('/move-history', moveHistoryRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/notifications', notificationRoutes);

export default router;