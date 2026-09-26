import React, { useState, useMemo } from 'react';
import { StaffOperationHistoryItem, StaffOperationType } from '../types';

interface StaffOperationHistoryViewProps {
  operations: StaffOperationHistoryItem[];
}

export const StaffOperationHistoryView: React.FC<StaffOperationHistoryViewProps> = ({ operations }) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOp, setSelectedOp] = useState<StaffOperationHistoryItem | null>(null);

  // Filter operations
  const filteredOperations = useMemo(() => {
    return operations.filter(op => {
      if (selectedType !== 'all' && op.operationType !== selectedType) {
        return false;
      }
      if (selectedStatus !== 'all' && op.status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [operations, selectedType, selectedStatus]);

  const handleResetFilters = () => {
    setSelectedType('all');
    setSelectedStatus('all');
  };

  const getOpBadgeClass = (type: StaffOperationType) => {
    switch (type) {
      case 'Internal Transfer':
        return 'badge-ready';
      case 'Delivery / Picking':
        return 'badge-done';
      case 'Stock Counting':
        return 'badge-waiting';
      default:
        return 'badge-draft';
    }
  };

  return (
    <section className="page-view active">
      {/* Page Heading */}
      <div className="page-heading-block">
        <div>
          <h2 className="page-title">Operation History</h2>
          <p className="page-subtitle">Track your completed warehouse operations.</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-card">
        <div className="filters-header">
          <div className="filters-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            Filter Operations
          </div>
          {(selectedType !== 'all' || selectedStatus !== 'all') && (
            <button type="button" className="filters-reset-btn" onClick={handleResetFilters}>
              Reset Filters
            </button>
          )}
        </div>

        <div className="filters-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {/* Operation Type Filter */}
          <div className="filter-item">
            <label className="filter-label" htmlFor="filter-op-type">Operation Type</label>
            <select
              id="filter-op-type"
              className="form-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="Internal Transfer">Internal Transfer</option>
              <option value="Delivery / Picking">Delivery / Picking</option>
              <option value="Stock Counting">Stock Counting</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="filter-item">
            <label className="filter-label" htmlFor="filter-op-status">Status</label>
            <select
              id="filter-op-status"
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Operations Table */}
      <div className="table-card">
        <div className="table-header-bar">
          <div>
            <h3 className="table-title">Completed Warehouse Operations</h3>
            <p className="table-subtitle">
              Showing {filteredOperations.length} of {operations.length} total operations recorded by you
            </p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Operation ID</th>
                <th>Operation Type</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>From</th>
                <th>To</th>
                <th>Completed At</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOperations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="empty-state">
                    <div>No operations match the selected criteria.</div>
                  </td>
                </tr>
              ) : (
                filteredOperations.map(op => {
                  return (
                    <tr
                      key={op.id}
                      style={{ cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                      onClick={() => setSelectedOp(op)}
                      title="Click to view operation details"
                    >
                      <td>
                        <span className="staff-op-id">
                          {op.operationId}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getOpBadgeClass(op.operationType)}`}>
                          {op.operationType}
                        </span>
                      </td>
                      <td>
                        <span className="font-medium">{op.product}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>
                          {op.quantity}
                        </span>
                      </td>
                      <td>
                        <span className="text-secondary">{op.sourceLocation}</span>
                      </td>
                      <td>
                        <span className="text-secondary">{op.destinationLocation}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                          {op.completedAt}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-done" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <span>✓</span> Completed
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOp(op);
                          }}
                        >
                          View Details
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

      {/* Operation Detail Modal */}
      {selectedOp && (
        <div className="modal-backdrop active" onClick={() => setSelectedOp(null)}>
          <div className="modal-window" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Operation Details</h3>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
                  <span style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 600, color: 'var(--text-dark)' }}>{selectedOp.operationId}</span> • {selectedOp.operationType}
                </span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedOp(null)}
                aria-label="Close modal"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="transfer-status-details">
                {/* Specific Layout based on Operation Type */}
                {selectedOp.operationType === 'Internal Transfer' && (
                  <>
                    <div className="transfer-detail-item">
                      <span className="transfer-detail-label">Operation ID</span>
                      <span className="transfer-detail-val" style={{ fontFamily: 'ui-monospace, monospace' }}>
                        {selectedOp.operationId}
                      </span>
                    </div>

                    <div className="transfer-detail-item">
                      <span className="transfer-detail-label">Transfer ID</span>
                      <span className="transfer-detail-val" style={{ fontFamily: 'ui-monospace, monospace' }}>
                        {selectedOp.referenceId || selectedOp.operationId}
                      </span>
                    </div>

                    <div className="transfer-detail-item">
                      <span className="transfer-detail-label">Product</span>
                      <span className="transfer-detail-val">{selectedOp.product}</span>
                    </div>

                    <div className="transfer-detail-item">
                      <span className="transfer-detail-label">Quantity</span>
                      <span className="transfer-detail-val">
                        {selectedOp.quantity}
                      </span>
                    </div>

                    <div className="transfer-detail-item">
                      <span className="transfer-detail-label">From Location</span>
                      <span className="transfer-detail-val">{selectedOp.sourceLocation}</span>
                    </div>

                    <div className="transfer-detail-item">
                      <span className="transfer-detail-label">To Location</span>
                      <span className="transfer-detail-val">{selectedOp.destinationLocation}</span>
                    </div>

                    {selectedOp.acceptedAt && (
                      <div className="transfer-detail-item">
                        <span className="transfer-detail-label">Accepted At</span>
                        <span className="transfer-detail-val">{selectedOp.acceptedAt}</span>
                      </div>
                    )}

                    <div className="transfer-detail-item">
                      <span className="transfer-detail-label">Completed At</span>
                      <span className="transfer-detail-val">{selectedOp.completedAt}</span>
                    </div>
                  </>
                )}

                {selectedOp.operationType === 'Delivery / Picking' && (
                  <>
                    <div className="transfer-detail-item">
                      <span className="transfer-detail-label">Operation ID</span>
                      <span className="transfer-detail-val" style={{ fontFamily: 'ui-monospace, monospace' }}>
                        {selectedOp.operationId}
                      </span>
                    </div>

                    <div className="transfer-detail-item">
                      <span className="transfer-detail-label">Operation</span>
                      <span className="transfer-detail-val">Delivery / Picking</span>
                    </div>

                    <div className="transfer-detail-item">
                      <span className="transfer-detail-label">Product</span>
                      <span className="transfer-detail-val">{selectedOp.product}</span>
                    </div>

                    <div className="transfer-detail-item">
                      <span className="transfer-detail-label">Quantity</span>
                      <span className="transfer-detail-val">
                        {selectedOp.quantity}
                      </span>
                    </div>

                    <div className="transfer-detail-item">
                      <span className="transfer-detail-label">From Location</span>
                      <span className="transfer-detail-val">{selectedOp.sourceLocation}</span>
                    </div>

                    <div className="transfer-detail-item">
                      <span className="transfer-detail-label">Destination</span>
                      <span className="transfer-detail-val">{selectedOp.destinationLocation}</span>
                    </div>

                    <div className="transfer-detail-item">
                      <span className="transfer-detail-label">Completed At</span>
                      <span className="transfer-detail-val">{selectedOp.completedAt}</span>
                    </div>

                    <div className="transfer-detail-item">
                      <span className="transfer-detail-label">Executed By</span>
                      <span className="transfer-detail-val">{selectedOp.performedBy}</span>
                    </div>
                  </>
                )}

                {selectedOp.operationType === 'Stock Counting' && (
                  <>
                    <div className="transfer-detail-item">
                      <span className="transfer-detail-label">Operation ID</span>
                      <span className="transfer-detail-val" style={{ fontFamily: 'ui-monospace, monospace' }}>
                        {selectedOp.operationId}
                      </span>
                    </div>

                    <div className="transfer-detail-item">
                      <span className="transfer-detail-label">Operation</span>
                      <span className="transfer-detail-val">Stock Counting</span>
                    </div>

                    <div className="transfer-detail-item">
                      <span className="transfer-detail-label">Product</span>
                      <span className="transfer-detail-val">{selectedOp.product}</span>
                    </div>

                    <div className="transfer-detail-item">
                      <span className="transfer-detail-label">Location</span>
                      <span className="transfer-detail-val">{selectedOp.sourceLocation}</span>
                    </div>

                    <div className="transfer-detail-item">
                      <span className="transfer-detail-label">Recorded Stock</span>
                      <span className="transfer-detail-val">{selectedOp.recordedStock || '—'}</span>
                    </div>

                    <div className="transfer-detail-item">
                      <span className="transfer-detail-label">Physical Count</span>
                      <span className="transfer-detail-val">{selectedOp.physicalCount || '—'}</span>
                    </div>

                    <div className="transfer-detail-item">
                      <span className="transfer-detail-label">Adjustment</span>
                      <span
                        className="transfer-detail-val"
                        style={{
                          color: selectedOp.adjustmentQty?.startsWith('-')
                            ? 'var(--status-danger-text)'
                            : 'var(--status-success-text)'
                        }}
                      >
                        {selectedOp.adjustmentQty || selectedOp.quantity}
                      </span>
                    </div>

                    <div className="transfer-detail-item">
                      <span className="transfer-detail-label">Completed At</span>
                      <span className="transfer-detail-val">{selectedOp.completedAt}</span>
                    </div>
                  </>
                )}

                {/* Common Status and Performed By */}
                <div className="transfer-detail-item">
                  <span className="transfer-detail-label">Status</span>
                  <div>
                    <span className="badge badge-done" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <span>✓</span> Completed
                    </span>
                  </div>
                </div>

                <div className="transfer-detail-item">
                  <span className="transfer-detail-label">Completed By</span>
                  <span className="transfer-detail-val">{selectedOp.performedBy}</span>
                </div>
              </div>

              <div className="transfer-explanation-card">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--primary-purple)', flexShrink: 0 }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <div className="transfer-explanation-text">
                  This operation was verified and committed to the warehouse inventory ledger by <strong>{selectedOp.performedBy}</strong>.
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setSelectedOp(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
