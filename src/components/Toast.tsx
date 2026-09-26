import React from 'react';
import { ToastNotification } from '../types';

interface ToastProps {
  toasts: ToastNotification[];
}

export const Toast: React.FC<ToastProps> = ({ toasts }) => {
  return (
    <div className="toast-container">
      {toasts.map(toast => {
        let iconSvg = (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        );

        if (toast.type === 'success') {
          iconSvg = (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          );
        } else if (toast.type === 'danger') {
          iconSvg = (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          );
        }

        return (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {iconSvg}
            <div className="toast-message">{toast.message}</div>
          </div>
        );
      })}
    </div>
  );
};
