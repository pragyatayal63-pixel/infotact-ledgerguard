const mongoose = require("mongoose");

// One shared connection to the Atlas cluster, created once and reused
let basePromise = null;

const getBase = () => {
  if (!basePromise) {
    basePromise = mongoose
      .createConnection(process.env.MONGO_URI)
      .asPromise()
      .catch((err) => {
        basePromise = null;
        throw err;
      });
  }
  return basePromise;
};

// Each tenant gets its OWN database, e.g. ledgerguard_companya
const getTenantConnection = async (tenantId) => {
  const base = await getBase();
  return base.useDb(`ledgerguard_${tenantId}`, { useCache: true });
};

module.exports = { getTenantConnection };