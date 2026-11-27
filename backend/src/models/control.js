
const companySchema = require("./company.model");
const userSchema = require("./user.model");

const getControlModels = (conn) => ({
  Company: conn.models.Company || conn.model("Company", companySchema),
  User: conn.models.User || conn.model("User", userSchema),
});

module.exports = { getControlModels };
