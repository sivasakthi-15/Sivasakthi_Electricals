import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    mobile: { type: String, default: "" },
    place: { type: String, default: "" },
  },
  { _id: false }
);

const lineItemSchema = new mongoose.Schema(
  {
    description: { type: String, default: "" },
    qty: { type: Number, default: 0 },
    unit: { type: String, default: "" },
    rate: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
  },
  { _id: false }
);

const totalsSchema = new mongoose.Schema(
  {
    subtotal: { type: Number, default: 0 },
    taxableValue: { type: Number, default: 0 },
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    totalTax: { type: Number, default: 0 },
    discountTotal: { type: Number, default: 0 },
    freight: { type: Number, default: 0 },
    roundOff: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
  },
  { _id: false }
);

const billSchema = new mongoose.Schema(
  {
    billNumber: { type: String, required: true, unique: true },
    billType: { type: String, required: true, enum: ["contractor", "normal"] },
    shop: { type: String, required: true, enum: ["sivasakthi", "meenatchi"] },
    gstMode: { type: String, enum: ["on", "off"], default: "off" },
    status: { type: String, enum: ["draft", "saved"], default: "saved" },
    customer: { type: customerSchema, default: () => ({}) },
    items: { type: [lineItemSchema], default: [] },
    totals: { type: totalsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

billSchema.index({ "customer.name": "text", "customer.mobile": "text" });
billSchema.index({ createdAt: -1 });

export const Bill = mongoose.model("Bill", billSchema);
