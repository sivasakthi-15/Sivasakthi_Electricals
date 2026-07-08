import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    latestRate: {
      type: Number,
      default: 0,
    },

    unit: {
      type: String,
      default: "",
    },

    timesUsed: {
      type: Number,
      default: 0,
    },

    lastUsed: {
      type: Date,
      default: Date.now,
    },

    active: {
      type: Boolean,
      default: true,
    },

    // ===========================
    // Inventory Fields
    // ===========================

    currentStock: {
      type: Number,
      default: 0,
      min: 0,
    },

    minimumStock: {
      type: Number,
      default: 0,
      min: 0,
    },

    reorderLevel: {
      type: Number,
      default: 0,
      min: 0,
    },

    purchaseRate: {
      type: Number,
      default: 0,
      min: 0,
    },

    sellingRate: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Product", productSchema);