# LedgerGuard: Billing & Transaction Engine (Module 2)

Backend for credit/debit transactions with tenant isolation, JWT authentication, idempotency, Redis distributed locks and MongoDB multi-document (ACID) transactions.

## Run Locally

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and configure the required environment variables.

4. Start the development server:
   ```bash
   npm run dev
   ```

The server runs on port `5000` by default.

## Environment Variables

Configure these variables in your `.env` file:

| Variable | Description |
|---|---|
| `PORT` | Backend server port (default: 5000) |
| `NODE_ENV` | Application environment (development/production) |
| `MONGO_URI` | MongoDB connection string |
| `REDIS_URL` | Redis connection URL |
| `JWT_SECRET` | Secret used to sign and verify JWT tokens |
| `JWT_EXPIRES_IN` | JWT token expiry duration (e.g. 1h) |
| `CORS_ORIGIN` | Allowed frontend origin, e.g. `http://localhost:5173` |

Never commit your `.env` file or expose its secret values.

## Authentication

All `/api/transactions` routes require JWT authentication.

Send the token in the request header:

```http
Authorization: Bearer <token>
```

The tenant (company) is identified from the signed JWT token, never from a client-provided tenant header.

### POST /api/auth/register

Registers a company and creates its admin user and company-specific database.

Request body:

```json
{
  "companyName": "Company A",
  "tenantId": "companya",
  "name": "Admin",
  "email": "admin@companya.test",
  "password": "Secret123"
}
```

Returns an authentication token along with user and company information.

### POST /api/auth/login

Authenticates a registered user.

Request body:

```json
{
  "email": "admin@companya.test",
  "password": "Secret123"
}
```

Returns `data.token`, `data.user` and `data.company`.

Use the returned token for protected transaction APIs.

## Endpoints

### GET /api/health

Checks whether the backend service is running.

### POST /api/transactions

Creates a credit or debit transaction.

Requires JWT authentication.

Request body:

```json
{
  "eventId": "evt-001",
  "accountId": "ACC001",
  "type": "credit",
  "amount": 100,
  "currency": "INR"
}
```

The `eventId` is used for idempotency. Repeated requests with the same event ID do not create duplicate transactions.

### GET /api/transactions

Returns transaction records for the authenticated company.

Supports the `limit` query parameter.

Example:

```http
GET /api/transactions?limit=100
```

### GET /api/transactions/balance/:accountId

Returns the balance of an account belonging to the authenticated company.

Example:

```http
GET /api/transactions/balance/ACC001
```

All transaction endpoints require:

```http
Authorization: Bearer <token>
```

## Tenant Isolation

- Each registered company has its own database.
- JWT authentication identifies the company associated with a request.
- Tenant middleware connects the request to that company's database.
- One company cannot access another company's account or transaction records.
- Tenant identity is not accepted from a client-controlled `x-tenant-id` header.

## Transaction Processing

The transaction engine supports:

- Credit and debit operations.
- Duplicate transaction prevention through idempotency.
- Redis distributed locks.
- MongoDB multi-document ACID transactions.
- Failure handling and transaction rollback.

## Error Codes

| Error Code | HTTP Status | Description |
|---|---:|---|
| `AUTH_REQUIRED` | 401 | Authentication token is missing |
| `TOKEN_INVALID` | 401 | Token is invalid |
| `TOKEN_EXPIRED` | 401 | Token has expired |
| `INVALID_CREDENTIALS` | 401 | Incorrect login credentials |
| `COMPANY_SUSPENDED` | 403 | Company account is suspended |
| `EMAIL_EXISTS` | 409 | Email is already registered |
| `TENANT_EXISTS` | 409 | Tenant ID is already registered |
| `WEAK_PASSWORD` | 400 | Password does not meet requirements |
| `INVALID_EMAIL` | 400 | Email format is invalid |
| `INVALID_TENANT_ID` | 400 | Tenant ID format is invalid |

## Testing

Run the isolation audit while the backend server is running:

```bash
node scripts/isolation-audit.js
```

The audit checks:

- Requests without tokens are rejected.
- Tampered JWT tokens are rejected.
- Company-specific account access works.
- Cross-tenant transaction data is not exposed.
- Multiple requests can be processed without tenant data leakage.

A successful audit displays:

```text
ISOLATION AUDIT PASSED: no cross-tenant data
```