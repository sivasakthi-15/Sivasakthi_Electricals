import type { BillPayload } from "@/types/bill";

const base = "/api";

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || res.statusText);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export interface CounterResponse {
  shopKey: string;
  fyLabel: string;
  lastBillNumber: number;
  tempDisplayNumber: string;
}

/* -------------------------------------------------------------------------- */
/*                                  Counters                                  */
/* -------------------------------------------------------------------------- */

export function fetchCounter(shop: string) {
  return json<CounterResponse>(`${base}/counters/${shop}`);
}


export interface Product {
  _id: string;

  // Basic Information
  name: string;
  category: string;
  unit: string;
  barcode: string;
  hsnCode: string;
  gst: number;

  // Pricing
  latestRate: number;
  purchaseRate: number;
  sellingRate: number;

  // Inventory
  currentStock: number;
  minimumStock: number;
  reorderLevel: number;

  // Analytics
  timesUsed: number;
  lastUsed: string;

  // Status
  active: boolean;

  createdAt: string;
  updatedAt: string;
}


export interface Customer {
  _id: string;
  name: string;
  mobile: string;
  place: string;
  timesVisited: number;
  totalPurchase: number;
  lastVisit: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardRecentBill {
  _id: string;
  billNumber: string;
  status: string;
  createdAt: string;
  customer: {
    name: string;
    mobile: string;
    place: string;
  };
  totals: {
    grandTotal: number;
  };
}

export interface DashboardData {
  todaySales: number;
  todayBills: number;
  monthSales: number;
  totalProducts: number;
  activeProducts: number;
  totalCustomers: number;
  cancelledBills: number;
  recentBills: DashboardRecentBill[];
  topProducts: TopProduct[];
}

export interface TopProduct {
  name: string;
  qty: number;
}

export interface ReportSummary {
  totalBills: number;
  totalSales: number;
  cancelledBills: number;
  gstCollected: number;
}

export interface ReportBill {
  _id: string;
  billNumber: string;
  status: string;
  createdAt: string;
  customer: {
    name: string;
    mobile: string;
    place: string;
  };
  totals: {
    grandTotal: number;
    cgst?: number;
    sgst?: number;
  };
}

export interface ReportProduct {
  name: string;
  qty: number;
}

export interface ReportsResponse {
  summary: ReportSummary;
  bills: ReportBill[];
  products: ReportProduct[];
  customers: ReportCustomer[];
}

export interface ReportCustomer {
  name: string;
  bills: number;
  purchase: number;
  lastVisit: string;
}

// ==============================
// Inventory Types
// ==============================

export interface InventoryProduct {
  _id: string;

  name: string;
  category: string;

  latestRate: number;
  purchaseRate: number;
  sellingRate: number;

  currentStock: number;
  minimumStock: number;
  reorderLevel: number;

  unit: string;

  barcode: string;
  hsnCode: string;
  gst: number;

