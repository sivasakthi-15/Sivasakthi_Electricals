import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Layout from "@/components/layout/Layout";

import DashboardPage from "@/pages/DashboardPage";
import { BillingPage } from "@/pages/BillingPage";
import { ViewBillsPage } from "@/pages/ViewBillsPage";
import { ProductsPage } from "@/pages/ProductsPage";
import CustomersPage from "@/pages/CustomersPage";
import InventoryPage from "@/pages/InventoryPage";
import ReportsPage from "@/pages/ReportsPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route
            path="/"
            element={<DashboardPage />}
          />

          <Route
            path="/billing"
            element={<BillingPage />}
          />

          <Route
            path="/bills"
            element={<ViewBillsPage />}
          />

          <Route
            path="/products"
            element={<ProductsPage />}
          />

          <Route
            path="/customers"
            element={<CustomersPage />}
          />

          <Route
            path="/inventory"
            element={<InventoryPage />}
          />

          <Route
            path="/reports"
            element={<ReportsPage />}
          />

          {/* Future Modules */}

          <Route
            path="/purchase"
            element={
              <div>
                <h2>Purchase Module</h2>
                <p>Coming Soon...</p>
              </div>
            }
          />

          <Route
            path="/suppliers"
            element={
              <div>
                <h2>Suppliers Module</h2>
                <p>Coming Soon...</p>
              </div>
            }
          />

          <Route
            path="/settings"
            element={
              <div>
                <h2>Settings</h2>
                <p>Coming Soon...</p>
              </div>
            }
          />
        </Route>

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;