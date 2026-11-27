const { getTenantConnection } = require("../config/tenantConnection");
const { getModels } = require("../models");
const { httpError } = require("../utils/httpError");

// Runs AFTER authenticate: switches to the tenant named inside the JWT
const tenantMiddleware = async (req, res, next) => {
  try {
    if (!req.tenantId) {
      throw httpError(401, "AUTH_REQUIRED", "Authentication is required");
    }

    const db = await getTenantConnection(req.tenantId);
    req.db = db;
    req.models = getModels(db);
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = tenantMiddleware;  