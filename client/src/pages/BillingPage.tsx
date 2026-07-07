import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { BillA4 } from "@/components/BillA4";
import { Modal } from "@/components/Modal";
import {
  createBill,
  fetchCounter,
  fetchCustomerSuggestions,
  getBill,
  saveAsNewBill,
  updateBillOverwrite,
} from "@/api/client";
import { SHOPS } from "@/constants/shops";
import type { BillPayload, BillType, GstMode, LineItem, ShopId } from "@/types/bill";
import { computeBillTotals } from "@/utils/calculations";
import { buildDisplayRows } from "@/utils/lineRows";
import { downloadBillPdf } from "@/utils/pdf";
import { buildBillShareText, openWhatsAppShare } from "@/utils/whatsapp";
import { clearDraft, loadDraft, useAutoSaveDraft } from "@/hooks/useDraftStorage";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { createEmptyBill, defaultItems, emptyLine, ROWS } from "@/state/emptyBill";
import { ProductAutocomplete } from "@/components/ProductAutocomplete";
import { formatName } from "@/utils/text";


function padItems(items: LineItem[]): LineItem[] {
  const next = items.slice(0, ROWS).map((x) => ({ ...x }));
  while (next.length < ROWS) next.push(emptyLine());
  return next;
}

function normalizeBill(b: Partial<BillPayload> & { items?: LineItem[] }): BillPayload {
  return {
    billType: b.billType ?? "normal",
    shop: b.shop ?? "sivasakthi",
    gstMode: b.gstMode ?? "off",
    status: b.status ?? "draft",
    customer: { name: "", mobile: "", place: "", ...b.customer },
    items: padItems(b.items ?? defaultItems()),
    totals: {
      subtotal: 0,
      taxableValue: 0,
      cgst: 0,
      sgst: 0,
      totalTax: 0,
      discountTotal: 0,
      freight: 0,
      roundOff: 0,
      grandTotal: 0,
      ...b.totals,
    },
  };
}

function inferUnitFromDescription(description: string): string {
  const s = description.trim().toLowerCase();
  if (!s) return "Nos";

  const meterKeywords = [
  "wire",
  "cable",
  "pipe",
  "hose",
];
  if (meterKeywords.some((k) => s.includes(k))) return "Meter";

  const nosKeywords = [
    "switch board",
    "switchboard",
    "switch plate",
    "switch",
    "mcb",
    "db",
    "distribution board",
  ];
  if (nosKeywords.some((k) => s.includes(k))) return "Nos";

  return "Nos";
}

