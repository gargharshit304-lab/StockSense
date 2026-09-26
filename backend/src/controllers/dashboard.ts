import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { dashboardService } from '../services/dashboard';

export const dashboardController = {
  async getDashboard(req: AuthRequest, res: Response): Promise<void> {
    const data = await dashboardService.getDashboard();
    res.json(data);
  },

  async getFilters(req: AuthRequest, res: Response): Promise<void> {
    const data = await dashboardService.getFilters();
    res.json(data);
  },
};