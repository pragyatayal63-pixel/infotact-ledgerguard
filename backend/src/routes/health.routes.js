
const express = require("express");
const router = express.Router();

// Used to check that the API is alive
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      service: "LedgerGuard Billing & Transaction Engine",
      status: "running",
      timestamp: new Date().toISOString(),
    },
  });
});

module.exports = router;
