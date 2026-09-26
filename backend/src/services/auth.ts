import prisma from '../utils/prisma';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateAccessToken, generateOtpToken, generateRefreshToken, hashRefreshToken, verifyOtpToken } from '../utils/jwt';
import { sendOtpEmail } from '../utils/sendEmail';
import { OtpPurpose, UserRole } from '@prisma/client';
import env from '../config';

const OTP_EXPIRY_MINUTES = 5;
const PASSWORD_RESET_EXPIRY_MINUTES = 10;

function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function createOtpVerification(userId: string, purpose: OtpPurpose, expiresMinutes: number): Promise<string> {
  const otpCode = generateOtpCode();
  const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);

  await prisma.otpVerification.create({
    data: {
      userId,
      otpCode,
      purpose,
      expiresAt,
    },
  });

  return otpCode;
}

async function verifyOtpCode(userId: string, purpose: OtpPurpose, otpCode: string): Promise<boolean> {
  const otpRecord = await prisma.otpVerification.findFirst({
    where: {
      userId,
      purpose,
      otpCode,
      isUsed: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!otpRecord) return false;

  await prisma.otpVerification.update({
    where: { id: otpRecord.id },
    data: { isUsed: true },
  });

  return true;
}

export const authService = {
  async signup(data: { email: string; password: string; fullName: string; role: UserRole }) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        role: data.role,
        isTwoFactorEnabled: true,
      },
    });

    const otpCode = await createOtpVerification(user.id, 'EMAIL_VERIFY', OTP_EXPIRY_MINUTES);
    await sendOtpEmail({ to: user.email, otpCode, purpose: 'EMAIL_VERIFY', userName: user.fullName });

    return { message: 'Registration successful. Please check your email to verify your account.' };
  },

  async login(email: string, password: string, userAgent?: string, ipAddress?: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    if (!user.isEmailVerified) {
      throw new Error('EMAIL_NOT_VERIFIED');
    }

    const otpCode = await createOtpVerification(user.id, 'LOGIN_2FA', OTP_EXPIRY_MINUTES);
    await sendOtpEmail({ to: user.email, otpCode, purpose: 'LOGIN_2FA', userName: user.fullName });

    const otpToken = generateOtpToken({ userId: user.id, purpose: 'LOGIN_2FA' });

    return { message: 'OTP sent to your email', otpToken };
  },

  async verifyEmail(email: string, otpCode: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return generic success to avoid user enumeration
      return { message: 'If the email exists, the verification OTP has been processed' };
    }

    if (user.isEmailVerified) {
      return { message: 'Email already verified' };
    }

    const isValid = await verifyOtpCode(user.id, 'EMAIL_VERIFY', otpCode);
    if (!isValid) {
      throw new Error('INVALID_OTP_CODE');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true },
    });

    return { message: 'Email verified successfully' };
  },

  async resendVerification(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && !user.isEmailVerified) {
      const otpCode = await createOtpVerification(user.id, 'EMAIL_VERIFY', OTP_EXPIRY_MINUTES);
      await sendOtpEmail({ to: user.email, otpCode, purpose: 'EMAIL_VERIFY', userName: user.fullName });
    }
    // Always return generic success to avoid user enumeration
    return { message: 'If the email exists and is not verified, a new verification OTP has been sent' };
  },

  async verifyOtp(otpToken: string, otpCode: string, userAgent?: string, ipAddress?: string) {
    const payload = verifyOtpToken(otpToken);
    if (!payload || payload.purpose !== 'LOGIN_2FA') {
      throw new Error('INVALID_OTP_TOKEN');
    }

    const isValid = await verifyOtpCode(payload.userId, 'LOGIN_2FA', otpCode);
    if (!isValid) {
      throw new Error('INVALID_OTP_CODE');
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshToken);
    const expiresAt = new Date(Date.now() + env.JWT_REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt,
        userAgent,
        ipAddress,
      },
    });

    return { accessToken, refreshToken, user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role } };
  },

  async refresh(refreshToken: string, userAgent?: string, ipAddress?: string) {
    const tokenHash = hashRefreshToken(refreshToken);

    const matchedToken = await prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!matchedToken) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    await prisma.refreshToken.update({
      where: { id: matchedToken.id },
      data: { isRevoked: true },
    });

    const user = await prisma.user.findUnique({ where: { id: matchedToken.userId } });
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    const newAccessToken = generateAccessToken({ userId: user.id, role: user.role });
    const newRefreshToken = generateRefreshToken();
    const newRefreshTokenHash = hashRefreshToken(newRefreshToken);
    const newExpiresAt = new Date(Date.now() + env.JWT_REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: newRefreshTokenHash,
        expiresAt: newExpiresAt,
        userAgent,
        ipAddress,
      },
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  async logout(refreshToken: string) {
    const tokenHash = hashRefreshToken(refreshToken);

    await prisma.refreshToken.updateMany({
      where: {
        tokenHash,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      data: { isRevoked: true },
    });

    return { message: 'Logged out successfully' };
  },

  async logoutAll(userId: string) {
    await prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });

    return { message: 'Logged out of all devices' };
  },

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const otpCode = await createOtpVerification(user.id, 'PASSWORD_RESET', PASSWORD_RESET_EXPIRY_MINUTES);
      await sendOtpEmail({ to: user.email, otpCode, purpose: 'PASSWORD_RESET', userName: user.fullName });
    }
    return { message: 'If the email exists, a password reset OTP has been sent' };
  },

  async resetPassword(email: string, otpCode: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    const isValid = await verifyOtpCode(user.id, 'PASSWORD_RESET', otpCode);
    if (!isValid) {
      throw new Error('INVALID_OTP_CODE');
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    await prisma.refreshToken.updateMany({
      where: { userId: user.id, isRevoked: false },
      data: { isRevoked: true },
    });

    return { message: 'Password reset successful. Please log in again.' };
  },
};