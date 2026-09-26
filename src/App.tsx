import React, { useState, useEffect } from 'react';
import { 
  TabType, 
  Product, 
  Receipt, 
  DeliveryOrder, 
  InternalTransfer, 
  InventoryAdjustment, 
  MoveHistoryItem, 
  WarehouseLocation, 
  FilterState, 
  ToastNotification,
  UserRole,
  StaffNotification
} from './types';
import { 
  INITIAL_LOCATIONS, 
  INITIAL_PRODUCTS, 
  INITIAL_RECEIPTS, 
  INITIAL_DELIVERIES, 
  INITIAL_TRANSFERS, 
  INITIAL_ADJUSTMENTS, 
  INITIAL_MOVE_HISTORY 
} from './initialData';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { StaffDashboardView } from './components/StaffDashboardView';
import { ProductsView } from './components/ProductsView';
import { ReceiptsView } from './components/ReceiptsView';
import { DeliveryOrdersView } from './components/DeliveryOrdersView';
import { InventoryAdjustmentView } from './components/InventoryAdjustmentView';
import { MoveHistoryView } from './components/MoveHistoryView';
import { WarehouseView } from './components/WarehouseView';
import { ProfileView } from './components/ProfileView';
import { 
  CreateProductModal, 
  CreateReceiptModal, 
  CreateDeliveryModal, 
  InternalTransferModal, 
  TransferStatusModal,
  LogoutModal 
} from './components/Modals';
import { Toast } from './components/Toast';

const STORAGE_KEY = 'stocksense_ts_state_v1';

const getRouteForTab = (tab: TabType, role: UserRole): string => {
  if (role === 'warehouse_staff') {
    switch (tab) {
      case 'dashboard':
        return '/staff/dashboard';
      case 'staff-transfers':
        return '/staff/transfers';
      case 'staff-delivery-picking':
        return '/staff/delivery-picking';
      case 'staff-stock-counting':
        return '/staff/stock-counting';
      case 'profile':
        return '/profile';
      default:
        return '/staff/dashboard';
    }
  } else {
    switch (tab) {
      case 'dashboard':
        return '/dashboard';
      case 'products':
        return '/products';
      case 'receipts':
        return '/receipts';
      case 'delivery-orders':
        return '/delivery-orders';
      case 'inventory-adjustment':
        return '/inventory-adjustment';
      case 'move-history':
        return '/move-history';
      case 'warehouse':
        return '/warehouse';
      case 'profile':
        return '/profile';
      default:
        return '/dashboard';
    }
  }
};

const parseRoute = (path: string): { tab: TabType; role?: UserRole } | null => {
  const clean = path.toLowerCase().replace(/\/$/, '') || '/';
  if (clean === '/staff/dashboard') {
    return { tab: 'dashboard', role: 'warehouse_staff' };
  }
  if (clean === '/staff/transfers') {
    return { tab: 'staff-transfers', role: 'warehouse_staff' };
  }
  if (clean === '/staff/delivery-picking') {
    return { tab: 'staff-delivery-picking', role: 'warehouse_staff' };
  }
  if (clean === '/staff/stock-counting') {
    return { tab: 'staff-stock-counting', role: 'warehouse_staff' };
  }
  if (clean === '/profile') {
    return { tab: 'profile' };
  }
  if (clean === '/dashboard') {
    return { tab: 'dashboard', role: 'manager' };
  }
  if (clean === '/products') {
    return { tab: 'products', role: 'manager' };
  }
  if (clean === '/receipts') {
    return { tab: 'receipts', role: 'manager' };
  }
  if (clean === '/delivery-orders') {
    return { tab: 'delivery-orders', role: 'manager' };
  }
  if (clean === '/inventory-adjustment') {
    return { tab: 'inventory-adjustment', role: 'manager' };
  }
  if (clean === '/move-history') {
    return { tab: 'move-history', role: 'manager' };
  }
  if (clean === '/warehouse') {
    return { tab: 'warehouse', role: 'manager' };
  }
  return null;
};

