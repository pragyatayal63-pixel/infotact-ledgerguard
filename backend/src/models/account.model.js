const { Schema } = require("mongoose");

const accountSchema = new Schema(
  {
    accountId: { type: String, required: true, unique: true },
    balance: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
  },
  { timestamps: true }
);

module.exports = accountSchema;