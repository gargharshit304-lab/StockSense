import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { productService } from '../services/product';

export const productController = {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const product = await productService.create(req.body);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'CATEGORY_NOT_FOUND') {
          res.status(404).json({ error: 'Product category not found' });
          return;
        }
        if (error.message === 'UOM_NOT_FOUND') {
          res.status(404).json({ error: 'UoM not found' });
          return;
        }
        if (error.message === 'PRODUCT_SKU_EXISTS') {
          res.status(409).json({ error: 'Product SKU already exists' });
          return;
        }
      }
      throw error;
    }
  },

  async list(req: AuthRequest, res: Response): Promise<void> {
    const { page = 1, limit = 20, search, categoryId, uomId, include } = req.query;
    const result = await productService.findAll({
      page: Number(page),
      limit: Number(limit),
      search: search as string,
      categoryId: categoryId as string,
      uomId: uomId as string,
      includeStock: include === 'stock',
    });
    res.json(result);
  },

  async getOne(req: AuthRequest, res: Response): Promise<void> {
    const { include } = req.query;
    const product = await productService.findById(req.params.id, include === 'stock');
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    
    if (include === 'stock' && product) {
      const totalOnHand = (product as any).stockQuants?.reduce((sum: number, q: any) => sum + Number(q.onHand), 0) ?? 0;
      const { stockQuants, ...productData } = product as any;
      res.json({ ...productData, totalOnHand });
      return;
    }
    
    res.json(product);
  },

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const product = await productService.update(req.params.id, req.body);
      res.json(product);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'CATEGORY_NOT_FOUND') {
          res.status(404).json({ error: 'Product category not found' });
          return;
        }
        if (error.message === 'UOM_NOT_FOUND') {
          res.status(404).json({ error: 'UoM not found' });
          return;
        }
        if (error.message === 'PRODUCT_NOT_FOUND') {
          res.status(404).json({ error: 'Product not found' });
          return;
        }
        if (error.message === 'PRODUCT_SKU_EXISTS') {
          res.status(409).json({ error: 'Product SKU already exists' });
          return;
        }
      }
      throw error;
    }
  },

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      await productService.delete(req.params.id);
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'PRODUCT_NOT_FOUND') {
          res.status(404).json({ error: 'Product not found' });
          return;
        }
        if (error.message === 'PRODUCT_HAS_STOCK_QUANTS_OR_MOVES') {
          res.status(409).json({ error: 'Cannot delete: product has associated stock quants or moves' });
          return;
        }
      }
      throw error;
    }
  },
};