export const App: React.FC = () => {
  // Load State from localStorage or fallback
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).products || INITIAL_PRODUCTS;
    } catch {}
    return INITIAL_PRODUCTS;
  });

  const [receipts, setReceipts] = useState<Receipt[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).receipts || INITIAL_RECEIPTS;
    } catch {}
    return INITIAL_RECEIPTS;
  });

  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).deliveries || INITIAL_DELIVERIES;
    } catch {}
    return INITIAL_DELIVERIES;
  });

  const [transfers, setTransfers] = useState<InternalTransfer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).transfers || INITIAL_TRANSFERS;
    } catch {}
    return INITIAL_TRANSFERS;
  });

  const [adjustments, setAdjustments] = useState<InventoryAdjustment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).adjustments || INITIAL_ADJUSTMENTS;
    } catch {}
    return INITIAL_ADJUSTMENTS;
  });

  const [moveHistory, setMoveHistory] = useState<MoveHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).moveHistory || INITIAL_MOVE_HISTORY;
    } catch {}
    return INITIAL_MOVE_HISTORY;
  });

  const [locations] = useState<WarehouseLocation[]>(INITIAL_LOCATIONS);

  // Initial Route Resolution
  const initialRouteInfo = typeof window !== 'undefined' ? parseRoute(window.location.pathname) : null;

  // Active Role ('manager' | 'warehouse_staff')
  const [userRole, setUserRole] = useState<UserRole>(initialRouteInfo?.role || 'warehouse_staff');

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>(initialRouteInfo?.tab || 'dashboard');

  // Staff Notifications
  const [staffNotifications, setStaffNotifications] = useState<StaffNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.staffNotifications && parsed.staffNotifications.length > 0) {
          return parsed.staffNotifications;
        }
      }
    } catch {}
    return [
      {
        id: 'notif-1',
        title: 'New Internal Transfer',
        product: 'Steel Rods',
        quantity: '50 kg',
        route: 'Main Warehouse → Production Rack',
        transferId: 'INT-2026-001',
        read: false,
        timestamp: '10:00 AM'
      },
      {
        id: 'notif-history-1',
        title: 'Internal Transfer',
        product: 'Ergonomic Office Chair',
        quantity: '20 Units',
        route: 'Main Warehouse → Production Rack',
        transferId: 'INT-2026-000',
        read: true,
        status: 'Completed',
        timestamp: 'Yesterday, 4:15 PM'
      }
    ];
  });

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    documentType: 'all',
    status: 'all',
    location: 'all',
    category: 'all'
  });

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferDefaultFrom, setTransferDefaultFrom] = useState<string | undefined>(undefined);
  const [viewingTransfer, setViewingTransfer] = useState<InternalTransfer | null>(null);
  const [isTransferStatusModalOpen, setIsTransferStatusModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Persist State
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          products,
          receipts,
          deliveries,
          transfers,
          adjustments,
          moveHistory,
          staffNotifications
        })
      );
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [products, receipts, deliveries, transfers, adjustments, moveHistory, staffNotifications]);

  // Handle popstate (Browser back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const match = parseRoute(window.location.pathname);
      if (match) {
        if (match.role) setUserRole(match.role);
        setActiveTab(match.tab);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync initial URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const current = window.location.pathname;
      if (current === '/' || !parseRoute(current)) {
        window.history.replaceState(null, '', getRouteForTab(activeTab, userRole));
      }
    }
  }, []);

  const handleNavigate = (tab: TabType) => {
    setActiveTab(tab);
    try {
      const targetRoute = getRouteForTab(tab, userRole);
      if (window.location.pathname !== targetRoute) {
        window.history.pushState(null, '', targetRoute);
      }
    } catch {}
  };

  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
    let nextTab = activeTab;
    if (newRole === 'warehouse_staff') {
      if (['products', 'receipts', 'delivery-orders', 'inventory-adjustment', 'move-history', 'warehouse'].includes(activeTab)) {
        nextTab = 'dashboard';
      }
    } else if (newRole === 'manager') {
      if (['staff-transfers', 'staff-delivery-picking', 'staff-stock-counting'].includes(activeTab)) {
        nextTab = 'dashboard';
      }
    }
    setActiveTab(nextTab);
    try {
      const targetRoute = getRouteForTab(nextTab, newRole);
      if (window.location.pathname !== targetRoute) {
        window.history.pushState(null, '', targetRoute);
      }
    } catch {}
  };

  const showToast = (message: string, type: 'info' | 'success' | 'danger' = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    const newToast: ToastNotification = { id, message, type };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  };

  // Reset Demo
  const handleResetDemo = () => {
    setProducts(JSON.parse(JSON.stringify(INITIAL_PRODUCTS)));
    setReceipts(JSON.parse(JSON.stringify(INITIAL_RECEIPTS)));
    setDeliveries(JSON.parse(JSON.stringify(INITIAL_DELIVERIES)));
    setTransfers(JSON.parse(JSON.stringify(INITIAL_TRANSFERS)));
    setAdjustments(JSON.parse(JSON.stringify(INITIAL_ADJUSTMENTS)));
    setMoveHistory(JSON.parse(JSON.stringify(INITIAL_MOVE_HISTORY)));
    setStaffNotifications([
      {
        id: 'notif-1',
        title: 'New Internal Transfer',
        product: 'Steel Rods',
        quantity: '50 kg',
        route: 'Main Warehouse → Production Rack',
        transferId: 'INT-2026-001',
        read: false,
        timestamp: '10:00 AM'
      },
      {
        id: 'notif-history-1',
        title: 'Internal Transfer',
        product: 'Ergonomic Office Chair',
        quantity: '20 Units',
        route: 'Main Warehouse → Production Rack',
        transferId: 'INT-2026-000',
        read: true,
        status: 'Completed',
        timestamp: 'Yesterday, 4:15 PM'
      }
    ]);
    setFilters({ documentType: 'all', status: 'all', location: 'all', category: 'all' });
    showToast('Demo data reset to initial stock state (Steel Rods: 100 kg, Chairs: 12 Units).', 'info');
  };

  // 1. Receipt Validation Flow (Increases Stock)
  const handleValidateReceipt = (receiptId: string) => {
    const r = receipts.find(rec => rec.id === receiptId);
    if (!r || r.status === 'Done') return;

    const prod = products.find(p => p.id === r.productId || p.name === r.productName);
    if (!prod) {
      showToast('Product not found for this receipt', 'danger');
      return;
    }

    const previousStock = prod.stock;
    const addedQty = Number(r.quantity);
    const updatedStock = previousStock + addedQty;

    // Update product stock and location balance
    const targetLoc = r.destinationLocation || prod.location || 'Main Warehouse';
    const updatedBalances = { ...(prod.locationBalances || {}) };
    updatedBalances[targetLoc] = (updatedBalances[targetLoc] || 0) + addedQty;

    setProducts(prev =>
      prev.map(p =>
        p.id === prod.id
          ? { ...p, stock: updatedStock, locationBalances: updatedBalances }
          : p
      )
    );

    // Update receipt status
    setReceipts(prev =>
      prev.map(rec => (rec.id === receiptId ? { ...rec, status: 'Done' } : rec))
    );

    // Record in Move History
    const newMove: MoveHistoryItem = {
      id: `MOV-${Date.now().toString().slice(-4)}`,
      product: prod.name,
      type: 'Receipt',
      from: `Vendor (${r.supplier})`,
      to: targetLoc,
      quantity: `+${addedQty} ${prod.uom}`,
      numericQty: addedQty,
      uom: prod.uom,
      status: 'Done',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setMoveHistory(prev => [newMove, ...prev]);

    showToast(
      `Receipt ${r.id} validated! ${prod.name}: ${previousStock} ${prod.uom} → ${updatedStock} ${prod.uom} (+${addedQty} ${prod.uom})`,
      'success'
    );
  };

  // 2. Delivery Orders Flow (Pick -> Pack -> Validate, Decreases Stock)
  const handleAdvanceDeliveryStep = (deliveryId: string, action: 'pick' | 'pack') => {
    setDeliveries(prev =>
      prev.map(d => {
        if (d.id === deliveryId) {
          if (action === 'pick') {
            showToast(`${d.id}: Pick confirmed. Ready for packing.`, 'info');
            return { ...d, step: 'pack', status: 'Ready' };
          }
          if (action === 'pack') {
            showToast(`${d.id}: Pack confirmed. Ready for validation & dispatch.`, 'info');
            return { ...d, step: 'validate', status: 'Ready' };
          }
        }
        return d;
      })
    );
  };

  const handleValidateDelivery = (deliveryId: string) => {
    const d = deliveries.find(del => del.id === deliveryId);
    if (!d || d.status === 'Done') return;

    const prod = products.find(p => p.id === d.productId || p.name === d.productName);
    if (!prod) {
      showToast('Product not found for delivery', 'danger');
      return;
    }

    const deliverQty = Number(d.quantity);
    if (prod.stock < deliverQty) {
      showToast(`Cannot deliver ${deliverQty} ${prod.uom}. Only ${prod.stock} ${prod.uom} available!`, 'danger');
      return;
    }

    const previousStock = prod.stock;
    const updatedStock = previousStock - deliverQty;

    const loc = d.fromLocation || prod.location || 'Main Warehouse';
    const updatedBalances = { ...(prod.locationBalances || {}) };
    updatedBalances[loc] = Math.max(0, (updatedBalances[loc] || 0) - deliverQty);

    setProducts(prev =>
      prev.map(p =>
        p.id === prod.id
          ? { ...p, stock: updatedStock, locationBalances: updatedBalances }
          : p
      )
    );

    setDeliveries(prev =>
      prev.map(del =>
        del.id === deliveryId ? { ...del, status: 'Done', step: 'validate' } : del
      )
    );

    // Record in Move History
    const newMove: MoveHistoryItem = {
      id: `MOV-${Date.now().toString().slice(-4)}`,
      product: prod.name,
      type: 'Delivery',
      from: loc,
      to: `Customer (${d.customer || 'Client'})`,
      quantity: `-${deliverQty} ${prod.uom}`,
      numericQty: -deliverQty,
      uom: prod.uom,
      status: 'Done',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setMoveHistory(prev => [newMove, ...prev]);

    showToast(
      `Delivery ${d.id} validated! ${prod.name}: ${previousStock} ${prod.uom} → ${updatedStock} ${prod.uom} (-${deliverQty} ${prod.uom})`,
      'success'
    );
  };

  // 3. View Transfer Status (Inventory Manager does NOT execute; only monitors)
  const handleViewTransferStatus = (transfer: InternalTransfer) => {
    // Open modal without modifying inventory
    setViewingTransfer(transfer);
    setIsTransferStatusModalOpen(true);
  };

  // Staff Accepts Transfer (Status becomes In Progress, Inventory UNCHANGED)
  const handleStaffAcceptTransfer = (transferId: string) => {
    const t = transfers.find(tr => tr.id === transferId);
    if (!t) return;

    const updated: InternalTransfer = {
      ...t,
      workflowStep: 'in_progress',
      statusText: 'In Progress'
    };

    setTransfers(prev => prev.map(tr => tr.id === transferId ? updated : tr));
    if (viewingTransfer && viewingTransfer.id === transferId) {
      setViewingTransfer(updated);
    }

    // Mark notification as read and set status
    setStaffNotifications(prev =>
      prev.map(n => n.transferId === transferId ? { ...n, read: true, status: 'In Progress' } : n)
    );

    showToast(`Transfer ${transferId} accepted! Status is now In Progress. Physically perform goods movement.`, 'info');
  };

  // Warehouse Staff Confirmation (Inventory changes ONLY after staff confirms)
  const handleStaffConfirmTransfer = (transferId: string) => {
    const t = transfers.find(tr => tr.id === transferId);
    if (!t || t.status === 'Done') return;

    const prod = products.find(p => p.id === t.productId || p.name === t.productName);
    if (!prod) {
      showToast('Product not found for transfer', 'danger');
      return;
    }

    const qty = Number(t.quantity);
    const updatedBalances = { ...(prod.locationBalances || {}) };
    const sourceBal = updatedBalances[t.fromLocation] || 0;
    updatedBalances[t.fromLocation] = Math.max(0, sourceBal - qty);
    updatedBalances[t.toLocation] = (updatedBalances[t.toLocation] || 0) + qty;

    setProducts(prev =>
      prev.map(p =>
        p.id === prod.id ? { ...p, locationBalances: updatedBalances } : p
      )
    );

    const completedTransfer: InternalTransfer = {
      ...t,
      status: 'Done',
      workflowStep: 'completed',
      statusText: 'Completed'
    };

    setTransfers(prev =>
      prev.map(tr => (tr.id === transferId ? completedTransfer : tr))
    );

    setViewingTransfer(completedTransfer);

    // Mark notification as read and set status
    setStaffNotifications(prev =>
      prev.map(n => n.transferId === transferId ? { ...n, read: true, status: 'Completed' } : n)
    );

    // Record in Move History
    const newMove: MoveHistoryItem = {
      id: t.id,
      product: prod.name,
      type: 'Internal Transfer',
      from: t.fromLocation,
      to: t.toLocation,
      quantity: `${qty} ${prod.uom}`,
      numericQty: qty,
      uom: prod.uom,
      status: 'Completed',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setMoveHistory(prev => [newMove, ...prev]);

    showToast(
      `✓ Transfer Completed! ${qty} ${prod.uom} of ${prod.name} moved from ${t.fromLocation} → ${t.toLocation}. Total stock remains ${prod.stock} ${prod.uom}.`,
      'success'
    );
  };

  // Notification Actions
  const handleMarkNotificationAsRead = (notifId: string) => {
    setStaffNotifications(prev =>
      prev.map(n => n.id === notifId ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllNotificationsAsRead = () => {
    setStaffNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
    showToast('All notifications marked as read.', 'info');
  };

  const handleNotificationViewTransfer = (transferId: string, notifId?: string) => {
    // 1. Mark notification as read
    if (notifId) {
      setStaffNotifications(prev =>
        prev.map(n => n.id === notifId ? { ...n, read: true } : n)
      );
    } else {
      setStaffNotifications(prev =>
        prev.map(n => n.transferId === transferId ? { ...n, read: true } : n)
      );
    }

    // 2. Navigate or open status modal based on active role
    if (userRole === 'warehouse_staff') {
      handleNavigate('staff-transfers');
    } else {
      const t = transfers.find(x => x.id === transferId);
      if (t) handleViewTransferStatus(t);
    }
  };

  // 4. Inventory Adjustment Application
  const handleApplyAdjustment = (productId: string, location: string, countedQty: number) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    let recordedStock = prod.stock;
    if (prod.locationBalances && prod.locationBalances[location] !== undefined) {
      recordedStock = prod.locationBalances[location];
    }

    const adjustmentQty = countedQty - recordedStock;
    if (adjustmentQty === 0) {
      showToast('Physical count matches recorded stock. No adjustment needed.', 'info');
      return;
    }

    const newStock = Math.max(0, prod.stock + adjustmentQty);
    const updatedBalances = { ...(prod.locationBalances || {}) };
    updatedBalances[location] = countedQty;

    setProducts(prev =>
      prev.map(p =>
        p.id === prod.id
          ? { ...p, stock: newStock, locationBalances: updatedBalances }
          : p
      )
    );

    const adjRecord: InventoryAdjustment = {
      id: `ADJ-${Date.now().toString().slice(-4)}`,
      productName: prod.name,
      productId: prod.id,
      location,
      recordedStock,
      physicalCount: countedQty,
      adjustmentQty,
      uom: prod.uom,
      reason: 'Physical count reconciliation',
      date: new Date().toISOString().slice(0, 10)
    };
    setAdjustments(prev => [adjRecord, ...prev]);

    const sign = adjustmentQty > 0 ? `+${adjustmentQty}` : `${adjustmentQty}`;
    const newMove: MoveHistoryItem = {
      id: `MOV-${Date.now().toString().slice(-4)}`,
      product: prod.name,
      type: 'Adjustment',
      from: '—',
      to: location,
      quantity: `${sign} ${prod.uom}`,
      numericQty: adjustmentQty,
      uom: prod.uom,
      status: 'Done',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setMoveHistory(prev => [newMove, ...prev]);

    showToast(
      `Inventory adjustment applied! ${prod.name} at ${location} adjusted to ${countedQty} ${prod.uom} (${sign} ${prod.uom})`,
      'success'
    );
  };

  // 5. Creation Modals Submit Handlers
  const handleCreateProduct = (data: {
    name: string;
    sku: string;
    category: string;
    uom: string;
    initialStock: number;
    location: string;
  }) => {
    const newProduct: Product = {
      id: `prod-${Date.now().toString().slice(-4)}`,
      name: data.name,
      sku: data.sku,
      category: data.category,
      uom: data.uom,
      stock: data.initialStock,
      location: data.location,
      reorderingRule: `Min: 10 ${data.uom} / Max: 100 ${data.uom}`,
      minStock: 10,
      maxStock: 100,
      locationBalances: {
        [data.location]: data.initialStock
      }
    };

    setProducts(prev => [...prev, newProduct]);

    if (data.initialStock > 0) {
      setMoveHistory(prev => [
        {
          id: `MOV-${Date.now().toString().slice(-4)}`,
          product: data.name,
          type: 'Receipt',
          from: 'Initial Inventory',
          to: data.location,
          quantity: `+${data.initialStock} ${data.uom}`,
          numericQty: data.initialStock,
          uom: data.uom,
          status: 'Done',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
        },
        ...prev
      ]);
    }

    showToast(`Product "${data.name}" created successfully!`, 'success');
  };

  const handleCreateReceipt = (data: {
    supplier: string;
    productId: string;
    quantity: number;
  }) => {
    const prod = products.find(p => p.id === data.productId);
    if (!prod) return;

    const newReceipt: Receipt = {
      id: `REC-${Date.now().toString().slice(-4)}`,
      supplier: data.supplier,
      productName: prod.name,
      productId: prod.id,
      quantity: data.quantity,
      uom: prod.uom,
      status: 'Ready',
      destinationLocation: prod.location || 'Main Warehouse'
    };

    setReceipts(prev => [newReceipt, ...prev]);
    showToast(`Receipt ${newReceipt.id} created! You can now validate it to increase stock.`, 'success');
  };

  const handleCreateDelivery = (data: {
    customer: string;
    productId: string;
    quantity: number;
  }) => {
    const prod = products.find(p => p.id === data.productId);
    if (!prod) return;

    const newDelivery: DeliveryOrder = {
      id: `DEL-${Date.now().toString().slice(-4)}`,
      productName: prod.name,
      productId: prod.id,
      quantity: data.quantity,
      uom: prod.uom,
      fromLocation: prod.location || 'Main Warehouse',
      customer: data.customer,
      status: 'Ready',
      step: 'pick'
    };

    setDeliveries(prev => [newDelivery, ...prev]);
    showToast(`Delivery order ${newDelivery.id} created! Ready for Pick → Pack → Validate.`, 'success');
  };

  const handleCreateTransfer = (data: {
    productId: string;
    fromLocation: string;
    toLocation: string;
    quantity: number;
  }) => {
    const prod = products.find(p => p.id === data.productId);
    if (!prod) return;

    const newTransfer: InternalTransfer = {
      id: `INT-${Date.now().toString().slice(-4)}`,
      productName: prod.name,
      productId: prod.id,
      fromLocation: data.fromLocation,
      toLocation: data.toLocation,
      quantity: data.quantity,
      uom: prod.uom,
      status: 'Waiting',
      workflowStep: 'scheduled',
      statusText: 'Waiting for Warehouse Staff'
    };

    setTransfers(prev => [newTransfer, ...prev]);

    // Send notification to Warehouse Staff
    const newNotif: StaffNotification = {
      id: `notif-${Date.now()}`,
      title: 'New Internal Transfer',
      product: prod.name,
      quantity: `${data.quantity} ${prod.uom}`,
      route: `${data.fromLocation} → ${data.toLocation}`,
      transferId: newTransfer.id,
      read: false,
      timestamp: 'Just now'
    };
    setStaffNotifications(prev => [newNotif, ...prev]);

    showToast(`Internal transfer ${newTransfer.id} scheduled (${data.fromLocation} → ${data.toLocation}). Notification sent to Warehouse Staff.`, 'success');
  };

  // Hackathon Presentation Demo Steps (1 to 5)
  const handleTriggerDemoStep = (step: number) => {
    const steel = products.find(p => p.name === 'Steel Rods');
    if (!steel) {
      handleResetDemo();
      return;
    }

    if (userRole !== 'manager') {
      setUserRole('manager');
    }

    if (step === 1) {
      // Step 1: Receive goods -> Steel Rods +50 kg
      handleNavigate('receipts');
      const pending = receipts.find(r => r.productName === 'Steel Rods' && r.status !== 'Done');
      if (pending) {
        handleValidateReceipt(pending.id);
      } else {
        const newRec: Receipt = {
          id: `REC-${Date.now().toString().slice(-4)}`,
          supplier: 'Acme Steel Corp',
          productName: 'Steel Rods',
          productId: steel.id,
          quantity: 50,
          uom: 'kg',
          status: 'Ready',
          destinationLocation: 'Main Warehouse'
        };
        setReceipts(prev => [newRec, ...prev]);
        setTimeout(() => handleValidateReceipt(newRec.id), 50);
      }
      showToast('Step 1 Complete: Received +50 kg Steel Rods! Stock increased.', 'success');
    } else if (step === 2) {
      // Step 2: Transfer goods between locations
      handleNavigate('warehouse');
      let t = transfers.find(tr => tr.productName === 'Steel Rods');
      if (!t) {
        t = {
          id: 'INT-2026-001',
          productName: 'Steel Rods',
          productId: steel.id,
          fromLocation: 'Main Warehouse',
          toLocation: 'Production Rack',
          quantity: 50,
          uom: 'kg',
          status: 'Waiting',
          workflowStep: 'scheduled',
          statusText: 'Waiting for Warehouse Staff'
        };
        setTransfers(prev => [t!, ...prev]);
      }
      handleViewTransferStatus(t);
      showToast('Step 2: Transfer status viewed (Waiting for Warehouse Staff). Inventory remains unchanged until confirmed.', 'info');
    } else if (step === 3) {
      // Step 3: Deliver goods (-20 kg)
      handleNavigate('delivery-orders');
      let del = deliveries.find(d => d.productName === 'Steel Rods' && d.status !== 'Done');
      if (!del) {
        del = {
          id: `DEL-${Date.now().toString().slice(-4)}`,
          productName: 'Steel Rods',
          productId: steel.id,
          quantity: 20,
          uom: 'kg',
          fromLocation: 'Production Rack',
          customer: 'Apex Fabrication',
          status: 'Ready',
          step: 'validate'
        };
        setDeliveries(prev => [del!, ...prev]);
      }
      handleValidateDelivery(del.id);
      showToast('Step 3 Complete: Delivered 20 kg Steel Rods! Stock decreased.', 'success');
    } else if (step === 4) {
      // Step 4: Adjust damaged stock (-3 kg)
      handleNavigate('inventory-adjustment');
      const rackBal = steel.locationBalances['Production Rack'] || 30;
      handleApplyAdjustment(steel.id, 'Production Rack', Math.max(0, rackBal - 3));
      showToast('Step 4 Complete: Adjusted damaged stock (-3 kg). Logged in Move History!', 'success');
    } else if (step === 5) {
      // Step 5: Ledger verification
      handleNavigate('move-history');
      showToast('Stock Ledger: All movements verified in chronological order!', 'info');
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        userRole={userRole}
        activeTab={activeTab}
        onNavigate={handleNavigate}
        onLogoutClick={() => setIsLogoutModalOpen(true)}
        onResetDemo={handleResetDemo}
      />

      {/* Main View Area */}
      <div className="main-wrapper">
        <Header
          activeTab={activeTab}
          userRole={userRole}
          onRoleChange={handleRoleChange}
          notifications={staffNotifications}
          transfers={transfers}
          onNavigate={handleNavigate}
          onTriggerDemoStep={handleTriggerDemoStep}
          onViewTransfer={handleNotificationViewTransfer}
          onMarkNotificationAsRead={handleMarkNotificationAsRead}
          onMarkAllAsRead={handleMarkAllNotificationsAsRead}
        />

        <main className="content-viewport">
          {(activeTab === 'dashboard' || 
            activeTab === 'staff-transfers' || 
            activeTab === 'staff-delivery-picking' || 
            activeTab === 'staff-stock-counting') && (
            userRole === 'manager' ? (
              <DashboardView
                products={products}
                receipts={receipts}
                deliveries={deliveries}
                transfers={transfers}
                adjustments={adjustments}
                locations={locations}
                filters={filters}
                onFilterChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))}
                onResetFilters={() => setFilters({ documentType: 'all', status: 'all', location: 'all', category: 'all' })}
              />
            ) : (
              <StaffDashboardView
                activeTab={activeTab}
                transfers={transfers}
                deliveries={deliveries}
                products={products}
                locations={locations}
                onAcceptTransfer={handleStaffAcceptTransfer}
                onConfirmTransferCompleted={handleStaffConfirmTransfer}
                onAdvanceDeliveryStep={handleAdvanceDeliveryStep}
                onValidateDelivery={handleValidateDelivery}
                onApplyAdjustment={handleApplyAdjustment}
              />
            )
          )}

          {userRole === 'manager' && activeTab === 'products' && (
            <ProductsView
              products={products}
              onOpenCreateProduct={() => setIsProductModalOpen(true)}
            />
          )}

          {userRole === 'manager' && activeTab === 'receipts' && (
            <ReceiptsView
              receipts={receipts}
              onOpenCreateReceipt={() => setIsReceiptModalOpen(true)}
              onValidateReceipt={handleValidateReceipt}
            />
          )}

          {userRole === 'manager' && activeTab === 'delivery-orders' && (
            <DeliveryOrdersView
              deliveries={deliveries}
              onOpenCreateDelivery={() => setIsDeliveryModalOpen(true)}
              onAdvanceStep={handleAdvanceDeliveryStep}
              onValidateDelivery={handleValidateDelivery}
            />
          )}

          {userRole === 'manager' && activeTab === 'inventory-adjustment' && (
            <InventoryAdjustmentView
              products={products}
              locations={locations}
              adjustments={adjustments}
              onApplyAdjustment={handleApplyAdjustment}
            />
          )}

          {userRole === 'manager' && activeTab === 'move-history' && (
            <MoveHistoryView moveHistory={moveHistory} />
          )}

          {userRole === 'manager' && activeTab === 'warehouse' && (
            <WarehouseView
              locations={locations}
              products={products}
              transfers={transfers}
              onOpenTransferModal={(fromLoc) => {
                setTransferDefaultFrom(fromLoc);
                setIsTransferModalOpen(true);
              }}
              onViewTransferStatus={handleViewTransferStatus}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView userRole={userRole} onLogoutClick={() => setIsLogoutModalOpen(true)} />
          )}
        </main>
      </div>

      {/* Modals */}
      <CreateProductModal
        isOpen={isProductModalOpen}
        locations={locations}
        onClose={() => setIsProductModalOpen(false)}
        onSubmit={handleCreateProduct}
      />

      <CreateReceiptModal
        isOpen={isReceiptModalOpen}
        products={products}
        onClose={() => setIsReceiptModalOpen(false)}
        onSubmit={handleCreateReceipt}
      />

      <CreateDeliveryModal
        isOpen={isDeliveryModalOpen}
        products={products}
        onClose={() => setIsDeliveryModalOpen(false)}
        onSubmit={handleCreateDelivery}
      />

      <InternalTransferModal
        isOpen={isTransferModalOpen}
        products={products}
        locations={locations}
        defaultFrom={transferDefaultFrom}
        onClose={() => {
          setIsTransferModalOpen(false);
          setTransferDefaultFrom(undefined);
        }}
        onSubmit={handleCreateTransfer}
      />

      <TransferStatusModal
        isOpen={isTransferStatusModalOpen}
        transfer={viewingTransfer}
        onClose={() => {
          setIsTransferStatusModalOpen(false);
          setViewingTransfer(null);
        }}
      />

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          setIsLogoutModalOpen(false);
          showToast('You have been logged out of StockSense.', 'info');
        }}
      />

      {/* Floating Toast Notification Container */}
      <Toast toasts={toasts} />
    </div>
  );
};
