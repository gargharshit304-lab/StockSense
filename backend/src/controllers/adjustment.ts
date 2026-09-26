import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { pickingService } from '../services/picking';
import { DocType, DocStatus } from '@prisma/client';

export const adjustmentController = {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { warehouseId, locationId, scheduledDate, responsibleId, lines } = req.body;
      const picking = await pickingService.create({
        docType: DocType.ADJUSTMENT,
        warehouseId,
        scheduledDate: new Date(scheduledDate),
        responsibleId,
        locationId,
        lines,
      });
      res.status(201).json(picking);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'INVALID_LOCATION: Adjustment location must be non-virtual') {
          res.status(400).json({ error: 'Adjustment location must be non-virtual (real warehouse location)' });
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
    const result = await pickingService.findAll(DocType.ADJUSTMENT, {
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
    const picking = await pickingService.findById(id, DocType.ADJUSTMENT);
    if (!picking) {
      res.status(404).json({ error: 'Adjustment not found' });
      return;
    }
    res.json(picking);
  },

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { scheduledDate, responsibleId, lines } = req.body;
      const picking = await pickingService.update(id, DocType.ADJUSTMENT, {
        ...(scheduledDate && { scheduledDate: new Date(scheduledDate) }),
        responsibleId,
        lines,
      });
      if (!picking) {
        res.status(404).json({ error: 'Adjustment not found' });
        return;
      }
      res.json(picking);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'PICKING_NOT_FOUND') {
          res.status(404).json({ error: 'Adjustment not found' });
          return;
        }
        if (error.message === 'CANNOT_EDIT_DONE_OR_CANCELED') {
          res.status(409).json({ error: 'Cannot edit a completed or canceled adjustment' });
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
      const picking = await pickingService.validate(id, DocType.ADJUSTMENT);
      res.json(picking);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'PICKING_NOT_FOUND') {
          res.status(404).json({ error: 'Adjustment not found' });
          return;
        }
        if (error.message === 'ALREADY_DONE_OR_CANCELED') {
          res.status(409).json({ error: 'Adjustment is already completed or canceled' });
          return;
        }
        res.status(400).json({ error: error.message });
        return;
      }
      throw error;
    }
  },

  async cancel(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const picking = await pickingService.cancel(id, DocType.ADJUSTMENT);
      res.json(picking);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'PICKING_NOT_FOUND') {
          res.status(404).json({ error: 'Adjustment not found' });
          return;
        }
        if (error.message === 'CANNOT_CANCEL_DONE') {
          res.status(409).json({ error: 'Cannot cancel a completed adjustment' });
          return;
        }
        res.status(400).json({ error: error.message });
        return;
      }
      throw error;
    }
  },
};