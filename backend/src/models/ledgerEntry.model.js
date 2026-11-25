const { Schema } = require("mongoose");

const ledgerEntrySchema = new Schema(
  {
    transactionId: { type: Schema.Types.ObjectId, ref: "Transaction", required: true },
    eventId: { type: String, required: true },
    accountId: { type: String, required: true },
    type: { type: String, enum: ["credit", "debit"], required: true },
    amount: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = ledgerEntrySchema;