import type { Customer } from "@/api/client";

interface Props {
  customers: Customer[];
  loading: boolean;
  onEdit: (customer: Customer) => void;
  onToggleStatus: (customer: Customer) => void;
}

function formatDate(date: string) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function CustomerTable({
  customers,
  loading,
  onEdit,
  onToggleStatus,
}: Props) {
  if (loading) {
    return (
      <div className="card">
        <p className="muted-text">Loading customers...</p>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="card">
        <p className="muted-text">No customers found.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="product-table">
        <thead>
          <tr>
            <th style={{ width: "22%" }}>Customer</th>
            <th>Mobile</th>
            <th>Place</th>
            <th className="num">Visits</th>
            <th className="num">Purchase</th>
            <th>Last Visit</th>
            <th>Status</th>
            <th style={{ width: "180px" }}>Action</th>
          </tr>
        </thead>

        <tbody>
          {customers.map((customer) => (
            <tr key={customer._id}>
              <td>
                <div className="product-name">
                  {customer.name}
                </div>
              </td>

              <td>{customer.mobile || "-"}</td>

              <td>{customer.place || "-"}</td>

              <td className="num">
                {customer.timesVisited}
              </td>

              <td className="num">
                ₹{customer.totalPurchase.toFixed(2)}
              </td>

              <td>
                {formatDate(customer.lastVisit)}
              </td>

              <td>
                <span
                  className={`status-badge ${
                    customer.active
                      ? "active"
                      : "inactive"
                  }`}
                >
                  {customer.active
                    ? "Active"
                    : "Inactive"}
                </span>
              </td>

              <td>
                <div className="row-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => onEdit(customer)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className={
                      customer.active
                        ? "btn btn-danger"
                        : "btn btn-primary"
                    }
                    onClick={() =>
                      onToggleStatus(customer)
                    }
                  >
                    {customer.active
                      ? "Disable"
                      : "Enable"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}