import { useEffect, useMemo, useState } from "react";

import {
  getInventory,
  getInventorySummary,
  getLowStockProducts,
  type InventoryProduct,
  type InventorySummary,
} from "@/api/client";

import "@/styles/InventoryPage.css";

export default function InventoryPage() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [summary, setSummary] =
    useState<InventorySummary | null>(null);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [inventory, summaryData] =
          await Promise.all([
            getInventory(),
            getInventorySummary(),
            getLowStockProducts(),
          ]);

        setProducts(inventory);
        setSummary(summaryData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [products, search]);

  if (loading) {
    return <h2>Loading Inventory...</h2>;
  }

  return (
    <div className="inventory-page">

      <div className="inventory-header">
        <h1>Inventory</h1>
        <p>Manage your stock efficiently</p>
      </div>

      <div className="inventory-summary">

        <div className="summary-card">
          <h3>Total Products</h3>
          <h2>{summary?.totalProducts}</h2>
        </div>

        <div className="summary-card">
          <h3>Total Stock</h3>
          <h2>{summary?.totalStock}</h2>
        </div>

        <div className="summary-card">
          <h3>Inventory Value</h3>
          <h2>
            ₹{summary?.inventoryValue.toLocaleString()}
          </h2>
        </div>

        <div className="summary-card">
          <h3>Low Stock</h3>
          <h2>{summary?.lowStock}</h2>
        </div>

      </div>

      <div className="inventory-toolbar">

        <input
          type="text"
          placeholder="Search product..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>

      <div className="inventory-table">

        <table>

          <thead>
            <tr>
              <th>Product</th>
              <th>Stock</th>
              <th>Unit</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            {filteredProducts.map((product) => {

              const status =
                product.currentStock === 0
                  ? "Out of Stock"
                  : product.currentStock <= 10
                  ? "Low Stock"
                  : "In Stock";

              return (
                <tr key={product._id}>
                  <td>{product.name}</td>

                  <td>{product.currentStock}</td>

                  <td>{product.unit}</td>

                  <td>
                    <span
                      className={`status ${status
                        .replace(/\s/g, "")
                        .toLowerCase()}`}
                    >
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}

          </tbody>

        </table>

      </div>

    </div>
  );
}