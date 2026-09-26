import React, { useState, useCallback } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthView } from './components/AuthView';
import { DashboardView } from './components/DashboardView';
import { ProductsView } from './components/ProductsView';
import { ReceiptsView } from './components/ReceiptsView';
import { DeliveryOrdersView } from './components/DeliveryOrdersView';
import { InventoryAdjustmentView } from './components/InventoryAdjustmentView';
import { MoveHistoryView } from './components/MoveHistoryView';
import { WarehouseView } from './components/WarehouseView';
import { ProfileView } from './components/ProfileView';
import { StaffDashboardView } from './components/StaffDashboardView';
import { StaffOperationHistoryView } from './components/StaffOperationHistoryView';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/Toast';
import {
  INITIAL_PRODUCTS,
  INITIAL_RECEIPTS,
  INITIAL_DELIVERIES,
  INITIAL_TRANSFERS,
  INITIAL_ADJUSTMENTS,
  INITIAL_LOCATIONS,
  INITIAL_MOVE_HISTORY,
  INITIAL_STAFF_OPERATIONS,
} from './initialData';
import { Product, Receipt, DeliveryOrder, InternalTransfer, InventoryAdjustment, MoveHistoryItem, WarehouseLocation, FilterState, TabType, StaffOperationHistoryItem, UserRole } from './types';
import './styles.css';

