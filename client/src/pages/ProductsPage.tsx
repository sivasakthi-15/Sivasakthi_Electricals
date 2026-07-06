import { useEffect, useMemo, useState } from "react";
import {
  getProducts,
  toggleProductStatus,
  type Product,
} from "@/api/client";
import { ProductTable } from "@/components/ProductTable";
import { EditProductModal } from "@/components/EditProductModal";
import { AddProductModal } from "@/components/AddProductModal";

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [showAddModal, setShowAddModal] =
    useState(false);

  const loadProducts = async () => {
    try {
      setLoading(true);

      const data = await getProducts();

      setProducts(data);
    } catch (err) {
      console.error("Failed to load products", err);
    } finally {
      setLoading(false);
    }
  };

  async function handleToggleStatus(product: Product) {
    try {
      const updated = await toggleProductStatus(
        product._id,
        !product.active
      );

      setProducts((prev) =>
        prev.map((p) =>
          p._id === updated._id ? updated : p
        )
      );
    } catch (err) {
      console.error(err);
      alert("Unable to update product status.");
    }
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return products;

    return products.filter((product) =>
      product.name.toLowerCase().includes(q)
    );
  }, [products, search]);

  const totalProducts = products.length;

  const activeProducts = products.filter(
    (p) => p.active
  ).length;

  const inactiveProducts =
    totalProducts - activeProducts;

  const mostUsedProduct =
    products.length === 0
      ? null
      : [...products].sort(
          (a, b) => b.timesUsed - a.timesUsed
        )[0];

  return (
    <div className="page-container">

      {/* Header */}

      <div className="page-header">
        <div>
          <h2>📦 Product Master</h2>

          <p className="muted-text">
            Manage products used in billing.
          </p>
        </div>

        <button
          className="btn btn-primary"
          type="button"
          onClick={() => setShowAddModal(true)}
        >
          + Add Product
        </button>
      </div>

      {/* Toolbar */}

      <div className="product-toolbar">
        <div className="product-search">
          <input
            type="text"
            placeholder="Search product by name..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>
      </div>

      {/* Summary */}

      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total Products</h4>
          <h2>{totalProducts}</h2>
        </div>

        <div className="stat-card">
          <h4>Active Products</h4>
          <h2>{activeProducts}</h2>
        </div>

        <div className="stat-card">
          <h4>Inactive Products</h4>
          <h2>{inactiveProducts}</h2>
        </div>

        <div className="stat-card">
          <h4>Most Used</h4>

          <h2
            style={{
              fontSize: "1.15rem",
              marginTop: "10px",
            }}
          >
            {mostUsedProduct?.name ?? "-"}
          </h2>

          {mostUsedProduct && (
            <small className="muted-text">
              Used {mostUsedProduct.timesUsed} times
            </small>
          )}
        </div>
      </div>

      {/* Product Table */}

      <div className="product-table-card">
        <ProductTable
          products={filteredProducts}
          loading={loading}
          onEdit={(product) => {
            setEditingProduct(product);
            setShowEditModal(true);
          }}
          onToggleStatus={handleToggleStatus}
        />
      </div>

      {/* Add Product Modal */}

      <AddProductModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSaved={(product) => {
          setProducts((prev) =>
            [...prev, product].sort((a, b) =>
              a.name.localeCompare(b.name)
            )
          );

          setShowAddModal(false);
        }}
      />

      {/* Edit Product Modal */}

      <EditProductModal
        open={showEditModal}
        product={editingProduct}
        onClose={() => {
          setShowEditModal(false);
          setEditingProduct(null);
        }}
        onSaved={(updated) => {
          setProducts((prev) =>
            prev.map((product) =>
              product._id === updated._id
                ? updated
                : product
            )
          );

          setShowEditModal(false);
          setEditingProduct(null);
        }}
      />

    </div>
  );
}