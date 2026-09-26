import React, { useState, useEffect } from 'react';
import { Product, InventoryAdjustment, WarehouseLocation } from '../types';

interface InventoryAdjustmentViewProps {
  products: Product[];
  locations: WarehouseLocation[];
  adjustments: InventoryAdjustment[];
  onApplyAdjustment: (productId: string, location: string, countedQty: number) => void;
}

export const InventoryAdjustmentView: React.FC<InventoryAdjustmentViewProps> = ({
  products,
  locations,
  adjustments,
  onApplyAdjustment
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [countedQty, setCountedQty] = useState<number | string>(27);

  // Initialize with Steel Rods if available
  useEffect(() => {
    if (!selectedProductId && products.length > 0) {
      const steel = products.find(p => p.name === 'Steel Rods') || products[0];
      setSelectedProductId(steel.id);
      setSelectedLocation('Production Rack');
    }
  }, [products, selectedProductId]);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Calculate recorded stock
  let recordedStock = 0;
  if (selectedProduct) {
    if (
      selectedLocation &&
      selectedProduct.locationBalances &&
      selectedProduct.locationBalances[selectedLocation] !== undefined
    ) {
      recordedStock = selectedProduct.locationBalances[selectedLocation];
    } else {
      recordedStock = selectedProduct.stock;
    }
  }

  const numericCounted = countedQty !== '' ? Number(countedQty) : recordedStock;
  const diff = numericCounted - recordedStock;
  const diffSign = diff > 0 ? `+${diff}` : `${diff}`;
  const diffColor = diff < 0 ? 'var(--status-danger-text)' : diff > 0 ? 'var(--status-success-text)' : 'var(--text-dark)';

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !selectedLocation || countedQty === '') return;
    onApplyAdjustment(selectedProductId, selectedLocation, Number(countedQty));
  };

  return (
    <section className="page-view active">
      <div className="page-heading-block">
        <div>
          <h2 className="page-title">Inventory Adjustment</h2>
          <p className="page-subtitle">Reconcile discrepancies between recorded stock and physical counts</p>
        </div>
      </div>

      <div className="adjustment-layout">
        {/* Adjustment Form */}
        <div className="adjustment-form-card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Physical Count Reconciliation</h3>
          
          <form onSubmit={handleApply}>
            <div className="form-group">
              <label className="form-label" htmlFor="adj-prod-select">Product</label>
              <select
                id="adj-prod-select"
                className="form-select"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
              >
                <option value="">Select a product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku}) — Stock: {p.stock} {p.uom}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="adj-loc-select">Location</label>
              <select
                id="adj-loc-select"
                className="form-select"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option value="">Select a location...</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="adj-count-input">Counted Quantity (Physical)</label>
              <input
                id="adj-count-input"
                type="number"
                className="form-input"
                placeholder="e.g. 27"
                value={countedQty}
                onChange={(e) => setCountedQty(e.target.value)}
              />
            </div>

            {/* Real-time Calculation Panel */}
            <div className="adjustment-calc-panel">
              <div className="calc-row">
                <span className="calc-label">Recorded Stock:</span>
                <span className="calc-val">{recordedStock} {selectedProduct?.uom || ''}</span>
              </div>
              <div className="calc-row">
                <span className="calc-label">Physical Count:</span>
                <span className="calc-val">{numericCounted} {selectedProduct?.uom || ''}</span>
              </div>
              <div className="calc-row total-adjustment">
                <span>Adjustment:</span>
                <span className="calc-val" style={{ color: diffColor, fontSize: 15 }}>
                  {diffSign} {selectedProduct?.uom || ''}
                </span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Apply Adjustment
            </button>
          </form>
        </div>

        {/* Audit Log Table */}
        <div className="table-card">
          <div className="table-header-bar">
            <div>
              <h4 className="table-title">Adjustment Audit Log</h4>
              <p className="table-subtitle">Recent physical reconciliations</p>
            </div>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Location</th>
                  <th>Recorded</th>
                  <th>Physical</th>
                  <th>Adjustment</th>
                </tr>
              </thead>
              <tbody>
                {adjustments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty-state">No adjustments logged yet.</td>
                  </tr>
                ) : (
                  adjustments.map(a => {
                    const sign = a.adjustmentQty > 0 ? `+${a.adjustmentQty}` : `${a.adjustmentQty}`;
                    const color = a.adjustmentQty < 0 ? 'var(--status-danger-text)' : 'var(--status-success-text)';
                    return (
                      <tr key={a.id}>
                        <td><span className="font-medium">{a.productName}</span></td>
                        <td><span className="text-secondary">{a.location}</span></td>
                        <td>{a.recordedStock} {a.uom}</td>
                        <td><strong>{a.physicalCount} {a.uom}</strong></td>
                        <td><span style={{ fontWeight: 700, color }}>{sign} {a.uom}</span></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
