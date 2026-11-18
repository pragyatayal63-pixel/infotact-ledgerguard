const express = require("express");
const healthRoutes = require("./routes/health.routes");
const tenantCheckRoutes = require("./routes/tenantCheck.routes");
const transactionRoutes = require("./routes/transaction.routes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(express.json());

// Register APIs
app.use("/api/health", healthRoutes);
app.use("/api/tenant-check", tenantCheckRoutes);
app.use("/api/transactions", transactionRoutes);

// These two must stay last
app.use(notFound);
app.use(errorHandler);

module.exports = app;