import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const VerifyEmailPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const emailFromQuery = searchParams.get('email');
    const emailFromState = (location.state as { email?: string })?.email;
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    } else if (emailFromState) {
      setEmail(emailFromState);
    }
  }, [searchParams, location.state]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await verifyEmail(email, otp);
      navigate('/login', { replace: true });
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      setError(axiosError.response?.data?.error || 'Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setError('');
    try {
      await resendVerification(email);
      alert('Verification email sent!');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      setError(axiosError.response?.data?.error || 'Failed to resend verification email.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Verify Email</h1>
        <p className="auth-subtitle">Enter the verification code sent to your email</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleVerify}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="otp">Verification Code</label>
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
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="auth-links">
          <p>
            <button type="button" onClick={handleResend} disabled={isLoading || !email}>
              Resend verification email
            </button>
          </p>
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