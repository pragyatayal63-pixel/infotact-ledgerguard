
require("dotenv").config();

const { getTenantConnection } = require("../src/config/tenantConnection");
const { getModels } = require("../src/models");

const createTestAccount = async () => {
  let connection;

  try {
    connection = await getTenantConnection("companya");

    const { Account } = getModels(connection);

    const existing = await Account.findOne({
      accountId: "ACC001",
    });

    if (existing) {
      console.log("Test account already exists:");
      console.log({
        accountId: existing.accountId,
        balance: existing.balance,
        currency: existing.currency,
      });
      return;
    }

    const account = await Account.create({
      accountId: "ACC001",
      balance: 1000,
      currency: "INR",
    });

    console.log("Test account created successfully:");
    console.log({
      accountId: account.accountId,
      balance: account.balance,
      currency: account.currency,
    });
  } catch (error) {
    console.error("Error:", error.message);
    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

createTestAccount();
