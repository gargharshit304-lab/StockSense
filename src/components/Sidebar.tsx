import React from 'react';
import { TabType, UserRole } from '../types';

interface SidebarProps {
  userRole: UserRole;
  activeTab: TabType;
  onNavigate: (tab: TabType) => void;
  onLogoutClick: () => void;
  onResetDemo: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  userRole,
  activeTab,
  onNavigate,
  onLogoutClick,
  onResetDemo
}) => {
  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
        </div>
        <span className="brand-name">STOCKSENSE</span>
      </div>

      <nav className="sidebar-nav">
        {userRole === 'manager' ? (
          /* ================================================================
             MANAGER SIDEBAR CONFIGURATION
             ================================================================ */
          <>
            {/* Dashboard */}
            <button
              type="button"
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => onNavigate('dashboard')}
            >
              <span className="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </span>
              <span>Dashboard</span>
            </button>

            {/* Products */}
            <button
              type="button"
              className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => onNavigate('products')}
            >
              <span className="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </span>
              <span>Products</span>
            </button>

            {/* Operations Group */}
            <div className="nav-section-title">Operations</div>

            <button
              type="button"
              className={`nav-item nav-sub-item ${activeTab === 'receipts' ? 'active' : ''}`}
              onClick={() => onNavigate('receipts')}
            >
              <span className="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
                  <path d="M12 12v9"></path>
                  <path d="m8 17 4 4 4-4"></path>
                </svg>
              </span>
              <span>Receipts</span>
            </button>

            <button
              type="button"
              className={`nav-item nav-sub-item ${activeTab === 'delivery-orders' ? 'active' : ''}`}
              onClick={() => onNavigate('delivery-orders')}
            >
              <span className="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
              </span>
              <span>Delivery Orders</span>
            </button>

            <button
              type="button"
              className={`nav-item nav-sub-item ${activeTab === 'inventory-adjustment' ? 'active' : ''}`}
              onClick={() => onNavigate('inventory-adjustment')}
            >
              <span className="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </span>
              <span>Inventory Adjustment</span>
            </button>

            <button
              type="button"
              className={`nav-item nav-sub-item ${activeTab === 'move-history' ? 'active' : ''}`}
              onClick={() => onNavigate('move-history')}
            >
              <span className="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </span>
              <span>Move History</span>
            </button>

            {/* Settings Group */}
            <div className="nav-section-title">Settings</div>

            <button
              type="button"
              className={`nav-item nav-sub-item ${activeTab === 'warehouse' ? 'active' : ''}`}
              onClick={() => onNavigate('warehouse')}
            >
              <span className="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </span>
              <span>Warehouse</span>
            </button>
          </>
        ) : (
          /* ================================================================
             WAREHOUSE STAFF SIDEBAR CONFIGURATION (SHOW ONLY THESE ITEMS)
             ================================================================ */
          <>
            {/* Dashboard */}
            <button
              type="button"
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => onNavigate('dashboard')}
            >
              <span className="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </span>
              <span>Dashboard</span>
            </button>

            {/* Operations Group */}
            <div className="nav-section-title">Operations</div>

            {/* Internal Transfers */}
            <button
              type="button"
              className={`nav-item nav-sub-item ${activeTab === 'staff-transfers' ? 'active' : ''}`}
              onClick={() => onNavigate('staff-transfers')}
            >
              <span className="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="17 1 21 5 17 9"></polyline>
                  <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                  <polyline points="7 23 3 19 7 15"></polyline>
                  <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                </svg>
              </span>
              <span>Internal Transfers</span>
            </button>

            {/* Delivery / Picking */}
            <button
              type="button"
              className={`nav-item nav-sub-item ${activeTab === 'staff-delivery-picking' ? 'active' : ''}`}
              onClick={() => onNavigate('staff-delivery-picking')}
            >
              <span className="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
              </span>
              <span>Delivery / Picking</span>
            </button>

            {/* Stock Counting */}
            <button
              type="button"
              className={`nav-item nav-sub-item ${activeTab === 'staff-stock-counting' ? 'active' : ''}`}
              onClick={() => onNavigate('staff-stock-counting')}
            >
              <span className="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </span>
              <span>Stock Counting</span>
            </button>
          </>
        )}

        {/* Profile Group (Common Section Structure) */}
        <div className="nav-section-title">Profile</div>

        <button
          type="button"
          className={`nav-item nav-sub-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => onNavigate('profile')}
        >
          <span className="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </span>
          <span>My Profile</span>
        </button>

        <button
          type="button"
          className="nav-item nav-sub-item"
          onClick={onLogoutClick}
        >
          <span className="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </span>
          <span>Logout</span>
        </button>
      </nav>

      {/* Footer Demo Flow Indicator */}
      <div className="sidebar-footer">
        <div className="demo-flow-badge">
          <div className="demo-flow-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            {userRole === 'warehouse_staff' ? 'Staff Floor Flow' : 'Manager Demo Flow'}
          </div>
          <div className="demo-flow-text">
            {userRole === 'warehouse_staff' 
              ? 'Receive Alert → Accept → Perform Transfer → Confirm' 
              : 'Schedule → Alert Staff → Track Status → Verify'}
          </div>
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            style={{ marginTop: 6, width: '100%', fontSize: 11 }}
            onClick={onResetDemo}
          >
            Reset Demo State
          </button>
        </div>
      </div>
    </aside>
  );
};
