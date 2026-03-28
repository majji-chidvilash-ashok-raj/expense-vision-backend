const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  invoiceNumber: {
    type: String,
    required: true,
  },

  vendor: {
    type: String,
    required: true,
  },

  category: {
    type: String,
    default: "General",
  },

  amount: {
    type: Number,
    required: true,
  },

  status: {
    type: String,
    enum: ["Paid", "Pending", "Overdue"],
    default: "Pending",
  },

  date: {
    type: Date,
    default: Date.now,
  },

}, { timestamps: true });

module.exports = mongoose.model("Invoice", InvoiceSchema);