import jwt, { SignOptions } from 'jsonwebtoken';
import { randomBytes, createHash } from 'crypto';
import env from '../config';

export interface AccessTokenPayload {
  userId: string;
  role: string;
}

export interface OtpTokenPayload {
  userId: string;
  purpose: 'LOGIN_2FA';
}

const accessTokenOptions: SignOptions = { expiresIn: env.JWT_ACCESS_EXPIRY as SignOptions['expiresIn'] };
const otpTokenOptions: SignOptions = { expiresIn: env.JWT_OTP_EXPIRY as SignOptions['expiresIn'] };

export function generateAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, accessTokenOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
  } catch {
    return null;
  }
}

export function generateOtpToken(payload: OtpTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, otpTokenOptions);
}

export function verifyOtpToken(token: string): OtpTokenPayload | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as OtpTokenPayload;
  } catch {
    return null;
  }
}

export function generateRefreshToken(): string {
  return randomBytes(64).toString('hex');
}

// SHA-256 is appropriate here because raw refresh tokens are high-entropy
// 64-byte random strings (not low-entropy passwords), so a fast deterministic
// hash allows direct indexed lookup without bcrypt's intentional slowness.
export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}