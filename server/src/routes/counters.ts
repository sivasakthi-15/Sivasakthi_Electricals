import { Router } from "express";
import { Counter } from "../models/Counter.js";
import { getFinancialYearLabel, shopIdToKey } from "../services/billNumber.js";

const router = Router();

router.get("/:shop", async (req, res) => {
  try {
    const shop = req.params.shop as "sivasakthi" | "meenatchi";
    if (shop !== "sivasakthi" && shop !== "meenatchi") {
      return res.status(400).json({ error: "Invalid shop" });
    }
    const shopKey = shopIdToKey(shop);
    const fyLabel = getFinancialYearLabel(new Date());
    let doc = await Counter.findOne({ shopKey, fyLabel });
    if (!doc) {
      doc = await Counter.create({ shopKey, lastSequence: 0, fyLabel });
    }
    const lastBillNumber = doc.lastSequence;
    const tempNext = lastBillNumber + 1;
    return res.json({
      shopKey,
      fyLabel,
      lastBillNumber,
      tempDisplayNumber: formatTemp(shopKey, tempNext, fyLabel),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to read counter" });
  }
});

function formatTemp(shopKey: string, seq: number, fy: string) {
  return `${shopKey}-${String(seq).padStart(4, "0")}/${fy}`;
}

export default router;
