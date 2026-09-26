import React, { useState, useRef, useEffect } from 'react';
import { TabType, UserRole, StaffNotification, InternalTransfer, AuthUser } from '../types';

interface HeaderProps {
  activeTab: TabType;
  userRole: UserRole;
  user?: AuthUser | null;
  notifications: StaffNotification[];
  transfers: InternalTransfer[];
  onNavigate: (tab: TabType) => void;
  onTriggerDemoStep: (step: number) => void;
  onViewTransfer: (transferId: string, notifId?: string) => void;
  onMarkNotificationAsRead?: (notifId: string) => void;
  onMarkAllAsRead?: () => void;
  onLogoutClick?: () => void;
}

const TITLE_MAP: Record<TabType, string> = {
  login: 'Sign In',
  signup: 'Create Account',
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
  'staff-stock-counting': 'Stock Counting',
  'staff-history': 'Operation History'
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  userRole,
  user,
  notifications,
  transfers,
  onNavigate,
  onTriggerDemoStep,
  onViewTransfer,
  onMarkNotificationAsRead,
  onMarkAllAsRead,
  onLogoutClick
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = userRole === 'warehouse_staff'
    ? notifications.filter(n => !n.read).length
    : 0;

  const sortedNotifications = [...notifications].sort((a, b) => {
    if (!a.read && b.read) return -1;
    if (a.read && !b.read) return 1;
    return 0;
  });

  const initials = user?.name
    ? user.name.trim().split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase()
    : (userRole === 'warehouse_staff' ? 'WS' : 'AM');
  const displayName = user?.name || (userRole === 'warehouse_staff' ? 'Warehouse Staff' : 'Alex Morgan');
  const displayRole = userRole === 'manager' ? 'Inventory Lead' : 'Floor Operations';

  return (
    <header className="top-header">
      <div className="header-left">
        <h1 className="page-main-title">{TITLE_MAP[activeTab]}</h1>
      </div>

      <div className="header-right">
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
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            onClick={() => setIsNotifOpen(prev => !prev)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {isNotifOpen && (
            <div className="notification-popover">
              <div className="notif-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="notif-header-title">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="notif-badge-count">{unreadCount} unread</span>
                  )}
                </div>
                {unreadCount > 0 && onMarkAllAsRead && (
                  <button
                    type="button"
                    className="notif-mark-read-btn"
                    onClick={onMarkAllAsRead}
                    title="Mark all notifications as read"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="notif-list">
                {userRole === 'warehouse_staff' ? (
                  notifications.length === 0 ? (
                    <div className="notif-empty-state">
                      <div className="notif-empty-title">No new notifications</div>
                      <div className="notif-empty-desc">You're all caught up.</div>
                    </div>
                  ) : (
                    sortedNotifications.map(n => {
                      const matchingTransfer = transfers.find(t => t.id === n.transferId);
                      const isCompleted = matchingTransfer
                        ? (matchingTransfer.status === 'Done' || matchingTransfer.workflowStep === 'completed')
                        : n.status === 'Completed';
                      const isInProgress = matchingTransfer
                        ? matchingTransfer.workflowStep === 'in_progress'
                        : n.status === 'In Progress';
                      const isUnread = !n.read && !isCompleted;

                      return (
                        <div
                          key={n.id}
                          className={`notif-item ${isUnread ? 'unread' : 'read'}`}
                          onClick={() => {
                            if (!n.read && onMarkNotificationAsRead) {
                              onMarkNotificationAsRead(n.id);
                            }
                          }}
                        >
                          <div className="notif-item-top">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              {isCompleted && (
                                <span style={{ color: 'var(--status-success-text)', fontSize: 13, fontWeight: 700 }}>✓</span>
                              )}
                              <span className="notif-item-title">{n.title}</span>
                              {isUnread && <span className="notif-unread-dot" title="Unread notification"></span>}
                            </div>
                            <span className="notif-item-time">{n.timestamp}</span>
                          </div>

                          <div className="notif-item-detail">{n.quantity} {n.product}</div>
                          <div className="notif-item-route">{n.route}</div>

                          <div className="notif-item-footer">
                            <div>
                              {isCompleted ? (
                                <span className="badge badge-done">Completed</span>
                              ) : isInProgress ? (
                                <span className="badge badge-ready">In Progress</span>
                              ) : (
                                <span className="badge badge-waiting">Waiting for your acceptance</span>
                              )}
                            </div>

                            {!isCompleted && (
                              <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsNotifOpen(false);
                                  onViewTransfer(n.transferId, n.id);
                                }}
                              >
                                View Transfer
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
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

        {/* Profile Menu with Dropdown Popover */}
        <div className="profile-wrapper" ref={profileRef} style={{ position: 'relative' }}>
          <button
            type="button"
            className={`profile-menu-btn ${isProfileOpen ? 'active' : ''}`}
            title="Account Menu"
            onClick={() => setIsProfileOpen(prev => !prev)}
            aria-expanded={isProfileOpen}
          >
            <div className="profile-avatar">
              {initials}
            </div>
            <div className="profile-info-text">
              <div className="profile-name">
                {displayName}
              </div>
              <div className="profile-role">
                {displayRole}
              </div>
            </div>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{
                transform: isProfileOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.15s ease'
              }}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          {isProfileOpen && (
            <div className="profile-dropdown-popover">
              <div className="profile-dropdown-header">
                <div className="profile-avatar-large-sm">{initials}</div>
                <div className="profile-dropdown-user-info">
                  <div className="profile-dropdown-name">{displayName}</div>
                  <div className="profile-dropdown-email">
                    {user?.email || (userRole === 'warehouse_staff' ? 'staff@stocksense.demo' : 'manager@stocksense.demo')}
                  </div>
                  <div className="profile-dropdown-role-badge">
                    {userRole === 'manager' ? 'Manager • Inventory Lead' : 'Warehouse Staff • Operations'}
                  </div>
                </div>
              </div>

              <div className="profile-dropdown-divider"></div>

              <div className="profile-dropdown-actions">
                <button
                  type="button"
                  className="profile-dropdown-item"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onNavigate('profile');
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span>My Profile</span>
                </button>

                <button
                  type="button"
                  className="profile-dropdown-item logout"
                  onClick={() => {
                    setIsProfileOpen(false);
                    if (onLogoutClick) {
                      onLogoutClick();
                    }
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
