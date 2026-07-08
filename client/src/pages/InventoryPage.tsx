import { useEffect, useMemo, useState } from "react";
import {
  Boxes,
  IndianRupee,
  Package,
  TriangleAlert,
  Plus,
  RefreshCw,
  ArrowDownToLine,
} from "lucide-react";

import {
  getInventory,
  getInventorySummary,
  getLowStockProducts,
  type InventoryProduct,
  type InventorySummary,
} from "@/api/client";
import { StockInModal } from "@/components/StockInModal";
import { StockOutModal } from "@/components/StockOutModal";
import StockCard from "@/components/StockCard";
import { StockAdjustmentModal } from "@/components/StockAdjustmentModal";
import { InventoryHistoryModal } from "@/components/InventoryHistoryModal";


import "@/styles/InventoryPage.css";

export default function InventoryPage() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [summary, setSummary] =
    useState<InventorySummary | null>(null);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [sortBy, setSortBy] =
    useState("name");

  const [showStockIn, setShowStockIn] =
    useState(false);

  const [showStockOut, setShowStockOut] = useState(false);

  const [showAdjustment, setShowAdjustment] =
  useState(false);

  const [showHistory, setShowHistory] =
  useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState<InventoryProduct | null>(null);
  
  async function loadInventory() {
    try {
      setLoading(true);

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

  useEffect(() => {
    loadInventory();
  }, []);

  function getProductStatus(product: InventoryProduct) {
    if (product.currentStock === 0) {
      return "Out of Stock";
    }

    if (product.currentStock <= product.minimumStock) {
      return "Low Stock";
    }

    return "In Stock";
  }

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search
    if (search.trim()) {
      filtered = filtered.filter((product) =>
        product.name
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    // Status Filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((product) => {
        const status = getProductStatus(product);

        return status === statusFilter;
      });
    }

    // Sorting
    switch (sortBy) {
      case "stock":
        filtered.sort(
          (a, b) =>
            b.currentStock - a.currentStock
        );
        break;

      case "name":
      default:
        filtered.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        break;
    }

    return filtered;
  }, [
    products,
    search,
    statusFilter,
    sortBy,
  ]);

  if (loading) {
    return <h2>Loading Inventory...</h2>;
  }

  return (
    <div className="inventory-page">
      {/* Header */}

      <div className="inventory-header">
        <div className="inventory-header-left">
          <h1>Inventory</h1>

          <p>
            Manage products, stock movements and
            inventory value.
          </p>
        </div>

        <div className="inventory-header-actions">
          <button className="btn btn-secondary">
            <Plus size={18} />
            Add Product
          </button>

          <button
            className="btn btn-primary"
            disabled={!selectedProduct}
            onClick={() => {
              if (!selectedProduct) {
                alert("Please select a product from the table first.");
                return;
              }

              setShowStockIn(true);
            }}
          >
            <ArrowDownToLine size={18} />
            Stock In
          </button>

          <button
            className="btn btn-light"
            onClick={loadInventory}
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}

      <div className="inventory-summary">
        <StockCard
          title="Total Products"
          value={summary?.totalProducts ?? 0}
          icon={<Package size={28} />}
          iconBg="icon-blue"
        />

        <StockCard
          title="Total Stock"
          value={summary?.totalStock ?? 0}
          icon={<Boxes size={28} />}
          iconBg="icon-green"
        />

        <StockCard
          title="Inventory Value"
          value={`₹${(
            summary?.inventoryValue ?? 0
          ).toLocaleString()}`}
          icon={<IndianRupee size={28} />}
          iconBg="icon-green"
        />

        <StockCard
          title="Low Stock"
          value={summary?.lowStock ?? 0}
          icon={<TriangleAlert size={28} />}
          iconBg="icon-yellow"
          warning
        />
      </div>

      {/* Toolbar */}

      <div className="inventory-toolbar">
        <div className="toolbar-left">
          <input
            type="text"
            placeholder="🔍 Search product..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <div className="toolbar-right">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="All">
              All Status
            </option>

            <option value="In Stock">
              In Stock
            </option>

            <option value="Low Stock">
              Low Stock
            </option>

            <option value="Out of Stock">
              Out of Stock
            </option>
          </select>

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value)
            }
          >
            <option value="name">
              Sort by Name
            </option>

            <option value="stock">
              Sort by Stock
            </option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}

      <div className="inventory-table">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Purchase</th>
              <th>Selling</th>
              <th>Stock</th>
              <th>Min</th>
              <th>Unit</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map((product) => {
              const status = getProductStatus(product);

              return (
                <tr key={product._id}>
                  <td>
                    <strong>{product.name}</strong>
                  </td>

                  <td>{product.category}</td>

                  <td>
                    ₹{product.purchaseRate.toFixed(2)}
                  </td>

                  <td>
                    ₹{product.sellingRate.toFixed(2)}
                  </td>

                  <td>{product.currentStock}</td>

                  <td>{product.minimumStock}</td>

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

                  <td>
                    <div className="inventory-actions">
                      <button
                        className="action-btn view"
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowHistory(true);
                        }}
                      >
                        View
                      </button>

                      <button
                        className="action-btn stock-in"
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowStockIn(true);
                        }}
                      >
                        In
                      </button>

                      <button
                        className="action-btn stock-out"
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowStockOut(true);
                        }}
                      >
                        Out
                      </button>

                      <button
                        className="action-btn adjust"
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowAdjustment(true);
                        }}
                      >
                        Adjust
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredProducts.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="empty-table"
                >
                  📦 No inventory items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <StockInModal
        open={showStockIn}
        product={selectedProduct}
        onClose={() => {
          setShowStockIn(false);
          setSelectedProduct(null);
        }}
        onSaved={async () => {
          setShowStockIn(false);
          setSelectedProduct(null);

          loadInventory();
        }}
      />

      <StockOutModal
        open={showStockOut}
        product={selectedProduct}
        onClose={() => {
          setShowStockOut(false);
          setSelectedProduct(null);
        }}
        onSaved={async () => {
          setShowStockOut(false);
          setSelectedProduct(null);

          await loadInventory();
        }}
      />

      <StockAdjustmentModal
        open={showAdjustment}
        product={selectedProduct}
        onClose={() => {
          setShowAdjustment(false);
          setSelectedProduct(null);
        }}
        onSaved={async (_updated) => {
          setShowAdjustment(false);
          setSelectedProduct(null);

          await loadInventory();
        }}
      />

      <InventoryHistoryModal
        open={showHistory}
        product={selectedProduct}
        onClose={() => {
          setShowHistory(false);
          setSelectedProduct(null);
        }}
      />

    </div>
  );
}