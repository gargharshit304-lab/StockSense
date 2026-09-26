# StockSense - Inventory Management System

A full-stack inventory management system with role-based access control, built with React (frontend) and Express.js + Prisma (backend).

## Overview

StockSense provides a complete warehouse inventory management solution with two distinct user roles:
- **Inventory Manager** - Full inventory control, reporting, and oversight
- **Warehouse Staff** - Operational execution (picking, packing, transfers, stock counting)

## Features

### Inventory Manager (Manager Role)
- **Dashboard** - Real-time stock overview, low stock alerts, pending operations
- **Products** - CRUD product catalog with categories, UoM, reordering rules
- **Receipts** - Inbound inventory receiving with validation workflow
- **Delivery Orders** - Pick → Pack → Validate dispatch workflow
- **Inventory Adjustment** - Physical count reconciliation with variance tracking
- **Move History** - Complete audit trail of all stock movements
- **Warehouse Management** - Multi-location transfers with staff notifications

### Warehouse Staff (Staff Role)
- **Staff Dashboard** - Task-focused view with pending operations
- **Internal Transfers** - Accept → Execute → Confirm transfer workflow
- **Delivery Picking** - Pick → Pack → Validate customer orders
- **Stock Counting** - Physical inventory counting with adjustments
- **Operation History** - Personal task completion timeline
- **Real-time Notifications** - New transfer alerts with status tracking

### Authentication & Security
- JWT access tokens (short-lived) + rotating refresh tokens (httpOnly cookies)
- Role-based route guards (client & server)
- Email verification & password reset flows
- Rate limiting on sensitive endpoints
- bcrypt password hashing (cost 12)

## Tech Stack

### Frontend
- **React 18** + TypeScript
- **Vite** for build & dev server
- **CSS Modules** / custom CSS (no external UI library)
- **localStorage** for state persistence (demo mode)

### Backend
- **Node.js 18+** + Express.js
- **Prisma ORM** + PostgreSQL (Supabase)
- **Zod** for request validation
- **Resend** for transactional emails
- **jsonwebtoken** + **bcryptjs** for auth

## Project Structure

```
StockSense-front/
├── src/                    # Frontend source
│   ├── components/         # React components
│   │   ├── AuthView.tsx    # Login/Signup
│   │   ├── Sidebar.tsx     # Navigation
│   │   ├── Header.tsx      # Top bar with notifications
│   │   ├── DashboardView.tsx
│   │   ├── StaffDashboardView.tsx
│   │   ├── ProductsView.tsx
│   │   ├── ReceiptsView.tsx
│   │   ├── DeliveryOrdersView.tsx
│   │   ├── InventoryAdjustmentView.tsx
│   │   ├── MoveHistoryView.tsx
│   │   ├── WarehouseView.tsx
│   │   ├── StaffOperationHistoryView.tsx
│   │   ├── ProfileView.tsx
│   │   ├── Modals.tsx      # All creation modals
│   │   └── Toast.tsx       # Notifications
│   ├── App.tsx             # Main app with routing & state
│   ├── types.ts            # TypeScript interfaces
│   ├── initialData.ts      # Demo seed data
│   └── main.tsx            # Entry point
├── backend/                # Backend source
│   ├── src/
│   │   ├── config/         # Env validation (Zod)
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, validation, rate limit
│   │   ├── routes/         # Express routers
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Prisma, JWT, password, email
│   │   ├── validators/     # Zod schemas
│   │   ├── app.ts          # Express setup
│   │   └── server.ts       # Entry point
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Database seeding
│   └── package.json
├── public/                 # Static assets
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (Supabase recommended)
- Resend account for emails (backend)

### Frontend Setup

```bash
# From project root
npm install
npm run dev          # Starts on http://localhost:3000
npm run build        # Production build
npm run preview      # Preview production build
```

### Backend Setup

```bash
cd backend
npm install

