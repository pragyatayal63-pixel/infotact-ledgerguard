const express = require("express");
const tenantMiddleware = require("../middleware/tenant");
const { createTransaction } = require("../controllers/transaction.controller");
const { getBalance, listTransactions } = require("../controllers/query.controller");

const router = express.Router();

// Apply tenant middleware to every transaction API
router.use(tenantMiddleware);

// Create transaction
router.post("/", createTransaction);

// List transactions (?accountId=&type=&status=&page=&limit=)
router.get("/", listTransactions);

// Get an account's balance
router.get("/balance/:accountId", getBalance);

module.exports = router;