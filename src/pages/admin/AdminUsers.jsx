import { useState } from "react";
import {
  Search, Plus, Pencil, Trash2, Lock, Unlock, Eye, X, AlertTriangle, Check
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import t from "../../styles/AdminTable.module.css";

const INITIAL_USERS = [
  { id: 101, name: "Sara Al-Rashid", email: "sara@example.com", role: "Customer", status: "Active", joined: "Jan 10, 2026", orders: 12 },
  { id: 102, name: "Layla Hassan", email: "layla@example.com", role: "Customer", status: "Banned", joined: "Feb 14, 2026", orders: 3 },
  { id: 103, name: "Nour Khalil", email: "nour@example.com", role: "Vendor", status: "Active", joined: "Mar 5, 2026", orders: 28 },
  { id: 104, name: "Amira Fayed", email: "amira@example.com", role: "Customer", status: "Banned", joined: "Apr 1, 2026", orders: 1 },
  { id: 105, name: "Fatima Al-Zahra", email: "fatima@example.com", role: "Vendor", status: "Active", joined: "Apr 8, 2026", orders: 45 },
  { id: 106, name: "Hana Saleh", email: "hana@example.com", role: "Customer", status: "Active", joined: "Apr 12, 2026", orders: 7 },
  { id: 107, name: "Mariam Khatib", email: "mariam@example.com", role: "Customer", status: "Active", joined: "Apr 15, 2026", orders: 0 },
];

const PAGE_SIZE = 5;

function getInitials(name) {
  return name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
}

function StatusBadge({ status }) {
  const map = { Active: t.badgeActive, Banned: t.badgeBanned };
  return <span className={`${t.badge} ${map[status] || t.badgeDraft}`}><span className={t.badgeDot} />{status}</span>;
}

function RoleBadge({ role }) {
  const map = { Vendor: t.badgeProcessing, Customer: t.badgeDraft };
  return <span className={`${t.badge} ${map[role] || t.badgeDraft}`}>{role}</span>;
}

export default function AdminUsers() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [editUser, setEditUser] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    const matchStatus = statusFilter === "All" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleBan = (id) => {
    setUsers(users.map((u) => u.id === id ? { ...u, status: u.status === "Active" ? "Banned" : "Active" } : u));
  };

  const deleteUser = (id) => {
    setUsers(users.filter((u) => u.id !== id));
    setConfirmDelete(null);
  };

  const saveEdit = (e) => {
    e.preventDefault();
    setUsers(users.map((u) => u.id === editUser.id ? editUser : u));
    setEditUser(null);
  };

  return (
    <AdminLayout pageTitle="User Management" pageSubtitle="Monitor customer accounts and control privileges." breadcrumb="Users">

      {/* Toolbar */}
      <div className={t.toolbar}>
        <div className={t.toolbarLeft}>
          <div className={t.searchBox}>
            <Search size={15} className={t.searchIcon} />
            <input className={t.searchInput} placeholder="Search by name or email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className={t.filterSelect} value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
            <option value="All">All Roles</option>
            <option value="Customer">Customer</option>
            <option value="Vendor">Vendor</option>
          </select>
          <select className={t.filterSelect} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Banned">Banned</option>
          </select>
        </div>
        <div className={t.toolbarRight}>
          <button className={`${t.btn} ${t.btnPrimary}`} onClick={() => setEditUser({ id: Date.now(), name: "", email: "", role: "Customer", status: "Active", joined: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), orders: 0, _new: true })}>
            <Plus size={15} /> Add User
          </button>
        </div>
      </div>

      {/* Table */}
      <div className={t.tableCard}>
        <div className={t.tableWrap}>
          <table className={t.table}>
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Orders</th>
                <th>Joined</th>
                <th style={{ width: 140 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className={t.emptyState}>
                      <div className={t.emptyIcon}><Search size={24} /></div>
                      <h3 className={t.emptyTitle}>No users found</h3>
                      <p className={t.emptyText}>Try adjusting your search or filter to find results.</p>
                    </div>
                  </td>
                </tr>
              ) : paged.map((user, i) => (
                <tr key={user.id} style={{ opacity: user.status === "Banned" ? 0.65 : 1 }}>
                  <td style={{ color: "var(--adm-text-subtle)", fontWeight: 600 }}>{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td>
                    <div className={t.avatarCell}>
                      <div className={t.avatar}>{getInitials(user.name || "U")}</div>
                      <div>
                        <span className={t.avatarName}>{user.name}</span>
                        <span className={t.avatarSub}>{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td><RoleBadge role={user.role} /></td>
                  <td><StatusBadge status={user.status} /></td>
                  <td style={{ fontWeight: 600 }}>{user.orders}</td>
                  <td style={{ color: "var(--adm-text-muted)" }}>{user.joined}</td>
                  <td>
                    <div className={t.actions}>
                      <button className={`${t.actionBtn}`} title="View" onClick={() => setViewUser(user)}><Eye size={15} /></button>
                      <button className={`${t.actionBtn} ${t.edit}`} title="Edit" onClick={() => setEditUser({ ...user })}><Pencil size={15} /></button>
                      <button className={`${t.actionBtn}`} title={user.status === "Active" ? "Ban" : "Unban"} onClick={() => toggleBan(user.id)}>
                        {user.status === "Active" ? <Lock size={15} /> : <Unlock size={15} />}
                      </button>
                      <button className={`${t.actionBtn} ${t.delete}`} title="Delete" onClick={() => setConfirmDelete(user)}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={t.pagination}>
            <span className={t.pageInfo}>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} users</span>
            <div className={t.pageButtons}>
              <button className={t.pageBtn} onClick={() => setPage(p => p - 1)} disabled={page === 1}>←</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i + 1} className={`${t.pageBtn} ${page === i + 1 ? t.pageBtnActive : ""}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
              ))}
              <button className={t.pageBtn} onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>→</button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewUser && (
        <div className={t.modalBackdrop} onClick={() => setViewUser(null)}>
          <div className={t.modal} onClick={(e) => e.stopPropagation()}>
            <div className={t.modalHead}>
              <h2 className={t.modalTitle}>User Details</h2>
              <button className={t.modalClose} onClick={() => setViewUser(null)}><X size={18} /></button>
            </div>
            <div className={t.modalBody}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
                <div className={t.avatar} style={{ width: 56, height: 56, fontSize: 20 }}>{getInitials(viewUser.name)}</div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 17 }}>{viewUser.name}</p>
                  <p style={{ margin: "3px 0 0", color: "var(--adm-text-muted)", fontSize: 13 }}>{viewUser.email}</p>
                </div>
              </div>
              <div className={t.formRow}>
                <div className={t.formGroup}><label className={t.label}>Role</label><div><RoleBadge role={viewUser.role} /></div></div>
                <div className={t.formGroup}><label className={t.label}>Status</label><div><StatusBadge status={viewUser.status} /></div></div>
                <div className={t.formGroup}><label className={t.label}>Orders</label><p style={{ margin: 0, fontWeight: 700 }}>{viewUser.orders}</p></div>
                <div className={t.formGroup}><label className={t.label}>Joined</label><p style={{ margin: 0 }}>{viewUser.joined}</p></div>
              </div>
            </div>
            <div className={t.modalFoot}>
              <button className={`${t.btn} ${t.btnOutline}`} onClick={() => setViewUser(null)}>Close</button>
              <button className={`${t.btn} ${t.btnPrimary}`} onClick={() => { setEditUser({ ...viewUser }); setViewUser(null); }}><Pencil size={14} /> Edit User</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Add Modal */}
      {editUser && (
        <div className={t.modalBackdrop} onClick={() => setEditUser(null)}>
          <div className={t.modal} onClick={(e) => e.stopPropagation()}>
            <div className={t.modalHead}>
              <h2 className={t.modalTitle}>{editUser._new ? "Add New User" : "Edit User"}</h2>
              <button className={t.modalClose} onClick={() => setEditUser(null)}><X size={18} /></button>
            </div>
            <form onSubmit={saveEdit}>
              <div className={t.modalBody}>
                <div className={t.formRow}>
                  <div className={t.formGroup}>
                    <label className={t.label}>Full Name</label>
                    <input className={t.input} value={editUser.name} onChange={(e) => setEditUser({ ...editUser, name: e.target.value })} required placeholder="Full name" />
                  </div>
                  <div className={t.formGroup}>
                    <label className={t.label}>Email</label>
                    <input className={t.input} type="email" value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} required placeholder="email@example.com" />
                  </div>
                  <div className={t.formGroup}>
                    <label className={t.label}>Role</label>
                    <select className={t.select} value={editUser.role} onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}>
                      <option>Customer</option>
                      <option>Vendor</option>
                    </select>
                  </div>
                  <div className={t.formGroup}>
                    <label className={t.label}>Status</label>
                    <select className={t.select} value={editUser.status} onChange={(e) => setEditUser({ ...editUser, status: e.target.value })}>
                      <option>Active</option>
                      <option>Banned</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className={t.modalFoot}>
                <button type="button" className={`${t.btn} ${t.btnOutline}`} onClick={() => setEditUser(null)}>Cancel</button>
                <button type="submit" className={`${t.btn} ${t.btnPrimary}`}><Check size={14} /> {editUser._new ? "Add User" : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className={t.modalBackdrop} onClick={() => setConfirmDelete(null)}>
          <div className={`${t.modal} ${t.modalSm}`} onClick={(e) => e.stopPropagation()}>
            <div className={t.modalBody} style={{ alignItems: "center", textAlign: "center", paddingTop: 28, paddingBottom: 28 }}>
              <div className={t.confirmIcon}><AlertTriangle size={24} /></div>
              <h3 className={t.modalTitle}>Delete User?</h3>
              <p className={t.confirmText}>Are you sure you want to permanently delete <strong>{confirmDelete.name}</strong>? This action cannot be undone.</p>
            </div>
            <div className={t.modalFoot} style={{ justifyContent: "center" }}>
              <button className={`${t.btn} ${t.btnOutline}`} onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className={`${t.btn} ${t.btnDanger}`} onClick={() => deleteUser(confirmDelete.id)}><Trash2 size={14} /> Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
