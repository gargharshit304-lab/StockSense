import { Router } from 'express';
import { locationController } from '../controllers/location';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createLocationSchema,
  updateLocationSchema,
  getLocationSchema,
  listLocationsSchema,
  deleteLocationSchema,
} from '../validators/location';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'INVENTORY_MANAGER'),
  validate(createLocationSchema),
  locationController.create
);

router.get(
  '/',
  authenticate,
  validate(listLocationsSchema),
  locationController.list
);

router.get(
  '/:id',
  authenticate,
  validate(getLocationSchema),
  locationController.getOne
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'INVENTORY_MANAGER'),
  validate(updateLocationSchema),
  locationController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN', 'INVENTORY_MANAGER'),
  validate(deleteLocationSchema),
  locationController.delete
);

export default router;