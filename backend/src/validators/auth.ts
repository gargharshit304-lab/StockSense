import { z } from 'zod';

export const signupSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    role: z.enum(['ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF']).default('WAREHOUSE_STAFF'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    otpToken: z.string().min(1, 'OTP token is required'),
    otpCode: z.string().length(6, 'OTP code must be 6 digits'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    otpCode: z.string().length(6, 'OTP code must be 6 digits'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    otpCode: z.string().length(6, 'OTP code must be 6 digits'),
  }),
});

export const resendVerificationSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const refreshSchema = z.object({});

export const logoutSchema = z.object({});

export const logoutAllSchema = z.object({});