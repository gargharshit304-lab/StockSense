import { Router } from 'express';
import { partnerController } from '../controllers/partner';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createPartnerSchema,
  updatePartnerSchema,
  getPartnerSchema,
  listPartnersSchema,
  deletePartnerSchema,
} from '../validators/partner';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'INVENTORY_MANAGER'),
  validate(createPartnerSchema),
  partnerController.create
);

router.get(
  '/',
  authenticate,
  validate(listPartnersSchema),
  partnerController.list
);

router.get(
  '/:id',
  authenticate,
  validate(getPartnerSchema),
  partnerController.getOne
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'INVENTORY_MANAGER'),
  validate(updatePartnerSchema),
  partnerController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN', 'INVENTORY_MANAGER'),
  validate(deletePartnerSchema),
  partnerController.delete
);

export default router;