import React, { useState } from 'react';
import { Product } from '../types';

interface ProductsViewProps {
  products: Product[];
  onOpenCreateProduct: () => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  onOpenCreateProduct
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q)
    );
  });

  return (
    <section className="page-view active">
      <div className="page-heading-block">
        <div>
          <h2 className="page-title">Products</h2>
          <p className="page-subtitle">Central product catalogue and stock levels</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onOpenCreateProduct}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Create Product
        </button>
      </div>

      <div className="table-card">
        <div className="table-header-bar">
          <div className="search-input-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              className="form-input"
              placeholder="Search products by name, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU / Code</th>
                <th>Category</th>
                <th>Unit of Measure</th>
                <th>Stock</th>
                <th>Location</th>
                <th>Reordering Rule</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state">
                    <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    </svg>
                    <div>No products found matching your search.</div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const isLowStock = p.stock <= p.minStock;
                  return (
                    <tr key={p.id}>
                      <td><span className="font-medium">{p.name}</span></td>
                      <td><code style={{ color: 'var(--primary-purple)', fontWeight: 600 }}>{p.sku}</code></td>
                      <td><span className="text-secondary">{p.category}</span></td>
                      <td>{p.uom}</td>
                      <td>
                        <span
                          className="font-medium"
                          style={{ color: isLowStock ? 'var(--status-warning-text)' : 'var(--text-dark)' }}
                        >
                          {p.stock} {p.uom}
                        </span>
                        {isLowStock && (
                          <span className="badge badge-waiting" style={{ marginLeft: 6 }}>
                            Low Stock
                          </span>
                        )}
                      </td>
                      <td><span className="text-secondary">{p.location}</span></td>
                      <td><span className="text-secondary" style={{ fontSize: 12 }}>{p.reorderingRule}</span></td>
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
