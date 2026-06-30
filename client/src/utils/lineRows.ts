import type { BillType, GstMode, LineItem } from "@/types/bill";
import {
  calculateContractorLine,
  calculateNormalGSTLine,
  calculateNormalNonGSTLine,
} from "@/utils/calculations";

export interface DisplayRow {
  description: string;
  qty: number;
  unit: string;
  rate: number;
  discountPercent: number;
  afterDiscount: number;
  gstPercent: number;
  netAmount: number;
}

export function buildDisplayRows(
  billType: BillType,
  gstMode: GstMode,
  items: LineItem[]
): DisplayRow[] {
  return items.map((item) => {
    if (billType === "contractor") {
      const r = calculateContractorLine(item);
      return {
        description: item.description,
        qty: item.qty,
        unit: item.unit,
        rate: item.rate,
        discountPercent: item.discountPercent,
        afterDiscount: r.afterDiscount,
        gstPercent: r.gstPercent,
        netAmount: r.netAmount,
      };
    }
    if (gstMode === "on") {
      const r = calculateNormalGSTLine(item);
      return {
        description: item.description,
        qty: item.qty,
        unit: item.unit,
        rate: item.rate,
        discountPercent: item.discountPercent,
        afterDiscount: r.afterDiscount,
        gstPercent: r.gstPercent,
        netAmount: r.netAmount,
      };
    }
    const r = calculateNormalNonGSTLine(item);
    return {
      description: item.description,
      qty: item.qty,
      unit: item.unit,
      rate: item.rate,
      discountPercent: item.discountPercent,
      afterDiscount: r.afterDiscount,
      gstPercent: 0,
      netAmount: r.netAmount,
    };
  });
}
