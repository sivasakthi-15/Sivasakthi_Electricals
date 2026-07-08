import { useEffect, useState } from "react";

import {
  getStockHistory,
  type InventoryProduct,
  type InventoryTransaction,
} from "@/api/client";

import { Modal } from "@/components/Modal";

interface Props {
  open: boolean;
  product: InventoryProduct | null;
  onClose: () => void;
}

export function InventoryHistoryModal({
  open,
  product,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<
    InventoryTransaction[]
  >([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !product) return;

    loadHistory();
  }, [open, product]);

 async function loadHistory() {
    if (!product) return;

    console.log("==================================");
    console.log("Selected Product");
    console.log(product);
    console.log("Product ID:", product._id);

    try {
        setLoading(true);
        setError("");

        const data = await getStockHistory(product._id);

        console.log("History API Response");
        console.log(data);

        setHistory(data);
    } catch (err: any) {
        console.error(err);

        setError(
        err.message || "Failed to load stock history."
        );
    } finally {
        setLoading(false);
    }
    }

  function getTypeColor(type: string) {
    switch (type) {
      case "PURCHASE":
        return "#16a34a";

      case "SALE":
        return "#dc2626";

      case "RETURN":
        return "#2563eb";

      case "ADJUSTMENT":
        return "#ca8a04";

      default:
        return "#6b7280";
    }
  }

  function formatQty(
    type: InventoryTransaction["type"],
    qty: number
  ) {
    switch (type) {
      case "PURCHASE":
      case "RETURN":
        return `+${qty}`;

      case "SALE":
        return `-${qty}`;

      case "ADJUSTMENT":
        return qty > 0
          ? `+${qty}`
          : `${qty}`;

      default:
        return qty;
    }
  }

  if (!open) {
    return null;
  }

  return (
    <Modal
      title={`Stock History${
        product
          ? ` - ${product.name}`
          : ""
      }`}
      onClose={onClose}
    >
      {loading && (
        <p>Loading history...</p>
      )}

      {!loading && error && (
        <p className="error-text">
          {error}
        </p>
      )}

      {!loading &&
        !error &&
        history.length === 0 && (
          <p>
            No inventory transactions
            found.
          </p>
        )}

      {!loading &&
        history.length > 0 && (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: "left",
                    padding: 8,
                  }}
                >
                  Date
                </th>

                <th
                  style={{
                    textAlign: "left",
                    padding: 8,
                  }}
                >
                  Type
                </th>

                <th
                  style={{
                    textAlign: "right",
                    padding: 8,
                  }}
                >
                  Qty
                </th>

                <th
                  style={{
                    textAlign: "right",
                    padding: 8,
                  }}
                >
                  Balance
                </th>

                <th
                  style={{
                    textAlign: "left",
                    padding: 8,
                  }}
                >
                  Remarks
                </th>
              </tr>
            </thead>

            <tbody>
              {history.map((txn) => (
                <tr key={txn._id}>
                  <td
                    style={{
                      padding: 8,
                    }}
                  >
                    {new Date(
                      txn.createdAt
                    ).toLocaleString()}
                  </td>

                  <td
                    style={{
                      padding: 8,
                      color: getTypeColor(
                        txn.type
                      ),
                      fontWeight: 600,
                    }}
                  >
                    {txn.type}
                  </td>

                  <td
                    style={{
                      padding: 8,
                      textAlign: "right",
                      fontWeight: 600,
                    }}
                  >
                    {formatQty(
                      txn.type,
                      txn.quantity
                    )}
                  </td>

                  <td
                    style={{
                      padding: 8,
                      textAlign: "right",
                    }}
                  >
                    {txn.balanceAfter}
                  </td>

                  <td
                    style={{
                      padding: 8,
                    }}
                  >
                    {txn.remarks || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      <div
        className="modal-actions"
        style={{ marginTop: 20 }}
      >
        <button
            className="btn btn-secondary"
            onClick={() => {
                console.log("Button clicked");
                onClose();
            }}
            >
            Close
            </button>
      </div>
    </Modal>
  );
}