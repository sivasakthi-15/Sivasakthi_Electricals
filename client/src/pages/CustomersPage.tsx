import { useEffect, useMemo, useState } from "react";
import {
  getCustomers,
  toggleCustomerStatus,
  type Customer,
} from "@/api/client";

import { CustomerTable } from "@/components/CustomerTable";
import { EditCustomerModal } from "@/components/EditCustomerModal";
import { AddCustomerModal } from "@/components/AddCustomerModal";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [editingCustomer, setEditingCustomer] =
    useState<Customer | null>(null);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [showAddModal, setShowAddModal] =
    useState(false);

  const loadCustomers = async () => {
    try {
      setLoading(true);

      const data = await getCustomers();

      setCustomers(data);
    } catch (err) {
      console.error("Failed to load customers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCustomers();
  }, []);

  async function handleToggleStatus(customer: Customer) {
    try {
      const updated = await toggleCustomerStatus(
        customer._id,
        !customer.active
      );

      setCustomers((prev) =>
        prev.map((c) =>
          c._id === updated._id ? updated : c
        )
      );
    } catch (err) {
      console.error(err);
      alert("Unable to update customer status.");
    }
  }

  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return customers;

    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(q) ||
        customer.mobile.toLowerCase().includes(q) ||
        customer.place.toLowerCase().includes(q)
    );
  }, [customers, search]);

  const totalCustomers = customers.length;

  const activeCustomers = customers.filter(
    (c) => c.active
  ).length;

  const inactiveCustomers =
    totalCustomers - activeCustomers;

  const topCustomer =
    customers.length === 0
      ? null
      : [...customers].sort(
          (a, b) =>
            b.totalPurchase - a.totalPurchase
        )[0];

  return (
    <div className="page-container">

      {/* Header */}

      <div className="page-header">
        <div>
          <h2>👥 Customer Master</h2>

          <p className="muted-text">
            Manage customers used in billing.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          + Add Customer
        </button>
      </div>

      {/* Search */}

      <div className="product-toolbar">
        <div className="product-search">
          <input
            type="text"
            placeholder="Search customer..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>
      </div>

      {/* Dashboard */}

      <div className="stats-grid">

        <div className="stat-card">
          <h4>Total Customers</h4>
          <h2>{totalCustomers}</h2>
        </div>

        <div className="stat-card">
          <h4>Active Customers</h4>
          <h2>{activeCustomers}</h2>
        </div>

        <div className="stat-card">
          <h4>Inactive Customers</h4>
          <h2>{inactiveCustomers}</h2>
        </div>

        <div className="stat-card">
          <h4>Top Customer</h4>

          <h2
            style={{
              fontSize: "1.15rem",
              marginTop: "10px",
            }}
          >
            {topCustomer?.name ?? "-"}
          </h2>

          {topCustomer && (
            <small className="muted-text">
              ₹{topCustomer.totalPurchase.toFixed(2)}
            </small>
          )}
        </div>

      </div>

      {/* Customer Table */}

      <div className="product-table-card">
        <CustomerTable
          customers={filteredCustomers}
          loading={loading}
          onEdit={(customer) => {
            setEditingCustomer(customer);
            setShowEditModal(true);
          }}
          onToggleStatus={handleToggleStatus}
        />
      </div>

      {/* Add Customer */}

      <AddCustomerModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSaved={(customer) => {
          setCustomers((prev) =>
            [...prev, customer].sort((a, b) =>
              a.name.localeCompare(b.name)
            )
          );

          setShowAddModal(false);
        }}
      />

      {/* Edit Customer */}

      <EditCustomerModal
        open={showEditModal}
        customer={editingCustomer}
        onClose={() => {
          setShowEditModal(false);
          setEditingCustomer(null);
        }}
        onSaved={(updated) => {
          setCustomers((prev) =>
            prev.map((customer) =>
              customer._id === updated._id
                ? updated
                : customer
            )
          );

          setShowEditModal(false);
          setEditingCustomer(null);
        }}
      />

    </div>
  );
}