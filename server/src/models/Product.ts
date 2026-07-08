import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // ===========================
    // Basic Information
    // ===========================

    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    category: {
      type: String,
      default: "General",
      trim: true,
    },

    unit: {
      type: String,
      default: "Nos",
      trim: true,
    },

    barcode: {
      type: String,
      default: "",
      trim: true,
    },

    hsnCode: {
      type: String,
      default: "",
      trim: true,
    },

    gst: {
      type: Number,
      default: 18,
      min: 0,
      max: 100,
    },

    // ===========================
    // Pricing
    // ===========================

    latestRate: {
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

    // ===========================
    // Inventory
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

    // ===========================
    // Analytics
    // ===========================

    timesUsed: {
      type: Number,
      default: 0,
    },

    lastUsed: {
      type: Date,
      default: Date.now,
    },

    // ===========================
    // Status
    // ===========================

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Useful indexes
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ barcode: 1 });

export default mongoose.model("Product", productSchema);