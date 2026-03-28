const mongoose = require("mongoose");

const InventorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  quantity: {
    type: Number,
    required: true,
  },

  category: {
    type: String,
    default: "General",
  },

  supplier: {
    type: String,
    default: "",
  },

  cost: {
    type: Number,
    required: true,
  },

}, { timestamps: true });

module.exports = mongoose.model("Inventory", InventorySchema);