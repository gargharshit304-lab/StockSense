import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { pickingService } from '../services/picking';
import { DocType, DocStatus } from '@prisma/client';

export const transferController = {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { warehouseId, scheduledDate, responsibleId, srcLocationId, destLocationId, lines } = req.body;
      const picking = await pickingService.create({
        docType: DocType.INTERNAL_TRANSFER,
        warehouseId,
        scheduledDate: new Date(scheduledDate),
        responsibleId,
        srcLocationId,
        destLocationId,
        lines,
      });
      res.status(201).json(picking);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'INVALID_LOCATION: Transfer locations must be non-virtual') {
          res.status(400).json({ error: 'Transfer locations must be non-virtual (real warehouse locations)' });
          return;
        }
        res.status(400).json({ error: error.message });
        return;
      }
      throw error;
    }
  },

  async list(req: AuthRequest, res: Response): Promise<void> {
    const { page = 1, limit = 20, status, warehouseId, search } = req.query;
    const result = await pickingService.findAll(DocType.INTERNAL_TRANSFER, {
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
    const picking = await pickingService.findById(id, DocType.INTERNAL_TRANSFER);
    if (!picking) {
      res.status(404).json({ error: 'Transfer not found' });
      return;
    }
    res.json(picking);
  },

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { scheduledDate, responsibleId, lines } = req.body;
      const picking = await pickingService.update(id, DocType.INTERNAL_TRANSFER, {
        ...(scheduledDate && { scheduledDate: new Date(scheduledDate) }),
        responsibleId,
        lines,
      });
      if (!picking) {
        res.status(404).json({ error: 'Transfer not found' });
        return;
      }
      res.json(picking);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'PICKING_NOT_FOUND') {
          res.status(404).json({ error: 'Transfer not found' });
          return;
        }
        if (error.message === 'CANNOT_EDIT_DONE_OR_CANCELED') {
          res.status(409).json({ error: 'Cannot edit a completed or canceled transfer' });
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
      const picking = await pickingService.validate(id, DocType.INTERNAL_TRANSFER);
      res.json(picking);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'PICKING_NOT_FOUND') {
          res.status(404).json({ error: 'Transfer not found' });
          return;
        }
        if (error.message === 'ALREADY_DONE_OR_CANCELED') {
          res.status(409).json({ error: 'Transfer is already completed or canceled' });
          return;
        }
        res.status(400).json({ error: error.message });
        return;
      }
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const err = error as { code: string; shortages: any[] };
        if (err.code === 'INSUFFICIENT_STOCK') {
          res.status(422).json({ error: 'Insufficient stock at source location', shortages: err.shortages });
          return;
        }
      }
      throw error;
    }
  },

  async cancel(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const picking = await pickingService.cancel(id, DocType.INTERNAL_TRANSFER);
      res.json(picking);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'PICKING_NOT_FOUND') {
          res.status(404).json({ error: 'Transfer not found' });
          return;
        }
        if (error.message === 'CANNOT_CANCEL_DONE') {
          res.status(409).json({ error: 'Cannot cancel a completed transfer' });
          return;
        }
        res.status(400).json({ error: error.message });
        return;
      }
      throw error;
    }
  },
};