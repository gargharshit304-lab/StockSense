import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { authService } from '../services/auth';
import env from '../config';

const REFRESH_COOKIE_NAME = 'refreshToken';

function setRefreshTokenCookie(res: Response, token: string): void {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: env.JWT_REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    path: '/auth',
  });
}

function clearRefreshTokenCookie(res: Response): void {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/auth',
  });
}

export const authController = {
  async signup(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await authService.signup(req.body);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error && error.message === 'EMAIL_ALREADY_EXISTS') {
        res.status(409).json({ error: 'Email already registered' });
        return;
      }
      throw error;
    }
  },

  async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip;

      const result = await authService.login(email, password, userAgent, ipAddress);
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'INVALID_CREDENTIALS') {
          res.status(401).json({ error: 'Invalid email or password' });
          return;
        }
        if (error.message === 'EMAIL_NOT_VERIFIED') {
          res.status(403).json({ error: 'Email not verified. Please verify your email before logging in.' });
          return;
        }
      }
      throw error;
    }
  },

  async verifyOtp(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { otpToken, otpCode } = req.body;
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip;

      const result = await authService.verifyOtp(otpToken, otpCode, userAgent, ipAddress);
      setRefreshTokenCookie(res, result.refreshToken);
      res.json({ accessToken: result.accessToken, user: result.user });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'INVALID_OTP_TOKEN') {
          res.status(401).json({ error: 'Invalid or expired OTP token' });
          return;
        }
        if (error.message === 'INVALID_OTP_CODE') {
          res.status(401).json({ error: 'Invalid or expired OTP code' });
          return;
        }
        if (error.message === 'USER_NOT_FOUND') {
          res.status(404).json({ error: 'User not found' });
          return;
        }
      }
      throw error;
    }
  },

  async refresh(req: AuthRequest, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        res.status(401).json({ error: 'Refresh token not found' });
        return;
      }

      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip;

      const result = await authService.refresh(refreshToken, userAgent, ipAddress);
      setRefreshTokenCookie(res, result.refreshToken);
      res.json({ accessToken: result.accessToken });
    } catch (error) {
      if (error instanceof Error && error.message === 'INVALID_REFRESH_TOKEN') {
        clearRefreshTokenCookie(res);
        res.status(401).json({ error: 'Invalid or expired refresh token' });
        return;
      }
      throw error;
    }
  },

  async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
      clearRefreshTokenCookie(res);
      res.json({ message: 'Logged out successfully' });
    } catch {
      clearRefreshTokenCookie(res);
      res.json({ message: 'Logged out successfully' });
    }
  },

  async logoutAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }
      await authService.logoutAll(req.user.userId);
      clearRefreshTokenCookie(res);
      res.json({ message: 'Logged out of all devices' });
    } catch (error) {
      clearRefreshTokenCookie(res);
      throw error;
    }
  },

  async forgotPassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword(email);
      res.json(result);
    } catch (error) {
      throw error;
    }
  },

  async resetPassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, otpCode, newPassword } = req.body;
      const result = await authService.resetPassword(email, otpCode, newPassword);
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'USER_NOT_FOUND') {
          res.status(404).json({ error: 'User not found' });
          return;
        }
        if (error.message === 'INVALID_OTP_CODE') {
          res.status(401).json({ error: 'Invalid or expired OTP code' });
          return;
        }
      }
      throw error;
    }
  },

  async verifyEmail(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, otpCode } = req.body;
      const result = await authService.verifyEmail(email, otpCode);
      res.json(result);
    } catch (error) {
      if (error instanceof Error && error.message === 'INVALID_OTP_CODE') {
        res.status(401).json({ error: 'Invalid or expired OTP code' });
        return;
      }
      throw error;
    }
  },

  async resendVerification(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const result = await authService.resendVerification(email);
      res.json(result);
    } catch (error) {
      throw error;
    }
  },
};