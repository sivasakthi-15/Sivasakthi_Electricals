import { useEffect, useState } from "react";
import {
  stockIn,
  type InventoryProduct,
} from "@/api/client";
import { Modal } from "@/components/Modal";

interface Props {
  open: boolean;
  product: InventoryProduct | null;
  onClose: () => void;
  onSaved: (product: InventoryProduct) => void;
}

export function StockInModal({
  open,
  product,
  onClose,
  onSaved,
}: Props) {
  const [quantity, setQuantity] = useState(1);
  const [remarks, setRemarks] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setQuantity(1);
    setRemarks("");
    setError("");
  }, [open]);

  if (!open || !product) {
    return null;
  }

  async function handleSave() {
    if (saving) return;
    if (quantity <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    try {
      setSaving(true);

      const updated = await stockIn({
        productId: product._id,
        quantity,
        remarks,
      });

      onSaved(updated);

      onClose();
    } catch (err: any) {
      console.error(err);

      setError(
        err.message || "Failed to update stock."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Stock In"
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
          value={product.currentStock}
          readOnly
        />
      </div>

      <div className="field">
        <label>Quantity *</label>

        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) =>
            setQuantity(Number(e.target.value))
          }
        />
      </div>

      <div className="field">
        <label>Remarks</label>

        <textarea
          rows={3}
          value={remarks}
          placeholder="Purchase, supplier, adjustment..."
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
          {saving ? "Saving..." : "Save"}
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