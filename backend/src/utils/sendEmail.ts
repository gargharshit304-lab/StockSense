import { Resend } from 'resend';
import env from '../config';

const resend = new Resend(env.RESEND_API_KEY);

interface SendOtpEmailParams {
  to: string;
  otpCode: string;
  purpose: 'LOGIN_2FA' | 'PASSWORD_RESET' | 'EMAIL_VERIFY';
  userName?: string;
}

const purposeMessages: Record<SendOtpEmailParams['purpose'], { subject: string; action: string }> = {
  LOGIN_2FA: { subject: 'Your StockSense Login OTP', action: 'log in' },
  PASSWORD_RESET: { subject: 'Your StockSense Password Reset OTP', action: 'reset your password' },
  EMAIL_VERIFY: { subject: 'Verify Your StockSense Email', action: 'verify your email' },
};

export async function sendOtpEmail({ to, otpCode, purpose, userName }: SendOtpEmailParams): Promise<void> {
  const { subject, action } = purposeMessages[purpose];
  const name = userName || 'User';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8f9fa; border-radius: 8px; padding: 32px;">
          <h1 style="color: #1a1a2e; margin-top: 0;">StockSense</h1>
          <p>Hi ${name},</p>
          <p>Your OTP to <strong>${action}</strong> is:</p>
          <div style="background: #fff; border: 2px solid #1a1a2e; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #1a1a2e; font-family: monospace;">${otpCode}</span>
          </div>
          <p style="color: #666; font-size: 14px;">This code expires in 5 minutes. If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;">
          <p style="color: #999; font-size: 12px;">StockSense Inventory Management System</p>
        </div>
      </body>
    </html>
  `;

  const text = `
StockSense - ${subject}

Hi ${name},

Your OTP to ${action} is: ${otpCode}

This code expires in 5 minutes. If you didn't request this, please ignore this email.

StockSense Inventory Management System
  `.trim();

  await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject,
    html,
    text,
  });
}