const { withLock } = require("../../utils/distributedLock");

// One format for every failure: { success:false, error:{ code, message } }
const fail = (res, status, code, message) =>
  res.status(status).json({ success: false, error: { code, message } });

const createTransaction = async (req, res, next) => {
  try {
    // 1. Request data and tenant-specific models
    const { eventId, accountId, type, amount, currency, simulateFailure } =
      req.body || {};
    const { Account, Transaction, LedgerEntry } = req.models;
    const tenantKey = req.tenantId || req.headers["x-tenant-id"] || "default";

    // 2. Validation (all failures return HTTP 400)
    if (
      typeof eventId !== "string" || !eventId.trim() ||
      typeof accountId !== "string" || !accountId.trim()
    ) {
      return fail(res, 400, "INVALID_INPUT", "eventId and accountId must be non-empty text");
    }
    if (!["credit", "debit"].includes(type)) {
      return fail(res, 400, "INVALID_TYPE", "type must be credit or debit");
    }
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
      return fail(res, 400, "INVALID_AMOUNT", "amount must be a positive number");
    }
    if (currency !== undefined && !/^[A-Za-z]{3}$/.test(String(currency).trim())) {
      return fail(res, 400, "INVALID_CURRENCY", "currency must be a 3-letter code like INR");
    }

    const cleanEventId = eventId.trim();
    const cleanAccountId = accountId.trim();

    // Failure demo only works in development, never in production
    const forceFailure =
      simulateFailure === true && process.env.NODE_ENV !== "production";

    // 3. Distributed lock per tenant + eventId
    const lockResource = `tx:${tenantKey}:${cleanEventId}`;

    const outcome = await withLock(
      lockResource,
      async () => {
        // 4. Idempotent replay check inside the lock
        const existingTx = await Transaction.findOne({ eventId: cleanEventId }).lean();
        if (existingTx) {
          const existingAccount = await Account.findOne({
            accountId: existingTx.accountId,
          }).lean();
          return {
            replayed: true,
            data: {
              transaction: existingTx,
              balance: existingAccount ? existingAccount.balance : null,
            },
          };
        }

        // 5. MongoDB transaction: everything below succeeds together or not at all
        const session = await req.db.startSession();
        let result;

        try {
          await session.withTransaction(async () => {
            const existingInSession = await Transaction.findOne({
              eventId: cleanEventId,
            }).session(session);

            if (existingInSession) {
              const acc = await Account.findOne({
                accountId: existingInSession.accountId,
              }).session(session);
              result = {
                replayed: true,
                data: {
                  transaction: existingInSession,
                  balance: acc ? acc.balance : null,
                },
              };
              return;
            }

            const account = await Account.findOne({
              accountId: cleanAccountId,
            }).session(session);
            if (!account) {
              const err = new Error("Account not found");
              err.statusCode = 404;
              err.code = "ACCOUNT_NOT_FOUND";
              throw err;
            }

            const [transaction] = await Transaction.create(
              [
                {
                  eventId: cleanEventId,
                  accountId: cleanAccountId,
                  type,
                  amount,
                  currency: (currency && String(currency).trim().toUpperCase()) ||
                    account.currency || "INR",
                  status: "completed",
                },
              ],
              { session }
            );

            // Atomic balance update (a debit needs enough balance)
            const updatedAccount = await Account.findOneAndUpdate(
              type === "debit"
                ? { accountId: cleanAccountId, balance: { $gte: amount } }
                : { accountId: cleanAccountId },
              { $inc: { balance: type === "credit" ? amount : -amount } },
              { returnDocument: "after", session, runValidators: true }
            );

            if (!updatedAccount) {
              const err = new Error("Insufficient balance");
              err.statusCode = 400;
              err.code = "INSUFFICIENT_BALANCE";
              throw err;
            }

            await LedgerEntry.create(
              [
                {
                  transactionId: transaction._id,
                  eventId: cleanEventId,
                  accountId: cleanAccountId,
                  type,
                  amount,
                  balanceAfter: updatedAccount.balance,
                },
              ],
              { session }
            );

            // DEMO: fail AFTER everything was written, to prove rollback
            if (forceFailure) {
              const err = new Error("Simulated failure: transaction rolled back");
              err.statusCode = 500;
              err.code = "SIMULATED_FAILURE";
              throw err;
            }

            result = {
              replayed: false,
              data: { transaction, balance: updatedAccount.balance },
            };
          });
        } finally {
          await session.endSession();
        }

        return result;
      },
      { ttlMs: 10000, retryCount: 25, retryDelayMs: 100 }
    );

    // 6. 200 for replay, 201 for a new transaction
    if (outcome.replayed) {
      return res.status(200).json({
        success: true,
        idempotentReplay: true,
        message: "Idempotent replay: returning original transaction",
        data: outcome.data,
      });
    }

    return res.status(201).json({
      success: true,
      idempotentReplay: false,
      message: "Transaction completed successfully",
      data: outcome.data,
    });
  } catch (err) {
    // Fallback: unique index fired outside the lock
    if (err.code === 11000 && req.body?.eventId && req.models?.Transaction) {
      try {
        const existingTx = await req.models.Transaction.findOne({
          eventId: String(req.body.eventId).trim(),
        }).lean();

        if (existingTx) {
          const existingAccount = await req.models.Account.findOne({
            accountId: existingTx.accountId,
          }).lean();

          return res.status(200).json({
            success: true,
            idempotentReplay: true,
            message: "Idempotent replay: returning original transaction",
            data: {
              transaction: existingTx,
              balance: existingAccount ? existingAccount.balance : null,
            },
          });
        }
      } catch (_) {
        // Fall through to the standard error handler
      }
    }

    return next(err);
  }
};

module.exports = { createTransaction };