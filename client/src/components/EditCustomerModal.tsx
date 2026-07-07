import { useEffect, useState } from "react";
import {
  updateCustomer,
  type Customer,
} from "@/api/client";
import { Modal } from "@/components/Modal";

interface Props {
  open: boolean;
  customer: Customer | null;
  onClose: () => void;
  onSaved: (customer: Customer) => void;
}

export function EditCustomerModal({
  open,
  customer,
  onClose,
  onSaved,
}: Props) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [place, setPlace] = useState("");
  const [active, setActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!customer) return;

    setName(customer.name);
    setMobile(customer.mobile);
    setPlace(customer.place);
    setActive(customer.active);

    setError("");
  }, [customer]);

  if (!open || !customer) {
    return null;
  }

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Customer name is required.");
      return;
    }

    try {
      setSaving(true);

      const updated = await updateCustomer(customer._id, {
        name: name.trim(),
        mobile: mobile.trim(),
        place: place.trim(),
        active,
      });

      onSaved(updated);

      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to update customer.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Edit Customer"
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

      <div className="field">
        <label>Status</label>

        <select
          value={active ? "active" : "inactive"}
          onChange={(e) =>
            setActive(
              e.target.value === "active"
            )
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
          {saving
            ? "Saving..."
            : "Save Changes"}
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