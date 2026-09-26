import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const VerifyOtpPage: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { verifyLoginOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const otpToken = (location.state as { otpToken?: string })?.otpToken;

  useEffect(() => {
    if (!otpToken) {
      navigate('/login', { replace: true });
    }
  }, [otpToken, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpToken) return;

    setError('');
    setIsLoading(true);

    try {
      await verifyLoginOtp(otpToken, otp);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      setError(axiosError.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!otpToken) {
    return null;
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Verify OTP</h1>
        <p className="auth-subtitle">Enter the 6-digit code sent to your email</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="otp">OTP Code</label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
              pattern="[0-9]{6}"
              inputMode="numeric"
              autoComplete="one-time-code"
              disabled={isLoading}
              placeholder="000000"
            />
          </div>

          <button type="submit" className="btn btn-primary auth-btn" disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Verify'}
          </button>
        </form>

        <div className="auth-links">
          <p>
            <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
              Back to login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};