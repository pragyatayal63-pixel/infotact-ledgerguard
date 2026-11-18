
const { Schema } = require("mongoose");

const transactionSchema = new Schema(
  {
    // Unique ID prevents duplicate transaction requests
    eventId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 1,
    },

    // Account receiving or sending money
    accountId: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },

    // Transaction type
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },

    // Transaction amount
    amount: {
      type: Number,
      required: true,
      min: 0.01,
      validate: {
        validator: Number.isFinite,
        message: "Amount must be a finite number",
      },
    },

    // Currency code
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
      match: /^[A-Z]{3}$/,
    },

    // Transaction status
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = transactionSchema;
