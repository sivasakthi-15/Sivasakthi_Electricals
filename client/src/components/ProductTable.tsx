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
            <th>Product</th>

            <th>Category</th>

            <th className="num">Purchase</th>

            <th className="num">Selling</th>

            <th className="num">Stock</th>

            <th className="num">Min</th>

            <th>Unit</th>

            <th className="num">GST</th>

            <th className="num">Used</th>

            <th>Last Used</th>

            <th>Status</th>

            <th style={{ width: "180px" }}>
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td>
                <strong>{product.name}</strong>
              </td>

              <td>{product.category}</td>

              <td className="num">
                ₹
                {product.purchaseRate.toFixed(2)}
              </td>

              <td className="num">
                ₹
                {product.sellingRate.toFixed(2)}
              </td>

              <td className="num">
                {product.currentStock}
              </td>

              <td className="num">
                {product.minimumStock}
              </td>

              <td>{product.unit}</td>

              <td className="num">
                {product.gst}%
              </td>

              <td className="num">
                {product.timesUsed}
              </td>

              <td>
                {formatDate(product.lastUsed)}
              </td>

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
                    onClick={() =>
                      onEdit(product)
                    }
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