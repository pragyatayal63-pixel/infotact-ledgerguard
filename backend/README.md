# LedgerGuard: Billing & Transaction Engine (Module 2)

Backend for credit/debit transactions with tenant isolation, idempotency,
Redis distributed locks and MongoDB multi-document (ACID) transactions.

## Run locally
1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env` and fill in `MONGO_URI` and `REDIS_URL`
4. `npm run dev` (server on port 5000)

## Tenant header (temporary)
Every transaction request needs `x-tenant-id: <company>` (for example `companya`).
Each tenant has its own database. This header is a temporary mock and will be
replaced by the JWT tenant middleware (`src/middleware/tenant.js`).

## Endpoints

### POST /api/transactions
Body:
```json
{ "eventId": "evt-001", "accountId": "ACC001", "type": "credit", "amount": 100, "currency": "INR" }