import mongoose from "mongoose";

const counterSchema = new mongoose.Schema(
  {
    shopKey: { type: String, required: true, enum: ["SE", "MP"] },
    lastSequence: { type: Number, default: 0 },
    fyLabel: { type: String, required: true },
  },
  { timestamps: true }
);

counterSchema.index({ shopKey: 1, fyLabel: 1 }, { unique: true });

export const Counter = mongoose.model("Counter", counterSchema);
