import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import client from '../api/client';
import { setAccessToken, getAccessToken } from '../api/client';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ otpToken: string }>;
  verifyLoginOtp: (otpToken: string, otpCode: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, fullName: string, role: string) => Promise<void>;
  verifyEmail: (email: string, otpCode: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const accessToken = getAccessToken();

  const attemptSilentRefresh = useCallback(async () => {
    try {
      const response = await client.post('/auth/refresh');
      const newAccessToken = response.data.accessToken;
      const userData = response.data.user;
      setAccessToken(newAccessToken);
      setUser(userData);
    } catch {
      setAccessToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    attemptSilentRefresh();
  }, [attemptSilentRefresh]);

  const login = async (email: string, password: string) => {
    const response = await client.post('/auth/login', { email, password });
    return { otpToken: response.data.otpToken };
  };

  const verifyLoginOtp = async (otpToken: string, otpCode: string) => {
    const response = await client.post('/auth/login/verify-otp', { otpToken, otpCode });
    const newAccessToken = response.data.accessToken;
    const userData = response.data.user;
    setAccessToken(newAccessToken);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await client.post('/auth/logout');
    } catch {
      // Ignore logout errors
    } finally {
      setAccessToken(null);
      setUser(null);
      window.location.href = '/login';
    }
  };

  const signup = async (email: string, password: string, fullName: string, role: string) => {
    await client.post('/auth/signup', { email, password, fullName, role });
  };

  const verifyEmail = async (email: string, otpCode: string) => {
    await client.post('/auth/verify-email', { email, otpCode });
  };

  const forgotPassword = async (email: string) => {
    await client.post('/auth/forgot-password', { email });
  };

  const resetPassword = async (token: string, password: string) => {
    await client.post('/auth/reset-password', { token, password });
  };

  const resendVerification = async (email: string) => {
    await client.post('/auth/resend-verification', { email });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        login,
        verifyLoginOtp,
        logout,
        signup,
        verifyEmail,
        forgotPassword,
        resetPassword,
        resendVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};