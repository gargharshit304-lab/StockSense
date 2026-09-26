import React, { useState, useEffect } from 'react';
import { Product, WarehouseLocation, InternalTransfer } from '../types';

interface CreateProductModalProps {
  isOpen: boolean;
  locations: WarehouseLocation[];
  onClose: () => void;
  onSubmit: (product: {
    name: string;
    sku: string;
    category: string;
    uom: string;
    initialStock: number;
    location: string;
  }) => void;
}

export const CreateProductModal: React.FC<CreateProductModalProps> = ({
  isOpen,
  locations,
  onClose,
  onSubmit
}) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [uom, setUom] = useState('');
  const [initialStock, setInitialStock] = useState(0);
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (locations.length > 0 && !location) {
      setLocation(locations[0].name);
    }
  }, [locations, location]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku || !category || !uom) return;
    onSubmit({
      name,
      sku,
      category,
      uom,
      initialStock: Number(initialStock) || 0,
      location: location || 'Main Warehouse'
    });
    setName('');
    setSku('');
    setCategory('');
    setUom('');
    setInitialStock(0);
    onClose();
  };

  return (
    <div className="modal-backdrop active" onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Create Product</h3>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="prod-name">Name</label>
              <input
                id="prod-name"
                type="text"
                className="form-input"
                placeholder="e.g. Copper Wire Coils"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="prod-sku">SKU / Code</label>
              <input
                id="prod-sku"
                type="text"
                className="form-input"
                placeholder="e.g. CW-5500"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="prod-cat">Category</label>
              <input
                id="prod-cat"
                type="text"
                className="form-input"
                placeholder="e.g. Raw Materials"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="prod-uom">Unit of Measure</label>
              <input
                id="prod-uom"
                type="text"
                className="form-input"
                placeholder="e.g. kg, Units, Sheets"
                value={uom}
                onChange={(e) => setUom(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="prod-stock">Initial Stock</label>
              <input
                id="prod-stock"
                type="number"
                className="form-input"
                min="0"
                value={initialStock}
                onChange={(e) => setInitialStock(Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="prod-loc">Primary Location</label>
              <select
                id="prod-loc"
                className="form-select"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Product</button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface CreateReceiptModalProps {
  isOpen: boolean;
  products: Product[];
  onClose: () => void;
  onSubmit: (receipt: {
    supplier: string;
    productId: string;
    quantity: number;
  }) => void;
}

export const CreateReceiptModal: React.FC<CreateReceiptModalProps> = ({
  isOpen,
  products,
  onClose,
  onSubmit
}) => {
  const [supplier, setSupplier] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(50);

  useEffect(() => {
    if (products.length > 0 && !productId) {
      const steel = products.find(p => p.name === 'Steel Rods') || products[0];
      setProductId(steel.id);
    }
  }, [products, productId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier || !productId || quantity <= 0) return;
    onSubmit({
      supplier,
      productId,
      quantity: Number(quantity)
    });
    setSupplier('');
    onClose();
  };

  return (
    <div className="modal-backdrop active" onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">+ New Receipt</h3>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="rec-supplier">Supplier</label>
              <input
                id="rec-supplier"
                type="text"
                className="form-input"
                placeholder="e.g. Acme Steel Corp"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="rec-product">Product</label>
              <select
                id="rec-product"
                className="form-select"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
              >
                <option value="">Select product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Current Stock: {p.stock} {p.uom})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="rec-qty">Quantity</label>
              <input
                id="rec-qty"
                type="number"
                className="form-input"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Receipt</button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface CreateDeliveryModalProps {
  isOpen: boolean;
  products: Product[];
  onClose: () => void;
  onSubmit: (delivery: {
    customer: string;
    productId: string;
    quantity: number;
  }) => void;
}

export const CreateDeliveryModal: React.FC<CreateDeliveryModalProps> = ({
  isOpen,
  products,
  onClose,
  onSubmit
}) => {
  const [customer, setCustomer] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(20);

  useEffect(() => {
    if (products.length > 0 && !productId) {
      const steel = products.find(p => p.name === 'Steel Rods') || products[0];
      setProductId(steel.id);
    }
  }, [products, productId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || quantity <= 0) return;
    onSubmit({
      customer: customer.trim() || 'Client',
      productId,
      quantity: Number(quantity)
    });
    setCustomer('');
    onClose();
  };

  return (
    <div className="modal-backdrop active" onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">+ New Delivery</h3>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="del-cust">Customer / Order Reference</label>
              <input
                id="del-cust"
                type="text"
                className="form-input"
                placeholder="e.g. Apex Fabrication"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="del-prod">Product</label>
              <select
                id="del-prod"
                className="form-select"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
              >
                <option value="">Select product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Available: {p.stock} {p.uom})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="del-qty">Quantity</label>
              <input
                id="del-qty"
                type="number"
                className="form-input"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Delivery Order</button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface InternalTransferModalProps {
  isOpen: boolean;
  products: Product[];
  locations: WarehouseLocation[];
  defaultFrom?: string;
  onClose: () => void;
  onSubmit: (transfer: {
    productId: string;
    fromLocation: string;
    toLocation: string;
    quantity: number;
  }) => void;
}

export const InternalTransferModal: React.FC<InternalTransferModalProps> = ({
  isOpen,
  products,
  locations,
  defaultFrom,
  onClose,
  onSubmit
}) => {
  const [productId, setProductId] = useState('');
  const [fromLoc, setFromLoc] = useState('');
  const [toLoc, setToLoc] = useState('');
  const [quantity, setQuantity] = useState(50);

  useEffect(() => {
    if (products.length > 0 && !productId) {
      const steel = products.find(p => p.name === 'Steel Rods') || products[0];
      setProductId(steel.id);
    }
  }, [products, productId]);

  useEffect(() => {
    if (locations.length >= 2) {
      if (defaultFrom) {
        setFromLoc(defaultFrom);
        const dest = locations.find(l => l.name !== defaultFrom) || locations[1];
        setToLoc(dest.name);
      } else {
        setFromLoc(locations[0].name);
        setToLoc(locations[1].name);
      }
    }
  }, [locations, defaultFrom, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !fromLoc || !toLoc || quantity <= 0) return;
    if (fromLoc === toLoc) return;
    onSubmit({
      productId,
      fromLocation: fromLoc,
      toLocation: toLoc,
      quantity: Number(quantity)
    });
    onClose();
  };

  return (
    <div className="modal-backdrop active" onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Schedule Internal Transfer</h3>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="trans-prod">Product</label>
              <select
                id="trans-prod"
                className="form-select"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
              >
                <option value="">Select product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Total Stock: {p.stock} {p.uom})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="trans-from">From Location</label>
              <select
                id="trans-from"
                className="form-select"
                value={fromLoc}
                onChange={(e) => setFromLoc(e.target.value)}
                required
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="trans-to">To Location</label>
              <select
                id="trans-to"
                className="form-select"
                value={toLoc}
                onChange={(e) => setToLoc(e.target.value)}
                required
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="trans-qty">Quantity</label>
              <input
                id="trans-qty"
                type="number"
                className="form-input"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Schedule Transfer</button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop active" onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Logout Confirmation</h3>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>
            Are you sure you want to log out of <strong>StockSense</strong>?
          </p>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
            Your local session and mock inventory changes will remain saved in your browser local storage.
          </p>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Stay Logged In</button>
          <button type="button" className="btn btn-primary" onClick={onConfirm}>Confirm Logout</button>
        </div>
      </div>
    </div>
  );
};

interface TransferStatusModalProps {
  isOpen: boolean;
  transfer: InternalTransfer | null;
  onClose: () => void;
}

export const TransferStatusModal: React.FC<TransferStatusModalProps> = ({
  isOpen,
  transfer,
  onClose
}) => {
  if (!isOpen || !transfer) return null;

  const isCompleted = transfer.status === 'Done' || transfer.workflowStep === 'completed';
  const statusDisplay = isCompleted 
    ? 'Completed' 
    : (transfer.statusText || 'Waiting for Warehouse Staff');

  return (
    <div className="modal-backdrop active" onClick={onClose}>
      <div className="modal-window" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Internal Transfer Status</h3>
            <span style={{ fontSize: 12, color: 'var(--primary-purple)', fontWeight: 600 }}>
              {transfer.id}
            </span>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {/* Transfer Details Card */}
          <div className="transfer-status-details">
            <div className="transfer-detail-item">
              <span className="transfer-detail-label">Transfer ID</span>
              <span className="transfer-detail-val" style={{ color: 'var(--primary-purple)' }}>
                {transfer.id}
              </span>
            </div>

            <div className="transfer-detail-item">
              <span className="transfer-detail-label">Product</span>
              <span className="transfer-detail-val">{transfer.productName}</span>
            </div>

            <div className="transfer-detail-item">
              <span className="transfer-detail-label">Quantity</span>
              <span className="transfer-detail-val">{transfer.quantity} {transfer.uom}</span>
            </div>

            <div className="transfer-detail-item">
              <span className="transfer-detail-label">From</span>
              <span className="transfer-detail-val">{transfer.fromLocation}</span>
            </div>

            <div className="transfer-detail-item">
              <span className="transfer-detail-label">To</span>
              <span className="transfer-detail-val">{transfer.toLocation}</span>
            </div>

            <div className="transfer-detail-item">
              <span className="transfer-detail-label">Status</span>
              <span className="transfer-detail-val">
                {isCompleted ? (
                  <span className="badge badge-done">Completed</span>
                ) : (
                  <span className="badge badge-waiting">{statusDisplay}</span>
                )}
              </span>
            </div>
          </div>

          {/* Simple Status Timeline */}
          <div className="transfer-timeline-container">
            <div className="timeline-header-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Transfer Progress Timeline
            </div>

            <div className="transfer-timeline">
              {/* Step 1: Scheduled */}
              <div className="transfer-timeline-step completed">
                <div className="timeline-dot">✓</div>
                <div className="timeline-content">
                  <span className="timeline-step-name">1. Scheduled ✓</span>
                  <span className="timeline-step-desc">Transfer logged by Inventory Manager</span>
                </div>
              </div>

              {/* Step 2: Accepted by Warehouse Staff */}
              <div className={`transfer-timeline-step ${isCompleted ? 'completed' : 'active'}`}>
                <div className="timeline-dot">
                  {isCompleted ? '✓' : '2'}
                </div>
                <div className="timeline-content">
                  <span className="timeline-step-name">2. Accepted by Warehouse Staff</span>
                  <span className="timeline-step-desc">
                    {isCompleted ? 'Accepted and verified by facility crew' : 'Awaiting crew acknowledgment'}
                  </span>
                </div>
              </div>

              {/* Step 3: In Progress */}
              <div className={`transfer-timeline-step ${isCompleted ? 'completed' : ''}`}>
                <div className="timeline-dot">
                  {isCompleted ? '✓' : '3'}
                </div>
                <div className="timeline-content">
                  <span className="timeline-step-name">3. In Progress</span>
                  <span className="timeline-step-desc">
                    {isCompleted ? 'Physical transport finished' : 'Goods en route between bins'}
                  </span>
                </div>
              </div>

              {/* Step 4: Completed */}
              <div className={`transfer-timeline-step ${isCompleted ? 'completed active' : ''}`}>
                <div className="timeline-dot">
                  {isCompleted ? '✓' : '4'}
                </div>
                <div className="timeline-content">
                  <span className="timeline-step-name">4. Completed</span>
                  <span className="timeline-step-desc">
                    {isCompleted ? 'Stock updated across warehouses' : 'Final destination verification'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Explanation Callout */}
          <div className="transfer-explanation-card">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <div className="transfer-explanation-text">
              {isCompleted ? (
                <>Transfer confirmed and completed by warehouse staff. Stock has been moved to <strong>{transfer.toLocation}</strong>.</>
              ) : (
                <>Waiting for warehouse staff to accept and perform this transfer.</>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   Accept Internal Transfer Modal (Warehouse Staff Slide-to-Confirm)
   ========================================================================== */
interface AcceptTransferModalProps {
  isOpen: boolean;
  transfer: InternalTransfer | null;
  onClose: () => void;
  onAccept: (transferId: string) => void;
}

export const AcceptTransferModal: React.FC<AcceptTransferModalProps> = ({
  isOpen,
  transfer,
  onClose,
  onAccept
}) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const startXRef = React.useRef(0);

  // Reset state whenever modal is opened or transfer changes
  useEffect(() => {
    if (isOpen) {
      setIsConfirmed(false);
      setIsDragging(false);
      setDragX(0);
    }
  }, [isOpen, transfer?.id]);

  // Global pointerup listener for reliable release handling outside handle
  useEffect(() => {
    if (!isDragging) return;
    const handleGlobalUp = () => {
      if (!isConfirmed) {
        setIsDragging(false);
        setDragX(0);
      }
    };
    window.addEventListener('pointerup', handleGlobalUp);
    window.addEventListener('pointercancel', handleGlobalUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalUp);
      window.removeEventListener('pointercancel', handleGlobalUp);
    };
  }, [isDragging, isConfirmed]);

  if (!isOpen || !transfer) return null;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isConfirmed) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    setIsDragging(true);
    startXRef.current = e.clientX - dragX;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || isConfirmed) return;
    if (!trackRef.current) return;
    const trackWidth = trackRef.current.clientWidth;
    const maxDrag = Math.max(1, trackWidth - 44 - 8); // 44px handle + 4px left + 4px right padding
    const currentX = e.clientX - startXRef.current;
    const clampedX = Math.max(0, Math.min(currentX, maxDrag));
    setDragX(clampedX);

    // Confirmation threshold: 90%
    if (clampedX >= maxDrag * 0.90) {
      setIsConfirmed(true);
      setIsDragging(false);
      setDragX(maxDrag);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}

      // Show brief success state, then close modal and trigger acceptance
      setTimeout(() => {
        onAccept(transfer.id);
        onClose();
      }, 700);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || isConfirmed) return;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    // If not past threshold, snap back to initial position
    setDragX(0);
  };

  const trackWidth = trackRef.current?.clientWidth || 380;
  const maxDrag = Math.max(1, trackWidth - 44 - 8);
  const dragRatio = Math.min(1, dragX / maxDrag);
  const textOpacity = isConfirmed ? 1 : Math.max(0.15, 1 - dragRatio * 1.5);

  return (
    <div className="modal-backdrop active" onClick={isConfirmed ? undefined : onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Accept Internal Transfer</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              Review the transfer details before accepting.
            </p>
          </div>
          {!isConfirmed && (
            <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>

        <div className="modal-body">
          {/* Transfer Details Card */}
          <div className="transfer-status-details" style={{ marginBottom: 16 }}>
            <div className="transfer-detail-item">
              <span className="transfer-detail-label">Transfer ID</span>
              <span className="transfer-detail-val" style={{ color: 'var(--primary-purple)' }}>
                {transfer.id}
              </span>
            </div>

            <div className="transfer-detail-item">
              <span className="transfer-detail-label">Product</span>
              <span className="transfer-detail-val">{transfer.productName}</span>
            </div>

            <div className="transfer-detail-item">
              <span className="transfer-detail-label">Quantity</span>
              <span className="transfer-detail-val">{transfer.quantity} {transfer.uom}</span>
            </div>

            <div className="transfer-detail-item">
              <span className="transfer-detail-label">Current Status</span>
              <span className="transfer-detail-val">
                <span className="badge badge-waiting">Waiting for Warehouse Staff</span>
              </span>
            </div>

            <div className="transfer-detail-item">
              <span className="transfer-detail-label">From</span>
              <span className="transfer-detail-val">{transfer.fromLocation}</span>
            </div>

            <div className="transfer-detail-item">
              <span className="transfer-detail-label">To</span>
              <span className="transfer-detail-val">{transfer.toLocation}</span>
            </div>
          </div>

          {/* Verification Section */}
          <div className="slide-verification-section">
            <span className="slide-verification-label">
              Slide to confirm that you accept this transfer.
            </span>

            {/* Slide to Confirm Track */}
            <div 
              ref={trackRef} 
              className={`slide-confirm-track ${isConfirmed ? 'confirmed' : ''}`}
            >
              {/* Progress Fill */}
              <div 
                className="slide-confirm-fill" 
                style={{ 
                  width: isConfirmed ? '100%' : `${dragX + 44 + 4}px`,
                  transition: isDragging ? 'none' : 'width 0.25s cubic-bezier(0.2, 0, 0, 1)'
                }}
              />

              {/* Centered Track Label */}
              <div 
                className={`slide-confirm-text ${isConfirmed ? 'success' : ''}`}
                style={{ opacity: textOpacity }}
              >
                {isConfirmed ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    ✓ Transfer Accepted
                  </>
                ) : (
                  <>
                    Slide to accept transfer →
                  </>
                )}
              </div>

              {/* Draggable Circular Handle */}
              <div
                className={`slide-confirm-handle ${isConfirmed ? 'confirmed' : ''}`}
                style={{
                  transform: `translateX(${dragX}px)`,
                  transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0, 0, 1)'
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                role="slider"
                aria-label="Slide to accept transfer"
                aria-valuenow={Math.round(dragRatio * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                {isConfirmed ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={isConfirmed}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   Confirm Internal Transfer Completion Modal (Warehouse Staff Slide-to-Confirm)
   ========================================================================== */
interface ConfirmTransferCompletionModalProps {
  isOpen: boolean;
  transfer: InternalTransfer | null;
  onClose: () => void;
  onConfirm: (transferId: string) => void;
}

export const ConfirmTransferCompletionModal: React.FC<ConfirmTransferCompletionModalProps> = ({
  isOpen,
  transfer,
  onClose,
  onConfirm
}) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const startXRef = React.useRef(0);

  // Reset state whenever modal is opened or transfer changes
  useEffect(() => {
    if (isOpen) {
      setIsConfirmed(false);
      setIsDragging(false);
      setDragX(0);
    }
  }, [isOpen, transfer?.id]);

  // Global pointerup listener for reliable release handling outside handle
  useEffect(() => {
    if (!isDragging) return;
    const handleGlobalUp = () => {
      if (!isConfirmed) {
        setIsDragging(false);
        setDragX(0);
      }
    };
    window.addEventListener('pointerup', handleGlobalUp);
    window.addEventListener('pointercancel', handleGlobalUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalUp);
      window.removeEventListener('pointercancel', handleGlobalUp);
    };
  }, [isDragging, isConfirmed]);

  if (!isOpen || !transfer) return null;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isConfirmed) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    setIsDragging(true);
    startXRef.current = e.clientX - dragX;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || isConfirmed) return;
    if (!trackRef.current) return;
    const trackWidth = trackRef.current.clientWidth;
    const maxDrag = Math.max(1, trackWidth - 44 - 8); // 44px handle + 4px left + 4px right padding
    const currentX = e.clientX - startXRef.current;
    const clampedX = Math.max(0, Math.min(currentX, maxDrag));
    setDragX(clampedX);

    // Confirmation threshold: 90%
    if (clampedX >= maxDrag * 0.90) {
      setIsConfirmed(true);
      setIsDragging(false);
      setDragX(maxDrag);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}

      // Show brief success state, then close modal and trigger completion
      setTimeout(() => {
        onConfirm(transfer.id);
        onClose();
      }, 700);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || isConfirmed) return;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    // If not past threshold, snap back to initial position
    setDragX(0);
  };

  const trackWidth = trackRef.current?.clientWidth || 380;
  const maxDrag = Math.max(1, trackWidth - 44 - 8);
  const dragRatio = Math.min(1, dragX / maxDrag);
  const textOpacity = isConfirmed ? 1 : Math.max(0.15, 1 - dragRatio * 1.5);

  return (
    <div className="modal-backdrop active" onClick={isConfirmed ? undefined : onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Confirm Transfer Completion</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              Verify the physical transfer has been completed.
            </p>
          </div>
          {!isConfirmed && (
            <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>

        <div className="modal-body">
          {/* Transfer Details Card */}
          <div className="transfer-status-details" style={{ marginBottom: 16 }}>
            <div className="transfer-detail-item">
              <span className="transfer-detail-label">Transfer ID</span>
              <span className="transfer-detail-val" style={{ color: 'var(--primary-purple)' }}>
                {transfer.id}
              </span>
            </div>

            <div className="transfer-detail-item">
              <span className="transfer-detail-label">Product</span>
              <span className="transfer-detail-val">{transfer.productName}</span>
            </div>

            <div className="transfer-detail-item">
              <span className="transfer-detail-label">Quantity</span>
              <span className="transfer-detail-val">{transfer.quantity} {transfer.uom}</span>
            </div>

            <div className="transfer-detail-item">
              <span className="transfer-detail-label">Current Status</span>
              <span className="transfer-detail-val">
                <span className="badge badge-ready">In Progress</span>
              </span>
            </div>

            <div className="transfer-detail-item">
              <span className="transfer-detail-label">From</span>
              <span className="transfer-detail-val">{transfer.fromLocation}</span>
            </div>

            <div className="transfer-detail-item">
              <span className="transfer-detail-label">To</span>
              <span className="transfer-detail-val">{transfer.toLocation}</span>
            </div>
          </div>

          {/* Verification Section */}
          <div className="slide-verification-section">
            <span className="slide-verification-label">
              Slide to confirm transfer completion.
            </span>

            {/* Slide to Confirm Track */}
            <div 
              ref={trackRef} 
              className={`slide-confirm-track ${isConfirmed ? 'confirmed' : ''}`}
            >
              {/* Progress Fill */}
              <div 
                className="slide-confirm-fill" 
                style={{ 
                  width: isConfirmed ? '100%' : `${dragX + 44 + 4}px`,
                  transition: isDragging ? 'none' : 'width 0.25s cubic-bezier(0.2, 0, 0, 1)'
                }}
              />

              {/* Centered Track Label */}
              <div 
                className={`slide-confirm-text ${isConfirmed ? 'success' : ''}`}
                style={{ opacity: textOpacity }}
              >
                {isConfirmed ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    ✓ Transfer Completed
                  </>
                ) : (
                  <>
                    Slide to confirm completion →
                  </>
                )}
              </div>

              {/* Draggable Circular Handle */}
              <div
                className={`slide-confirm-handle ${isConfirmed ? 'confirmed' : ''}`}
                style={{
                  transform: `translateX(${dragX}px)`,
                  transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0, 0, 1)'
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                role="slider"
                aria-label="Slide to confirm completion"
                aria-valuenow={Math.round(dragRatio * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                {isConfirmed ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={isConfirmed}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};


