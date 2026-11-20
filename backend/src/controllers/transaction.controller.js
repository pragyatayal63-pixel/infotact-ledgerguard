const { withLock } = require("../../utils/distributedLock");

const createTransaction = async (req, res, next) => {
  try {
    // 1. Get request data and tenant-specific models
    const { eventId, accountId, type, amount, currency } = req.body || {};
    const { Account, Transaction, LedgerEntry } = req.models;
    const tenantKey = req.tenantId || req.headers["x-tenant-id"] || "default";

    // 2. Validate required fields
    if (!eventId || !accountId || !type || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "eventId, accountId, type and amount are required",
      });
    }

    // 3. Validate transaction type
    if (!["credit", "debit"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "type must be credit or debit",
      });
    }

    // 4. Validate amount
    if (
      typeof amount !== "number" ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "amount must be a positive number",
      });
    }

    // 5. Acquire distributed lock per tenant + eventId so duplicate requests serialize cleanly
    const lockResource = `tx:${tenantKey}:${eventId}`;

    const outcome = await withLock(
      lockResource,
      async () => {
        // 6. Fast idempotent replay check inside the lock
        const existingTx = await Transaction.findOne({ eventId }).lean();
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

        // 7. Start MongoDB transaction session for new eventId
        const session = await req.db.startSession();
        let result;

        try {
          await session.withTransaction(async () => {
            // Double-check inside MongoDB session
            const existingInSession = await Transaction.findOne({
              eventId,
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

            // 8. Find account
            const account = await Account.findOne({ accountId }).session(session);
            if (!account) {
              const err = new Error("Account not found");
              err.statusCode = 404;
              err.code = "ACCOUNT_NOT_FOUND";
              throw err;
            }

            // 9. Create transaction record
            const [transaction] = await Transaction.create(
              [
                {
                  eventId,
                  accountId,
                  type,
                  amount,
                  currency: currency || account.currency || "INR",
                  status: "completed",
                },
              ],
              { session }
            );

            // 10. Atomically update account balance
            const updatedAccount = await Account.findOneAndUpdate(
              type === "debit"
                ? { accountId, balance: { $gte: amount } }
                : { accountId },
              {
                $inc: {
                  balance: type === "credit" ? amount : -amount,
                },
              },
              {
                new: true,
                session,
                runValidators: true,
              }
            );

            // 11. Handle insufficient balance
            if (!updatedAccount) {
              const err = new Error("Insufficient balance");
              err.statusCode = 400;
              err.code = "INSUFFICIENT_BALANCE";
              throw err;
            }

            // 12. Create ledger entry
            await LedgerEntry.create(
              [
                {
                  transactionId: transaction._id,
                  eventId,
                  accountId,
                  type,
                  amount,
                  balanceAfter: updatedAccount.balance,
                },
              ],
              { session }
            );

            result = {
              replayed: false,
              data: {
                transaction,
                balance: updatedAccount.balance,
              },
            };
          });
        } finally {
          await session.endSession();
        }

        return result;
      },
      {
        ttlMs: 10000,
        retryCount: 25,
        retryDelayMs: 100,
      }
    );

    // 13. Return 200 on idempotent replay, 201 on newly processed transaction
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
    // Fallback if unique index triggers outside lock
    if (err.code === 11000 && req.body?.eventId && req.models?.Transaction) {
      try {
        const existingTx = await req.models.Transaction.findOne({
          eventId: req.body.eventId,
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
        // Fall through to standard error handler
      }
    }

    return next(err);
  }
};

module.exports = { createTransaction };