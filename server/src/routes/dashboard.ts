import { Router } from "express";
import { Bill } from "../models/Bill.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const now = new Date();

    // Today
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    // This Month
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    // Today's Bills
    const todayBills = await Bill.find({
      status: "active",
      createdAt: {
        $gte: startOfToday,
        $lt: endOfToday,
      },
    });

    const todaySales = todayBills.reduce(
      (sum, bill) => sum + bill.totals.grandTotal,
      0
    );

    // Month Bills
    const monthBills = await Bill.find({
      status: "active",
      createdAt: {
        $gte: startOfMonth,
      },
    });

    const monthSales = monthBills.reduce(
      (sum, bill) => sum + bill.totals.grandTotal,
      0
    );

    // Counts
    const totalProducts = await Product.countDocuments();

    const activeProducts =
      await Product.countDocuments({
        active: true,
      });

    const totalCustomers =
      await Customer.countDocuments();

    const cancelledBills =
      await Bill.countDocuments({
        status: "cancelled",
      });

    // Recent Bills
    const recentBills = await Bill.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select({
        billNumber: 1,
        customer: 1,
        totals: 1,
        createdAt: 1,
        status: 1,
      });

    // Top Selling Products
    const topProductsMap = new Map<
      string,
      number
    >();

    const activeBills = await Bill.find({
      status: "active",
    }).select({
      items: 1,
    });

    for (const bill of activeBills) {
      for (const item of bill.items) {
        const current =
          topProductsMap.get(
            item.description
          ) ?? 0;

        topProductsMap.set(
          item.description,
          current + item.qty
        );
      }
    }

    const topProducts = [
      ...topProductsMap.entries(),
    ]
      .map(([name, qty]) => ({
        name,
        qty,
      }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // Final Response
    res.json({
      todaySales,
      todayBills: todayBills.length,
      monthSales,
      totalProducts,
      activeProducts,
      totalCustomers,
      cancelledBills,
      recentBills,
      topProducts,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to load dashboard",
    });
  }
});

export default router;