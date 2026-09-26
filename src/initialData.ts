import { 
  Product, 
  Receipt, 
  DeliveryOrder, 
  InternalTransfer, 
  InventoryAdjustment, 
  MoveHistoryItem, 
  WarehouseLocation 
} from './types';

export const INITIAL_LOCATIONS: WarehouseLocation[] = [
  { id: 'loc-1', name: 'Main Warehouse', type: 'Primary Storage', capacity: '85%' },
  { id: 'loc-2', name: 'Production Rack', type: 'Buffer / Staging', capacity: '42%' },
  { id: 'loc-3', name: 'Warehouse 2', type: 'Overflow Storage', capacity: '60%' }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Steel Rods',
    sku: 'SR-1002',
    category: 'Raw Materials',
    uom: 'kg',
    stock: 100,
    location: 'Main Warehouse',
    reorderingRule: 'Min: 40 kg / Max: 200 kg',
    minStock: 40,
    maxStock: 200,
    locationBalances: {
      'Main Warehouse': 100,
      'Production Rack': 0,
      'Warehouse 2': 0
    }
  },
  {
    id: 'prod-2',
    name: 'Chairs',
    sku: 'CH-4040',
    category: 'Finished Goods',
    uom: 'Units',
    stock: 12,
    location: 'Warehouse 2',
    reorderingRule: 'Min: 15 Units / Max: 80 Units',
    minStock: 15,
    maxStock: 80,
    locationBalances: {
      'Main Warehouse': 0,
      'Production Rack': 0,
      'Warehouse 2': 12
    }
  },
  {
    id: 'prod-3',
    name: 'Industrial Fasteners',
    sku: 'IF-0091',
    category: 'Hardware',
    uom: 'Units',
    stock: 450,
    location: 'Main Warehouse',
    reorderingRule: 'Min: 100 Units / Max: 1000 Units',
    minStock: 100,
    maxStock: 1000,
    locationBalances: {
      'Main Warehouse': 450,
      'Production Rack': 0,
      'Warehouse 2': 0
    }
  },
  {
    id: 'prod-4',
    name: 'Plywood Sheets',
    sku: 'PW-2201',
    category: 'Raw Materials',
    uom: 'Sheets',
    stock: 8,
    location: 'Production Rack',
    reorderingRule: 'Min: 20 Sheets / Max: 100 Sheets',
    minStock: 20,
    maxStock: 100,
    locationBalances: {
      'Main Warehouse': 0,
      'Production Rack': 8,
      'Warehouse 2': 0
    }
  }
];

export const INITIAL_RECEIPTS: Receipt[] = [
  {
    id: 'REC-2024-001',
    supplier: 'Acme Steel Corp',
    productName: 'Steel Rods',
    productId: 'prod-1',
    quantity: 50,
    uom: 'kg',
    status: 'Ready',
    destinationLocation: 'Main Warehouse'
  },
  {
    id: 'REC-2024-002',
    supplier: 'Comfort Furniture Ltd',
    productName: 'Chairs',
    productId: 'prod-2',
    quantity: 25,
    uom: 'Units',
    status: 'Waiting',
    destinationLocation: 'Warehouse 2'
  },
  {
    id: 'REC-2024-003',
    supplier: 'Fastener Direct',
    productName: 'Industrial Fasteners',
    productId: 'prod-3',
    quantity: 200,
    uom: 'Units',
    status: 'Draft',
    destinationLocation: 'Main Warehouse'
  }
];

export const INITIAL_DELIVERIES: DeliveryOrder[] = [
  {
    id: 'DEL-2024-001',
    productName: 'Steel Rods',
    productId: 'prod-1',
    quantity: 20,
    uom: 'kg',
    fromLocation: 'Production Rack',
    customer: 'Apex Fabrication',
    status: 'Ready',
    step: 'pick'
  },
  {
    id: 'DEL-2024-002',
    productName: 'Chairs',
    productId: 'prod-2',
    quantity: 5,
    uom: 'Units',
    fromLocation: 'Warehouse 2',
    customer: 'Metropolis Offices',
    status: 'Waiting',
    step: 'pick'
  }
];

export const INITIAL_TRANSFERS: InternalTransfer[] = [
  {
    id: 'INT-2026-001',
    productName: 'Steel Rods',
    productId: 'prod-1',
    fromLocation: 'Main Warehouse',
    toLocation: 'Production Rack',
    quantity: 50,
    uom: 'kg',
    status: 'Waiting',
    workflowStep: 'scheduled',
    statusText: 'Waiting for Warehouse Staff'
  }
];

export const INITIAL_ADJUSTMENTS: InventoryAdjustment[] = [
  {
    id: 'ADJ-2024-001',
    productName: 'Steel Rods',
    productId: 'prod-1',
    location: 'Production Rack',
    recordedStock: 30,
    physicalCount: 27,
    adjustmentQty: -3,
    uom: 'kg',
    reason: 'B-grade defect discarded',
    date: '2026-09-25'
  }
];

export const INITIAL_MOVE_HISTORY: MoveHistoryItem[] = [
  {
    id: 'MOV-1001',
    product: 'Steel Rods',
    type: 'Receipt',
    from: 'Vendor (Acme Steel)',
    to: 'Main Warehouse',
    quantity: '+50 kg',
    numericQty: 50,
    uom: 'kg',
    status: 'Done',
    timestamp: '2026-09-24 10:15'
  },
  {
    id: 'MOV-1002',
    product: 'Steel Rods',
    type: 'Internal',
    from: 'Main Warehouse',
    to: 'Production Rack',
    quantity: '50 kg',
    numericQty: 50,
    uom: 'kg',
    status: 'Ready',
    timestamp: '2026-09-24 14:30'
  },
  {
    id: 'MOV-1003',
    product: 'Steel Rods',
    type: 'Delivery',
    from: 'Production Rack',
    to: 'Customer (Apex)',
    quantity: '-20 kg',
    numericQty: -20,
    uom: 'kg',
    status: 'Done',
    timestamp: '2026-09-25 09:00'
  },
  {
    id: 'MOV-1004',
    product: 'Steel Rods',
    type: 'Adjustment',
    from: '—',
    to: 'Production Rack',
    quantity: '-3 kg',
    numericQty: -3,
    uom: 'kg',
    status: 'Done',
    timestamp: '2026-09-25 16:45'
  }
];
