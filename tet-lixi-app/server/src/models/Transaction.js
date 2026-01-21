// server/src/models/Transaction.js
const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  envelopeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Envelope",
    required: true,
  },
  receiverName: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  openedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = {
  Transaction: mongoose.model("Transaction", TransactionSchema),
};
