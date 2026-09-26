import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { warehouseService } from '../services/warehouse';

export const warehouseController = {
  async create(req: AuthRequest, res: Response): Promise<void> {
    const warehouse = await warehouseService.create(req.body);
    res.status(201).json(warehouse);
  },

  async list(req: AuthRequest, res: Response): Promise<void> {
    const { page = 1, limit = 20, search, include } = req.query;
    const result = await warehouseService.findAll({
      page: Number(page),
      limit: Number(limit),
      search: search as string,
      includeLocations: include === 'locations',
    });
    res.json(result);
  },

  async getOne(req: AuthRequest, res: Response): Promise<void> {
    const { include } = req.query;
    const warehouse = await warehouseService.findById(req.params.id, include === 'locations');
    if (!warehouse) {
      res.status(404).json({ error: 'Warehouse not found' });
      return;
    }
    res.json(warehouse);
  },

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const warehouse = await warehouseService.update(req.params.id, req.body);
      res.json(warehouse);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'WAREHOUSE_NOT_FOUND') {
          res.status(404).json({ error: 'Warehouse not found' });
          return;
        }
        if (error.message === 'WAREHOUSE_SHORT_CODE_EXISTS') {
          res.status(409).json({ error: 'Warehouse short code already exists' });
          return;
        }
      }
      throw error;
    }
  },

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      await warehouseService.delete(req.params.id);
      res.json({ message: 'Warehouse deleted successfully' });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'WAREHOUSE_NOT_FOUND') {
          res.status(404).json({ error: 'Warehouse not found' });
          return;
        }
        if (error.message === 'WAREHOUSE_HAS_LOCATIONS') {
          res.status(409).json({ error: 'Cannot delete: warehouse has associated locations' });
          return;
        }
      }
      throw error;
    }
  },
};