export function BillingPage() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const editId = sp.get("edit");
  const viewId = sp.get("view");
  const dupId = sp.get("duplicate");
  const typeQ = sp.get("type") as BillType | null;
  const shopQ = sp.get("shop") as ShopId | null;

  const readOnly = Boolean(viewId);

  useEffect(() => {
    // If the billing page was opened directly (no prior browser history)
    // and it's not an edit/view/duplicate flow, send user to HomePage
    // so they can select shop/type first.
    try {
      if (
        typeof window !== "undefined" &&
        window.history.length <= 1 &&
        !location.state?.from &&
        !editId &&
        !viewId &&
        !dupId
      ) {
        navigate("/", { replace: true });
      }
    } catch {
      /* ignore */
    }
  }, []);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [bill, setBill] = useState<BillPayload>(() =>
    createEmptyBill(typeQ ?? "normal", shopQ ?? "sivasakthi")
  );
  const [upiId, setUpiId] = useState("");
  const [tempDisplayNumber, setTempDisplayNumber] = useState("—");
  const [invoiceDate, setInvoiceDate] = useState(() => new Date());
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showChangeShopModal, setShowChangeShopModal] = useState(false);
  const [pendingShop, setPendingShop] = useState<ShopId | null>(null);
  const [customerOpts, setCustomerOpts] = useState<{ name: string; mobile: string; place: string }[]>(
    []
  );
  const [error, setError] = useState<string | null>(null);
  const pendingAfterEditRef = useRef<"save" | "print" | null>(null);

  const printRootRef = useRef<HTMLDivElement | null>(null);

  const refreshTemp = useCallback(async (shop: ShopId) => {
    try {
      const c = await fetchCounter(shop);
      setTempDisplayNumber(c.tempDisplayNumber);
    } catch {
      setTempDisplayNumber("Offline");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (viewId || editId) {
        try {
          const id = viewId || editId!;
          const b = await getBill(id);
          if (cancelled) return;
          setEditingId(viewId ? null : id);
          setBill(
            normalizeBill({
              ...b,
              items: padItems(b.items ?? []),
            })
          );
          setUpiId(SHOPS[b.shop].defaultUpi);
          setInvoiceDate(b.createdAt ? new Date(b.createdAt) : new Date());
          await refreshTemp(b.shop);
        } catch {
          setError("Failed to load bill.");
        }
        return;
      }
      if (dupId) {
        try {
          const b = await getBill(dupId);
          if (cancelled) return;
          setEditingId(null);
          setBill(
            normalizeBill({
              ...b,
              billNumber: undefined,
              items: padItems(b.items?.map((x) => ({ ...x })) ?? []),
              status: "draft",
            })
          );
          setUpiId(SHOPS[b.shop].defaultUpi);
          setInvoiceDate(new Date());
          await refreshTemp(b.shop);
        } catch {
          setError("Failed to duplicate bill.");
        }
        return;
      }
      const bt = typeQ ?? "normal";
      const sh = shopQ ?? "sivasakthi";
      const draft = loadDraft();

    if (draft && draft.billType === bt && draft.shop === sh) {
      setBill(
        normalizeBill({
          ...draft,
          items: padItems(draft.items ?? []),
        })
      );

      setUpiId(draft.upiId ?? SHOPS[draft.shop].defaultUpi);
    } else {
      setBill(createEmptyBill(bt, sh));
      setUpiId(SHOPS[sh].defaultUpi);
    }
      setInvoiceDate(new Date());
      await refreshTemp(sh);
    })();
    return () => {
      cancelled = true;
    };
  }, [dupId, editId, viewId, typeQ, shopQ, refreshTemp]);

  useEffect(() => {
    (async () => {
      try {
        const c = await fetchCustomerSuggestions();
        setCustomerOpts(c);
      } catch {
        /* offline */
      }
    })();
  }, []);

  const liveTotals = useMemo(
    () =>
      computeBillTotals({
        billType: bill.billType,
        gstMode: bill.billType === "contractor" ? "on" : bill.gstMode,
        items: bill.items,
        freight: 0,
      }),
    [bill.billType, bill.gstMode, bill.items]
  );

  const displayBill = useMemo(
    () => ({ ...bill, totals: liveTotals }),
    [bill, liveTotals]
  );

  const draftPayload = useMemo(
    () => ({
      ...bill,
      totals: liveTotals,
      tempDisplayNumber,
      upiId,
    }),
    [bill, liveTotals, tempDisplayNumber, upiId]
  );

  useAutoSaveDraft(draftPayload, !readOnly && bill.status === "draft" && !editingId);

  const displayNumber = bill.billNumber ?? tempDisplayNumber;
  const displayRows = buildDisplayRows(displayBill.billType, displayBill.gstMode, displayBill.items);
  const shopCfg = SHOPS[bill.shop];

  const persistNew = async (): Promise<BillPayload & { _id: string }> => {
    const body = {
      ...bill,
      totals: liveTotals,
      status: bill.status === "draft" ? "active" : bill.status,
      createdAt: invoiceDate.toISOString(),
    };
    const { billNumber: _bn, _id: _i, ...rest } = body as BillPayload & {
      _id?: string;
    };
    const saved = await createBill(rest);
    setEditingId(saved._id);
    setBill((prev) => ({
      ...prev,
      ...saved,
      items: padItems(saved.items ?? prev.items),
      status: "saved",
    }));
    clearDraft();
    await refreshTemp(bill.shop);
    return saved;
  };

  const runPrint = () => {
    requestAnimationFrame(() => window.print());
  };

  const finishSaveOrPrint = async (intent: "save" | "print") => {
    setError(null);
    try {
      if (!editingId) {
        await persistNew();
        if (intent === "print") runPrint();
        setShowPrintModal(false);
        return;
      }
      pendingAfterEditRef.current = intent;
      setShowEditModal(true);
    } catch {
      setError("Save failed. Check API / MongoDB.");
    }
  };

  const applyOverwrite = async () => {
    const payload = {
      ...bill,
      totals: liveTotals,
      updatedAt: new Date().toISOString(),
    };
    const saved = await updateBillOverwrite(editingId!, payload);
    setBill(normalizeBill({ ...saved, items: padItems(saved.items ?? []) }));
    setShowEditModal(false);
    setShowPrintModal(false);
    const intent = pendingAfterEditRef.current;
    pendingAfterEditRef.current = null;
    if (intent === "print") runPrint();
  };

  const applySaveAsNew = async () => {
    const payload = {
      ...bill,
      totals: liveTotals,
      createdAt: invoiceDate.toISOString(),
    };
    const saved = await saveAsNewBill(editingId!, payload);
    setEditingId(saved._id);
    setBill(normalizeBill({ ...saved, items: padItems(saved.items ?? []) }));
    setShowEditModal(false);
    setShowPrintModal(false);
    await refreshTemp(bill.shop);
    const intent = pendingAfterEditRef.current;
    pendingAfterEditRef.current = null;
    if (intent === "print") runPrint();
  };

  const onSaveClick = () => {
    if (readOnly) return;
    if (editingId) {
      pendingAfterEditRef.current = "save";
      setShowEditModal(true);
      return;
    }
    void finishSaveOrPrint("save");
  };

  const onPrintClick = () => {
    if (readOnly) {
      runPrint();
      return;
    }
    setShowPrintModal(true);
  };

  useKeyboardShortcuts({
    onSave: onSaveClick,
    onPrint: onPrintClick,
  });

  const changeLine = (idx: number, patch: Partial<LineItem>) => {
    setBill((prev) => {
      const items = prev.items.map((x, i) => (i === idx ? { ...x, ...patch } : x));
      return { ...prev, items };
    });
  };

  const pdfName = `${displayNumber.replace(/\//g, "-")}.pdf`;

  const downloadPdf = async () => {
    const el = printRootRef.current?.querySelector("#print-root") as HTMLElement | null;
    if (!el) return;
    await downloadBillPdf(el, pdfName);
  };

  const shareWa = () => {
    openWhatsAppShare(buildBillShareText(displayBill, displayNumber));
  };

  return (
    <div>
      <div className="toolbar">
        <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <Link to="/bills" className="btn btn-secondary">
          View bills
        </Link>
        {!readOnly && (
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                if (!confirm("Duplicate this bill? Number and date will reset.")) return;
                setEditingId(null);
                setBill((prev) => ({
                  ...prev,
                  billNumber: undefined,
                  status: "draft",
                  items: padItems(prev.items.map((x) => ({ ...x }))),
                }));
                setInvoiceDate(new Date());
                void refreshTemp(bill.shop);
              }}
            >
              Duplicate bill
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setPendingShop(null);
                setShowChangeShopModal(true);
              }}
            >
              Change shop
            </button>
          </>
        )}
        <span className="spacer" />
        {!readOnly && (
          <>
            <button type="button" className="btn btn-primary" onClick={onSaveClick}>
              Save (Ctrl+S)
            </button>
            <button type="button" className="btn btn-secondary" onClick={shareWa}>
              WhatsApp
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => void downloadPdf()}>
              PDF
            </button>
            <button type="button" className="btn btn-secondary" onClick={onPrintClick}>
              Print (Ctrl+P)
            </button>
          </>
        )}
        {readOnly && (
          <button type="button" className="btn btn-secondary" onClick={onPrintClick}>
            Print
          </button>
        )}
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="billing-layout">
        <div className="card">
          <h3 className="card-subtitle">Bill details</h3>
          <div className="form-row">
            <div className="field field-flex-140">
              <label htmlFor="invoice-preview">Invoice no. (preview)</label>
              <input id="invoice-preview" readOnly value={displayNumber} />
            </div>
            <div className="field field-flex-140">
              <label htmlFor="invoice-date">Date</label>
              <input
                id="invoice-date"
                type="datetime-local"
                disabled={readOnly}
                value={invoiceDate.toISOString().slice(0, 16)}
                onChange={(e) => setInvoiceDate(new Date(e.target.value))}
              />
            </div>
            {bill.billType === "normal" && (
              <div className="field field-flex-160">
                <label htmlFor="invoice-gst">GST</label>
                <select
                  id="invoice-gst"
                  disabled={readOnly}
                  value={bill.gstMode}
                  onChange={(e) =>
                    setBill((p) => ({ ...p, gstMode: e.target.value as GstMode }))
                  }
                >
                  <option value="off">GST off</option>
                  <option value="on">GST on (inclusive rate)</option>
                </select>
              </div>
            )}
            <div className="field field-flex-200">
              <label htmlFor="upi-id">UPI ID (QR)</label>
              <input
                id="upi-id"
                disabled={readOnly}
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
            </div>
          </div>

          <h4>Customer</h4>
          <div className="grid-3">
            <div className="field">
              <label htmlFor="customer-name">Name</label>
              <input
                id="customer-name"
                disabled={readOnly}
                list="cust-names"
                value={bill.customer.name}
                onChange={(e) =>
                  setBill((p) => ({ ...p, customer: { ...p.customer, name: e.target.value } }))
                }
              />
            </div>
            <div className="field">
              <label htmlFor="customer-mobile">Mobile</label>
              <input
                id="customer-mobile"
                disabled={readOnly}
                list="cust-mobiles"
                value={bill.customer.mobile}
                onChange={(e) =>
                  setBill((p) => ({ ...p, customer: { ...p.customer, mobile: e.target.value } }))
                }
              />
            </div>
            <div className="field">
              <label htmlFor="customer-place">Place</label>
              <input
                id="customer-place"
                disabled={readOnly}
                value={bill.customer.place}
                onChange={(e) =>
                  setBill((p) => ({ ...p, customer: { ...p.customer, place: e.target.value } }))
                }
              />
            </div>
          </div>
          <datalist id="cust-names">
            {customerOpts.map((c, i) => (
              <option key={i} value={c.name} />
            ))}
          </datalist>
          <datalist id="cust-mobiles">
            {customerOpts.map((c, i) => (
              <option key={i} value={c.mobile} />
            ))}
          </datalist>

          <h4>Products ({ROWS} rows)</h4>
          <div className="table-wrap">
            <table className="edit-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Description</th>
                  <th className="num">Qty</th>
                  <th>Unit</th>
                  <th className="num">Rate</th>
                  <th className="num">Disc %</th>
                </tr>
              </thead>
              <tbody>
                {bill.items.map((row, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>
                      <ProductAutocomplete
                        disabled={readOnly}
                        value={row.description}
                        onChange={(description) => {
                          const formatted = formatName(description);

                          changeLine(idx, {
                            description: formatted,
                            unit: inferUnitFromDescription(formatted),
                          });
                        }}
                        onSelect={(product) => {
                          changeLine(idx, {
                            description: formatName(product.name),
                            rate: product.latestRate,
                            unit: product.unit,
                          });
                        }}
                      />
                    </td>
                    <td className="num">
                      <input
                        aria-label="Quantity"
                        disabled={readOnly}
                        type="number"
                        value={row.qty || ""}
                        onChange={(e) => changeLine(idx, { qty: Number(e.target.value) || 0 })}
                      />
                    </td>
                    <td>
                      <input
                        aria-label="Unit"
                        disabled={readOnly}
                        value={row.unit}
                        onChange={(e) => changeLine(idx, { unit: e.target.value })}
                      />
                    </td>
                    <td className="num">
                      <input
                        aria-label="Rate"
                        disabled={readOnly}
                        type="number"
                        value={row.rate || ""}
                        onChange={(e) => changeLine(idx, { rate: Number(e.target.value) || 0 })}
                      />
                    </td>
                    <td className="num">
                      <input
                        aria-label="Disc percent"
                        disabled={readOnly}
                        type="number"
                        value={row.discountPercent || ""}
                        onChange={(e) =>
                          changeLine(idx, { discountPercent: Number(e.target.value) || 0 })
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="help-text">
            {bill.billType === "contractor"
              ? "Contractor: rate is without GST; 18% is added in net amount."
              : bill.gstMode === "on"
                ? "Normal GST on: rate includes GST; taxable value and tax are derived."
                : "Normal GST off: net equals qty × rate after discount (same total as GST on for the same inclusive rate)."}
          </p>
        </div>

        <div className="preview-scroll" ref={printRootRef}>
          <BillA4
            shop={shopCfg}
            bill={displayBill}
            displayNumber={displayNumber}
            invoiceDate={invoiceDate}
            displayRows={displayRows}
            upiId={upiId}
          />
        </div>
      </div>

      {showPrintModal && (
        <Modal title="Print" onClose={() => setShowPrintModal(false)}>
          <p>Numbers are reserved when the bill is saved to the server. Choose an option:</p>
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => void finishSaveOrPrint("print")}
            >
              Save &amp; print
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => void finishSaveOrPrint("print")}
            >
              Print only (still saves &amp; reserves no.)
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setShowPrintModal(false)}>
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {showEditModal && (
        <Modal title="Bill already exists" onClose={() => setShowEditModal(false)}>
          <p>This bill already exists. What do you want to do?</p>
          <div className="modal-actions">
            <button type="button" className="btn btn-primary" onClick={() => void applyOverwrite()}>
              Update existing bill
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => void applySaveAsNew()}>
              Save as new bill
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                pendingAfterEditRef.current = null;
                setShowEditModal(false);
                setShowPrintModal(false);
              }}
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {showChangeShopModal && (
        <Modal
          title="Change shop"
          onClose={() => {
            setPendingShop(null);
            setShowChangeShopModal(false);
          }}
        >
          <p>Header and bank details will update. Continue?</p>
          <div className="field">
            <label htmlFor="new-shop">New shop</label>
            <select
              id="new-shop"
              value={(pendingShop ?? bill.shop) as ShopId}
              onChange={(e) => setPendingShop(e.target.value as ShopId)}
            >
              {(Object.keys(SHOPS) as ShopId[]).map((id) => (
                <option key={id} value={id}>
                  {SHOPS[id].name}
                </option>
              ))}
            </select>
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                const next = pendingShop ?? bill.shop;
                setPendingShop(next);
                setBill((p) => ({ ...p, shop: next }));
                setUpiId(SHOPS[next].defaultUpi);
                void refreshTemp(next);
                setShowChangeShopModal(false);
                setPendingShop(null);
              }}
            >
              Confirm
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setShowChangeShopModal(false)}>
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
