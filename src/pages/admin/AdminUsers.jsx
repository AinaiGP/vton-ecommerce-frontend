import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Trash2,
  Lock,
  Unlock,
  Eye,
  X,
  AlertTriangle,
  Users,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import apiClient from "../../utils/apiClient";
import t from "../../styles/AdminTable.module.css";

function getInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function StatusBadge({ isSuspended, isActive }) {
  if (isSuspended) return <span className={`${t.badge} ${t.badgeSuspended}`}><span className={t.badgeDot} />Suspended</span>;
  if (!isActive) return <span className={`${t.badge} ${t.badgeClosed}`}><span className={t.badgeDot} />Inactive</span>;
  return <span className={`${t.badge} ${t.badgeActive}`}><span className={t.badgeDot} />Active</span>;
}

function RoleBadge({ role }) {
  const cls = role === "vendor" ? t.badgeProcessing : t.badgeDraft;
  return <span className={`${t.badge} ${cls}`}>{role}</span>;
}

function fmt(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [suspendedFilter, setSuspendedFilter] = useState("");

  const [viewUser, setViewUser] = useState(null);
  const [suspendTarget, setSuspendTarget] = useState(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = { page, limit };
    if (search) params.search = search;
    if (roleFilter) params.role = roleFilter;
    if (suspendedFilter !== "") params.isSuspended = suspendedFilter;
    apiClient
      .get("/admin/users", { params })
      .then((r) => {
        setUsers(r.data.data);
        setTotal(r.data.total);
      })
      .catch(() => setError("Failed to load users."))
      .finally(() => setLoading(false));
  }, [page, limit, search, roleFilter, suspendedFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const totalPages = Math.ceil(total / limit);

  const handleSuspend = async () => {
    if (!suspendTarget) return;
    setActionLoading(true);
    try {
      await apiClient.patch(`/admin/users/${suspendTarget.id}/suspend`, { reason: suspendReason || undefined });
      setSuspendTarget(null);
      setSuspendReason("");
      fetchUsers();
    } catch {
      setError("Failed to suspend user.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnsuspend = async (user) => {
    setActionLoading(true);
    try {
      await apiClient.patch(`/admin/users/${user.id}/unsuspend`);
      fetchUsers();
    } catch {
      setError("Failed to unsuspend user.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setActionLoading(true);
    try {
      await apiClient.delete(`/admin/users/${confirmDelete.id}`);
      setConfirmDelete(null);
      fetchUsers();
    } catch {
      setError("Failed to delete user.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout
      pageTitle="User Management"
      pageSubtitle="Monitor customer and vendor accounts."
      breadcrumb="Users"
    >
      {error && (
        <div className={`${t.badge} ${t.badgeBanned}`} style={{ marginBottom: 12, padding: "10px 16px", borderRadius: 8, display: "block" }}>
          {error} <button onClick={() => setError(null)} style={{ marginLeft: 8, background: "none", border: "none", cursor: "pointer" }}><X size={14} /></button>
        </div>
      )}

      {/* Toolbar */}
      <div className={t.toolbar}>
        <div className={t.toolbarLeft}>
          <div className={t.searchBox}>
            <Search size={15} className={t.searchIcon} />
            <input
              className={t.searchInput}
              placeholder="Search by email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className={t.filterSelect}
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Roles</option>
            <option value="customer">Customer</option>
            <option value="vendor">Vendor</option>
          </select>
          <select
            className={t.filterSelect}
            value={suspendedFilter}
            onChange={(e) => { setSuspendedFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Status</option>
            <option value="false">Active</option>
            <option value="true">Suspended</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={t.tableCard}>
        <div className={t.tableWrap}>
          <table className={t.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6}><span className={`${t.skeleton} ${t.skeletonRow}`} /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className={t.emptyState}>
                      <div className={t.emptyIcon}><Users size={24} /></div>
                      <h3 className={t.emptyTitle}>No users found</h3>
                      <p className={t.emptyText}>Try adjusting your filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user, i) => (
                  <tr key={user.id}>
                    <td>{(page - 1) * limit + i + 1}</td>
                    <td>
                      <div className={t.avatarCell}>
                        <div className={t.avatar}>{getInitials(user.name || user.email)}</div>
                        <div>
                          <span className={t.avatarName}>{user.name || "—"}</span>
                          <span className={t.avatarSub}>{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td><RoleBadge role={user.role} /></td>
                    <td><StatusBadge isSuspended={user.isSuspended} isActive={user.isActive} /></td>
                    <td>{fmt(user.createdAt)}</td>
                    <td>
                      <div className={t.actions}>
                        <button className={t.actionBtn} title="View" onClick={() => setViewUser(user)}>
                          <Eye size={15} />
                        </button>
                        {user.isSuspended ? (
                          <button
                            className={`${t.actionBtn} ${t.approve}`}
                            title="Unsuspend"
                            onClick={() => handleUnsuspend(user)}
                            disabled={actionLoading}
                          >
                            <Unlock size={15} />
                          </button>
                        ) : (
                          <button
                            className={`${t.actionBtn} ${t.reject}`}
                            title="Suspend"
                            onClick={() => { setSuspendTarget(user); setSuspendReason(""); }}
                          >
                            <Lock size={15} />
                          </button>
                        )}
                        <button
                          className={`${t.actionBtn} ${t.delete}`}
                          title="Delete"
                          onClick={() => setConfirmDelete(user)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={t.pagination}>
            <span className={t.pageInfo}>
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} users
            </span>
            <div className={t.pageButtons}>
              <button className={t.pageBtn} onClick={() => setPage((p) => p - 1)} disabled={page === 1}>←</button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const pg = i + 1;
                return (
                  <button
                    key={pg}
                    className={`${t.pageBtn} ${page === pg ? t.pageBtnActive : ""}`}
                    onClick={() => setPage(pg)}
                  >{pg}</button>
                );
              })}
              <button className={t.pageBtn} onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>→</button>
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
              <div className={t.avatarCell}>
                <div className={t.avatar} style={{ width: 52, height: 52, fontSize: 18 }}>
                  {getInitials(viewUser.name || viewUser.email)}
                </div>
                <div>
                  <span className={t.avatarName}>{viewUser.name || "—"}</span>
                  <span className={t.avatarSub}>{viewUser.email}</span>
                </div>
              </div>
              <div className={t.formRow}>
                <div className={t.formGroup}>
                  <label className={t.label}>Role</label>
                  <RoleBadge role={viewUser.role} />
                </div>
                <div className={t.formGroup}>
                  <label className={t.label}>Status</label>
                  <StatusBadge isSuspended={viewUser.isSuspended} isActive={viewUser.isActive} />
                </div>
                <div className={t.formGroup}>
                  <label className={t.label}>Joined</label>
                  <p style={{ margin: 0 }}>{fmt(viewUser.createdAt)}</p>
                </div>
                {viewUser.brandName && (
                  <div className={t.formGroup}>
                    <label className={t.label}>Brand</label>
                    <p style={{ margin: 0 }}>{viewUser.brandName}</p>
                  </div>
                )}
              </div>
            </div>
            <div className={t.modalFoot}>
              <button className={`${t.btn} ${t.btnOutline}`} onClick={() => setViewUser(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {suspendTarget && (
        <div className={t.modalBackdrop} onClick={() => setSuspendTarget(null)}>
          <div className={`${t.modal} ${t.modalSm}`} onClick={(e) => e.stopPropagation()}>
            <div className={t.modalHead}>
              <h2 className={t.modalTitle}>Suspend User</h2>
              <button className={t.modalClose} onClick={() => setSuspendTarget(null)}><X size={18} /></button>
            </div>
            <div className={t.modalBody}>
              <p className={t.confirmText}>
                Suspend <strong>{suspendTarget.name || suspendTarget.email}</strong>? They will no longer be able to log in.
              </p>
              <div className={t.formGroup}>
                <label className={t.label}>Reason (optional)</label>
                <textarea
                  className={t.textarea}
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="Reason for suspension..."
                  rows={3}
                />
              </div>
            </div>
            <div className={t.modalFoot}>
              <button className={`${t.btn} ${t.btnOutline}`} onClick={() => setSuspendTarget(null)}>Cancel</button>
              <button className={`${t.btn} ${t.btnDanger}`} onClick={handleSuspend} disabled={actionLoading}>
                <Lock size={14} /> {actionLoading ? "Suspending…" : "Suspend"}
              </button>
            </div>
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
              <p className={t.confirmText}>
                Permanently delete <strong>{confirmDelete.name || confirmDelete.email}</strong>? This cannot be undone.
              </p>
            </div>
            <div className={t.modalFoot} style={{ justifyContent: "center" }}>
              <button className={`${t.btn} ${t.btnOutline}`} onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className={`${t.btn} ${t.btnDanger}`} onClick={handleDelete} disabled={actionLoading}>
                <Trash2 size={14} /> {actionLoading ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
