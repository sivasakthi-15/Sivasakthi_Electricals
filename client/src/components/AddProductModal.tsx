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
  const [latestRate, setLatestRate] = useState(0);
  const [unit, setUnit] = useState("");

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
        latestRate,
        unit: unit.trim(),
      });

      onSaved(product);

      setName("");
      setLatestRate(0);
      setUnit("");
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
        <label>Product Name</label>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="field">
        <label>Latest Rate</label>

        <input
          type="number"
          value={latestRate}
          onChange={(e) =>
            setLatestRate(Number(e.target.value))
          }
        />
      </div>

      <div className="field">
        <label>Unit</label>

        <input
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
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
          {saving ? "Saving..." : "Create Product"}
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