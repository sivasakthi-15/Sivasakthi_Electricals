export type BillType = "contractor" | "normal";
export type ShopId = "sivasakthi" | "meenatchi";
export type GstMode = "on" | "off";
export type BillStatus = "active" | "cancelled";

export interface Customer {
  name: string;
  mobile: string;
  place: string;
}

export interface LineItem {
  description: string;
  qty: number;
  unit: string;
  rate: number;
  discountPercent: number;
}

export interface LineComputed {
  afterDiscount: number;
  gstPercent: number;
  netAmount: number;
  baseAmount?: number;
  cgst?: number;
  sgst?: number;
}

export interface Totals {
  subtotal: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  totalTax: number;
  discountTotal: number;
  freight: number;
  roundOff: number;
  grandTotal: number;
}

export interface BillPayload {
  _id?: string;
  billNumber?: string;
  billType: BillType;
  shop: ShopId;
  gstMode: GstMode;
  status: BillStatus;
  customer: Customer;
  items: LineItem[];
  totals: Totals;
  createdAt?: string;
  updatedAt?: string;
}

export interface DraftState extends BillPayload {
  tempDisplayNumber?: string;
  upiId?: string;
}
