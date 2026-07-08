import "dotenv/config";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import billsRouter from "./routes/bills.js";
import countersRouter from "./routes/counters.js";
import productsRouter from "./routes/products.js";
import customerRoutes from "./routes/customers.js";
import dashboardRouter from "./routes/dashboard.js";
import reportsRouter from "./routes/reports.js";
import inventoryRoutes from "./routes/inventory.js";


const PORT = Number(process.env.PORT) || 4000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/electrical_billing";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use("/api/customers", customerRoutes);
app.use("/api/counters", countersRouter);
app.use("/api/bills", billsRouter);
app.use("/api/products", productsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/inventory", inventoryRoutes);


app.get("/api/health", (_req, res) => res.json({ ok: true }));

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
