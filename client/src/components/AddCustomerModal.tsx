import { useState } from "react";
import {
  createCustomer,
  type Customer,
} from "@/api/client";
import { Modal } from "@/components/Modal";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (customer: Customer) => void;
}

export function AddCustomerModal({
  open,
  onClose,
  onSaved,
}: Props) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [place, setPlace] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const reset = () => {
    setName("");
    setMobile("");
    setPlace("");
    setError("");
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Customer name is required.");
      return;
    }

    try {
      setSaving(true);

      const customer = await createCustomer({
        name: name.trim(),
        mobile: mobile.trim(),
        place: place.trim(),
      });

      onSaved(customer);

      reset();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Unable to create customer.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Add Customer"
      onClose={onClose}
    >
      <div className="field">
        <label>Customer Name</label>

        <input
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
        />
      </div>

      <div className="field">
        <label>Mobile</label>

        <input
          value={mobile}
          onChange={(e) =>
            setMobile(e.target.value)
          }
        />
      </div>

      <div className="field">
        <label>Place</label>

        <input
          value={place}
          onChange={(e) =>
            setPlace(e.target.value)
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
            : "Add Customer"}
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => {
            reset();
            onClose();
          }}
          disabled={saving}
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}