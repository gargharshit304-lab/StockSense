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
  ToastNotification 
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

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

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
          moveHistory
        })
      );
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [products, receipts, deliveries, transfers, adjustments, moveHistory]);

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

    // Record in Move History
    const newMove: MoveHistoryItem = {
      id: `MOV-${Date.now().toString().slice(-4)}`,
      product: prod.name,
      type: 'Internal',
      from: t.fromLocation,
      to: t.toLocation,
      quantity: `${qty} ${prod.uom}`,
      numericQty: qty,
      uom: prod.uom,
      status: 'Done',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setMoveHistory(prev => [newMove, ...prev]);

    showToast(
      `Warehouse Staff confirmed transfer ${t.id}! ${qty} ${prod.uom} of ${prod.name} moved from ${t.fromLocation} → ${t.toLocation}. Total stock remains ${prod.stock} ${prod.uom}.`,
      'success'
    );
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
    showToast(`Internal transfer ${newTransfer.id} scheduled (${data.fromLocation} → ${data.toLocation}). Waiting for Warehouse Staff.`, 'success');
  };

  // Hackathon Presentation Demo Steps (1 to 5)
  const handleTriggerDemoStep = (step: number) => {
    const steel = products.find(p => p.name === 'Steel Rods');
    if (!steel) {
      handleResetDemo();
      return;
    }

    if (step === 1) {
      // Step 1: Receive goods -> Steel Rods +50 kg
      setActiveTab('receipts');
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
      setActiveTab('warehouse');
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
      setActiveTab('delivery-orders');
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
      setActiveTab('inventory-adjustment');
      const rackBal = steel.locationBalances['Production Rack'] || 30;
      handleApplyAdjustment(steel.id, 'Production Rack', Math.max(0, rackBal - 3));
      showToast('Step 4 Complete: Adjusted damaged stock (-3 kg). Logged in Move History!', 'success');
    } else if (step === 5) {
      // Step 5: Ledger verification
      setActiveTab('move-history');
      showToast('Stock Ledger: All movements verified in chronological order!', 'info');
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onNavigate={setActiveTab}
        onLogoutClick={() => setIsLogoutModalOpen(true)}
        onResetDemo={handleResetDemo}
      />

      {/* Main View Area */}
      <div className="main-wrapper">
        <Header
          activeTab={activeTab}
          onNavigate={setActiveTab}
          onTriggerDemoStep={handleTriggerDemoStep}
          onNotificationClick={() => showToast('3 inventory tasks require operational review', 'info')}
        />

        <main className="content-viewport">
          {activeTab === 'dashboard' && (
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
          )}

          {activeTab === 'products' && (
            <ProductsView
              products={products}
              onOpenCreateProduct={() => setIsProductModalOpen(true)}
            />
          )}

          {activeTab === 'receipts' && (
            <ReceiptsView
              receipts={receipts}
              onOpenCreateReceipt={() => setIsReceiptModalOpen(true)}
              onValidateReceipt={handleValidateReceipt}
            />
          )}

          {activeTab === 'delivery-orders' && (
            <DeliveryOrdersView
              deliveries={deliveries}
              onOpenCreateDelivery={() => setIsDeliveryModalOpen(true)}
              onAdvanceStep={handleAdvanceDeliveryStep}
              onValidateDelivery={handleValidateDelivery}
            />
          )}

          {activeTab === 'inventory-adjustment' && (
            <InventoryAdjustmentView
              products={products}
              locations={locations}
              adjustments={adjustments}
              onApplyAdjustment={handleApplyAdjustment}
            />
          )}

          {activeTab === 'move-history' && (
            <MoveHistoryView moveHistory={moveHistory} />
          )}

          {activeTab === 'warehouse' && (
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
            <ProfileView onLogoutClick={() => setIsLogoutModalOpen(true)} />
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
        onStaffConfirmCompletion={handleStaffConfirmTransfer}
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
