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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Product", productSchema);