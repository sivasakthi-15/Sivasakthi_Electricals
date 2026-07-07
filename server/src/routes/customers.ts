import { Router } from "express";
import {
  createCustomer,
  getAllCustomers,
  searchCustomers,
  updateCustomer,
  toggleCustomerStatus,
} from "../services/customer.service.js";

const router = Router();

/* -------------------------------------------------------------
   Get All Customers
------------------------------------------------------------- */

router.get("/", async (_req, res) => {
  try {
    const customers = await getAllCustomers();

    return res.json(customers);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to fetch customers",
    });
  }
});

/* -------------------------------------------------------------
   Search Customers
------------------------------------------------------------- */

router.get("/search", async (req, res) => {
  try {
    const q = String(req.query.q ?? "");

    const customers = await searchCustomers(q);

    return res.json(customers);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Search failed",
    });
  }
});



/* -------------------------------------------------------------
   Create Customer
------------------------------------------------------------- */

router.post("/", async (req, res) => {
  try {
    const customer = await createCustomer(req.body);

    return res.status(201).json(customer);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to create customer",
    });
  }
});

/* -------------------------------------------------------------
   Update Customer
------------------------------------------------------------- */

router.put("/:id", async (req, res) => {
  try {
    const customer = await updateCustomer(
      req.params.id,
      req.body
    );

    if (!customer) {
      return res.status(404).json({
        error: "Customer not found",
      });
    }

    return res.json(customer);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to update customer",
    });
  }
});

/* -------------------------------------------------------------
   Enable / Disable Customer
------------------------------------------------------------- */

router.patch("/:id/status", async (req, res) => {
  try {
    const { active } = req.body;

    const customer = await toggleCustomerStatus(
      req.params.id,
      Boolean(active)
    );

    if (!customer) {
      return res.status(404).json({
        error: "Customer not found",
      });
    }

    return res.json(customer);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to update customer status",
    });
  }
});

export default router;