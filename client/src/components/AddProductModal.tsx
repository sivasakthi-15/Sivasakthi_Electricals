import { useState } from "react";
import { createProduct, type Product } from "@/api/client";
import { Modal } from "@/components/Modal";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (product: Product) => void;
}

export function AddProductModal({
  open,
  onClose,
  onSaved,
}: Props) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("General");

  const [purchaseRate, setPurchaseRate] = useState(0);
  const [sellingRate, setSellingRate] = useState(0);
  const [currentStock, setCurrentStock] = useState(0);
  const [minimumStock, setMinimumStock] = useState(0);
  const [reorderLevel, setReorderLevel] = useState(0);

  const [unit, setUnit] = useState("Nos");

  const [gst, setGst] = useState(18);
  const [hsnCode, setHsnCode] = useState("");
  const [barcode, setBarcode] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function handleSave() {
    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }

    try {
      setSaving(true);

      const product = await createProduct({
        name: name.trim(),

        category,

        latestRate: sellingRate,

        purchaseRate,
        sellingRate,

        currentStock,
        minimumStock,
        reorderLevel,

        unit,

        gst,
        hsnCode,
        barcode,
      });

      onSaved(product);

      setName("");
      setCategory("General");

      setPurchaseRate(0);
      setSellingRate(0);
      setCurrentStock(0);
      setMinimumStock(0);
      setReorderLevel(0);

      setUnit("Nos");

      setGst(18);
      setHsnCode("");
      setBarcode("");

      setError("");

      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Add Product" onClose={onClose}>
      <div className="field">
        <label>Product Name *</label>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="field">
        <label>Category</label>

        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
        >
          <option>General</option>
          <option>Electrical</option>
          <option>Pipes</option>
          <option>Hardware</option>
          <option>Lighting</option>
          <option>Switches</option>
          <option>Cables</option>
          <option>PVC</option>
        </select>
      </div>

      <div className="field">
        <label>Purchase Rate</label>

        <input
          type="number"
          value={purchaseRate}
          onChange={(e) =>
            setPurchaseRate(Number(e.target.value))
          }
        />
      </div>

      <div className="field">
        <label>Selling Rate</label>

        <input
          type="number"
          value={sellingRate}
          onChange={(e) =>
            setSellingRate(Number(e.target.value))
          }
        />
      </div>

      <div className="field">
        <label>Current Stock</label>

        <input
          type="number"
          value={currentStock}
          onChange={(e) =>
            setCurrentStock(Number(e.target.value))
          }
        />
      </div>

      <div className="field">
        <label>Minimum Stock</label>

        <input
          type="number"
          value={minimumStock}
          onChange={(e) =>
            setMinimumStock(Number(e.target.value))
          }
        />
      </div>

      <div className="field">
        <label>Reorder Level</label>

        <input
          type="number"
          value={reorderLevel}
          onChange={(e) =>
            setReorderLevel(Number(e.target.value))
          }
        />
      </div>

      <div className="field">
        <label>Unit</label>

        <input
          value={unit}
          onChange={(e) =>
            setUnit(e.target.value)
          }
        />
      </div>

      <div className="field">
        <label>GST (%)</label>

        <input
          type="number"
          value={gst}
          onChange={(e) =>
            setGst(Number(e.target.value))
          }
        />
      </div>

      <div className="field">
        <label>HSN Code</label>

        <input
          value={hsnCode}
          onChange={(e) =>
            setHsnCode(e.target.value)
          }
        />
      </div>

      <div className="field">
        <label>Barcode</label>

        <input
          value={barcode}
          onChange={(e) =>
            setBarcode(e.target.value)
          }
        />
      </div>

      {error && (
        <p className="error-text">
          {error}
        </p>
      )}

      <div className="modal-actions">
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : "Create Product"}
        </button>

        <button
          className="btn btn-secondary"
          onClick={onClose}
          disabled={saving}
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}