import React from 'react';
import { UserRole, AuthUser } from '../types';

interface ProfileViewProps {
  userRole: UserRole;
  user?: AuthUser | null;
  onLogoutClick: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ userRole, user, onLogoutClick }) => {
  const isStaff = userRole === 'warehouse_staff';
  const name = user?.name || (isStaff ? 'Warehouse Staff' : 'Alex Morgan');
  const email = user?.email || (isStaff ? 'staff@stocksense.demo' : 'manager@stocksense.demo');
  const initials = user?.name
    ? user.name.trim().split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase()
    : (isStaff ? 'WS' : 'AM');

  return (
    <section className="page-view active">
      <div className="page-heading-block">
        <div>
          <h2 className="page-title">My Profile</h2>
          <p className="page-subtitle">User credentials and session role details</p>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-large">
          {initials}
        </div>

        <div className="profile-field-row">
          <span className="profile-field-label">Full Name:</span>
          <span className="profile-field-value">{name}</span>
        </div>

        <div className="profile-field-row">
          <span className="profile-field-label">Email:</span>
          <span className="profile-field-value">{email}</span>
        </div>

        <div className="profile-field-row">
          <span className="profile-field-label">System Role:</span>
          <span className="profile-field-value">{isStaff ? 'Warehouse Staff (Operations)' : 'Inventory Operations Lead'}</span>
        </div>

        <div className="profile-field-row">
          <span className="profile-field-label">Assigned Facility:</span>
          <span className="profile-field-value">{isStaff ? 'Main Warehouse / Production Rack' : 'Main Warehouse'}</span>
        </div>

        <div className="profile-field-row">
          <span className="profile-field-label">System Status:</span>
          <span className="profile-field-value">
            <span className="badge badge-done">Active Operator</span>
          </span>
        </div>

        <div className="profile-field-row" style={{ borderBottom: 'none', paddingTop: 24 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onLogoutClick}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout from System
          </button>
        </div>
      </div>
    </section>
  );
};
