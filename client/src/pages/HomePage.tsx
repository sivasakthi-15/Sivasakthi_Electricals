import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { BillType, ShopId } from "@/types/bill";
import { SHOPS } from "@/constants/shops";

export function HomePage() {
  const nav = useNavigate();
  const [billType, setBillType] = useState<BillType>("normal");
  const [shop, setShop] = useState<ShopId>("sivasakthi");

  const start = () => {
    const q = new URLSearchParams({ type: billType, shop });
    nav(`/bill?${q.toString()}`);
  };

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>New bill</h2>
      <p style={{ color: "#64748b", marginTop: 0 }}>
        Choose bill type and shop, then open the billing workspace.
      </p>

      <div className="field">
        <label>Bill type</label>
        <div className="select-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <button
            type="button"
            className={`select-card ${billType === "contractor" ? "selected" : ""}`}
            onClick={() => setBillType("contractor")}
          >
            <h3>Contractor bill</h3>
            <p>Rate without GST · 18% added by system</p>
          </button>
          <button
            type="button"
            className={`select-card ${billType === "normal" ? "selected" : ""}`}
            onClick={() => setBillType("normal")}
          >
            <h3>Normal bill</h3>
            <p>GST on/off · same net total when toggled</p>
          </button>
        </div>
      </div>

      <div className="field">
        <label>Shop</label>
        <div className="select-grid">
          {(Object.keys(SHOPS) as ShopId[]).map((id) => (
            <button
              key={id}
              type="button"
              className={`select-card ${shop === id ? "selected" : ""}`}
              onClick={() => setShop(id)}
            >
              <h3>{SHOPS[id].name}</h3>
              <p>{SHOPS[id].address}</p>
            </button>
          ))}
        </div>
      </div>

      <button type="button" className="btn btn-primary" onClick={start}>
        Open billing page
      </button>
    </div>
  );
}
