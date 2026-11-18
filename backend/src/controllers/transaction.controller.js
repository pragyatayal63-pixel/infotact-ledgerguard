
const createTransaction = async (req, res, next) => {
  let session;

  try {
    // 1. Get request data and tenant-specific models
    const { eventId, accountId, type, amount, currency } = req.body || {};
    const { Account, Transaction, LedgerEntry } = req.models;

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

    // 5. Start MongoDB transaction session
    session = await req.db.startSession();

    let result;

    await session.withTransaction(async () => {
      // 6. Prevent duplicate transactions
      const existing = await Transaction.findOne({ eventId }).session(session);

      if (existing) {
        const err = new Error(
          "Duplicate transaction: eventId already exists"
        );
        err.statusCode = 409;
        err.code = "DUPLICATE_TRANSACTION";
        throw err;
      }

      // 7. Find account
      const account = await Account.findOne({ accountId }).session(session);

      if (!account) {
        const err = new Error("Account not found");
        err.statusCode = 404;
        err.code = "ACCOUNT_NOT_FOUND";
        throw err;
      }

      // 8. Create transaction record
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

      // 9. Atomically update account balance
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

      // 10. Handle insufficient balance
      if (!updatedAccount) {
        const err = new Error("Insufficient balance");
        err.statusCode = 400;
        err.code = "INSUFFICIENT_BALANCE";
        throw err;
      }

      // 11. Create ledger entry
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

      // 12. Store result
      result = {
        transaction,
        balance: updatedAccount.balance,
      };
    });

    // 13. Send success response
    return res.status(201).json({
      success: true,
      message: "Transaction completed successfully",
      data: result,
    });
  } catch (err) {
    // 14. Handle duplicate key errors
    if (err.code === 11000) {
      err.statusCode = 409;
      err.code = "DUPLICATE_TRANSACTION";
      err.message = "Duplicate transaction: eventId already exists";
    }

    return next(err);
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

module.exports = { createTransaction };
