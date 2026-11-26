
const { verifyToken } = require("../utils/jwt");
const { httpError } = require("../utils/httpError");

// API gateway: every protected request must carry a valid JWT
const authenticate = (req, res, next) => {
  try {
    const [scheme, token] = (req.header("Authorization") || "").split(" ");
    if (scheme !== "Bearer" || !token) {
      throw httpError(401, "AUTH_REQUIRED", "Authorization: Bearer <token> is required");
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch (e) {
      if (e.name === "TokenExpiredError") {
        throw httpError(401, "TOKEN_EXPIRED", "Token expired, please log in again");
      }
      throw httpError(401, "TOKEN_INVALID", "Token is invalid");
    }

    if (!payload.tenantId || !/^[a-z0-9_-]{2,30}$/.test(payload.tenantId)) {
      throw httpError(401, "TOKEN_INVALID", "Token has no valid tenant");
    }

    // The tenant now comes from the signed token, not from a header the client can change
    req.user = { id: payload.sub, role: payload.role, tenantId: payload.tenantId };
    req.tenantId = payload.tenantId;
    return next();
  } catch (err) {
    return next(err);
  }
};

module.exports = authenticate;
