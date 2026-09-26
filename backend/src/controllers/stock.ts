import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { stockService } from '../services/stock';

export const stockController = {
  async list(req: AuthRequest, res: Response): Promise<void> {
    const { page = 1, limit = 20, locationId, warehouseId, productId, lowStockOnly = false } = req.query;
    const result = await stockService.findAll({
      page: Number(page),
      limit: Number(limit),
      locationId: locationId as string,
      warehouseId: warehouseId as string,
      productId: productId as string,
      lowStockOnly: lowStockOnly === 'true',
    });
    res.json(result);
  },

  async getOne(req: AuthRequest, res: Response): Promise<void> {
    const { productId, locationId } = req.params;
    const stock = await stockService.findByProductAndLocation(productId, locationId);
    if (!stock) {
      res.status(404).json({ error: 'Stock quant not found for this product at this location' });
      return;
    }
    res.json(stock);
  },

  async updateOnHand(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { productId, locationId } = req.params;
      const { onHand } = req.body;
      const userId = req.user!.userId;

      const updated = await stockService.updateOnHand(productId, locationId, onHand, userId);
      res.json(updated);
    } catch (error) {
      if (error instanceof Error && error.message === 'STOCK_QUANT_NOT_FOUND') {
        res.status(404).json({ error: 'Stock quant not found for this product at this location' });
        return;
      }
      throw error;
    }
  },
};