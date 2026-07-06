import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import { BillingPage } from "@/pages/BillingPage";
import { HomePage } from "@/pages/HomePage";
import { ViewBillsPage } from "@/pages/ViewBillsPage";
import { ProductsPage } from "@/pages/ProductsPage"; // NEW

export function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="app-topbar">
          <h1>Electrical Shop Billing &amp; POS</h1>

          <nav>
            <Link to="/">Home</Link>

            <Link to="/bills">Bills</Link>

            <Link to="/products">Products</Link> {/* NEW */}
          </nav>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage />} />

            <Route path="/bill" element={<BillingPage />} />

            <Route path="/bills" element={<ViewBillsPage />} />

            <Route path="/products" element={<ProductsPage />} /> {/* NEW */}

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}