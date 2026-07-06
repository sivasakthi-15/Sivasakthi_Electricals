import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cancelBill, searchBills } from "@/api/client";
import type { BillPayload } from "@/types/bill";
import { SHOPS } from "@/constants/shops";

type Row = BillPayload & { _id: string };

export function ViewBillsPage() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await searchBills({ q, dateFrom, dateTo });
      setRows(data as Row[]);
    } catch {
      setErr("Could not load bills. Is the API running?");
    } finally {
      setLoading(false);
    }
  }, [q, dateFrom, dateTo]);

  useEffect(() => {
    void load();
  }, [load]);

  const cancel = async (id: string) => {
    if (!confirm("Cancel this bill?")) return;

    try {
      await cancelBill(id, "Cancelled by shop owner");

      setRows((rows) =>
        rows.map((row) =>
          row._id === id
            ? {
                ...row,
                status: "cancelled",
              }
            : row
        )
      );
    } catch {
      alert("Failed to cancel bill.");
    }
  };

  const edit = (row: Row) => {
    nav(`/bill?edit=${row._id}`, {
      state: {
        from: "/bills",
      },
    });
  };

  const view = (row: Row) => {
    nav(`/bill?view=${row._id}`, {
      state: {
        from: "/bills",
      },
    });
  };

  const duplicate = (row: Row) => {
    nav(`/bill?duplicate=${row._id}`, {
      state: {
        from: "/bills",
      },
    });
  };

  return (
    <div className="card">
      <h2 className="card-title">Bill History</h2>
      <div className="toolbar search-toolbar">
        <input
          placeholder="Search name, mobile, bill no."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="search-input"
        />
        <input
          type="date"
          title="From date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="date-input"
        />
        <input
          type="date"
          title="To date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="date-input"
        />

      </div>
      {err && <p className="error-text">{err}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="table-wrap">
          <table className="bill-list">
            <thead>
              <tr>
                <th>Bill No.</th>
                <th>Shop</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Mobile</th>
                <th>Bill Type</th>
                <th>Status</th>
                <th className="num">Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id}>
                  <td>{r.billNumber}</td>
                  <td>{SHOPS[r.shop].shortKey}</td>
                  <td>
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleDateString("en-IN")
                      : "—"}
                  </td>
                  <td>{r.customer?.name}</td>
                  <td>{r.customer?.mobile}</td>
                  <td>
                    {r.billType === "contractor" ? "Contractor" : "Normal"}
                  </td>

                  <td>
                    {r.status === "cancelled"
                      ? "🔴 Cancelled"
                      : "🟢 Active"}
                  </td>

                  <td className="num">₹{r.totals?.grandTotal?.toFixed(2)}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => view(r)}
                      >
                        View
                      </button>

                      <button
                        type="button"
                        className="btn btn-secondary"
                        disabled={r.status === "cancelled"}
                        onClick={() => edit(r)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => duplicate(r)}
                      >
                        Duplicate
                      </button>

                      <button
                        type="button"
                        className="btn btn-danger"
                        disabled={r.status === "cancelled"}
                        onClick={() => cancel(r._id)}
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <p className="muted-text">No bills found.</p>}
        </div>
      )}
      <p className="mt-1">
        <button type="button" className="btn btn-link" onClick={() => nav(-1)}>
          ← Back
        </button>
      </p>
    </div>
  );
}
