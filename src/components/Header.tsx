import React, { useState, useRef, useEffect } from 'react';
import { TabType, UserRole, StaffNotification } from '../types';

interface HeaderProps {
  activeTab: TabType;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  notifications: StaffNotification[];
  onNavigate: (tab: TabType) => void;
  onTriggerDemoStep: (step: number) => void;
  onViewTransfer: (transferId: string) => void;
}

const TITLE_MAP: Record<TabType, string> = {
  dashboard: 'Dashboard',
  products: 'Products',
  receipts: 'Receipts',
  'delivery-orders': 'Delivery Orders',
  'inventory-adjustment': 'Inventory Adjustment',
  'move-history': 'Move History',
  warehouse: 'Warehouse',
  profile: 'My Profile',
  'staff-transfers': 'Internal Transfers',
  'staff-delivery-picking': 'Delivery / Picking',
  'staff-stock-counting': 'Stock Counting'
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  userRole,
  onRoleChange,
  notifications,
  onNavigate,
  onTriggerDemoStep,
  onViewTransfer
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pendingNotifs = notifications.filter(n => !n.read);
  const hasUnread = userRole === 'warehouse_staff' && pendingNotifs.length > 0;

  return (
    <header className="top-header">
      <div className="header-left">
        <h1 className="page-main-title">{TITLE_MAP[activeTab]}</h1>
      </div>

      <div className="header-right">
        {/* Role Switcher Pill */}
        <div className="role-switcher" title="Switch active system perspective">
          <button
            type="button"
            className={`role-switcher-btn ${userRole === 'manager' ? 'active' : ''}`}
            onClick={() => onRoleChange('manager')}
          >
            Manager
          </button>
          <button
            type="button"
            className={`role-switcher-btn ${userRole === 'warehouse_staff' ? 'active' : ''}`}
            onClick={() => onRoleChange('warehouse_staff')}
          >
            Warehouse Staff
          </button>
        </div>

        {/* Guided Demo Steps Shortcuts */}
        <div className="demo-quick-actions">
          <button
            type="button"
            className="btn-demo-tour"
            onClick={() => onTriggerDemoStep(1)}
            title="Step 1: Receive 50kg Steel Rods"
          >
            <span>1. Receive +50kg</span>
          </button>
          <button
            type="button"
            className="btn-demo-tour"
            onClick={() => onTriggerDemoStep(2)}
            title="Step 2: Transfer 50kg to Rack"
          >
            <span>2. Transfer Loc</span>
          </button>
          <button
            type="button"
            className="btn-demo-tour"
            onClick={() => onTriggerDemoStep(3)}
            title="Step 3: Deliver 20kg to Customer"
          >
            <span>3. Deliver -20kg</span>
          </button>
          <button
            type="button"
            className="btn-demo-tour"
            onClick={() => onTriggerDemoStep(4)}
            title="Step 4: Adjust Damaged -3kg"
          >
            <span>4. Adjust -3kg</span>
          </button>
          <button
            type="button"
            className="btn-demo-tour"
            onClick={() => onTriggerDemoStep(5)}
            title="Step 5: View Stock Ledger"
          >
            <span>5. Ledger</span>
          </button>
        </div>

        {/* Notification Bell with Popover */}
        <div className="notification-wrapper" ref={notifRef}>
          <button
            type="button"
            className="icon-btn"
            title="Notifications"
            aria-label="Notifications"
            onClick={() => setIsNotifOpen(prev => !prev)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {hasUnread && <span className="notification-badge"></span>}
          </button>

          {isNotifOpen && (
            <div className="notification-popover">
              <div className="notif-header">
                <span className="notif-header-title">Notifications</span>
                <span className="notif-badge-count">
                  {userRole === 'warehouse_staff' ? `${pendingNotifs.length} Pending` : 'System Alerts'}
                </span>
              </div>

              <div className="notif-list">
                {userRole === 'warehouse_staff' ? (
                  pendingNotifs.length === 0 ? (
                    <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 12 }}>
                      No pending warehouse notifications.
                    </div>
                  ) : (
                    pendingNotifs.map(n => (
                      <div key={n.id} className="notif-item">
                        <div className="notif-item-top">
                          <span className="notif-item-title">{n.title}</span>
                          <span className="notif-item-time">{n.timestamp}</span>
                        </div>
                        <div className="notif-item-detail">{n.quantity} {n.product}</div>
                        <div className="notif-item-route">{n.route}</div>
                        <div className="notif-item-footer">
                          <span className="badge badge-waiting">Waiting for Warehouse Staff</span>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={() => {
                              setIsNotifOpen(false);
                              onViewTransfer(n.transferId);
                            }}
                          >
                            View Transfer
                          </button>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  <div style={{ padding: '16px', fontSize: 12, color: 'var(--text-secondary)' }}>
                    <div><strong>Inventory Operations Status:</strong> All scheduled transfers queued for warehouse floor execution.</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu (Shows Role Appropriately) */}
        <div
          className="profile-menu-btn"
          title="View Profile"
          onClick={() => onNavigate('profile')}
        >
          <div className="profile-avatar">
            {userRole === 'warehouse_staff' ? 'WS' : 'AM'}
          </div>
          <div className="profile-info-text">
            <div className="profile-name">
              {userRole === 'warehouse_staff' ? 'Warehouse Staff' : 'Alex Morgan'}
            </div>
            <div className="profile-role">
              {userRole === 'warehouse_staff' ? 'Floor Operations' : 'Inventory Lead'}
            </div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
    </header>
  );
};
