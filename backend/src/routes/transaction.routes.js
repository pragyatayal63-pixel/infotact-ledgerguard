const express = require("express");
const authenticate = require("../middleware/authenticate");
const tenantMiddleware = require("../middleware/tenant");
const { createTransaction } = require("../controllers/transaction.controller");
const { getBalance, listTransactions } = require("../controllers/query.controller");

const router = express.Router();

// Gateway first (JWT), then the tenant's own database
router.use(authenticate, tenantMiddleware);

router.post("/", createTransaction);
router.get("/", listTransactions);
router.get("/balance/:accountId", getBalance);

module.exports = router;