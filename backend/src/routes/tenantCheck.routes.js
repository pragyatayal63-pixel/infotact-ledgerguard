const express = require("express");
const tenantMiddleware = require("../middleware/tenant");

const router = express.Router();

router.get("/", tenantMiddleware, async (req, res, next) => {
  try {
    // Creates the collections and indexes in this tenant's database
    await Promise.all(Object.values(req.models).map((m) => m.init()));
    const indexes = await req.models.Transaction.collection.indexes();

    res.status(200).json({
      success: true,
      data: {
        tenantId: req.tenantId,
        database: req.db.name,
        transactionIndexes: indexes.map((i) => ({ name: i.name, unique: !!i.unique })),
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;