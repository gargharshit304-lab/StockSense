import React, { useState } from 'react';
import { 
  InternalTransfer, 
  DeliveryOrder, 
  Product, 
  WarehouseLocation,
  TabType
} from '../types';

interface StaffDashboardViewProps {
  activeTab?: TabType;
  transfers: InternalTransfer[];
  deliveries: DeliveryOrder[];
  products: Product[];
  locations: WarehouseLocation[];
  onAcceptTransfer: (transferId: string) => void;
  onConfirmTransferCompleted: (transferId: string) => void;
  onAdvanceDeliveryStep: (deliveryId: string, action: 'pick' | 'pack') => void;
  onValidateDelivery: (deliveryId: string) => void;
  onApplyAdjustment: (productId: string, location: string, countedQty: number) => void;
}

export const StaffDashboardView: React.FC<StaffDashboardViewProps> = ({
  activeTab = 'dashboard',
  transfers,
  deliveries,
  products,
  locations,
  onAcceptTransfer,
  onConfirmTransferCompleted,
  onAdvanceDeliveryStep,
  onValidateDelivery,
  onApplyAdjustment
}) => {
  // Counting State
  const [isCountingActive, setIsCountingActive] = useState(false);
  const [countingProductId, setCountingProductId] = useState<string>('prod-1'); // Steel Rods
  const [countingLocation, setCountingLocation] = useState<string>('Production Rack');
  const [physicalCountInput, setPhysicalCountInput] = useState<number | string>(27);

  const selectedCountProd = products.find(p => p.id === countingProductId) || products[0];

  let recordedStock = 0;
  if (selectedCountProd) {
    if (
      countingLocation &&
      selectedCountProd.locationBalances &&
      selectedCountProd.locationBalances[countingLocation] !== undefined
    ) {
      recordedStock = selectedCountProd.locationBalances[countingLocation];
    } else {
      recordedStock = selectedCountProd.stock;
    }
  }

  const numericPhysicalCount = physicalCountInput !== '' ? Number(physicalCountInput) : recordedStock;
  const countDiff = numericPhysicalCount - recordedStock;
  const countDiffSign = countDiff > 0 ? `+${countDiff}` : `${countDiff}`;
  const countDiffColor = countDiff < 0 ? 'var(--status-danger-text)' : countDiff > 0 ? 'var(--status-success-text)' : 'var(--text-dark)';

  const handleConfirmCount = () => {
    if (!selectedCountProd || physicalCountInput === '') return;
    onApplyAdjustment(selectedCountProd.id, countingLocation, Number(physicalCountInput));
    setIsCountingActive(false);
  };

  const isAll = activeTab === 'dashboard';
  const showTransfers = isAll || activeTab === 'staff-transfers';
  const showDelivery = isAll || activeTab === 'staff-delivery-picking';
  const showCounting = isAll || activeTab === 'staff-stock-counting';

  let pageTitle = 'Dashboard';
  let pageSubtitle = 'Warehouse operations';
  if (activeTab === 'staff-transfers') {
    pageTitle = 'Internal Transfers';
    pageSubtitle = 'Warehouse staff transfer execution and confirmation';
  } else if (activeTab === 'staff-delivery-picking') {
    pageTitle = 'Delivery / Picking';
    pageSubtitle = 'Pick, pack, and validate customer dispatch orders';
  } else if (activeTab === 'staff-stock-counting') {
    pageTitle = 'Stock Counting';
    pageSubtitle = 'Physical stock counting and reconciliation';
  }

  return (
    <section className="page-view active">
      <div className="page-heading-block">
        <div>
          <h2 className="page-title">{pageTitle}</h2>
          <p className="page-subtitle">{pageSubtitle}</p>
        </div>
      </div>

      {/* Staff Overview Banner (shown on Dashboard overview) */}
      {isAll && (
        <div className="staff-overview-banner">
          <div className="staff-overview-info">
            <span className="staff-role-badge">Warehouse Staff Mode</span>
            <div className="staff-overview-text">
              Operational workspace for <strong>transfer execution, pick &amp; pack dispatches</strong>, and <strong>stock counting</strong>.
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Active Facility: <strong>Main Warehouse / Production Rack</strong>
          </div>
        </div>
      )}

      <div className="staff-sections-stack">
        
        {/* ================================================================
             1. INTERNAL TRANSFERS WORKFLOW (Primary Staff Workflow)
             ================================================================ */}
        {showTransfers && (
          <div className="staff-section-card">
          <div className="staff-section-header">
            <div className="staff-section-title-wrap">
              <div className="staff-section-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polyline points="17 1 21 5 17 9"></polyline>
                  <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                  <polyline points="7 23 3 19 7 15"></polyline>
                  <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                </svg>
              </div>
              <h3 className="staff-section-title">Internal Transfers</h3>
            </div>
            <span className="staff-section-badge">
              {transfers.filter(t => t.status !== 'Done').length} Pending Action
            </span>
          </div>

          <div className="staff-op-grid">
            {transfers.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: '24px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No internal transfers scheduled.
              </div>
            ) : (
              transfers.map(t => {
                const isCompleted = t.status === 'Done' || t.workflowStep === 'completed';
                const isInProgress = t.workflowStep === 'in_progress';
                const isWaitingStaff = !isCompleted && !isInProgress;

                return (
                  <div 
                    key={t.id} 
                    className={`staff-op-item-card ${isInProgress ? 'in-progress' : ''}`}
                  >
                    <div>
                      <div className="staff-op-item-top">
                        <div>
                          <span className="staff-op-id">{t.id}</span>
                          <h4 className="staff-op-product-title">{t.productName}</h4>
                        </div>
                        <span className="staff-op-qty-tag">{t.quantity} {t.uom}</span>
                      </div>

                      {/* Route Box */}
                      <div className="staff-route-box" style={{ marginTop: 12 }}>
                        <div className="staff-route-point">
                          <span className="staff-route-label">From</span>
                          <span className="staff-route-val">{t.fromLocation}</span>
                        </div>
                        <span className="staff-route-arrow">→</span>
                        <div className="staff-route-point" style={{ textAlign: 'right' }}>
                          <span className="staff-route-label">To</span>
                          <span className="staff-route-val">{t.toLocation}</span>
                        </div>
                      </div>
                    </div>

                    <div className="staff-op-footer">
                      <div>
                        {isCompleted && (
                          <span className="badge badge-done">✓ Transfer Completed</span>
                        )}
                        {isInProgress && (
                          <span className="badge badge-ready">In Progress</span>
                        )}
                        {isWaitingStaff && (
                          <span className="badge badge-waiting">Waiting for Warehouse Staff</span>
                        )}
                      </div>

                      <div>
                        {isWaitingStaff && (
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={() => onAcceptTransfer(t.id)}
                          >
                            Accept Transfer
                          </button>
                        )}
                        {isInProgress && (
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            style={{ backgroundColor: 'var(--status-success-text)', borderColor: 'var(--status-success-text)' }}
                            onClick={() => onConfirmTransferCompleted(t.id)}
                          >
                            Confirm Transfer Completed
                          </button>
                        )}
                        {isCompleted && (
                          <span style={{ fontSize: 12, color: 'var(--status-success-text)', fontWeight: 600 }}>
                            Done
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        )}

        {/* ================================================================
             2. DELIVERY / PICKING OPERATIONS
             ================================================================ */}
        {showDelivery && (
          <div className="staff-section-card">
          <div className="staff-section-header">
            <div className="staff-section-title-wrap">
              <div className="staff-section-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
              </div>
              <h3 className="staff-section-title">Delivery / Picking Operations</h3>
            </div>
            <span className="staff-section-badge">
              {deliveries.filter(d => d.status !== 'Done').length} Orders Pending Pick/Pack
            </span>
          </div>

          <div className="staff-op-grid">
            {deliveries.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: '24px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No delivery orders pending warehouse operations.
              </div>
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

                return (
                  <div key={d.id} className="staff-op-item-card">
                    <div>
                      <div className="staff-op-item-top">
                        <div>
                          <span className="staff-op-id">{d.id}</span>
                          <h4 className="staff-op-product-title">{d.productName}</h4>
                        </div>
                        <span className="staff-op-qty-tag">{d.quantity} {d.uom}</span>
                      </div>

                      {/* Operation Flow Steps */}
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                          Operation Flow:
                        </div>
                        <div className="delivery-steps">
                          <span className={pickClass}>1. Pick</span>
                          <span className="step-divider">→</span>
                          <span className={packClass}>2. Pack</span>
                          <span className="step-divider">→</span>
                          <span className={valClass}>3. Validate</span>
                        </div>
                      </div>
                    </div>

                    <div className="staff-op-footer">
                      <div>
                        {isDone ? (
                          <span className="badge badge-done">Done</span>
                        ) : (
                          <span className="badge badge-ready">Ready</span>
                        )}
                      </div>

                      <div>
                        {!isDone ? (
                          currentStep === 'pick' ? (
                            <button
                              type="button"
                              className="btn btn-sm btn-secondary"
                              onClick={() => onAdvanceDeliveryStep(d.id, 'pick')}
                            >
                              Confirm Pick
                            </button>
                          ) : currentStep === 'pack' ? (
                            <button
                              type="button"
                              className="btn btn-sm btn-secondary"
                              onClick={() => onAdvanceDeliveryStep(d.id, 'pack')}
                            >
                              Confirm Pack
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              onClick={() => onValidateDelivery(d.id)}
                            >
                              Validate &amp; Dispatch
                            </button>
                          )
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--status-success-text)', fontWeight: 600 }}>
                            Dispatched
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        )}

        {/* ================================================================
             3. COUNTING / INVENTORY ADJUSTMENT
             ================================================================ */}
        {showCounting && (
          <div className="staff-section-card">
          <div className="staff-section-header">
            <div className="staff-section-title-wrap">
              <div className="staff-section-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </div>
              <h3 className="staff-section-title">Counting / Inventory Adjustment</h3>
            </div>
            <span className="staff-section-badge">Physical Stock Verification</span>
          </div>

          <div className="counting-card">
            <div className="counting-header-info">
              <div className="counting-metric" style={{ flex: 1 }}>
                <span className="counting-metric-label">Target Product</span>
                {isCountingActive ? (
                  <select
                    className="form-select"
                    style={{ fontSize: 13, padding: '4px 8px', marginTop: 4 }}
                    value={countingProductId}
                    onChange={(e) => setCountingProductId(e.target.value)}
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                ) : (
                  <span className="counting-metric-val">{selectedCountProd.name}</span>
                )}
              </div>
              <div className="counting-metric" style={{ flex: 1 }}>
                <span className="counting-metric-label">Location / Bin</span>
                {isCountingActive ? (
                  <select
                    className="form-select"
                    style={{ fontSize: 13, padding: '4px 8px', marginTop: 4 }}
                    value={countingLocation}
                    onChange={(e) => setCountingLocation(e.target.value)}
                  >
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.name}>{loc.name}</option>
                    ))}
                  </select>
                ) : (
                  <span className="counting-metric-val">{countingLocation}</span>
                )}
              </div>
              <div className="counting-metric">
                <span className="counting-metric-label">Recorded Stock</span>
                <span className="counting-metric-val" style={{ color: 'var(--primary-purple)' }}>
                  {recordedStock} {selectedCountProd.uom}
                </span>
              </div>
              <div>
                {!isCountingActive ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setIsCountingActive(true)}
                  >
                    Start Counting
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setIsCountingActive(false)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Active Counting Input Workspace */}
            {isCountingActive && (
              <div className="counting-input-row">
                <div style={{ flex: 1 }}>
                  <label className="form-label" htmlFor="staff-physical-count">
                    Physical Count (Counted on Shelf)
                  </label>
                  <input
                    id="staff-physical-count"
                    type="number"
                    className="form-input"
                    placeholder="Enter physical count..."
                    value={physicalCountInput}
                    onChange={(e) => setPhysicalCountInput(e.target.value)}
                  />
                </div>

                <div className="counting-diff-badge" style={{ minWidth: 140 }}>
                  <span className="counting-diff-label">Adjustment</span>
                  <span className="counting-diff-val" style={{ color: countDiffColor }}>
                    {countDiffSign} {selectedCountProd.uom}
                  </span>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleConfirmCount}
                >
                  Confirm Count
                </button>
              </div>
            )}
          </div>
        </div>
        )}

      </div>
    </section>
  );
};
