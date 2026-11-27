
const { getControlConnection, getTenantConnection } = require("../config/tenantConnection");
const { getControlModels } = require("../models/control");
const { getModels } = require("../models");
const { hashPassword } = require("../utils/password");
const { httpError } = require("../utils/httpError");

// Creates the company, its admin user and its own tenant database
const provisionCompany = async ({ companyName, tenantId, name, email, password }) => {
  const control = await getControlConnection();
  const { Company, User } = getControlModels(control);
  await Promise.all([Company.init(), User.init()]);

  if (await User.findOne({ email })) {
    throw httpError(409, "EMAIL_EXISTS", "This email is already registered");
  }

  if (await Company.findOne({ tenantId })) {
    throw httpError(409, "TENANT_EXISTS", "This company ID is already taken");
  }

  const company = await Company.create({ name: companyName, tenantId });
  let user = null;

  try {
    const passwordHash = await hashPassword(password);
    user = await User.create({ name, email, passwordHash, tenantId, role: "admin" });

    // Boot this company's isolated database
    const tenantConn = await getTenantConnection(company.tenantId);
    const { Account, Transaction, LedgerEntry } = getModels(tenantConn);
    await Promise.all([Account.init(), Transaction.init(), LedgerEntry.init()]);

    // Starting account (an existing account and its balance are kept)
    await Account.updateOne(
      { accountId: "ACC001" },
      { $setOnInsert: { balance: 0, currency: "INR" } },
      { upsert: true }
    );

    return { company, user };
  } catch (err) {
    // Undo what we created if signup fails
    await Company.deleteOne({ _id: company._id });
    if (user) await User.deleteOne({ _id: user._id });
    throw err;
  }
};

module.exports = { provisionCompany };
