import client from './client';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  uom: string;
  stock: number;
  location: string;
  reorderingRule?: string;
  minStock?: number;
  maxStock?: number;
  locationBalances?: Record<string, number>;
}

export interface CreateProductData {
  name: string;
  sku: string;
  category: string;
  uom: string;
  initialStock: number;
  location: string;
}

export interface Receipt {
  id: string;
  supplier: string;
  productName: string;
  productId: string;
  quantity: number;
  uom: string;
  status: 'Ready' | 'Done';
  destinationLocation: string;
}

export interface CreateReceiptData {
  supplier: string;
  productId: string;
  quantity: number;
}

export interface DeliveryOrder {
  id: string;
  productName: string;
  productId: string;
  quantity: number;
  uom: string;
  fromLocation: string;
  customer: string;
  status: 'Ready' | 'Done';
  step: 'pick' | 'pack' | 'validate';
}

export interface CreateDeliveryData {
  customer: string;
  productId: string;
  quantity: number;
}

export interface InternalTransfer {
  id: string;
  productName: string;
  productId: string;
  fromLocation: string;
  toLocation: string;
  quantity: number;
  uom: string;
  status: 'Waiting' | 'In Progress' | 'Done';
  workflowStep: 'scheduled' | 'in_progress' | 'completed';
  statusText: string;
}

export interface CreateTransferData {
  productId: string;
  fromLocation: string;
  toLocation: string;
  quantity: number;
}

export interface InventoryAdjustment {
  id: string;
  productName: string;
  productId: string;
  location: string;
  recordedStock: number;
  physicalCount: number;
  adjustmentQty: number;
  uom: string;
  reason: string;
  date: string;
}

export interface MoveHistoryItem {
  id: string;
  product: string;
  type: 'Receipt' | 'Delivery' | 'Internal Transfer' | 'Adjustment';
  from: string;
  to: string;
  quantity: string;
  numericQty: number;
  uom: string;
  status: string;
  timestamp: string;
}

export const stockApi = {
  // Products
  getProducts: () =>
    client.get<Product[]>('/api/products'),

  getProduct: (id: string) =>
    client.get<Product>(`/api/products/${id}`),

  createProduct: (data: CreateProductData) =>
    client.post<Product>('/api/products', data),

  updateProduct: (id: string, data: Partial<Product>) =>
    client.patch<Product>(`/api/products/${id}`, data),

  deleteProduct: (id: string) =>
    client.delete(`/api/products/${id}`),

  // Receipts
  getReceipts: () =>
    client.get<Receipt[]>('/api/receipts'),

  getReceipt: (id: string) =>
    client.get<Receipt>(`/api/receipts/${id}`),

  createReceipt: (data: CreateReceiptData) =>
    client.post<Receipt>('/api/receipts', data),

  validateReceipt: (id: string) =>
    client.post<Receipt>(`/api/receipts/${id}/validate`),

  // Deliveries
  getDeliveries: () =>
    client.get<DeliveryOrder[]>('/api/deliveries'),

  getDelivery: (id: string) =>
    client.get<DeliveryOrder>(`/api/deliveries/${id}`),

  createDelivery: (data: CreateDeliveryData) =>
    client.post<DeliveryOrder>('/api/deliveries', data),

  advanceDeliveryStep: (id: string, action: 'pick' | 'pack') =>
    client.post<DeliveryOrder>(`/api/deliveries/${id}/advance`, { action }),

  validateDelivery: (id: string) =>
    client.post<DeliveryOrder>(`/api/deliveries/${id}/validate`),

  // Transfers
  getTransfers: () =>
    client.get<InternalTransfer[]>('/api/transfers'),

  getTransfer: (id: string) =>
    client.get<InternalTransfer>(`/api/transfers/${id}`),

  createTransfer: (data: CreateTransferData) =>
    client.post<InternalTransfer>('/api/transfers', data),

  acceptTransfer: (id: string) =>
    client.post<InternalTransfer>(`/api/transfers/${id}/accept`),

  confirmTransfer: (id: string) =>
    client.post<InternalTransfer>(`/api/transfers/${id}/confirm`),

  // Adjustments
  getAdjustments: () =>
    client.get<InventoryAdjustment[]>('/api/adjustments'),

  createAdjustment: (data: Omit<InventoryAdjustment, 'id' | 'date'>) =>
    client.post<InventoryAdjustment>('/api/adjustments', data),

  // Move History
  getMoveHistory: () =>
    client.get<MoveHistoryItem[]>('/api/move-history'),
};