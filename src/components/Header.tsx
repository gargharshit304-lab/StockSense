import React from 'react';
import { TabType } from '../types';

interface HeaderProps {
  activeTab: TabType;
  onNavigate: (tab: TabType) => void;
  onTriggerDemoStep: (step: number) => void;
  onNotificationClick: () => void;
}

const TITLE_MAP: Record<TabType, string> = {
  dashboard: 'Dashboard',
  products: 'Products',
  receipts: 'Receipts',
  'delivery-orders': 'Delivery Orders',
  'inventory-adjustment': 'Inventory Adjustment',
  'move-history': 'Move History',
  warehouse: 'Warehouse',
  profile: 'My Profile'
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onNavigate,
  onTriggerDemoStep,
  onNotificationClick
}) => {
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

        {/* Notification Icon */}
        <button
          type="button"
          className="icon-btn"
          title="Notifications"
          aria-label="Notifications"
          onClick={onNotificationClick}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span className="notification-badge"></span>
        </button>

        {/* Profile Menu */}
        <div
          className="profile-menu-btn"
          title="View Profile"
          onClick={() => onNavigate('profile')}
        >
          <div className="profile-avatar">AM</div>
          <div className="profile-info-text">
            <div className="profile-name">Manager</div>
            <div className="profile-role">Inventory Lead</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
    </header>
  );
};
