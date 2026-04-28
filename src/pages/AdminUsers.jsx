import React, { useState } from "react";
import { Lock, Unlock } from "lucide-react";
// Reusing table layout styles
import styles from "../styles/VendorProductsPage.module.css";

const initialUsers = [
  { id: 101, name: "Sara Al-Rashid", email: "sara@example.com", registered: "2026-01-10", status: "Active" },
  { id: 102, name: "Layla Hassan", email: "layla@example.com", registered: "2026-02-14", status: "Blocked" },
  { id: 103, name: "Nour Khalil", email: "nour@example.com", registered: "2026-03-05", status: "Active" },
  { id: 104, name: "Amira Fayed", email: "amira@example.com", registered: "2026-04-01", status: "Active" },
];

export default function AdminUsers() {
  const [users, setUsers] = useState(initialUsers);

  const toggleBlock = (id) => {
    setUsers(users.map(u => {
      if (u.id === id) {
        return { ...u, status: u.status === 'Active' ? 'Blocked' : 'Active' };
      }
      return u;
    }));
  };

  return (
    <div style={{ padding: '2rem' }}>
          <div className={styles.pageHead}>
            <div>
              <h1 className={styles.pageTitle}>User Management</h1>
              <p className={styles.pageSubtitle}>
                Manage customer accounts and access privileges.
              </p>
            </div>
          </div>

          <div className={styles.tableCard}>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Full Name</th>
                    <th>Email Address</th>
                    <th>Registered</th>
                    <th>Status</th>
                    <th className={styles.actionsCol}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} style={{ opacity: user.status === 'Blocked' ? 0.6 : 1 }}>
                      <td style={{ fontWeight: 600 }}>#{user.id}</td>
                      <td>
                        <span className={styles.productName}>{user.name}</span>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.registered}</td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${user.status === "Active" ? styles.active : styles.outOfStock
                            }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className={styles.actionsCol}>
                        <button
                          className={styles.addBtn}
                          style={{
                            padding: '0.5rem 1rem',
                            background: user.status === 'Active' ? 'var(--status-cancelled-bg)' : 'var(--ivory-dark)',
                            color: user.status === 'Active' ? 'var(--status-cancelled)' : 'var(--charcoal)',
                            boxShadow: 'none',
                          }}
                          onClick={() => toggleBlock(user.id)}
                        >
                          {user.status === 'Active' ? <><Lock size={14} /> Block</> : <><Unlock size={14} /> Unblock</>}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
    </div>
  );
}
