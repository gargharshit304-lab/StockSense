import React from 'react';
import { DeliveryOrder } from '../types';

interface DeliveryOrdersViewProps {
  deliveries: DeliveryOrder[];
  onOpenCreateDelivery: () => void;
  onAdvanceStep: (id: string, action: 'pick' | 'pack') => void;
  onValidateDelivery: (id: string) => void;
}

export const DeliveryOrdersView: React.FC<DeliveryOrdersViewProps> = ({
  deliveries,
  onOpenCreateDelivery,
  onAdvanceStep,
  onValidateDelivery
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
          <h2 className="page-title">Delivery Orders</h2>
          <p className="page-subtitle">Outbound customer dispatches with Pick → Pack → Validate workflow</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onOpenCreateDelivery}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          + New Delivery
        </button>
      </div>

      <div className="table-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Status &amp; Flow</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-state">
                    <div>No delivery orders recorded yet.</div>
                  </td>
                </tr>
              ) : (
                deliveries.map(d => {
                  const isDone = d.status === 'Done';
                  const currentStep = d.step || 'pick';

                  let pickClass = 'delivery-step';
                  let packClass = 'delivery-step';
                  let valClass = 'delivery-step';

                  if (isDone) {
                    pickClass += ' completed';
                    packClass += ' completed';
                    valClass += ' completed';
                  } else if (currentStep === 'pack') {
                    pickClass += ' completed';
                    packClass += ' active';
                  } else if (currentStep === 'validate') {
                    pickClass += ' completed';
                    packClass += ' completed';
                    valClass += ' active';
                  } else {
                    pickClass += ' active';
                  }

                  let actionBtn = null;
                  if (!isDone) {
                    if (currentStep === 'pick') {
                      actionBtn = (
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          onClick={() => onAdvanceStep(d.id, 'pick')}
                        >
                          Confirm Pick
                        </button>
                      );
                    } else if (currentStep === 'pack') {
                      actionBtn = (
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          onClick={() => onAdvanceStep(d.id, 'pack')}
                        >
                          Confirm Pack
                        </button>
                      );
                    } else {
                      actionBtn = (
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={() => onValidateDelivery(d.id)}
                        >
                          Validate Delivery
                        </button>
                      );
                    }
                  } else {
                    actionBtn = <span className="text-secondary" style={{ fontSize: 12 }}>Dispatched</span>;
                  }

                  return (
                    <tr key={d.id}>
                      <td><strong style={{ color: 'var(--primary-purple)' }}>{d.id}</strong></td>
                      <td><span className="font-medium">{d.productName}</span></td>
                      <td><span className="font-medium">{d.quantity} {d.uom}</span></td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <div>{getStatusBadge(d.status)}</div>
                          <div className="delivery-steps">
                            <span className={pickClass}>1. Pick</span>
                            <span className="step-divider">→</span>
                            <span className={packClass}>2. Pack</span>
                            <span className="step-divider">→</span>
                            <span className={valClass}>3. Validate</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>{actionBtn}</td>
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
