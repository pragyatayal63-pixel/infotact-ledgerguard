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
