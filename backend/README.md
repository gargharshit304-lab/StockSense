# StockSense - Inventory Management System (Backend)

A production-ready authentication backend built with **Express.js + Prisma (PostgreSQL) + TypeScript**.

## Features

- **User Authentication**: Signup, login with 2FA (OTP via email)
- **Email Verification**: Complete email verification flow with resend capability
- **Password Reset**: Secure OTP-based password reset
- **Token Management**: JWT access tokens (20min) + rotating refresh tokens (30 days, httpOnly cookies)
- **Rate Limiting**: 5 requests per 15 minutes per IP+email on sensitive endpoints
- **Role-Based Access**: ADMIN, INVENTORY_MANAGER, WAREHOUSE_STAFF
- **Security**: bcrypt (cost 12), SHA-256 for refresh token lookups, secure cookie flags

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Validation**: Zod
- **Email**: Resend
- **Auth**: jsonwebtoken, bcrypt

## Project Structure

```
src/
├── config/         # Environment validation (Zod)
├── controllers/    # HTTP request handlers
├── middleware/     # Auth, validation, rate limiting
├── routes/         # Express routers
├── services/       # Business logic
├── utils/          # Prisma client, JWT, password, email
├── validators/     # Zod schemas
├── app.ts          # Express app setup
└── server.ts       # Entry point
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)
- Resend account for emails

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Seed initial data (admin user, warehouses, products, etc.)
npm run prisma:seed

# Start development server
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-super-secret-jwt-key-min-32-chars-long"
RESEND_API_KEY="re_XXXXXXXXXXXXXXXXXXXXXXXX"
EMAIL_FROM="noreply@yourdomain.com"
FRONTEND_URL="http://localhost:3000"
```

See `.env.example` for all available options.

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register new user (sends verification email) |
| POST | `/auth/login` | Step 1: Verify credentials, sends 2FA OTP |
| POST | `/auth/login/verify-otp` | Step 2: Verify OTP, returns access + refresh token |
| POST | `/auth/verify-email` | Verify email with OTP |
| POST | `/auth/resend-verification` | Resend verification email |
| POST | `/auth/refresh` | Rotate refresh token, issue new access token |
| POST | `/auth/logout` | Revoke current refresh token |
| POST | `/auth/logout-all` | Revoke all user's refresh tokens |
| POST | `/auth/forgot-password` | Send password reset OTP |
| POST | `/auth/reset-password` | Reset password with OTP |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server status |

## Example Requests

```bash
# Signup
curl -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","fullName":"John Doe","role":"WAREHOUSE_STAFF"}'

# Login (step 1)
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Login (step 2 - verify OTP)
curl -X POST http://localhost:4000/auth/login/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"otpToken":"<otp_token_from_step1>","otpCode":"123456"}'

# Verify email
curl -X POST http://localhost:4000/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","otpCode":"123456"}'

# Refresh token (cookie-based)
curl -X POST http://localhost:4000/auth/refresh \
  -H "Cookie: refreshToken=<refresh_token>"

# Logout
curl -X POST http://localhost:4000/auth/logout \
  -H "Cookie: refreshToken=<refresh_token>"
```

## Database Schema

Key models:
- **User**: id, email, passwordHash, fullName, role, isTwoFactorEnabled, isEmailVerified
- **OtpVerification**: id, userId, otpCode, purpose (LOGIN_2FA, PASSWORD_RESET, EMAIL_VERIFY), expiresAt, isUsed
- **RefreshToken**: id, userId, tokenHash (SHA-256), expiresAt, isRevoked, userAgent, ipAddress
- **Warehouse/Location**: Multi-warehouse inventory locations
- **Product/Category/Uom**: Product catalog
- **StockQuant**: On-hand quantities per product per location
- **StockPicking/StockMove**: Inventory movements (receipts, deliveries, transfers)

## Scripts

```bash
npm run dev           # Start dev server with hot reload
npm run build         # Compile TypeScript
npm run start         # Run compiled production build
npm run prisma:generate   # Generate Prisma client
npm run prisma:push     # Push schema to database
npm run prisma:migrate  # Create migration
npm run prisma:migrate:prod # Apply migrations in production
npm run prisma:studio   # Open Prisma Studio
npm run prisma:seed     # Seed database
npm run db:setup        # Full setup: generate + push + seed
```

## License

MIT