import type { BillType, GstMode, LineItem, Totals } from "@/types/bill";

const GST_RATE = 0.18;

export interface ContractorLineResult {
  afterDiscount: number;
  gstPercent: number;
  baseAmount: number;
  cgst: number;
  sgst: number;
  netAmount: number;
  discountAmount: number;
}

export function lineAfterDiscount(rate: number, discountPercent: number): number {
  const d = Math.max(0, discountPercent);
  return rate - (rate * d) / 100;
}

/** Contractor: rate is WITHOUT GST; system adds 18% */
export function calculateContractorLine(item: LineItem): ContractorLineResult {
  const afterDiscount = lineAfterDiscount(item.rate, item.discountPercent);
  const discountAmount = item.qty * (item.rate - afterDiscount);
  const baseAmount = item.qty * afterDiscount;
  const totalGst = baseAmount * GST_RATE;
  const cgst = totalGst / 2;
  const sgst = totalGst / 2;
  const netAmount = baseAmount + totalGst;
  return {
    afterDiscount,
    gstPercent: 18,
    baseAmount,
    cgst,
    sgst,
    netAmount,
    discountAmount,
  };
}

export interface NormalGstLineResult {
  afterDiscount: number;
  gstPercent: number;
  baseAmount: number;
  cgst: number;
  sgst: number;
  netAmount: number;
  discountAmount: number;
}

/** Normal GST ON: rate INCLUDING GST */
export function calculateNormalGSTLine(item: LineItem): NormalGstLineResult {
  const afterDiscount = lineAfterDiscount(item.rate, item.discountPercent);
  const discountAmount = item.qty * (item.rate - afterDiscount);
  const baseRate = afterDiscount / (1 + GST_RATE);
  const baseAmount = baseRate * item.qty;
  const gst = baseAmount * GST_RATE;
  const cgst = gst / 2;
  const sgst = gst / 2;
  const netAmount = baseAmount + gst;
  return {
    afterDiscount,
    gstPercent: 18,
    baseAmount,
    cgst,
    sgst,
    netAmount,
    discountAmount,
  };
}

export interface NormalNonGstLineResult {
  afterDiscount: number;
  gstPercent: number;
  netAmount: number;
  discountAmount: number;
}

/** Normal GST OFF: same final total as GST ON for same entered inclusive rate */
export function calculateNormalNonGSTLine(item: LineItem): NormalNonGstLineResult {
  const afterDiscount = lineAfterDiscount(item.rate, item.discountPercent);
  const discountAmount = item.qty * (item.rate - afterDiscount);
  const netAmount = item.qty * afterDiscount;
  return {
    afterDiscount,
    gstPercent: 0,
    netAmount,
    discountAmount,
  };
}

export function roundOff(amount: number): { rounded: number; delta: number } {
  const rounded = Math.round(amount);
  // Avoid floating point noise like -0.0000001 showing as "-0.00"
  const delta = Number((rounded - amount).toFixed(2));
  return { rounded, delta };
}

const ones = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigits(n: number): string {
  if (n < 20) return ones[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return tens[t] + (o ? " " + ones[o] : "");
}

function segmentWords(n: number, label: string): string {
  if (n === 0) return "";
  return twoDigits(n) + " " + label + " ";
}

/** Indian numbering — rupees only (paise optional) */
export function amountToWords(amount: number): string {
  const rupees = Math.floor(Math.abs(amount));
  const paise = Math.round((Math.abs(amount) - rupees) * 100);
  if (rupees === 0 && paise === 0) return "Zero Rupees Only";

  let n = rupees;
  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  const hundred = Math.floor(n / 100);
  const rem = n % 100;

  let s = "";
  s += segmentWords(crore, "Crore");
  s += segmentWords(lakh, "Lakh");
  s += segmentWords(thousand, "Thousand");
  if (hundred) s += ones[hundred] + " Hundred ";
  if (rem) s += twoDigits(rem) + " ";

  s = s.trim();
  let out = (amount < 0 ? "Minus " : "") + s + " Rupees";
  if (paise) out += " and " + twoDigits(paise) + " Paise";
  out += " Only";
  return out.replace(/\s+/g, " ").trim();
}

export interface BillComputeInput {
  billType: BillType;
  gstMode: GstMode;
  items: LineItem[];
  freight: number;
}

export function computeBillTotals(input: BillComputeInput): Totals {
  const { billType, gstMode, items, freight } = input;
  let subtotal = 0;
  let taxableValue = 0;
  let cgst = 0;
  let sgst = 0;
  let discountTotal = 0;

  for (const item of items) {
    if (billType === "contractor") {
      const r = calculateContractorLine(item);
      subtotal += r.baseAmount;
      taxableValue += r.baseAmount;
      cgst += r.cgst;
      sgst += r.sgst;
      discountTotal += r.discountAmount;
    } else if (gstMode === "on") {
      const r = calculateNormalGSTLine(item);
      subtotal += r.baseAmount;
      taxableValue += r.baseAmount;
      cgst += r.cgst;
      sgst += r.sgst;
      discountTotal += r.discountAmount;
    } else {
      const r = calculateNormalNonGSTLine(item);
      subtotal += r.netAmount;
      taxableValue += r.netAmount;
      discountTotal += r.discountAmount;
    }
  }

  const totalTax = cgst + sgst;
  const preRound =
    billType === "contractor"
      ? subtotal + totalTax + freight
      : gstMode === "on"
        ? subtotal + totalTax + freight
        : subtotal + freight;

  const { rounded, delta } = roundOff(preRound);

  return {
    subtotal,
    taxableValue,
    cgst,
    sgst,
    totalTax,
    discountTotal,
    freight,
    roundOff: delta,
    grandTotal: rounded,
  };
}
