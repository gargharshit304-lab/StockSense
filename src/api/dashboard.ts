import client from './client';

export interface DashboardStats {
  totalProducts: number;
  totalStockValue: number;
  lowStockItems: number;
  pendingReceipts: number;
  pendingDeliveries: number;
  pendingTransfers: number;
}

export interface RecentActivity {
  id: string;
  type: 'receipt' | 'delivery' | 'transfer' | 'adjustment';
  description: string;
  timestamp: string;
}

export const dashboardApi = {
  getDashboard: () =>
    client.get<DashboardStats>('/api/dashboard'),

  getRecentActivity: (limit?: number) =>
    client.get<RecentActivity[]>('/api/dashboard/activity', { params: { limit } }),
};