import { Router } from "express";
import {
  getAllProducts,
  searchProducts,
  updateProduct,
  toggleProductStatus,
} from "../services/product.service.js";

const router = Router();

/* -------------------------------------------------------------
   Get All Products
------------------------------------------------------------- */
router.get("/", async (_req, res) => {
  try {
    const products = await getAllProducts();
    return res.json(products);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to fetch products",
    });
  }
});

/* -------------------------------------------------------------
   Search Products
------------------------------------------------------------- */
router.get("/search", async (req, res) => {
  try {
    const q = String(req.query.q ?? "");

    const products = await searchProducts(q);

    return res.json(products);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Search failed",
    });
  }
});

/* -------------------------------------------------------------
   Update Product
------------------------------------------------------------- */
router.put("/:id", async (req, res) => {
  try {
    const product = await updateProduct(req.params.id, req.body);

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    return res.json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to update product",
    });
  }
});

/* -------------------------------------------------------------
   Enable / Disable Product
------------------------------------------------------------- */
router.patch("/:id/status", async (req, res) => {
  try {
    const { active } = req.body;

    const product = await toggleProductStatus(
      req.params.id,
      Boolean(active)
    );

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    return res.json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to update product status",
    });
  }
});

export default router;