  active: boolean;
}

export interface InventorySummary {
  totalProducts: number;
  totalStock: number;
  inventoryValue: number;
  lowStock: number;
}

export interface InventoryTransaction {
  _id: string;
  product: InventoryProduct;
  type: "PURCHASE" | "SALE" | "RETURN" | "ADJUSTMENT";
  quantity: number;
  balanceAfter: number;
  referenceId: string;
  remarks: string;
  createdAt: string;
}

export interface StockPayload {
  productId: string;
  quantity: number;
  remarks?: string;
}

/* -------------------------------------------------------------------------- */
/*                                   Bills                                    */
/* -------------------------------------------------------------------------- */

export function createBill(body: Omit<BillPayload, "_id" | "billNumber">) {
  return json<BillPayload & { _id: string }>(`${base}/bills`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateBillOverwrite(id: string, body: Partial<BillPayload>) {
  return json<BillPayload & { _id: string }>(
    `${base}/bills/${id}?mode=overwrite`,
    {
      method: "PUT",
      body: JSON.stringify(body),
    }
  );
}

export function saveAsNewBill(id: string, body: Partial<BillPayload>) {
  return json<BillPayload & { _id: string }>(
    `${base}/bills/${id}?mode=new`,
    {
      method: "PUT",
      body: JSON.stringify(body),
    }
  );
}

export function getBill(id: string) {
  return json<BillPayload & { _id: string }>(`${base}/bills/${id}`);
}

export function searchBills(params: {
  q?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const u = new URLSearchParams();

  if (params.q) u.set("q", params.q);
  if (params.dateFrom) u.set("dateFrom", params.dateFrom);
  if (params.dateTo) u.set("dateTo", params.dateTo);

  return json<(BillPayload & { _id: string })[]>(
    `${base}/bills/search?${u.toString()}`
  );
}

/* -------------------------------------------------------------------------- */
/*                           Bill Cancellation API                            */
/* -------------------------------------------------------------------------- */

export function cancelBill(id: string, reason = "") {
  return json<{
    message: string;
    bill: BillPayload & { _id: string };
  }>(`${base}/bills/${id}/cancel`, {
    method: "PATCH",
    body: JSON.stringify({
      reason,
    }),
  });
}

/* -------------------------------------------------------------------------- */
/*                    Temporary Delete (Development Only)                     */
/* -------------------------------------------------------------------------- */

export function deleteBill(id: string) {
  return json<{ ok: boolean }>(`${base}/bills/${id}`, {
    method: "DELETE",
  });
}

/* -------------------------------------------------------------------------- */
/*                               Auto Suggestions                             */
/* -------------------------------------------------------------------------- */

export function fetchProductSuggestions() {
  return json<string[]>(`${base}/bills/meta/autofill/products`);
}

export function fetchCustomerSuggestions() {
  return json<{ name: string; mobile: string; place: string }[]>(
    `${base}/bills/meta/autofill/customers`
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Products                                   */
/* -------------------------------------------------------------------------- */

export function createProduct(data: {
  name: string;
  category: string;
  unit: string;

  latestRate: number;
  purchaseRate: number;
  sellingRate: number;

  currentStock: number;
  minimumStock: number;
  reorderLevel: number;

  barcode: string;
  hsnCode: string;
  gst: number;
}){
  return json<Product>(`${base}/products`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getProducts() {
  return json<Product[]>(`${base}/products`);
}

export function searchProducts(query: string) {
  const params = new URLSearchParams();

  if (query.trim()) {
    params.set("q", query);
  }

  return json<Product[]>(
    `${base}/products/search?${params.toString()}`
  );
}

export function updateProduct(
  id: string,
  data: Partial<
    Pick<
      Product,
      | "name"
      | "category"
      | "unit"
      | "barcode"
      | "hsnCode"
      | "gst"
      | "latestRate"
      | "purchaseRate"
      | "sellingRate"
      | "currentStock"
      | "minimumStock"
      | "reorderLevel"
      | "active"
    >
  >
) {
  return json<Product>(`${base}/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function toggleProductStatus(
  id: string,
  active: boolean
) {
  return json<Product>(`${base}/products/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      active,
    }),
  });
}


/* -------------------------------------------------------------------------- */
/*                                 Customers                                  */
/* -------------------------------------------------------------------------- */

export function createCustomer(data: {
  name: string;
  mobile: string;
  place: string;
}) {
  return json<Customer>(`${base}/customers`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getCustomers() {
  return json<Customer[]>(`${base}/customers`);
}

export function searchCustomers(query: string) {
  const params = new URLSearchParams();

  if (query.trim()) {
    params.set("q", query);
  }

  return json<Customer[]>(
    `${base}/customers/search?${params.toString()}`
  );
}

export function updateCustomer(
  id: string,
  data: Partial<
    Pick<Customer, "name" | "mobile" | "place" | "active">
  >
) {
  return json<Customer>(`${base}/customers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function toggleCustomerStatus(
  id: string,
  active: boolean
) {
  return json<Customer>(
    `${base}/customers/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        active,
      }),
    }
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Reports                                   */
/* -------------------------------------------------------------------------- */

export function fetchReports(
  from?: string,
  to?: string
) {
  const params = new URLSearchParams();

  if (from) {
    params.set("from", from);
  }

  if (to) {
    params.set("to", to);
  }

  const query = params.toString();

  return json<ReportsResponse>(
    `${base}/reports${query ? `?${query}` : ""}`
  );
}

/* -------------------------------------------------------------------------- */
/*                                Dashboard                                   */
/* -------------------------------------------------------------------------- */

export function fetchDashboard() {
  return json<DashboardData>(`${base}/dashboard`);
}

// ==============================
// Inventory APIs
// ==============================

export async function getInventory() {
  return json<InventoryProduct[]>(`${base}/inventory`);
}

export async function getInventorySummary() {
  return json<InventorySummary>(`${base}/inventory/summary`);
}

export async function getLowStockProducts() {
  return json<InventoryProduct[]>(`${base}/inventory/low-stock`);
}

export async function getStockHistory(productId: string) {
  return json<InventoryTransaction[]>(
    `${base}/inventory/history/${productId}`
  );
}

export async function stockIn(payload: StockPayload) {
  return json<InventoryProduct>(`${base}/inventory/stock-in`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function stockOut(payload: StockPayload) {
  return json<InventoryProduct>(`${base}/inventory/stock-out`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function adjustStock(payload: StockPayload) {
  return json<InventoryProduct>(`${base}/inventory/adjust`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}