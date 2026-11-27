# LedgerGuard Client — Frontend Dashboard

A modern, enterprise-grade React 19 + TypeScript + Vite frontend for LedgerGuard, a multi-tenant billing engine with distributed Redis idempotency locks and MongoDB ACID transactions.

---

## 📌 Features & Capabilities

- **Multi-Tenant Authentication**: Secure sign-up and login generating organization-scoped JWTs. Session tokens are securely managed via `sessionStorage` and automatic token-expiration handlers.
- **Strict Tenant Isolation**: The frontend strictly relies on JWT claims for tenant context. The client never transmits `x-tenant-id` or overrides tenant database routing.
- **Idempotent Billing Ledger**: Live transactional ledger displaying transactions recorded in the tenant's isolated database. Supports search, status filtering, and CSV statement exports.
- **ACID Transaction & Rollback Resiliency**: Real-time modal for recording billing events with client-generated UUID `eventId` idempotency keys. Features a developer rollback simulation demonstrating backend transaction aborts without balance deduction.
- **Loading & State Management**: Graceful loading skeleton states, error boundaries with manual retry actions, and alert notifications.

---

## ⚙️ Prerequisites

- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**: v9.0.0 or later
- **Backend Service**: LedgerGuard Express backend running at `http://localhost:5000` with active MongoDB and Redis connections.

---

## 🛠️ Setup & Installation

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Verify `VITE_API_URL` points to your backend API gateway:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

---

## 🚀 Running the Client

- **Development Mode** (Vite HMR on port 5173):
  ```bash
  npm run dev
  ```
  Access the web interface at `http://localhost:5173`.

- **Type Check & Build**:
  ```bash
  npm run build
  ```

- **Lint Code**:
  ```bash
  npm run lint
  ```

---

## 🔐 Architecture & Security Rules

### 1. Authentication & Tenant Isolation
- Authentication tokens (JWT) are stored exclusively in `sessionStorage` to prevent cross-tab or persistent token retention after browser closure.
- Protected routes automatically intercept 401 errors (`TOKEN_EXPIRED`, `TOKEN_INVALID`, `AUTH_REQUIRED`), clear session tokens, and route unauthenticated requests to `/login`.
- **Tenant Context**: The tenant identifier is decoded directly by the backend from the signed JWT. The frontend never injects `x-tenant-id` request headers or body `tenantId` fields.

### 2. Idempotency & Retry Safety
- In `AddTransactionModal`, each transaction generates a unique client-side `eventId` (`crypto.randomUUID()`).
- On failure (e.g., network disconnect or distributed lock contention), the **exact same `eventId` is retained** across retries. This ensures Redis mutex locks and backend idempotency mechanisms prevent duplicate billing.
- Only upon verified success (`201 Created` or `200 OK replay`) or explicit user action is a new `eventId` generated.

### 3. Failure Simulation (Dev Only)
- The "Simulate Failure" option in the transaction modal is enabled exclusively during local development (`import.meta.env.DEV`). It triggers a backend 500 error and MongoDB multi-document abort to demonstrate rollback state resiliency without deducting account balance.

---

## 📊 Component & Screen API Integration Status

| View / Component | Data Source | Notes |
| :--- | :--- | :--- |
| **Login (`/login`)** | Real Backend API | `POST /api/auth/login` |
| **Sign Up (`/signup`)** | Real Backend API | `POST /api/auth/register` |
| **Account Balance Card** | Real Backend API | `GET /api/transactions/balance/:accountId` |
| **Billing Ledger Table** | Real Backend API | `GET /api/transactions?accountId=ACC001` |
| **Transaction Modal** | Real Backend API | `POST /api/transactions` (ACID + Redis locks) |
| **Rollback Resiliency** | Real Backend API + Local Session | Aborted transactions verified with zero balance deduction |
| **Usage & Cost Metrics** | Demo Data | Week 3 milestone feature (aggregation pipeline) |
| **Dynamic DB Pools** | Demo Data | Week 3 milestone feature (live pool telemetry) |
| **Audit Logs View** | Demo Data | Week 4 milestone feature |
| **Engine Settings** | Demo Data | Week 4 milestone feature |

---

## 📁 Project Structure

```
client/
├── public/                 # Static branding assets and icons
├── src/
│   ├── api/                # API client layer & contract type definitions
│   │   ├── client.ts       # Typed fetch wrapper with JWT and 401 handling
│   │   └── types.ts        # Backend request/response TypeScript interfaces
│   ├── auth/               # Authentication context and hooks
│   │   ├── AuthContext.tsx # Context provider managing session state
│   │   ├── context.ts      # Auth context interface and React context definition
│   │   └── useAuth.ts      # useAuth custom hook
│   ├── components/         # Modular UI components
│   │   ├── common/         # Navbar, Sidebar, ProtectedRoute
│   │   ├── dashboard/      # ExecutiveHeader, SummaryCards, LedgerTable, UsageChart
│   │   └── transactions/   # AddTransactionModal
│   ├── pages/              # Primary route views (login, signup, dashboard)
│   ├── types/              # Domain-specific UI state models
│   ├── App.tsx             # Route definitions and provider wrapping
│   └── main.tsx            # Application entry point
├── .env.example            # Environment configuration template
├── package.json            # Scripts and dependencies
└── tsconfig.app.json       # Strict TypeScript configuration
```
