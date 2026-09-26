import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { productCategoryService } from '../services/productCategory';

export const productCategoryController = {
  async create(req: AuthRequest, res: Response): Promise<void> {
    const category = await productCategoryService.create(req.body);
    res.status(201).json(category);
  },

  async list(req: AuthRequest, res: Response): Promise<void> {
    const { page = 1, limit = 20, search } = req.query;
    const result = await productCategoryService.findAll({
      page: Number(page),
      limit: Number(limit),
      search: search as string,
    });
    res.json(result);
  },

  async getOne(req: AuthRequest, res: Response): Promise<void> {
    const category = await productCategoryService.findById(req.params.id);
    if (!category) {
      res.status(404).json({ error: 'Product category not found' });
      return;
    }
    res.json(category);
  },

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const category = await productCategoryService.update(req.params.id, req.body);
      res.json(category);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'PRODUCT_CATEGORY_NOT_FOUND') {
          res.status(404).json({ error: 'Product category not found' });
          return;
        }
        if (error.message === 'PRODUCT_CATEGORY_NAME_EXISTS') {
          res.status(409).json({ error: 'Product category name already exists' });
          return;
        }
      }
      throw error;
    }
  },

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      await productCategoryService.delete(req.params.id);
      res.json({ message: 'Product category deleted successfully' });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'PRODUCT_CATEGORY_NOT_FOUND') {
          res.status(404).json({ error: 'Product category not found' });
          return;
        }
        if (error.message === 'PRODUCT_CATEGORY_HAS_PRODUCTS') {
          res.status(409).json({ error: 'Cannot delete: product category has associated products' });
          return;
        }
      }
      throw error;
    }
  },
};