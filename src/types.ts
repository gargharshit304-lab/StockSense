export type DocumentTypeFilter = 'all' | 'Receipts' | 'Delivery' | 'Internal' | 'Adjustments';
export type StatusFilter = 'all' | 'Draft' | 'Waiting' | 'Ready' | 'Done' | 'Canceled';

export type TabType = 
  | 'dashboard' 
  | 'products' 
  | 'receipts' 
  | 'delivery-orders' 
  | 'inventory-adjustment' 
  | 'move-history' 
  | 'warehouse' 
  | 'profile';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  uom: string;
  stock: number;
  location: string;
  reorderingRule: string;
  minStock: number;
  maxStock: number;
  locationBalances: Record<string, number>;
}

export interface Receipt {
  id: string;
  supplier: string;
  productName: string;
  productId: string;
  quantity: number;
  uom: string;
  status: 'Draft' | 'Waiting' | 'Ready' | 'Done' | 'Canceled';
  destinationLocation: string;
}

export interface DeliveryOrder {
  id: string;
  productName: string;
  productId: string;
  quantity: number;
  uom: string;
  fromLocation: string;
  customer: string;
  status: 'Draft' | 'Waiting' | 'Ready' | 'Done' | 'Canceled';
  step: 'pick' | 'pack' | 'validate';
}

export type TransferWorkflowStep = 'scheduled' | 'accepted' | 'in_progress' | 'completed';

export interface InternalTransfer {
  id: string;
  productName: string;
  productId: string;
  fromLocation: string;
  toLocation: string;
  quantity: number;
  uom: string;
  status: 'Waiting' | 'Ready' | 'Done';
  workflowStep?: TransferWorkflowStep;
  statusText?: string;
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
  type: 'Receipt' | 'Internal' | 'Delivery' | 'Adjustment';
  from: string;
  to: string;
  quantity: string;
  numericQty: number;
  uom: string;
  status: string;
  timestamp: string;
}

export interface WarehouseLocation {
  id: string;
  name: string;
  type: string;
  capacity: string;
}

export interface ToastNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'danger';
}

export interface FilterState {
  documentType: DocumentTypeFilter;
  status: StatusFilter;
  location: string;
  category: string;
}
