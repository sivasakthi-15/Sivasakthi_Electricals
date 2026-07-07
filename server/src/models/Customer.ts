import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    mobile: {
      type: String,
      default: "",
      trim: true,
    },

    place: {
      type: String,
      default: "",
      trim: true,
    },

    timesVisited: {
      type: Number,
      default: 1,
    },

    totalPurchase: {
      type: Number,
      default: 0,
    },

    lastVisit: {
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

customerSchema.index(
  {
    mobile: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

export default mongoose.model(
  "Customer",
  customerSchema
);