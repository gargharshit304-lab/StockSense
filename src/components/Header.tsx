import React, { useState, useRef, useEffect } from 'react';
import { TabType } from '../types';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onMenuClick: () => void;
  onLogout: () => void;
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
  onTabChange,
  onMenuClick,
  onLogout
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { user: authUser } = useAuth();

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = authUser?.fullName
    ? authUser.fullName.trim().split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase()
    : 'AM';
  const displayName = authUser?.fullName || 'User';
  const displayRole = authUser?.role === 'ADMIN' ? 'Administrator' : authUser?.role === 'INVENTORY_MANAGER' ? 'Inventory Manager' : 'Warehouse Staff';

  return (
    <header className="top-header">
      <div className="header-left">
        <button
          type="button"
          className="header-menu-btn"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h1 className="page-main-title">{TITLE_MAP[activeTab]}</h1>
      </div>

      <div className="header-right">
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
                    {authUser?.email || 'user@example.com'}
                  </div>
                  <div className="profile-dropdown-role-badge">
                    {displayRole}
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
                    onTabChange('profile');
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
                    onLogout();
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