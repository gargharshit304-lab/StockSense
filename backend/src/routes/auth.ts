import { Router } from 'express';
import { authController } from '../controllers/auth';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { authRateLimiter } from '../middleware/rateLimit';
import {
  signupSchema,
  loginSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
} from '../validators/auth';

const router = Router();

router.post('/signup', validate(signupSchema), authController.signup);

router.post('/login', authRateLimiter, validate(loginSchema), authController.login);

router.post('/login/verify-otp', authRateLimiter, validate(verifyOtpSchema), authController.verifyOtp);

router.post('/verify-email', authRateLimiter, validate(verifyEmailSchema), authController.verifyEmail);

router.post('/resend-verification', authRateLimiter, validate(resendVerificationSchema), authController.resendVerification);

router.post('/refresh', authController.refresh);

router.post('/logout', authController.logout);

router.post('/logout-all', authenticate, authController.logoutAll);

router.post('/forgot-password', authRateLimiter, validate(forgotPasswordSchema), authController.forgotPassword);

router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

export default router;