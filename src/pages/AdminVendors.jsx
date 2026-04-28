import React, { useState } from "react";
import { Check, X } from "lucide-react";
// Reusing the table and layout styles from the vendor pages for consistency
import styles from "../styles/VendorProductsPage.module.css";

const initialVendors = [
  {
    id: 1,
    brandName: "Silk & Satin",
    ownerEmail: "contact@silksatin.com",
    joinDate: "2026-04-10",
    status: "Pending",
  },
  {
    id: 2,
    brandName: "Urban Threads",
    ownerEmail: "hello@urbanthreads.dev",
    joinDate: "2026-04-12",
    status: "Approved",
  },
  {
    id: 3,
    brandName: "Desert Rose Boutique",
    ownerEmail: "owner@desertrose.com",
    joinDate: "2026-04-15",
    status: "Pending",
  },
];

export default function AdminVendors() {
  const [vendors, setVendors] = useState(initialVendors);

  const handleApprove = (id) => {
    setVendors(vendors.map(v => v.id === id ? { ...v, status: 'Approved' } : v));
  };

  const handleReject = (id) => {
    setVendors(vendors.map(v => v.id === id ? { ...v, status: 'Rejected' } : v));
  };

  return (
    <div style={{ padding: '2rem' }}>
          <div className={styles.pageHead}>
            <div>
              <h1 className={styles.pageTitle}>Vendor Management</h1>
              <p className={styles.pageSubtitle}>
                Review and approve new vendor applications
              </p>
            </div>
          </div>

          <div className={styles.tableCard}>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Brand Name</th>
                    <th>Owner Email</th>
                    <th>Join Date</th>
                    <th>Status</th>
                    <th className={styles.actionsCol}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((vendor) => (
                    <tr key={vendor.id}>
                      <td>
                        <span className={styles.productName}>{vendor.brandName}</span>
                      </td>
                      <td>{vendor.ownerEmail}</td>
                      <td>{vendor.joinDate}</td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${vendor.status === "Approved"
                              ? styles.active
                              : vendor.status === "Rejected"
                                ? styles.outOfStock
                                : styles.draft
                            }`}
                        >
                          {vendor.status}
                        </span>
                      </td>
                      <td className={styles.actionsCol}>
                        <div className={styles.actions}>
                          <button
                            className={styles.actionBtn}
                            style={{ color: "var(--status-delivered)", opacity: vendor.status === "Approved" ? 0.3 : 1 }}
                            title="Approve"
                            onClick={() => handleApprove(vendor.id)}
                            disabled={vendor.status === "Approved"}
                          >
                            <Check size={18} />
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            style={{ color: "var(--status-cancelled)", opacity: vendor.status === "Rejected" ? 0.3 : 1 }}
                            title="Reject"
                            onClick={() => handleReject(vendor.id)}
                            disabled={vendor.status === "Rejected"}
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {vendors.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", padding: "2rem" }}>
                        No vendors found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
    </div>
  );
}
