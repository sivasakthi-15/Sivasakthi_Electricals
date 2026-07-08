import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  History,
  Package,
  Users,
  Boxes,
  ShoppingCart,
  Truck,
  BarChart3,
  Settings,
} from "lucide-react";

import "@/styles/layout.css";

const menuItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
    enabled: true,
  },
  {
    name: "Billing",
    path: "/billing",
    icon: Receipt,
    enabled: true,
  },
  {
    name: "Bill History",
    path: "/bills",
    icon: History,
    enabled: true,
  },
  {
    name: "Products",
    path: "/products",
    icon: Package,
    enabled: true,
  },
  {
    name: "Customers",
    path: "/customers",
    icon: Users,
    enabled: true,
  },
  {
    name: "Inventory",
    path: "/inventory",
    icon: Boxes,
    enabled: true,
  },
  {
    name: "Purchase",
    path: "#",
    icon: ShoppingCart,
    enabled: false,
  },
  {
    name: "Suppliers",
    path: "#",
    icon: Truck,
    enabled: false,
  },
  {
    name: "Reports",
    path: "/reports",
    icon: BarChart3,
    enabled: true,
  },
  {
    name: "Settings",
    path: "#",
    icon: Settings,
    enabled: false,
  },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">⚡</div>

        <div>
          <h2>Electrical Shop</h2>
          <p>Billing & POS</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;

          if (!item.enabled) {
            return (
              <div key={item.name} className="sidebar-item disabled">
                <Icon size={20} />
                <span>{item.name}</span>

                <small>Coming Soon</small>
              </div>
            );
          }

          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                isActive
                  ? "sidebar-item active"
                  : "sidebar-item"
              }
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <p>Version 1.0</p>
      </div>
    </aside>
  );
}