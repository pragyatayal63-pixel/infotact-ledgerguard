# infotact-ledgerguard
LedgerGuard Internship Project - Group 14
<br>
This is our internship Project

## Architecture & Redis Locking
- Distributed locks via Redis prevent duplicate ledger processing.
- Express middleware validates request integrity before state updates.


## Backend Ledger Validation
- Payload schema checks ensure amount, currency, and account IDs are valid.
- Idempotency keys prevent double-entry race conditions.


## Frontend Error Handling
- Standardized API timeout and retry fallback messages across dashboard views.
- Toast alerts surface network and lock contention states cleanly.


## API & Middleware Setup
- Configured Express JSON parsing, CORS headers, and structured error responses.


## Authentication Flow
- Token verification and protected route guards added for dashboard access.


## Ledger Transaction Model
- Added schema fields for debit/credit entries, timestamps, and lock status.


## Dashboard State Sync
- Added loading states and ledger summary metrics calculation helpers.


## API & Middleware Setup
- Configured Express JSON parsing, CORS headers, and structured error responses.


## Authentication Flow
- Token verification and protected route guards added for dashboard access.


## Ledger Transaction Model
- Added schema fields for debit/credit entries, timestamps, and lock status.


## API & Middleware Setup
- Configured Express JSON parsing, CORS headers, and structured error responses.


## Authentication Flow
- Token verification and protected route guards added for dashboard access.


## Ledger Transaction Model
- Added schema fields for debit/credit entries, timestamps, and lock status.


## Dashboard State Sync
- Added loading states and ledger summary metrics calculation helpers.


## API & Middleware Setup
- Configured Express JSON parsing, CORS headers, and structured error responses.


## Authentication Flow
- Token verification and protected route guards added for dashboard access.


## Ledger Transaction Model
- Added schema fields for debit/credit entries, timestamps, and lock status.


## Dashboard State Sync
- Added loading states and ledger summary metrics calculation helpers.


## Ledger Transaction Schema
- Defined transaction fields for debit/credit entries, timestamps, and lock status.


## Dashboard State Sync
- Added loading states and ledger summary metrics calculation helpers.


## Session & Auth Context
- Added dynamic user session state and protected route fallback handling.


## Redis Lock TTL & Retry
- Configured lock expiration TTL and automatic retry backoff for concurrent requests.


## Billing Ledger Filtering
- Added status and date filters for audit logs and transaction history views.


## Week 3: Audit Trail & Export
- Added CSV and JSON export support for verified billing ledger entries.
- Improved timestamp formatting across transaction history views.
