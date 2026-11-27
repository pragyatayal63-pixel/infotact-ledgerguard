
const jwt = require("jsonwebtoken");

const getSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in .env");
  }
  return process.env.JWT_SECRET;
};

const signToken = (payload) =>
  jwt.sign(payload, getSecret(), {
    algorithm: "HS256",
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });

const verifyToken = (token) =>
  jwt.verify(token, getSecret(), { algorithms: ["HS256"] });

module.exports = { signToken, verifyToken };
