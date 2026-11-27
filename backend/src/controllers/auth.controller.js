
const { getControlConnection } = require("../config/tenantConnection");
const { getControlModels } = require("../models/control");
const { provisionCompany } = require("../services/provisioning.service");
const { verifyPassword } = require("../utils/password");
const { signToken } = require("../utils/jwt");
const { httpError } = require("../utils/httpError");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TENANT_RE = /^[a-z0-9_-]{2,30}$/;

const buildAuthData = (user, companyName) => ({
  token: signToken({ sub: String(user._id), tenantId: user.tenantId, role: user.role }),
  user: { id: user._id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId },
  company: { name: companyName, tenantId: user.tenantId },
});

const register = async (req, res, next) => {
  try {
    const body = req.body || {};
    const companyName = String(body.companyName || "").trim();
    const tenantId = String(body.tenantId || "").trim().toLowerCase();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!companyName || !name) {
      throw httpError(400, "INVALID_INPUT", "companyName and name are required");
    }

    if (!TENANT_RE.test(tenantId)) {
      throw httpError(400, "INVALID_TENANT_ID", "tenantId must be 2-30 letters, numbers, - or _");
    }

    if (!EMAIL_RE.test(email)) {
      throw httpError(400, "INVALID_EMAIL", "A valid email is required");
    }

    if (password.length < 8) {
      throw httpError(400, "WEAK_PASSWORD", "Password must be at least 8 characters");
    }

    const { company, user } = await provisionCompany({ companyName, tenantId, name, email, password });

    return res.status(201).json({
      success: true,
      message: "Company registered. Default account: ACC001",
      data: buildAuthData(user, company.name),
    });
  } catch (err) {
    return next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const email = String((req.body || {}).email || "").trim().toLowerCase();
    const password = String((req.body || {}).password || "");

    if (!email || !password) {
      throw httpError(400, "INVALID_INPUT", "email and password are required");
    }

    const control = await getControlConnection();
    const { Company, User } = getControlModels(control);

    const user = await User.findOne({ email });

    // Same error for wrong email and wrong password
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw httpError(401, "INVALID_CREDENTIALS", "Email or password is incorrect");
    }

    const company = await Company.findOne({ tenantId: user.tenantId });

    if (!company || company.status !== "active") {
      throw httpError(403, "COMPANY_SUSPENDED", "This company account is not active");
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: buildAuthData(user, company.name),
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = { register, login };
