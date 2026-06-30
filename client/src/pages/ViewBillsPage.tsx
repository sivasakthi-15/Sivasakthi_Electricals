import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { deleteBill, searchBills } from "@/api/client";
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

  const remove = async (id: string) => {
    if (!confirm("Delete this bill permanently?")) return;
    try {
      await deleteBill(id);
      setRows((r) => r.filter((x) => x._id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  const duplicate = (row: Row) => {
    const q = new URLSearchParams({
      type: row.billType,
      shop: row.shop,
      duplicate: row._id,
    });
    nav(`/bill?${q.toString()}`);
  };

  const edit = (row: Row) => {
    nav(`/bill?edit=${row._id}`);
  };

  const view = (row: Row) => {
    nav(`/bill?view=${row._id}`);
  };

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>View bills</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1rem" }}>
        <input
          placeholder="Search name, mobile, bill no."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: "1 1 200px", padding: "0.5rem", borderRadius: 8, border: "1px solid #cbd5e1" }}
        />
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          style={{ padding: "0.5rem", borderRadius: 8, border: "1px solid #cbd5e1" }}
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          style={{ padding: "0.5rem", borderRadius: 8, border: "1px solid #cbd5e1" }}
        />
        <button type="button" className="btn btn-secondary" onClick={() => void load()}>
          Search
        </button>
      </div>
      {err && <p style={{ color: "#b91c1c" }}>{err}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="bill-list">
            <thead>
              <tr>
                <th>Bill no.</th>
                <th>Shop</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Mobile</th>
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
                  <td className="num">₹{r.totals?.grandTotal?.toFixed(2)}</td>
                  <td>
                    <div className="row-actions">
                      <button type="button" className="btn btn-secondary" onClick={() => view(r)}>
                        View
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => edit(r)}>
                        Edit
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => duplicate(r)}>
                        Duplicate
                      </button>
                      <button type="button" className="btn btn-danger" onClick={() => remove(r._id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <p style={{ color: "#64748b" }}>No bills found.</p>}
        </div>
      )}
      <p style={{ marginTop: "1rem" }}>
        <Link to="/">← Back</Link>
      </p>
    </div>
  );
}
