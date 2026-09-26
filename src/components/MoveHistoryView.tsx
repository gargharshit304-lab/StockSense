import React from 'react';
import { MoveHistoryItem } from '../types';

interface MoveHistoryViewProps {
  moveHistory: MoveHistoryItem[];
}

export const MoveHistoryView: React.FC<MoveHistoryViewProps> = ({ moveHistory }) => {
  return (
    <section className="page-view active">
      <div className="page-heading-block">
        <div>
          <h2 className="page-title">Move History</h2>
          <p className="page-subtitle">Immutable Stock Ledger tracking all inventory transactions</p>
        </div>
      </div>

      <div className="table-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {moveHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-state">
                    <div>No inventory movements recorded in the ledger yet.</div>
                  </td>
                </tr>
              ) : (
                moveHistory.map(m => {
                  let qtyClass = 'qty-neutral';
                  if (m.quantity.startsWith('+')) qtyClass = 'qty-positive';
                  else if (m.quantity.startsWith('-')) qtyClass = 'qty-negative';

                  return (
                    <tr key={m.id}>
                      <td><span className="font-medium">{m.product}</span></td>
                      <td>
                        <span className="badge badge-ready" style={{ textTransform: 'capitalize' }}>
                          {m.type}
                        </span>
                      </td>
                      <td><span className="text-secondary">{m.from}</span></td>
                      <td><span className="font-medium">{m.to}</span></td>
                      <td><span className={qtyClass} style={{ fontSize: 13.5 }}>{m.quantity}</span></td>
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
