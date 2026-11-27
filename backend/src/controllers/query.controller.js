// Read-only APIs. They use req.models, which belongs to the caller's tenant,
// so one company can never read another company's data.

const getBalance = async (req, res, next) => {
  try {
    const accountId = String(req.params.accountId || "").trim();
    const { Account } = req.models;

    const account = await Account.findOne({ accountId }).lean();
    if (!account) {
      const err = new Error("Account not found");
      err.statusCode = 404;
      err.code = "ACCOUNT_NOT_FOUND";
      return next(err);
    }

    return res.status(200).json({
      success: true,
      data: {
        accountId: account.accountId,
        balance: account.balance,
        currency: account.currency,
        updatedAt: account.updatedAt,
      },
    });
  } catch (err) {
    return next(err);
  }
};

const listTransactions = async (req, res, next) => {
  try {
    const { Transaction } = req.models;
    const { accountId, type, status } = req.query;

    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "20", 10);

    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
      const err = new Error("page must be 1 or more, and limit must be between 1 and 100");
      err.statusCode = 400;
      err.code = "INVALID_QUERY";
      return next(err);
    }
    if (type && !["credit", "debit"].includes(type)) {
      const err = new Error("type must be credit or debit");
      err.statusCode = 400;
      err.code = "INVALID_TYPE";
      return next(err);
    }
    if (status && !["pending", "completed", "failed"].includes(status)) {
      const err = new Error("status must be pending, completed or failed");
      err.statusCode = 400;
      err.code = "INVALID_STATUS";
      return next(err);
    }

    const filter = {};
    if (accountId) filter.accountId = String(accountId).trim();
    if (type) filter.type = type;
    if (status) filter.status = status;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = { getBalance, listTransactions };