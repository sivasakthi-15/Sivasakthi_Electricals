import { useEffect, useState } from "react";
import { updateProduct, type Product } from "@/api/client";
import { Modal } from "@/components/Modal";

interface Props {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onSaved: (product: Product) => void;
}

export function EditProductModal({
  open,
  product,
  onClose,
  onSaved,
}: Props) {
  const [name, setName] = useState("");
  const [latestRate, setLatestRate] = useState(0);
  const [unit, setUnit] = useState("");
  const [active, setActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!product) return;

    setName(product.name);
    setLatestRate(product.latestRate);
    setUnit(product.unit);
    setActive(product.active);

    setError("");
  }, [product]);

  if (!open || !product) {
    return null;
  }

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (latestRate < 0) {
      setError("Rate cannot be negative.");
      return;
    }

    try {
      setSaving(true);

      const updated = await updateProduct(product._id, {
        name: name.trim(),
        latestRate,
        unit: unit.trim(),
        active,
      });

      onSaved(updated);

      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Edit Product"
      onClose={onClose}
    >
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

      <div className="field">
        <label>Status</label>

        <select
          value={active ? "active" : "inactive"}
          onChange={(e) =>
            setActive(e.target.value === "active")
          }
        >
          <option value="active">
            Active
          </option>

          <option value="inactive">
            Inactive
          </option>
        </select>
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
          {saving ? "Saving..." : "Save Changes"}
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