const accountSchema = require("./account.model");
const transactionSchema = require("./transaction.model");
const ledgerEntrySchema = require("./ledgerEntry.model");

// conn is the tenant's own database connection
const getModels = (conn) => ({
  Account: conn.models.Account || conn.model("Account", accountSchema),
  Transaction: conn.models.Transaction || conn.model("Transaction", transactionSchema),
  LedgerEntry: conn.models.LedgerEntry || conn.model("LedgerEntry", ledgerEntrySchema),
});

module.exports = { getModels };