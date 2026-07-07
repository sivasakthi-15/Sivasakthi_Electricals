import { Router } from "express";
import { Bill } from "../models/Bill.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { from, to } = req.query;

    const filter: any = {};

    // Date Filter
    if (from || to) {
      filter.createdAt = {};

      if (from) {
        filter.createdAt.$gte = new Date(from as string);
      }

      if (to) {
        const end = new Date(to as string);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    // Fetch Bills
    const bills = await Bill.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // Active Bills
    const activeBills = bills.filter(
      (bill) => bill.status === "active"
    );

    // Cancelled Bills
    const cancelledBills = bills.filter(
      (bill) => bill.status === "cancelled"
    );

    // Total Sales
    const totalSales = activeBills.reduce(
      (sum, bill) => sum + bill.totals.grandTotal,
      0
    );

    // GST Collected
    const gstCollected = activeBills.reduce(
      (sum, bill) =>
        sum +
        (bill.totals.cgst ?? 0) +
        (bill.totals.sgst ?? 0),
      0
    );

    // ===============================
    // Product Summary
    // ===============================

    const productMap = new Map<string, number>();

    for (const bill of activeBills) {
      for (const item of bill.items) {
        const productName =
          item.description?.trim() || "Unknown Product";

        const currentQty =
          productMap.get(productName) ?? 0;

        productMap.set(
          productName,
          currentQty + item.qty
        );
      }
    }

    const products = [...productMap.entries()]
      .map(([name, qty]) => ({
        name,
        qty,
      }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);

    // ===============================
    // Customer Summary
    // ===============================

    const customerMap = new Map<
      string,
      {
        bills: number;
        purchase: number;
        lastVisit: Date;
      }
    >();

    for (const bill of activeBills) {
      const customerName =
        bill.customer?.name?.trim() ||
        "Walk-in Customer";

      const current =
        customerMap.get(customerName) ?? {
          bills: 0,
          purchase: 0,
          lastVisit: bill.createdAt,
        };

      current.bills += 1;
      current.purchase +=
        bill.totals.grandTotal;

      if (bill.createdAt > current.lastVisit) {
        current.lastVisit = bill.createdAt;
      }

      customerMap.set(customerName, current);
    }

    const customers = [...customerMap.entries()]
      .map(([name, value]) => ({
        name,
        bills: value.bills,
        purchase: value.purchase,
        lastVisit: value.lastVisit,
      }))
      .sort(
        (a, b) =>
          b.purchase - a.purchase
      )
      .slice(0, 10);

    // ===============================
    // Response
    // ===============================

    res.json({
      summary: {
        totalBills: activeBills.length,
        totalSales,
        cancelledBills: cancelledBills.length,
        gstCollected,
      },

      bills,

      products,

      customers,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to load reports",
    });
  }
});

export default router;