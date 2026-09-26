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
  | 'profile'
  | 'staff-transfers'
  | 'staff-delivery-picking'
  | 'staff-stock-counting';

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
  type: 'Receipt' | 'Internal' | 'Delivery' | 'Adjustment' | 'Internal Transfer';
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

export type UserRole = 'manager' | 'warehouse_staff';

export interface StaffNotification {
  id: string;
  title: string;
  product: string;
  quantity: string;
  route: string;
  transferId: string;
  read: boolean;
  timestamp: string;
  status?: 'Waiting' | 'In Progress' | 'Completed' | string;
}

