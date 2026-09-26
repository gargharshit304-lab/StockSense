import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { uomService } from '../services/uom';

export const uomController = {
  async create(req: AuthRequest, res: Response): Promise<void> {
    const uom = await uomService.create(req.body);
    res.status(201).json(uom);
  },

  async list(req: AuthRequest, res: Response): Promise<void> {
    const { page = 1, limit = 20, search } = req.query;
    const result = await uomService.findAll({
      page: Number(page),
      limit: Number(limit),
      search: search as string,
    });
    res.json(result);
  },

  async getOne(req: AuthRequest, res: Response): Promise<void> {
    const uom = await uomService.findById(req.params.id);
    if (!uom) {
      res.status(404).json({ error: 'UoM not found' });
      return;
    }
    res.json(uom);
  },

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const uom = await uomService.update(req.params.id, req.body);
      res.json(uom);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'UOM_NOT_FOUND') {
          res.status(404).json({ error: 'UoM not found' });
          return;
        }
        if (error.message === 'UOM_NAME_EXISTS') {
          res.status(409).json({ error: 'UoM name already exists' });
          return;
        }
      }
      throw error;
    }
  },

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      await uomService.delete(req.params.id);
      res.json({ message: 'UoM deleted successfully' });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'UOM_NOT_FOUND') {
          res.status(404).json({ error: 'UoM not found' });
          return;
        }
        if (error.message === 'UOM_HAS_PRODUCTS') {
          res.status(409).json({ error: 'Cannot delete: UoM has associated products' });
          return;
        }
      }
      throw error;
    }
  },
};