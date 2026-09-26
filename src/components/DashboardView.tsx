import React from 'react';
import { 
  Product, 
  Receipt, 
  DeliveryOrder, 
  InternalTransfer, 
  InventoryAdjustment, 
  FilterState, 
  WarehouseLocation,
  DocumentTypeFilter,
  StatusFilter
} from '../types';

interface DashboardViewProps {
  products: Product[];
  receipts: Receipt[];
  deliveries: DeliveryOrder[];
  transfers: InternalTransfer[];
  adjustments: InventoryAdjustment[];
  locations: WarehouseLocation[];
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onResetFilters: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  receipts,
  deliveries,
  transfers,
  adjustments,
  locations,
  filters,
  onFilterChange,
  onResetFilters
}) => {
  // 1. Total Products in Stock
  const totalProductsCount = products.filter(p => p.stock > 0).length;

  // 2. Low Stock / Out of Stock Items
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  // 3. Pending Receipts
  const pendingReceiptsCount = receipts.filter(r => r.status === 'Draft' || r.status === 'Waiting' || r.status === 'Ready').length;

  // 4. Pending Deliveries
  const pendingDeliveriesCount = deliveries.filter(d => d.status === 'Draft' || d.status === 'Waiting' || d.status === 'Ready').length;

  // 5. Internal Transfers Scheduled
  const scheduledTransfersCount = transfers.filter(t => t.status === 'Waiting' || t.status === 'Ready').length;

  // Distinct Categories
  const categories = Array.from(new Set(products.map(p => p.category)));

  // Build unified operations list
  interface OperationItem {
    id: string;
    docType: 'Receipt' | 'Delivery' | 'Internal' | 'Adjustment';
    productName: string;
    change: string;
    route: string;
    status: string;
    warehouse: string;
    category: string;
  }

  const getProductCategory = (name: string): string => {
    const prod = products.find(p => p.name.toLowerCase() === name.toLowerCase());
    return prod ? prod.category : 'General';
  };

  const ops: OperationItem[] = [
    ...receipts.map(r => ({
      id: r.id,
      docType: 'Receipt' as const,
      productName: r.productName,
      change: `+${r.quantity} ${r.uom}`,
      route: `Vendor (${r.supplier}) → ${r.destinationLocation}`,
      status: r.status,
      warehouse: r.destinationLocation,
      category: getProductCategory(r.productName)
    })),
    ...deliveries.map(d => ({
      id: d.id,
      docType: 'Delivery' as const,
      productName: d.productName,
      change: `-${d.quantity} ${d.uom}`,
      route: `${d.fromLocation} → Customer (${d.customer || 'Client'})`,
      status: d.status,
      warehouse: d.fromLocation,
      category: getProductCategory(d.productName)
    })),
    ...transfers.map(t => ({
      id: t.id,
      docType: 'Internal' as const,
      productName: t.productName,
      change: `${t.quantity} ${t.uom}`,
      route: `${t.fromLocation} → ${t.toLocation}`,
      status: t.status,
      warehouse: t.fromLocation,
      category: getProductCategory(t.productName)
    })),
    ...adjustments.map(a => {
      const sign = a.adjustmentQty > 0 ? `+${a.adjustmentQty}` : `${a.adjustmentQty}`;
      return {
        id: a.id,
        docType: 'Adjustment' as const,
        productName: a.productName,
        change: `${sign} ${a.uom}`,
        route: `Physical Count: ${a.physicalCount} ${a.uom} (${a.location})`,
        status: 'Done',
        warehouse: a.location,
        category: getProductCategory(a.productName)
      };
    })
  ];

  // Apply Dynamic Filters
  const filteredOps = ops.filter(item => {
    if (filters.documentType !== 'all') {
      if (filters.documentType === 'Receipts' && item.docType !== 'Receipt') return false;
      if (filters.documentType === 'Delivery' && item.docType !== 'Delivery') return false;
      if (filters.documentType === 'Internal' && item.docType !== 'Internal') return false;
      if (filters.documentType === 'Adjustments' && item.docType !== 'Adjustment') return false;
    }
    if (filters.status !== 'all' && item.status.toLowerCase() !== filters.status.toLowerCase()) {
      return false;
    }
    if (filters.location !== 'all' && item.warehouse !== filters.location) {
      return false;
    }
    if (filters.category !== 'all' && item.category !== filters.category) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'done') return <span className="badge badge-done">Done</span>;
    if (s === 'ready') return <span className="badge badge-ready">Ready</span>;
    if (s === 'waiting') return <span className="badge badge-waiting">Waiting</span>;
    if (s === 'draft') return <span className="badge badge-draft">Draft</span>;
    if (s === 'canceled') return <span className="badge badge-canceled">Canceled</span>;
    return <span className="badge badge-draft">{status}</span>;
  };

  return (
    <section className="page-view active">
      <div className="page-heading-block">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">Inventory operations overview</p>
        </div>
      </div>

      {/* EXACTLY FIVE REQUIRED KPI CARDS */}
      <div className="kpi-grid">
        {/* 1. Total Products in Stock */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Total Products in Stock</span>
            <div className="kpi-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
          </div>
          <div className="kpi-value">{totalProductsCount}</div>
        </div>

        {/* 2. Low Stock / Out of Stock Items */}
        <div className="kpi-card warning">
          <div className="kpi-header">
            <span className="kpi-label">Low Stock / Out of Stock Items</span>
            <div className="kpi-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
          </div>
          <div className="kpi-value">{lowStockCount}</div>
        </div>

        {/* 3. Pending Receipts */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Pending Receipts</span>
            <div className="kpi-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
            </div>
          </div>
          <div className="kpi-value">{pendingReceiptsCount}</div>
        </div>

        {/* 4. Pending Deliveries */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Pending Deliveries</span>
            <div className="kpi-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </div>
          </div>
          <div className="kpi-value">{pendingDeliveriesCount}</div>
        </div>

        {/* 5. Internal Transfers Scheduled */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Internal Transfers Scheduled</span>
            <div className="kpi-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="17 1 21 5 17 9"></polyline>
                <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                <polyline points="7 23 3 19 7 15"></polyline>
                <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
              </svg>
            </div>
          </div>
          <div className="kpi-value">{scheduledTransfersCount}</div>
        </div>
      </div>

      {/* Dynamic Filters Section */}
      <div className="filters-card">
        <div className="filters-header">
          <div className="filters-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            Dynamic Filters
          </div>
          <button type="button" className="filters-reset-btn" onClick={onResetFilters}>
            Reset Filters
          </button>
        </div>
        <div className="filters-grid">
          {/* Document Type */}
          <div className="filter-item">
            <label className="filter-label" htmlFor="filter-doc-type">Document Type</label>
            <select
              id="filter-doc-type"
              className="form-select"
              value={filters.documentType}
              onChange={(e) => onFilterChange({ documentType: e.target.value as DocumentTypeFilter })}
            >
              <option value="all">All Document Types</option>
              <option value="Receipts">Receipts</option>
              <option value="Delivery">Delivery</option>
              <option value="Internal">Internal</option>
              <option value="Adjustments">Adjustments</option>
            </select>
          </div>

          {/* Status */}
          <div className="filter-item">
            <label className="filter-label" htmlFor="filter-status">Status</label>
            <select
              id="filter-status"
              className="form-select"
              value={filters.status}
              onChange={(e) => onFilterChange({ status: e.target.value as StatusFilter })}
            >
              <option value="all">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Waiting">Waiting</option>
              <option value="Ready">Ready</option>
              <option value="Done">Done</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>

          {/* Warehouse / Location */}
          <div className="filter-item">
            <label className="filter-label" htmlFor="filter-location">Warehouse / Location</label>
            <select
              id="filter-location"
              className="form-select"
              value={filters.location}
              onChange={(e) => onFilterChange({ location: e.target.value })}
            >
              <option value="all">All Locations</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.name}>{loc.name}</option>
              ))}
            </select>
          </div>

          {/* Product Category */}
          <div className="filter-item">
            <label className="filter-label" htmlFor="filter-category">Product Category</label>
            <select
              id="filter-category"
              className="form-select"
              value={filters.category}
              onChange={(e) => onFilterChange({ category: e.target.value })}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Dashboard Operations Table */}
      <div className="table-card">
        <div className="table-header-bar">
          <div>
            <h3 className="table-title">Dashboard Operations</h3>
            <p className="table-subtitle">Live stream of inventory movements and document workflows</p>
          </div>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Document Type</th>
                <th>Product</th>
                <th>Quantity / Movement</th>
                <th>Location / Route</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOps.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-state">
                    <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                    <div>No inventory operations match the selected filters.</div>
                  </td>
                </tr>
              ) : (
                filteredOps.map((item, idx) => {
                  let qtyClass = 'qty-neutral';
                  if (item.change.startsWith('+')) qtyClass = 'qty-positive';
                  else if (item.change.startsWith('-')) qtyClass = 'qty-negative';

                  return (
                    <tr key={`${item.id}-${idx}`}>
                      <td>
                        <span className="font-medium">{item.docType}</span>
                      </td>
                      <td>
                        <span className="font-medium">{item.productName}</span>
                      </td>
                      <td>
                        <span className={qtyClass}>{item.change}</span>
                      </td>
                      <td className="text-secondary">{item.route}</td>
                      <td>{getStatusBadge(item.status)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