const ProtectedApp: React.FC = () => {
  const { user, isLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data state
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [receipts] = useState<Receipt[]>(INITIAL_RECEIPTS);
  const [deliveries] = useState<DeliveryOrder[]>(INITIAL_DELIVERIES);
  const [transfers] = useState<InternalTransfer[]>(INITIAL_TRANSFERS);
  const [adjustments] = useState<InventoryAdjustment[]>(INITIAL_ADJUSTMENTS);
  const [locations] = useState<WarehouseLocation[]>(INITIAL_LOCATIONS);
  const [moveHistory] = useState<MoveHistoryItem[]>(INITIAL_MOVE_HISTORY);
  const [staffOperations] = useState<StaffOperationHistoryItem[]>(INITIAL_STAFF_OPERATIONS);
  const [filters, setFilters] = useState<FilterState>({
    documentType: 'all',
    status: 'all',
    location: 'all',
    category: 'all',
  });
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'info' | 'success' | 'danger' }>>([]);

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'danger' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({ documentType: 'all', status: 'all', location: 'all', category: 'all' });
  }, []);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthView
        mode="login"
        onNavigate={() => {}}
        onLoginSuccess={() => {}}
        onSignupSuccess={() => {}}
      />
    );
  }

  const isManager = user.role === 'ADMIN' || user.role === 'INVENTORY_MANAGER';

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            products={products}
            receipts={receipts}
            deliveries={deliveries}
            transfers={transfers}
            adjustments={adjustments}
            locations={locations}
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
          />
        );
      case 'products':
        return <ProductsView products={products} onOpenCreateProduct={() => showToast('Add product - connect to API', 'info')} />;
      case 'receipts':
        return <ReceiptsView receipts={receipts} onOpenCreateReceipt={() => showToast('Add receipt - connect to API', 'info')} onValidateReceipt={(id) => showToast(`Validate receipt ${id}`, 'info')} />;
      case 'delivery-orders':
        return <DeliveryOrdersView deliveries={deliveries} onOpenCreateDelivery={() => showToast('Add delivery - connect to API', 'info')} onAdvanceStep={(id, action) => showToast(`Advance ${id} (${action})`, 'info')} onValidateDelivery={(id) => showToast(`Validate delivery ${id}`, 'info')} />;
      case 'inventory-adjustment':
        return <InventoryAdjustmentView products={products} locations={locations} adjustments={adjustments} onApplyAdjustment={(productId, location, countedQty) => showToast(`Adjustment applied: ${productId} at ${location} = ${countedQty}`, 'info')} />;
      case 'move-history':
        return <MoveHistoryView moveHistory={moveHistory} />;
      case 'warehouse':
        return <WarehouseView locations={locations} products={products} transfers={transfers} onOpenTransferModal={(fromLocation) => showToast(`Open transfer modal from ${fromLocation || 'anywhere'}`, 'info')} onViewTransferStatus={(transfer) => showToast(`View transfer ${transfer.id}`, 'info')} />;
      case 'profile':
        return <ProfileView userRole={(user.role === 'ADMIN' ? 'manager' : user.role === 'INVENTORY_MANAGER' ? 'manager' : 'warehouse_staff') as UserRole} user={{ id: user.id || '', name: user.fullName || '', email: user.email || '', role: (user.role === 'ADMIN' ? 'manager' : user.role === 'INVENTORY_MANAGER' ? 'manager' : 'warehouse_staff') as UserRole }} onLogoutClick={logout} />;
      case 'staff-transfers':
        return isManager ? (
          <StaffDashboardView
            activeTab="staff-transfers"
            transfers={transfers}
            deliveries={deliveries}
            products={products}
            locations={locations}
            onAcceptTransfer={(id) => showToast(`Accept transfer ${id}`, 'info')}
            onConfirmTransferCompleted={(id) => showToast(`Confirm transfer ${id}`, 'info')}
            onAdvanceDeliveryStep={(id, action) => showToast(`Advance delivery ${id} (${action})`, 'info')}
            onValidateDelivery={(id) => showToast(`Validate delivery ${id}`, 'info')}
            onApplyAdjustment={(productId, location, countedQty) => showToast(`Adjustment: ${productId} at ${location} = ${countedQty}`, 'info')}
          />
        ) : (
          <div className="page-view active">
            <div className="page-heading-block">
              <h2 className="page-title">Access Denied</h2>
              <p className="page-subtitle">Manager role required</p>
            </div>
          </div>
        );
      case 'staff-delivery-picking':
        return isManager ? (
          <StaffDashboardView
            activeTab="staff-delivery-picking"
            transfers={transfers}
            deliveries={deliveries}
            products={products}
            locations={locations}
            onAcceptTransfer={(id) => showToast(`Accept transfer ${id}`, 'info')}
            onConfirmTransferCompleted={(id) => showToast(`Confirm transfer ${id}`, 'info')}
            onAdvanceDeliveryStep={(id, action) => showToast(`Advance delivery ${id} (${action})`, 'info')}
            onValidateDelivery={(id) => showToast(`Validate delivery ${id}`, 'info')}
            onApplyAdjustment={(productId, location, countedQty) => showToast(`Adjustment: ${productId} at ${location} = ${countedQty}`, 'info')}
          />
        ) : (
          <div className="page-view active">
            <div className="page-heading-block">
              <h2 className="page-title">Access Denied</h2>
              <p className="page-subtitle">Manager role required</p>
            </div>
          </div>
        );
      case 'staff-stock-counting':
        return isManager ? (
          <StaffDashboardView
            activeTab="staff-stock-counting"
            transfers={transfers}
            deliveries={deliveries}
            products={products}
            locations={locations}
            onAcceptTransfer={(id) => showToast(`Accept transfer ${id}`, 'info')}
            onConfirmTransferCompleted={(id) => showToast(`Confirm transfer ${id}`, 'info')}
            onAdvanceDeliveryStep={(id, action) => showToast(`Advance delivery ${id} (${action})`, 'info')}
            onValidateDelivery={(id) => showToast(`Validate delivery ${id}`, 'info')}
            onApplyAdjustment={(productId, location, countedQty) => showToast(`Adjustment: ${productId} at ${location} = ${countedQty}`, 'info')}
          />
        ) : (
          <div className="page-view active">
            <div className="page-heading-block">
              <h2 className="page-title">Access Denied</h2>
              <p className="page-subtitle">Manager role required</p>
            </div>
          </div>
        );
      case 'staff-history':
        return (
          <StaffOperationHistoryView operations={staffOperations} />
        );
      default:
        return <DashboardView products={products} receipts={receipts} deliveries={deliveries} transfers={transfers} adjustments={adjustments} locations={locations} filters={filters} onFilterChange={handleFilterChange} onResetFilters={handleResetFilters} />;
    }
  };

  return (
    <div className="app-layout">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onMenuClick={() => setSidebarOpen(true)}
        onLogout={logout}
      />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userRole={user.role}
      />
      <main className="main-content">
        {renderActiveView()}
      </main>
      <ToastContainer toasts={toasts} onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProtectedApp />
      </AuthProvider>
    </BrowserRouter>
  );
};

export { App };