import React from 'react';
import { WarehouseLocation, Product, InternalTransfer } from '../types';

interface WarehouseViewProps {
  locations: WarehouseLocation[];
  products: Product[];
  transfers: InternalTransfer[];
  onOpenTransferModal: (fromLocation?: string) => void;
  onViewTransferStatus: (transfer: InternalTransfer) => void;
}

export const WarehouseView: React.FC<WarehouseViewProps> = ({
  locations,
  products,
  transfers,
  onOpenTransferModal,
  onViewTransferStatus
}) => {
  return (
    <section className="page-view active">
      <div className="page-heading-block">
        <div>
          <h2 className="page-title">Warehouse</h2>
          <p className="page-subtitle">Facilities, storage bins, and stock distributed across locations</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onOpenTransferModal()}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="17 1 21 5 17 9"></polyline>
            <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
            <polyline points="7 23 3 19 7 15"></polyline>
            <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
          </svg>
          + Schedule Internal Transfer
        </button>
      </div>

      {/* Warehouse Cards */}
      <div className="warehouse-grid">
        {locations.map(loc => {
          const prodsInLoc = products.map(p => {
            const bal = (p.locationBalances && p.locationBalances[loc.name] !== undefined)
              ? p.locationBalances[loc.name]
              : (p.location === loc.name ? p.stock : 0);
            return {
              name: p.name,
              sku: p.sku,
              uom: p.uom,
              balance: bal
            };
          }).filter(item => item.balance > 0);

          return (
            <div key={loc.id} className="warehouse-card">
              <div>
                <div className="wh-card-header">
                  <div>
                    <h3 className="wh-card-name">{loc.name}</h3>
                    <span className="text-secondary" style={{ fontSize: 12 }}>{loc.type}</span>
                  </div>
                  <span className="wh-card-badge">Capacity: {loc.capacity}</span>
                </div>
                <div className="wh-stock-list">
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Current Stock Allocated:
                  </div>
                  {prodsInLoc.length === 0 ? (
                    <div className="text-secondary" style={{ fontSize: 12, padding: '12px 0', textAlign: 'center' }}>
                      No stock currently assigned.
                    </div>
                  ) : (
                    prodsInLoc.map((item, idx) => (
                      <div key={idx} className="wh-stock-item">
                        <span>
                          <strong>{item.name}</strong>{' '}
                          <span className="text-secondary" style={{ fontSize: 11 }}>({item.sku})</span>
                        </span>
                        <span className="wh-stock-qty">{item.balance} {item.uom}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-purple"
                  onClick={() => onOpenTransferModal(loc.name)}
                >
                  Transfer From Here
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scheduled Internal Transfers Table */}
      <div className="table-card">
        <div className="table-header-bar">
          <div>
            <h4 className="table-title">Scheduled Internal Transfers</h4>
            <p className="table-subtitle">Inter-facility and intra-warehouse goods movements</p>
          </div>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Transfer ID</th>
                <th>Product</th>
                <th>From Location</th>
                <th>To Location</th>
                <th>Quantity</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {transfers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state">No scheduled internal transfers.</td>
                </tr>
              ) : (
                transfers.map(t => {
                  return (
                    <tr key={t.id}>
                      <td><strong style={{ color: 'var(--primary-purple)' }}>{t.id}</strong></td>
                      <td><span className="font-medium">{t.productName}</span></td>
                      <td><span className="text-secondary">{t.fromLocation}</span></td>
                      <td><span className="font-medium">{t.toLocation}</span></td>
                      <td><span className="font-medium">{t.quantity} {t.uom}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-purple"
                          onClick={() => onViewTransferStatus(t)}
                        >
                          View Transfer Status
                        </button>
                      </td>
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
