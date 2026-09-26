import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { moveHistoryService } from '../services/dashboard';
import { DocType, MoveStatus } from '@prisma/client';

export const moveHistoryController = {
  async list(req: AuthRequest, res: Response): Promise<void> {
    const { page = 1, limit = 20, productId, locationId, docType, status, dateFrom, dateTo } = req.query;
    const result = await moveHistoryService.findAll({
      page: Number(page),
      limit: Number(limit),
      productId: productId as string,
      locationId: locationId as string,
      docType: docType as DocType,
      status: status as MoveStatus,
      dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo: dateTo ? new Date(dateTo as string) : undefined,
    });
    res.json(result);
  },
};