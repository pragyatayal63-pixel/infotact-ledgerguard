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
