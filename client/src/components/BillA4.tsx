import { QRCodeSVG } from "qrcode.react";
import type { BillPayload } from "@/types/bill";
import type { ShopConfig } from "@/constants/shops";
import type { DisplayRow } from "@/utils/lineRows";
import { amountToWords } from "@/utils/calculations";
import "./BillA4.css";

function formatMoney(n: number) {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function BillA4({
  shop,
  bill,
  displayNumber,
  invoiceDate,
  displayRows,
  upiId,
}: {
  shop: ShopConfig;
  bill: BillPayload;
  displayNumber: string;
  invoiceDate: Date;
  displayRows: DisplayRow[];
  upiId: string;
}) {
  const words = amountToWords(bill.totals.grandTotal);
  const t = bill.totals;
  const isContractor = bill.billType === "contractor";
  const showGstColumn = isContractor || bill.gstMode === "on";
  const showDiscountColumn = displayRows.some((r) => Boolean(r.discountPercent));
  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(shop.name)}&am=${t.grandTotal.toFixed(2)}&cu=INR`;

  const dateStr = invoiceDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = invoiceDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="a4-root" id="print-root">
      <header className="a4-header">
        <div className="a4-brand">
          <div className="a4-logo" aria-hidden>
            {shop.shortKey}
          </div>
          <div className="a4-shop-meta">
            <h1>{shop.name}</h1>
            <p>{shop.address}</p>
            <p>Phone: {shop.phone}</p>
            <p>Alt: {shop.altMobile}</p>
            <p>GSTIN: {shop.gstin}</p>
          </div>
        </div>


        <div className="a4-inv-meta">
          <div className="a4-inv-row">
            <span className="a4-inv-label">Invoice No.</span>
            <span className="a4-colon">:</span>
            <span className="a4-inv-value">{displayNumber}</span>
          </div>

          <div className="a4-inv-row">
            <span className="a4-inv-label">Date</span>
            <span className="a4-colon">:</span>
            <span className="a4-inv-value">{dateStr}</span>
          </div>

          <div className="a4-inv-row">
            <span className="a4-inv-label">Time</span>
            <span className="a4-colon">:</span>
            <span className="a4-inv-value">{timeStr}</span>
          </div>

          <div className="a4-inv-row">
            <span className="a4-inv-label">Type</span>
            <span className="a4-colon">:</span>
            <span className="a4-inv-value">
              {bill.billType === "contractor" ? "Contractor" : "Normal"}
              {!isContractor &&
                (bill.gstMode === "on" ? " (GST On)" : " (GST Off)")}
            </span>
          </div>
        </div>
      </header>

      <section className="a4-customer">
        <div>
          <label>Name</label>
          <div>{bill.customer.name || "—"}</div>
        </div>
        <div>
          <label>Mobile</label>
          <div>{bill.customer.mobile || "—"}</div>
        </div>
        <div>
          <label>Place</label>
          <div>{bill.customer.place || "—"}</div>
        </div>
      </section>

      <div className="a4-table-wrap">
        <table className="a4-table">
          <thead>
            <tr>
              <th style={{ width: "6%" }}>S.No</th>
              <th style={{ width: "34%" }}>Description</th>
              <th style={{ width: "8%" }}>Qty</th>
              <th style={{ width: "10%" }} className="a4-num">
                Unit
              </th>
              <th style={{ width: "12%" }} className="a4-num">
                Rate
              </th>
              {showDiscountColumn && (
                <>
                  <th style={{ width: "10%" }} className="a4-num">
                    Disc %
                  </th>
                  <th style={{ width: "12%" }} className="a4-num">
                    After Disc
                  </th>
                </>
              )}
              {showGstColumn && (
                <th style={{ width: "8%" }} className="a4-num">
                  GST %
                </th>
              )}
              <th style={{ width: "14%" }} className="a4-num">
                Net Amt
              </th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let sno = 0;
              return displayRows.map((row, idx) => {
                const filled = Boolean(row.description?.trim());
                const snoText = filled ? String(++sno) : "";
                const unitText = filled ? row.unit : "";
                return (
                  <tr key={idx}>
                    <td className="a4-num">{snoText}</td>
                    <td className="a4-desc">{row.description}</td>
                    <td className="a4-num">{row.qty || ""}</td>
                    <td className="a4-num">{unitText}</td>
                    <td className="a4-num">{row.rate ? formatMoney(row.rate) : ""}</td>
                    {showDiscountColumn && (
                      <>
                        <td className="a4-num">{row.discountPercent ? `${row.discountPercent}` : ""}</td>
                        <td className="a4-num">{row.afterDiscount ? formatMoney(row.afterDiscount) : ""}</td>
                      </>
                    )}
                    {showGstColumn && (
                      <td className="a4-num">{filled && row.gstPercent ? `${row.gstPercent}%` : ""}</td>
                    )}
                    <td className="a4-num">{row.netAmount ? formatMoney(row.netAmount) : ""}</td>
                  </tr>
                );
              });
            })()}
          </tbody>
        </table>
      </div>

      <section className="a4-totals">
        <div className="a4-upi">
          <QRCodeSVG value={upiUrl} size={86} level="M" includeMargin={false} />

          <div className="a4-upi-content">
            <div className="a4-upi-heading">Scan to Pay</div>
            <div className="a4-upi-id">xxx@upi</div>
            <div className="a4-upi-amount">
              <strong>Amount :</strong> <strong>₹{formatMoney(t.grandTotal)}</strong>
            </div>
          </div>
        </div>
                <div className="a4-totals-box">
                  {isContractor ? (
                    <>
              <div className="a4-totals-row">
                <span>Subtotal</span>
                <span className="a4-num">{formatMoney(t.subtotal)}</span>
              </div>
              <div className="a4-totals-row">
                <span>CGST</span>
                <span className="a4-num">{formatMoney(t.cgst)}</span>
              </div>
              <div className="a4-totals-row">
                <span>SGST</span>
                <span className="a4-num">{formatMoney(t.sgst)}</span>
              </div>
              <div className="a4-totals-row">
                <span>Round Off</span>
                <span className="a4-num">{formatMoney(t.roundOff)}</span>
              </div>
              <div className="a4-totals-row grand">
                <span>Grand Total</span>
                <span className="a4-num">₹{formatMoney(t.grandTotal)}</span>
              </div>
            </>
          ) : bill.gstMode === "off" ? (
            <>
              <div className="a4-totals-row">
                <span>Taxable Value</span>
                <span className="a4-num">{formatMoney(t.taxableValue)}</span>
              </div>
              <div className="a4-totals-row">
                <span>Discount Total</span>
                <span className="a4-num">{formatMoney(t.discountTotal)}</span>
              </div>
              <div className="a4-totals-row">
                <span>Round Off</span>
                <span className="a4-num">{formatMoney(t.roundOff)}</span>
              </div>
              <div className="a4-totals-row grand">
                <span>NET AMOUNT</span>
                <span className="a4-num">₹{formatMoney(t.grandTotal)}</span>
              </div>
            </>
          ) : (
            <>
              <div className="a4-totals-row">
                <span>Taxable Value</span>
                <span className="a4-num">{formatMoney(t.taxableValue)}</span>
              </div>
              <div className="a4-totals-row">
                <span>CGST</span>
                <span className="a4-num">{formatMoney(t.cgst)}</span>
              </div>
              <div className="a4-totals-row">
                <span>SGST</span>
                <span className="a4-num">{formatMoney(t.sgst)}</span>
              </div>
              <div className="a4-totals-row">
                <span>Total Tax</span>
                <span className="a4-num">{formatMoney(t.totalTax)}</span>
              </div>
              <div className="a4-totals-row">
                <span>Discount Total</span>
                <span className="a4-num">{formatMoney(t.discountTotal)}</span>
              </div>
              <div className="a4-totals-row">
                <span>Round Off</span>
                <span className="a4-num">{formatMoney(t.roundOff)}</span>
              </div>
              <div className="a4-totals-row grand">
                <span>NET AMOUNT</span>
                <span className="a4-num">₹{formatMoney(t.grandTotal)}</span>
              </div>
            </>
          )}
        </div>
      </section>

      <div className="a4-words">
        <strong>Amount in words:</strong> {words}
      </div>

      <footer className="a4-footer">
        <div className="a4-bank">
          <p>
            <strong>Bank</strong> {shop.bank.name}
          </p>
          <p>
            <strong>Branch</strong> {shop.bank.branch}
          </p>
          <p>
            <strong>IFSC</strong> {shop.bank.ifsc}
          </p>
          <p>
            <strong>A/C No.</strong> {shop.bank.accountNumber}
          </p>
        </div>
        <div className="a4-sign">
          <p>
            <strong>{shop.name}</strong>
          </p>
          <div className="seal" />
          <p>{shop.proprietorLabel}</p>
        </div>
      </footer>
    </div>
  );
}
