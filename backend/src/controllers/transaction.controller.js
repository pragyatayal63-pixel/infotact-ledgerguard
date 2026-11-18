
const createTransaction = async (req, res, next) => {
  const { eventId, accountId, type, amount, currency } = req.body;
  const { Account, Transaction, LedgerEntry } = req.models;

  let session;

  try {
    // 1. Validate required fields
    if (!eventId || !accountId || !type || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "eventId, accountId, type and amount are required",
      });
    }

    // 2. Validate transaction type
    if (!["credit", "debit"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "type must be credit or debit",
      });
    }

    // 3. Validate amount
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

    // 4. Start MongoDB transaction session
    session = await req.db.startSession();

    let result;

    await session.withTransaction(async () => {
      // 5. Prevent duplicate transactions
      const existing = await Transaction.findOne({ eventId }).session(session);

      if (existing) {
        const err = new Error(
          "Duplicate transaction: eventId already exists"
        );
        err.statusCode = 409;
        err.code = "DUPLICATE_TRANSACTION";
        throw err;
      }

      // 6. Find account
      const account = await Account.findOne({ accountId }).session(session);

      if (!account) {
        const err = new Error("Account not found");
        err.statusCode = 404;
        err.code = "ACCOUNT_NOT_FOUND";
        throw err;
      }

      // 7. Check sufficient balance for debit
      if (type === "debit" && account.balance < amount) {
        const err = new Error("Insufficient balance");
        err.statusCode = 400;
        err.code = "INSUFFICIENT_BALANCE";
        throw err;
      }

      // 8. Calculate updated balance
      const updatedBalance =
        type === "credit"
          ? account.balance + amount
          : account.balance - amount;

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

      // 10. Update account balance
      account.balance = updatedBalance;
      await account.save({ session });

      // 11. Create ledger entry
      await LedgerEntry.create(
        [
          {
            transactionId: transaction._id,
            eventId,
            accountId,
            type,
            amount,
            balanceAfter: updatedBalance,
          },
        ],
        { session }
      );

      result = {
        transaction,
        balance: updatedBalance,
      };
    });

    // 12. Send success response
    return res.status(201).json({
      success: true,
      message: "Transaction completed successfully",
      data: result,
    });
  } catch (err) {
    // 13. Handle duplicate key errors
    if (err.code === 11000) {
      err.statusCode = 409;
      err.code = "DUPLICATE_TRANSACTION";
      err.message = "Duplicate transaction: eventId already exists";
    }

    next(err);
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

module.exports = { createTransaction };
