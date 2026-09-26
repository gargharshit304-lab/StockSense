import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthUser } from '../types';

interface AuthViewProps {
  mode: 'login' | 'signup';
  onNavigate: (mode: 'login' | 'signup') => void;
  onLoginSuccess: (user: AuthUser) => void;
  onSignupSuccess?: (user?: AuthUser) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  mode,
  onNavigate,
  onSignupSuccess
}) => {
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState('');

  // Signup State
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Field validation error states
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setFieldErrors({});
    setForgotPasswordNotice('');
  };

  const handleUseDemo = (role: 'manager' | 'staff') => {
    clearMessages();
    if (role === 'manager') {
      setLoginEmail('admin@stocksense.com');
      setLoginPassword('password123');
    } else {
      setLoginEmail('staff@stocksense.demo');
      setLoginPassword('staff123');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const errors: Record<string, string> = {};
    if (!loginEmail.trim()) {
      errors.email = 'Please enter your email.';
    }
    if (!loginPassword) {
      errors.password = 'Please enter your password.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { otpToken } = await login(loginEmail.trim(), loginPassword);
      // Navigate to OTP verification page with otpToken in state
      navigate('/login/verify-otp', { state: { otpToken, email: loginEmail.trim() } });
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      setErrorMessage(axiosError.response?.data?.error || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const errors: Record<string, string> = {};
    if (!fullName.trim()) {
      errors.fullName = 'Please enter your full name.';
    }
    if (!signupEmail.trim()) {
      errors.email = 'Please enter your email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail.trim())) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!signupPassword) {
      errors.password = 'Please enter your password.';
    } else if (signupPassword.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (signupPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      await signup(signupEmail.trim(), signupPassword, fullName.trim(), 'INVENTORY_MANAGER');
      setSuccessMessage('Account created successfully. Redirecting to email verification...');
      
      setTimeout(() => {
        if (onSignupSuccess) {
          onSignupSuccess();
        }
        navigate('/verify-email', { state: { email: signupEmail.trim() } });
      }, 800);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      setErrorMessage(axiosError.response?.data?.error || 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      {/* ================================================================
          LEFT SIDE — VISUAL & BRANDING (45%)
          ================================================================ */}
      <div className="auth-visual-panel">
        <div className="auth-visual-overlay"></div>
        <div className="auth-visual-content">
          {/* Top Logo */}
          <div className="auth-brand-badge">
            <div className="auth-brand-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <span className="auth-brand-name">STOCKSENSE</span>
          </div>

          {/* Bottom Value Proposition */}
          <div className="auth-visual-footer">
            <div className="auth-tagline-badge">Enterprise Warehouse Intelligence</div>
            <h2 className="auth-visual-headline">
              Inventory operations,<br />simplified.
            </h2>
            <p className="auth-visual-subtext">
              Track stock. Coordinate operations. Keep every movement accountable.
            </p>

            <div className="auth-highlights-grid">
              <div className="auth-highlight-item">
                <span className="auth-highlight-icon">✓</span>
                <span>Two-step physical transfer verification</span>
              </div>
              <div className="auth-highlight-item">
                <span className="auth-highlight-icon">✓</span>
                <span>Role-tailored manager & floor views</span>
              </div>
              <div className="auth-highlight-item">
                <span className="auth-highlight-icon">✓</span>
                <span>Real-time stock ledger & audit history</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================
          RIGHT SIDE — AUTHENTICATION FORM (55%)
          ================================================================ */}
      <div className="auth-form-panel">
        <div className="auth-form-wrapper">
          {/* Header Mobile Brand (shown on smaller screens) */}
          <div className="auth-mobile-brand">
            <div className="brand-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <span className="brand-name">STOCKSENSE</span>
          </div>

          {/* Form Header */}
          <div className="auth-header-block">
            <span className="auth-kicker">StockSense Enterprise</span>
            <h1 className="auth-title">
              {mode === 'login' ? 'Welcome back' : 'Create your StockSense account'}
            </h1>
            <p className="auth-subtitle">
              {mode === 'login'
                ? 'Sign in to your StockSense account to continue.'
                : 'Set up your account to access warehouse operations.'}
            </p>
          </div>

          {/* Alert Messages */}
          {errorMessage && (
            <div className="auth-alert auth-alert-danger">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="auth-alert auth-alert-success">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          {forgotPasswordNotice && (
            <div className="auth-alert auth-alert-info">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <span>{forgotPasswordNotice}</span>
            </div>
          )}

          {/* ================================================================
              LOGIN FORM
              ================================================================ */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} noValidate className="auth-form">
              <div className="form-group">
                <label className="form-label" htmlFor="login-email">
                  Email Address
                </label>
                <div className="auth-input-wrapper">
                  <input
                    id="login-email"
                    type="email"
                    className={`form-input ${fieldErrors.email ? 'input-error' : ''}`}
                    placeholder="name@company.com"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
                    }}
                    autoComplete="email"
                    disabled={isSubmitting}
                  />
                </div>
                {fieldErrors.email && (
                  <span className="auth-field-error">{fieldErrors.email}</span>
                )}
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" htmlFor="login-password">
                    Password
                  </label>
                  <button
                    type="button"
                    className="auth-link-subtle"
                    onClick={() => setForgotPasswordNotice('Password recovery will be available when authentication is connected.')}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="auth-input-wrapper" style={{ position: 'relative' }}>
                  <input
                    id="login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    className={`form-input ${fieldErrors.password ? 'input-error' : ''}`}
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: '' }));
                    }}
                    autoComplete="current-password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="auth-password-toggle-btn"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    tabIndex={-1}
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? (
                      /* Eye Off */
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      /* Eye On */
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                {fieldErrors.password && (
                  <span className="auth-field-error">{fieldErrors.password}</span>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-auth-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <span className="auth-spinner"></span>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>

              <div className="auth-switch-row">
                <span className="text-secondary">Don't have an account?</span>{' '}
                <button
                  type="button"
                  className="auth-link-primary"
                  onClick={() => {
                    clearMessages();
                    onNavigate('signup');
                  }}
                >
                  Create account
                </button>
              </div>

              {/* Demo Accounts Quick-Fill Box */}
              <div className="auth-demo-accounts-card">
                <div className="auth-demo-header">
                  <div className="auth-demo-title">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                    Demo Accounts
                  </div>
                  <span className="auth-demo-caption">Select to populate credentials</span>
                </div>

                <div className="auth-demo-items-grid">
                  <div className="auth-demo-item">
                    <div className="auth-demo-item-info">
                      <div className="auth-demo-role-pill manager">Manager</div>
                      <div className="auth-demo-email">admin@stocksense.com</div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-purple"
                      onClick={() => handleUseDemo('manager')}
                    >
                      Use Manager Demo
                    </button>
                  </div>

                  <div className="auth-demo-item">
                    <div className="auth-demo-item-info">
                      <div className="auth-demo-role-pill staff">Warehouse Staff</div>
                      <div className="auth-demo-email">staff@stocksense.demo</div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-purple"
                      onClick={() => handleUseDemo('staff')}
                    >
                      Use Staff Demo
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            /* ================================================================
               SIGNUP FORM
               ================================================================ */
            <form onSubmit={handleSignupSubmit} noValidate className="auth-form">
              <div className="form-group">
                <label className="form-label" htmlFor="signup-name">
                  Full Name
                </label>
                <input
                  id="signup-name"
                  type="text"
                  className={`form-input ${fieldErrors.fullName ? 'input-error' : ''}`}
                  placeholder="e.g. Jordan Lee"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (fieldErrors.fullName) setFieldErrors(prev => ({ ...prev, fullName: '' }));
                  }}
                  autoComplete="name"
                  disabled={isSubmitting}
                />
                {fieldErrors.fullName && (
                  <span className="auth-field-error">{fieldErrors.fullName}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-email">
                  Work Email Address
                </label>
                <input
                  id="signup-email"
                  type="email"
                  className={`form-input ${fieldErrors.email ? 'input-error' : ''}`}
                  placeholder="jordan.lee@company.com"
                  value={signupEmail}
                  onChange={(e) => {
                    setSignupEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
                  }}
                  autoComplete="email"
                  disabled={isSubmitting}
                />
                {fieldErrors.email && (
                  <span className="auth-field-error">{fieldErrors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-password">
                  Password
                </label>
                <div className="auth-input-wrapper" style={{ position: 'relative' }}>
                  <input
                    id="signup-password"
                    type={showSignupPassword ? 'text' : 'password'}
                    className={`form-input ${fieldErrors.password ? 'input-error' : ''}`}
                    placeholder="Create a secure password"
                    value={signupPassword}
                    onChange={(e) => {
                      setSignupPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: '' }));
                    }}
                    autoComplete="new-password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="auth-password-toggle-btn"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    tabIndex={-1}
                    aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                  >
                    {showSignupPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                {fieldErrors.password && (
                  <span className="auth-field-error">{fieldErrors.password}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-confirm-password">
                  Confirm Password
                </label>
                <div className="auth-input-wrapper" style={{ position: 'relative' }}>
                  <input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`form-input ${fieldErrors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (fieldErrors.confirmPassword) setFieldErrors(prev => ({ ...prev, confirmPassword: '' }));
                    }}
                    autoComplete="new-password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="auth-password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <span className="auth-field-error">{fieldErrors.confirmPassword}</span>
                )}
              </div>

              {/* Role allocation notice */}
              <div className="auth-role-notice">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--primary-purple)', flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span>
                  New accounts are provisioned with <strong>Warehouse Staff</strong> floor operations privileges. Manager accounts are managed by system administrators.
                </span>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-auth-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <span className="auth-spinner"></span>
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>

              <div className="auth-switch-row">
                <span className="text-secondary">Already have an account?</span>{' '}
                <button
                  type="button"
                  className="auth-link-primary"
                  onClick={() => {
                    clearMessages();
                    onNavigate('login');
                  }}
                >
                  Sign in
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};