export type ShopKey = "SE" | "MP";

export function getFinancialYearLabel(date: Date): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const startYear = m >= 4 ? y : y - 1;
  const endYear = startYear + 1;
  const a = String(startYear).slice(-2);
  const b = String(endYear).slice(-2);
  return `${a}-${b}`;
}

export function formatBillNumber(shopKey: ShopKey, sequence: number, fyLabel: string): string {
  const padded = String(sequence).padStart(4, "0");
  return `${shopKey}-${padded}/${fyLabel}`;
}

export function shopIdToKey(shop: "sivasakthi" | "meenatchi"): ShopKey {
  return shop === "sivasakthi" ? "SE" : "MP";
}
