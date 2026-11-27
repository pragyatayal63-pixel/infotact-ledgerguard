
const { Schema } = require("mongoose");

const companySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },

    // Becomes the tenant database name: ledgerguard_<tenantId>
    tenantId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9_-]{2,30}$/,
    },

    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = companySchema;
