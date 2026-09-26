import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { locationService } from '../services/location';

export const locationController = {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const location = await locationService.create(req.body);
      res.status(201).json(location);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'WAREHOUSE_NOT_FOUND') {
          res.status(404).json({ error: 'Warehouse not found' });
          return;
        }
        if (error.message === 'LOCATION_SHORT_CODE_EXISTS_IN_WAREHOUSE') {
          res.status(409).json({ error: 'Location short code already exists in this warehouse' });
          return;
        }
      }
      throw error;
    }
  },

  async list(req: AuthRequest, res: Response): Promise<void> {
    const { page = 1, limit = 20, search, warehouseId } = req.query;
    const result = await locationService.findAll({
      page: Number(page),
      limit: Number(limit),
      search: search as string,
      warehouseId: warehouseId as string,
    });
    res.json(result);
  },

  async getOne(req: AuthRequest, res: Response): Promise<void> {
    const location = await locationService.findById(req.params.id);
    if (!location) {
      res.status(404).json({ error: 'Location not found' });
      return;
    }
    res.json(location);
  },

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const location = await locationService.update(req.params.id, req.body);
      res.json(location);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'WAREHOUSE_NOT_FOUND') {
          res.status(404).json({ error: 'Warehouse not found' });
          return;
        }
        if (error.message === 'LOCATION_NOT_FOUND') {
          res.status(404).json({ error: 'Location not found' });
          return;
        }
        if (error.message === 'LOCATION_SHORT_CODE_EXISTS_IN_WAREHOUSE') {
          res.status(409).json({ error: 'Location short code already exists in this warehouse' });
          return;
        }
      }
      throw error;
    }
  },

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      await locationService.delete(req.params.id);
      res.json({ message: 'Location deleted successfully' });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'LOCATION_NOT_FOUND') {
          res.status(404).json({ error: 'Location not found' });
          return;
        }
        if (error.message === 'LOCATION_HAS_STOCK_QUANTS') {
          res.status(409).json({ error: 'Cannot delete: location has stock quants' });
          return;
        }
      }
      throw error;
    }
  },
};