import mongoose from "mongoose";

const inventoryTransactionSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "PURCHASE",
        "SALE",
        "RETURN",
        "ADJUSTMENT",
      ],
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    balanceAfter: {
      type: Number,
      required: true,
      default: 0,
    },

    referenceId: {
      type: String,
      default: "",
    },

    remarks: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "InventoryTransaction",
  inventoryTransactionSchema
);