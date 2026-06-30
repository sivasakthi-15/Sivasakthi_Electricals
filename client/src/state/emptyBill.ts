import type { BillPayload, LineItem } from "@/types/bill";

// Allow up to ~15 items to fit within the A4 invoice.
export const ROWS = 15;

export function emptyLine(): LineItem {
  return { description: "", qty: 0, unit: "Nos", rate: 0, discountPercent: 0 };
}

export function defaultItems(): LineItem[] {
  return Array.from({ length: ROWS }, () => emptyLine());
}

export function emptyTotals() {
  return {
    subtotal: 0,
    taxableValue: 0,
    cgst: 0,
    sgst: 0,
    totalTax: 0,
    discountTotal: 0,
    freight: 0,
    roundOff: 0,
    grandTotal: 0,
  };
}

export function createEmptyBill(
  billType: BillPayload["billType"],
  shop: BillPayload["shop"]
): BillPayload {
  return {
    billType,
    shop,
    gstMode: billType === "normal" ? "off" : "on",
    status: "draft",
    customer: { name: "", mobile: "", place: "" },
    items: defaultItems(),
    totals: emptyTotals(),
  };
}
