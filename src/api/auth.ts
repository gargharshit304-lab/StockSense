import client from './client';

export interface LoginResponse {
  otpToken: string;
}

export interface VerifyOtpResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
}

export interface SignupData {
  email: string;
  password: string;
  fullName: string;
  role: string;
}

export interface VerifyEmailData {
  email: string;
  otpCode: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface ResendVerificationData {
  email: string;
}

export interface RefreshResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
}

export const authApi = {
  login: (email: string, password: string) =>
    client.post<LoginResponse>('/auth/login', { email, password }),

  verifyLoginOtp: (otpToken: string, otpCode: string) =>
    client.post<VerifyOtpResponse>('/auth/login/verify-otp', { otpToken, otpCode }),

  signup: (data: SignupData) =>
    client.post('/auth/signup', data),

  verifyEmail: (data: VerifyEmailData) =>
    client.post('/auth/verify-email', data),

  resendVerification: (data: ResendVerificationData) =>
    client.post('/auth/resend-verification', data),

  refresh: () =>
    client.post<RefreshResponse>('/auth/refresh'),

  logout: () =>
    client.post('/auth/logout'),

  logoutAll: () =>
    client.post('/auth/logout-all'),

  forgotPassword: (data: ForgotPasswordData) =>
    client.post('/auth/forgot-password', data),

  resetPassword: (data: ResetPasswordData) =>
    client.post('/auth/reset-password', data),
};