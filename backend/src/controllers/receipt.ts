import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { pickingService } from '../services/picking';
import { DocType, DocStatus } from '@prisma/client';

export const receiptController = {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { warehouseId, partnerId, scheduledDate, responsibleId, destLocationId, lines } = req.body;
      const picking = await pickingService.create({
        docType: DocType.RECEIPT,
        warehouseId,
        partnerId,
        scheduledDate: new Date(scheduledDate),
        responsibleId,
        destLocationId,
        lines,
      });
      res.status(201).json(picking);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
        return;
      }
      throw error;
    }
  },

  async list(req: AuthRequest, res: Response): Promise<void> {
    const { page = 1, limit = 20, status, warehouseId, search } = req.query;
    const result = await pickingService.findAll(DocType.RECEIPT, {
      page: Number(page),
      limit: Number(limit),
      status: status as DocStatus,
      warehouseId: warehouseId as string,
      search: search as string,
    });
    res.json(result);
  },

  async getOne(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const picking = await pickingService.findById(id, DocType.RECEIPT);
    if (!picking) {
      res.status(404).json({ error: 'Receipt not found' });
      return;
    }
    res.json(picking);
  },

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { scheduledDate, responsibleId, lines } = req.body;
      const picking = await pickingService.update(id, DocType.RECEIPT, {
        ...(scheduledDate && { scheduledDate: new Date(scheduledDate) }),
        responsibleId,
        lines,
      });
      if (!picking) {
        res.status(404).json({ error: 'Receipt not found' });
        return;
      }
      res.json(picking);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'PICKING_NOT_FOUND') {
          res.status(404).json({ error: 'Receipt not found' });
          return;
        }
        if (error.message === 'CANNOT_EDIT_DONE_OR_CANCELED') {
          res.status(409).json({ error: 'Cannot edit a completed or canceled receipt' });
          return;
        }
        res.status(400).json({ error: error.message });
        return;
      }
      throw error;
    }
  },

  async validate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const picking = await pickingService.validate(id, DocType.RECEIPT);
      res.json(picking);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'PICKING_NOT_FOUND') {
          res.status(404).json({ error: 'Receipt not found' });
          return;
        }
        if (error.message === 'ALREADY_DONE_OR_CANCELED') {
          res.status(409).json({ error: 'Receipt is already completed or canceled' });
          return;
        }
        res.status(400).json({ error: error.message });
        return;
      }
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const err = error as { code: string; shortages: any[] };
        if (err.code === 'INSUFFICIENT_STOCK') {
          res.status(422).json({ error: 'Insufficient stock', shortages: err.shortages });
          return;
        }
      }
      throw error;
    }
  },

  async cancel(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const picking = await pickingService.cancel(id, DocType.RECEIPT);
      res.json(picking);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'PICKING_NOT_FOUND') {
          res.status(404).json({ error: 'Receipt not found' });
          return;
        }
        if (error.message === 'CANNOT_CANCEL_DONE') {
          res.status(409).json({ error: 'Cannot cancel a completed receipt' });
          return;
        }
        res.status(400).json({ error: error.message });
        return;
      }
      throw error;
    }
  },
};