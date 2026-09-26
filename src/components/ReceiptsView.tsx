import React from 'react';
import { Receipt } from '../types';

interface ReceiptsViewProps {
  receipts: Receipt[];
  onOpenCreateReceipt: () => void;
  onValidateReceipt: (id: string) => void;
}

export const ReceiptsView: React.FC<ReceiptsViewProps> = ({
  receipts,
  onOpenCreateReceipt,
  onValidateReceipt
}) => {
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
          <h2 className="page-title">Receipts</h2>
          <p className="page-subtitle">Inbound incoming stock receipts from suppliers</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onOpenCreateReceipt}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          + New Receipt
        </button>
      </div>

      <div className="table-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Receipt</th>
                <th>Supplier</th>
                <th>Products</th>
                <th>Quantity</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {receipts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state">
                    <div>No receipts recorded yet. Click "+ New Receipt" to create one.</div>
                  </td>
                </tr>
              ) : (
                receipts.map(r => {
                  const canValidate = r.status !== 'Done' && r.status !== 'Canceled';
                  return (
                    <tr key={r.id}>
                      <td><strong style={{ color: 'var(--primary-purple)' }}>{r.id}</strong></td>
                      <td><span className="font-medium">{r.supplier}</span></td>
                      <td>{r.productName}</td>
                      <td><span className="font-medium">{r.quantity} {r.uom}</span></td>
                      <td>{getStatusBadge(r.status)}</td>
                      <td style={{ textAlign: 'right' }}>
                        {canValidate ? (
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={() => onValidateReceipt(r.id)}
                          >
                            Validate Receipt
                          </button>
                        ) : (
                          <span className="text-secondary" style={{ fontSize: 12 }}>Validated</span>
                        )}
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
