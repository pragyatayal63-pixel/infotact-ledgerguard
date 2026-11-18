const express = require("express");
const tenantMiddleware = require("../middleware/tenant");
const {
  createTransaction,
} = require("../controllers/transaction.controller");

const router = express.Router();

// Apply tenant middleware to transaction APIs
router.use(tenantMiddleware);

// Create transaction
router.post("/", createTransaction);

module.exports = router;