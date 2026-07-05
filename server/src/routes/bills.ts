import { Router } from "express";
import { Bill } from "../models/Bill.js";
import { Counter } from "../models/Counter.js";
import {
  formatBillNumber,
  getFinancialYearLabel,
  shopIdToKey,
} from "../services/billNumber.js";

const router = Router();

/** Single-document $inc is atomic — works on standalone MongoDB (no replica set). */
async function allocateNextBillNumber(
  shop: "sivasakthi" | "meenatchi",
  invoiceDate: Date
): Promise<{ billNumber: string; fyLabel: string; sequence: number }> {
  const shopKey = shopIdToKey(shop);
  const fyLabel = getFinancialYearLabel(invoiceDate);

  const updated = await Counter.findOneAndUpdate(
    { shopKey, fyLabel },
    { $inc: { lastSequence: 1 }, $setOnInsert: { shopKey, fyLabel } },
    { new: true, upsert: true }
  );

  const sequence = updated!.lastSequence;

  return {
    billNumber: formatBillNumber(shopKey, sequence, fyLabel),
    fyLabel,
    sequence,
  };
}

/* -------------------------------------------------------------
   Search Bills
------------------------------------------------------------- */

router.get("/search", async (req, res) => {
  try {
    const q = String(req.query.q ?? "").trim();

    const dateFrom = req.query.dateFrom
      ? new Date(String(req.query.dateFrom))
      : null;

    const dateTo = req.query.dateTo
      ? new Date(String(req.query.dateTo))
      : null;

    const filter: Record<string, unknown> = {};

    if (q) {
      filter.$or = [
        { "customer.name": { $regex: q, $options: "i" } },
        { "customer.mobile": { $regex: q, $options: "i" } },
        { billNumber: { $regex: q, $options: "i" } },
      ];
    }

    if (dateFrom || dateTo) {
      filter.createdAt = {};

      if (dateFrom && !isNaN(dateFrom.getTime()))
        (filter.createdAt as Record<string, Date>).$gte = dateFrom;

      if (dateTo && !isNaN(dateTo.getTime())) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        (filter.createdAt as Record<string, Date>).$lte = end;
      }
    }

    const bills = await Bill.find(filter)
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    return res.json(bills);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Search failed" });
  }
});

/* -------------------------------------------------------------
   Create Bill
------------------------------------------------------------- */

router.post("/", async (req, res) => {
  try {
    const body = req.body as Record<string, unknown>;

    const shop = body.shop as "sivasakthi" | "meenatchi";

    if (shop !== "sivasakthi" && shop !== "meenatchi") {
      return res.status(400).json({ error: "Invalid shop" });
    }

    const invoiceDate = body.createdAt
      ? new Date(String(body.createdAt))
      : new Date();

    const { billNumber } = await allocateNextBillNumber(
      shop,
      invoiceDate
    );

    const doc = await Bill.create({
      ...body,
      billNumber,
      status: "active",
      createdAt: invoiceDate,
      updatedAt: new Date(),
    });

    return res.status(201).json(doc.toObject());
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Create failed" });
  }
});

/* -------------------------------------------------------------
   Edit Bill
------------------------------------------------------------- */

router.put("/:id", async (req, res) => {
  try {
    const { mode } = req.query as { mode?: string };

    const body = req.body as Record<string, unknown>;

    const existing = await Bill.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ error: "Not found" });
    }

    if (mode === "overwrite") {
      const updated = await Bill.findByIdAndUpdate(
        req.params.id,
        {
          ...body,
          billNumber: existing.billNumber,
          lastEditedAt: new Date(),
          updatedAt: new Date(),
        },
        { new: true }
      );

      return res.json(updated!.toObject());
    }

    if (mode === "new") {
      const shop =
        (body.shop as "sivasakthi" | "meenatchi") || existing.shop;

      const invoiceDate = body.createdAt
        ? new Date(String(body.createdAt))
        : new Date();

      const { billNumber } = await allocateNextBillNumber(
        shop,
        invoiceDate
      );

      const doc = await Bill.create({
        ...body,
        shop,
        billNumber,
        status: "active",
        createdAt: invoiceDate,
        updatedAt: new Date(),
      });

      return res.status(201).json(doc.toObject());
    }

    return res
      .status(400)
      .json({ error: "Invalid mode; use overwrite or new" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Update failed" });
  }
});

/* -------------------------------------------------------------
   Cancel Bill
------------------------------------------------------------- */

router.patch("/:id/cancel", async (req, res) => {
  try {
    const { reason = "" } = req.body;

    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
    }

    if (bill.status === "cancelled") {
      return res
        .status(400)
        .json({ error: "Bill is already cancelled" });
    }

    bill.status = "cancelled";
    bill.cancelledAt = new Date();
    bill.cancelReason = reason;

    await bill.save();

    return res.json({
      message: "Bill cancelled successfully",
      bill,
    });
  } catch (e) {
    console.error(e);

    return res.status(500).json({
      error: "Failed to cancel bill",
    });
  }
});

/* -------------------------------------------------------------
   Delete Bill (Temporary)
------------------------------------------------------------- */

router.delete("/:id", async (req, res) => {
  try {
    await Bill.findByIdAndDelete(req.params.id);
    return res.json({ ok: true });
  } catch {
    return res.status(400).json({ error: "Delete failed" });
  }
});

/* -------------------------------------------------------------
   Product Autofill
------------------------------------------------------------- */

router.get("/meta/autofill/products", async (_req, res) => {
  try {
    const rows = await Bill.aggregate([
      { $unwind: "$items" },
      { $match: { "items.description": { $ne: "" } } },
      { $group: { _id: "$items.description", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 200 },
    ]);

    return res.json(rows.map((r) => r._id as string));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed" });
  }
});

/* -------------------------------------------------------------
   Customer Autofill
------------------------------------------------------------- */

router.get("/meta/autofill/customers", async (_req, res) => {
  try {
    const rows = await Bill.aggregate([
      {
        $match: {
          $or: [
            { "customer.name": { $ne: "" } },
            { "customer.mobile": { $ne: "" } },
          ],
        },
      },
      {
        $group: {
          _id: {
            name: "$customer.name",
            mobile: "$customer.mobile",
            place: "$customer.place",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 200 },
    ]);

    return res.json(
      rows.map((r) => ({
        name: r._id.name,
        mobile: r._id.mobile,
        place: r._id.place,
      }))
    );
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed" });
  }
});

/* -------------------------------------------------------------
   Get Single Bill
------------------------------------------------------------- */

router.get("/:id", async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).lean();

    if (!bill) {
      return res.status(404).json({ error: "Not found" });
    }

    return res.json(bill);
  } catch {
    return res.status(400).json({ error: "Invalid id" });
  }
});

export default router;