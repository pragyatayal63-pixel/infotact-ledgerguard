const { Schema } = require("mongoose");

const transactionSchema = new Schema(
  {
    // unique: stops the same payment from being saved twice
    eventId: { type: String, required: true, unique: true },
    accountId: { type: String, required: true },
    type: { type: String, enum: ["credit", "debit"], required: true },
    amount: { type: Number, required: true, min: 0.01 },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = transactionSchema;