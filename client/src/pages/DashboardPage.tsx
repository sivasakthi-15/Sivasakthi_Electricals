import { useEffect, useState } from "react";
import {
  fetchDashboard,
  type DashboardData,
} from "@/api/client";
import DashboardCard from "@/components/DashboardCard";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const result = await fetchDashboard();
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return <div>Loading Dashboard...</div>;
  }

  if (!data) {
    return <div>Failed to load dashboard.</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: "24px" }}>Dashboard</h1>

      {/* Dashboard Cards */}
      <div className="dashboard-grid">
        <DashboardCard
          title="Today's Sales"
          value={`₹${data.todaySales.toLocaleString()}`}
          color="#22c55e"
        />

        <DashboardCard
          title="Today's Bills"
          value={data.todayBills}
          color="#3b82f6"
        />

        <DashboardCard
          title="Month Sales"
          value={`₹${data.monthSales.toLocaleString()}`}
          color="#8b5cf6"
        />

        <DashboardCard
          title="Products"
          value={data.totalProducts}
          color="#f97316"
        />

        <DashboardCard
          title="Customers"
          value={data.totalCustomers}
          color="#06b6d4"
        />

        <DashboardCard
          title="Cancelled Bills"
          value={data.cancelledBills}
          color="#ef4444"
        />
      </div>

      {/* Recent Bills */}
      <div className="card mt-1">
        <h2 className="card-title">Recent Bills</h2>

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
            {data.recentBills.length === 0 ? (
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
              data.recentBills.map((bill) => (
                <tr key={bill._id}>
                  <td>{bill.billNumber}</td>

                  <td>{bill.customer?.name || "-"}</td>

                  <td>
                    ₹{bill.totals.grandTotal.toLocaleString()}
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
      </div>

      {/* Top Selling Products */}
      <div className="card mt-1">
        <h2 className="card-title">Top Selling Products</h2>

        <table className="bill-list">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity Sold</th>
            </tr>
          </thead>

          <tbody>
            {data.topProducts.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  style={{
                    textAlign: "center",
                    padding: "20px",
                  }}
                >
                  No Sales Yet
                </td>
              </tr>
            ) : (
              data.topProducts.map((product) => (
                <tr key={product.name}>
                  <td>{product.name}</td>
                  <td>{product.qty}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}