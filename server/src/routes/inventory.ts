import { Router } from "express";
import {
  getInventory,
  getLowStock,
  stockIn,
  stockOut,
  adjustStock,
  getStockHistory,
  getInventorySummary,
} from "../services/inventory.service.js";

const router = Router();

/**
 * Inventory Summary
 */
router.get("/summary", async (_req, res) => {
  try {
    const data = await getInventorySummary();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load inventory summary",
    });
  }
});

/**
 * Low Stock Products
 */
router.get("/low-stock", async (_req, res) => {
  try {
    const products = await getLowStock();
    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load low stock products",
    });
  }
});

/**
 * Stock History
 */
router.get("/history/:productId", async (req, res) => {
  try {
    const history = await getStockHistory(req.params.productId);
    res.json(history);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load stock history",
    });
  }
});

/**
 * Get All Inventory
 */
router.get("/", async (_req, res) => {
  try {
    const products = await getInventory();
    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load inventory",
    });
  }
});

/**
 * Stock In
 */
router.post("/stock-in", async (req, res) => {
  try {
    const { productId, quantity, remarks } = req.body;

    const product = await stockIn(
      productId,
      Number(quantity),
      remarks
    );

    res.json(product);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
});

/**
 * Stock Out
 */
router.post("/stock-out", async (req, res) => {
  try {
    const { productId, quantity, remarks } = req.body;

    const product = await stockOut(
      productId,
      Number(quantity),
      remarks
    );

    res.json(product);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
});

/**
 * Manual Stock Adjustment
 */
router.post("/adjust", async (req, res) => {
  try {
    const { productId, quantity, remarks } = req.body;

    const product = await adjustStock(
      productId,
      Number(quantity),
      remarks
    );

    res.json(product);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
});

export default router;