import { useEffect, useState } from "react";
import {
  fetchReports,
  type ReportsResponse,
} from "@/api/client";
import DashboardCard from "@/components/DashboardCard";

export default function ReportsPage() {
  const [data, setData] = useState<ReportsResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [from, setFrom] = useState("");

  const [to, setTo] = useState("");

  async function loadReports(
    fromDate?: string,
    toDate?: string
  ) {
    try {
      setLoading(true);

      const result = await fetchReports(
        fromDate,
        toDate
      );

      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  function handleSearch() {
    loadReports(from, to);
  }

  function handleReset() {
    setFrom("");
    setTo("");

    loadReports();
  }

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return <div>Loading Reports...</div>;
  }

  if (!data) {
    return <div>Failed to load reports.</div>;
  }

  return (
    <div>

      <h1
        style={{
          marginBottom: "24px",
        }}
      >
        Reports
      </h1>

      {/* ====================================================== */}
      {/* Filters */}
      {/* ====================================================== */}

      <div className="card">

        <h2 className="card-title">
          Search Report
        </h2>

        <div className="form-row">

          <div className="field field-flex-200">
            <label>From Date</label>

            <input
              type="date"
              value={from}
              onChange={(e) =>
                setFrom(e.target.value)
              }
            />
          </div>

          <div className="field field-flex-200">
            <label>To Date</label>

            <input
              type="date"
              value={to}
              onChange={(e) =>
                setTo(e.target.value)
              }
            />
          </div>

        </div>

        <div className="draft-actions">

          <button
            className="btn btn-primary"
            onClick={handleSearch}
          >
            Search
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleReset}
          >
            Reset
          </button>

          <button
            className="btn btn-secondary"
            onClick={handlePrint}
          >
            Print
          </button>

        </div>

      </div>

      {/* ====================================================== */}
      {/* Summary */}
      {/* ====================================================== */}

      <div
        className="dashboard-grid"
        style={{
          marginTop: "20px",
        }}
      >

        <DashboardCard
          title="Total Bills"
          value={data.summary.totalBills}
          color="#3b82f6"
        />

        <DashboardCard
          title="Total Sales"
          value={`₹${data.summary.totalSales.toLocaleString()}`}
          color="#22c55e"
        />

        <DashboardCard
          title="Cancelled Bills"
          value={data.summary.cancelledBills}
          color="#ef4444"
        />

        <DashboardCard
          title="GST Collected"
          value={`₹${data.summary.gstCollected.toLocaleString()}`}
          color="#8b5cf6"
        />

      </div>

      {/* ====================================================== */}
      {/* Bills */}
      {/* ====================================================== */}

      <div
        className="card mt-1"
      >

        <h2 className="card-title">
          Bills
        </h2>

        <table className="bill-list">

          <thead>

            <tr>

              <th>Bill No</th>

              <th>Customer</th>

              <th>Amount</th>

              <th>Status</th>

              <th>Date</th>

            </tr>

          </thead>

                    <tbody>
            {data.bills.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    textAlign: "center",
                    padding: "20px",
                  }}
                >
                  No Bills Found
                </td>
              </tr>
            ) : (
              data.bills.map((bill) => (
                <tr key={bill._id}>
                  <td>{bill.billNumber}</td>

                  <td>{bill.customer?.name || "-"}</td>

                  <td>
                    ₹
                    {bill.totals.grandTotal.toLocaleString()}
                  </td>

                  <td>{bill.status}</td>

                  <td>
                    {new Date(
                      bill.createdAt
                    ).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <p
          className="help-text"
          style={{
            marginTop: "12px",
          }}
        >
          Showing {data.bills.length} bill
          {data.bills.length !== 1 ? "s" : ""}
        </p>
        </div>
      {/* ====================================================== */}
      {/* Product Summary */}
      {/* ====================================================== */}

      <div className="card mt-1">
        <h2 className="card-title">
          Top Selling Products
        </h2>

        <table className="bill-list">
          <thead>
            <tr>
              <th>Product</th>
              <th className="num">
                Quantity Sold
              </th>
            </tr>
          </thead>

          <tbody>
            {data.products.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  style={{
                    textAlign: "center",
                    padding: "20px",
                  }}
                >
                  No Product Sales
                </td>
              </tr>
            ) : (
              data.products.map((product) => (
                <tr key={product.name}>
                  <td>{product.name}</td>

                  <td className="num">
                    {product.qty}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <p
          className="help-text"
          style={{
            marginTop: "12px",
          }}
        >
          Showing {data.products.length} products
        </p>
      </div>


        {/* ====================================================== */}
        {/* Customer Summary */}
        {/* ====================================================== */}

        <div className="card mt-1">

        <h2 className="card-title">
            Top Customers
        </h2>

        <table className="bill-list">

            <thead>
            <tr>
                <th>Customer</th>
                <th>Bills</th>
                <th>Total Purchase</th>
                <th>Last Visit</th>
            </tr>
            </thead>

            <tbody>

            {data.customers.length === 0 ? (

                <tr>
                <td
                    colSpan={4}
                    style={{
                    textAlign: "center",
                    padding: "20px",
                    }}
                >
                    No Customers Found
                </td>
                </tr>

            ) : (

                data.customers.map((customer) => (

                <tr key={customer.name}>

                    <td>{customer.name}</td>

                    <td>{customer.bills}</td>

                    <td>
                    ₹{customer.purchase.toLocaleString()}
                    </td>

                    <td>
                    {new Date(
                        customer.lastVisit
                    ).toLocaleDateString()}
                    </td>

                </tr>

                ))

            )}

            </tbody>

        </table>

        <p
            className="help-text"
            style={{
            marginTop: "12px",
            }}
        >
            Showing {data.customers.length} customers
        </p>

        </div>
      </div>
  );
}