# Generate Prisma client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Seed initial data (admin user, warehouses, products)
npm run prisma:seed

# Start development server (default: http://localhost:4000)
npm run dev
```

### Environment Variables (Backend)

Copy `backend/.env.example` to `backend/.env` and configure:

```env
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars-long"
RESEND_API_KEY="re_XXXXXXXXXXXXXXXXXXXXXXXX"
EMAIL_FROM="noreply@yourdomain.com"
FRONTEND_URL="http://localhost:3000"
PORT=4000
```

## Demo Mode

The frontend runs in **demo mode** by default using localStorage for persistence. No backend connection required for UI exploration.

### Demo Credentials
- **Manager**: `manager@stocksense.com` / `manager123`
- **Warehouse Staff**: `staff@stocksense.com` / `staff123`

### Demo Presentation Steps
The app includes a built-in 5-step demo flow (accessible from Manager Dashboard header):
1. **Receive Goods** - Validate receipt (+50 kg Steel Rods)
2. **Transfer Stock** - Schedule internal transfer (Manager view only)
3. **Deliver Goods** - Pick → Pack → Validate delivery (-20 kg)
4. **Adjust Inventory** - Physical count reconciliation (-3 kg damaged)
5. **Verify Ledger** - Complete move history audit trail

## Key Workflows

### Receipt Validation (Stock Increase)
1. Manager creates receipt → Status: `Ready`
2. Manager validates receipt → Stock increases + Move History entry

### Delivery Order (Stock Decrease)
1. Manager creates delivery → Step: `pick`
2. Staff picks → Step: `pack`
3. Staff packs → Step: `validate`
4. Manager validates → Stock decreases + Move History + Staff Operation log

### Internal Transfer (Dual Role)
1. Manager schedules transfer → Status: `Waiting`, Notifies Staff
2. Staff accepts → Status: `In Progress` (stock UNCHANGED)
3. Staff physically moves goods
4. Staff confirms → Status: `Completed`, Stock rebalanced + Move History + Staff Operation log

### Inventory Adjustment
1. Manager/Staff performs physical count
2. System calculates variance (Physical - Recorded)
3. Adjustment applied → Stock corrected + Move History + Staff Operation log

## Database Schema (Prisma)

Key models:
- **User** - Authentication & roles
- **OtpVerification** - 2FA, email verify, password reset
- **RefreshToken** - Rotating token store (SHA-256 hashed)
- **Warehouse/Location** - Multi-location support
- **Product/Category/Uom** - Product catalog
- **StockQuant** - On-hand quantities per product per location
- **StockPicking/StockMove** - Receipts, deliveries, transfers
- **InventoryAdjustment** - Physical count records

## API Endpoints (Backend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register user |
| POST | `/auth/login` | Step 1: Credentials + send 2FA |
| POST | `/auth/login/verify-otp` | Step 2: Verify OTP → tokens |
| POST | `/auth/verify-email` | Email verification |
| POST | `/auth/refresh` | Rotate refresh token |
| POST | `/auth/logout` | Revoke current token |
| POST | `/auth/forgot-password` | Send reset OTP |
| POST | `/auth/reset-password` | Reset with OTP |
| GET | `/health` | Health check |

## Scripts

### Frontend (Root)
```bash
npm run dev      # Dev server (port 3000)
npm run build    # TypeScript compile + Vite build
npm run preview  # Preview build
```

### Backend (backend/)
```bash
npm run dev              # Dev server with hot reload (tsx watch)
npm run build            # Compile TypeScript
npm run start            # Run production build
npm run prisma:generate  # Generate Prisma client
npm run prisma:push      # Push schema (dev)
npm run prisma:migrate   # Create migration
npm run prisma:migrate:prod # Apply migrations (prod)
npm run prisma:studio    # Open Prisma Studio
npm run prisma:seed      # Seed database
npm run db:setup         # Full setup: generate + push + seed
```

## License

MIT