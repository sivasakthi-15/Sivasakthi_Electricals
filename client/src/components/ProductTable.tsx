import type { Product } from "@/api/client";

interface Props {
  products: Product[];
  loading: boolean;
  onEdit: (product: Product) => void;
  onToggleStatus: (product: Product) => void;
}

function formatDate(date: string) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ProductTable({
  products,
  loading,
  onEdit,
  onToggleStatus,
}: Props) {
  if (loading) {
    return (
      <div className="card">
        <p className="muted-text">Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="card">
        <p className="muted-text">No products found.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="product-table">
        <thead>
          <tr>
            <th style={{ width: "35%" }}>Product</th>
            <th className="num">Rate</th>
            <th>Unit</th>
            <th className="num">Used</th>
            <th>Last Used</th>
            <th>Status</th>
            <th style={{ width: "180px" }}>Action</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td>
                <div className="product-name">
                  {product.name}
                </div>
              </td>

              <td className="num">
                ₹{product.latestRate.toFixed(2)}
              </td>

              <td>{product.unit || "-"}</td>

              <td className="num">
                {product.timesUsed}
              </td>

              <td>{formatDate(product.lastUsed)}</td>

              <td>
                <span
                  className={`status-badge ${
                    product.active
                      ? "active"
                      : "inactive"
                  }`}
                >
                  {product.active
                    ? "Active"
                    : "Inactive"}
                </span>
              </td>

              <td>
                <div className="row-actions">

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => onEdit(product)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className={
                      product.active
                        ? "btn btn-danger"
                        : "btn btn-primary"
                    }
                    onClick={() =>
                      onToggleStatus(product)
                    }
                  >
                    {product.active
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