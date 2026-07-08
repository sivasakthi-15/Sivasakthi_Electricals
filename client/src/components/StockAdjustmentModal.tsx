import { useEffect, useMemo, useState } from "react";

import {
  adjustStock,
  type InventoryProduct,
} from "@/api/client";

import { Modal } from "@/components/Modal";

interface Props {
  open: boolean;
  product: InventoryProduct | null;
  onClose: () => void;
  onSaved: (product: InventoryProduct) => void;
}

export function StockAdjustmentModal({
  open,
  product,
  onClose,
  onSaved,
}: Props) {
  const [newStock, setNewStock] = useState(0);
  const [remarks, setRemarks] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !product) return;

    setNewStock(product.currentStock);
    setRemarks("");
    setError("");
  }, [open, product]);

  const difference = useMemo(() => {
    if (!product) return 0;

    return newStock - product.currentStock;
  }, [newStock, product]);

  if (!open || !product) {
    return null;
  }

  async function handleSave() {
    if (saving) return;

    if (newStock < 0) {
      setError("Stock cannot be negative.");
      return;
    }

    try {
      setSaving(true);

      const updated = await adjustStock({
        productId: product._id,
        quantity: newStock,
        remarks,
      });

      onSaved(updated);

      onClose();
    } catch (err: any) {
      console.error(err);

      setError(
        err.message || "Failed to adjust stock."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Stock Adjustment"
      onClose={onClose}
    >
      <div className="field">
        <label>Product</label>

        <input
          value={product.name}
          readOnly
        />
      </div>

      <div className="field">
        <label>Current Stock</label>

        <input
          value={`${product.currentStock} ${product.unit}`}
          readOnly
        />
      </div>

      <div className="field">
        <label>Actual Stock *</label>

        <input
          type="number"
          min={0}
          value={newStock}
          onChange={(e) =>
            setNewStock(Number(e.target.value))
          }
        />
      </div>

      <div className="field">
        <label>Difference</label>

        <input
          value={
            difference >= 0
              ? `+${difference}`
              : difference
          }
          readOnly
        />
      </div>

      <div className="field">
        <label>Remarks</label>

        <textarea
          rows={3}
          value={remarks}
          placeholder="Physical verification, damaged items..."
          onChange={(e) =>
            setRemarks(e.target.value)
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
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? "Saving..." : "Adjust Stock"}
        </button>

        <button
          className="btn btn-secondary"
          disabled={saving}
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}