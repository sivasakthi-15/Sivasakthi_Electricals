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