import React from 'react';

interface ProfileViewProps {
  onLogoutClick: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onLogoutClick }) => {
  return (
    <section className="page-view active">
      <div className="page-heading-block">
        <div>
          <h2 className="page-title">My Profile</h2>
          <p className="page-subtitle">User credentials and session role details</p>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-large">AM</div>

        <div className="profile-field-row">
          <span className="profile-field-label">Full Name:</span>
          <span className="profile-field-value">Harshit</span>
        </div>

        <div className="profile-field-row">
          <span className="profile-field-label">Email:</span>
          <span className="profile-field-value">manager@gmail.com</span>
        </div>

        <div className="profile-field-row">
          <span className="profile-field-label">System Role:</span>
          <span className="profile-field-value">Inventory Operations Lead</span>
        </div>

        <div className="profile-field-row">
          <span className="profile-field-label">Assigned Facility:</span>
          <span className="profile-field-value">Main Warehouse</span>
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
