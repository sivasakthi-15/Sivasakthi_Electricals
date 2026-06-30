import type { BillPayload } from "@/types/bill";
import { SHOPS } from "@/constants/shops";
import { amountToWords } from "@/utils/calculations";
import { buildDisplayRows } from "@/utils/lineRows";

export function buildBillShareText(bill: BillPayload, displayNumber: string): string {
  const shop = SHOPS[bill.shop];
  const lines = buildDisplayRows(bill.billType, bill.gstMode, bill.items)
    .map((r, i) => `${i + 1}. ${r.description || "-"}  Qty ${r.qty}  Net ₹${r.netAmount.toFixed(2)}`)
    .filter((_, i) => bill.items[i]?.description?.trim())
    .join("\n");

  return [
    `*${shop.name}*`,
    `Invoice: ${displayNumber}`,
    `Customer: ${bill.customer.name || "-"}`,
    `Mobile: ${bill.customer.mobile || "-"}`,
    "",
    lines || "(no items)",
    "",
    `*Total: ₹${bill.totals.grandTotal.toFixed(2)}*`,
    amountToWords(bill.totals.grandTotal),
  ].join("\n");
}

export function openWhatsAppShare(text: string) {
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
