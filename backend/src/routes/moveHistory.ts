import { Router } from 'express';
import { moveHistoryController } from '../controllers/moveHistory';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { moveHistorySchema } from '../validators/moveHistory';

const router = Router();

router.get(
  '/',
  authenticate,
  validate(moveHistorySchema),
  moveHistoryController.list
);

export default router;