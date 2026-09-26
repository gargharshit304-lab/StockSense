import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { partnerService } from '../services/partner';

export const partnerController = {
  async create(req: AuthRequest, res: Response): Promise<void> {
    const partner = await partnerService.create(req.body);
    res.status(201).json(partner);
  },

  async list(req: AuthRequest, res: Response): Promise<void> {
    const { page = 1, limit = 20, search, partnerType } = req.query;
    const result = await partnerService.findAll({
      page: Number(page),
      limit: Number(limit),
      search: search as string,
      partnerType: partnerType as 'VENDOR' | 'CUSTOMER',
    });
    res.json(result);
  },

  async getOne(req: AuthRequest, res: Response): Promise<void> {
    const partner = await partnerService.findById(req.params.id);
    if (!partner) {
      res.status(404).json({ error: 'Partner not found' });
      return;
    }
    res.json(partner);
  },

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const partner = await partnerService.update(req.params.id, req.body);
      res.json(partner);
    } catch (error) {
      if (error instanceof Error && error.message === 'PARTNER_NOT_FOUND') {
        res.status(404).json({ error: 'Partner not found' });
        return;
      }
      throw error;
    }
  },

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      await partnerService.delete(req.params.id);
      res.json({ message: 'Partner deleted successfully' });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'PARTNER_NOT_FOUND') {
          res.status(404).json({ error: 'Partner not found' });
          return;
        }
        if (error.message === 'PARTNER_HAS_PICKINGS') {
          res.status(409).json({ error: 'Cannot delete: partner has associated stock pickings' });
          return;
        }
      }
      throw error;
    }
  },
};