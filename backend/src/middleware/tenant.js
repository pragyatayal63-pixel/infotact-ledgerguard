const { getTenantConnection } = require("../config/tenantConnection");
const { getModels } = require("../models");

// TEMPORARY MOCK: later Member 1's JWT middleware will supply the tenantId.
// Replace only the line that reads the header; the rest stays.
const tenantMiddleware = async (req, res, next) => {
  try {
    const tenantId = req.header("x-tenant-id");
    if (!tenantId || !/^[a-z0-9_-]{2,30}$/i.test(tenantId)) {
      const err = new Error("A valid x-tenant-id header is required");
      err.statusCode = 400;
      err.code = "TENANT_ID_INVALID";
      return next(err);
    }

    const db = await getTenantConnection(tenantId.toLowerCase());
    req.tenantId = tenantId.toLowerCase();
    req.db = db;
    req.models = getModels(db);
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = tenantMiddleware;
