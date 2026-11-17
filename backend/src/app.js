const express = require("express");
const healthRoutes = require("./routes/health.routes");
const tenantCheckRoutes = require("./routes/tenantCheck.routes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

// Allows the backend to read JSON request bodies
app.use(express.json());

// Register health-check API
app.use("/api/health", healthRoutes);
app.use("/api/tenant-check", tenantCheckRoutes);

// These two must stay last
app.use(notFound);
app.use(errorHandler);

module.exports = app;