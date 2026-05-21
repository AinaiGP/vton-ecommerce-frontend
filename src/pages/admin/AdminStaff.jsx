import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Shield,
  Headphones,
  Search,
  ToggleLeft,
  ToggleRight,
  X,
  AlertTriangle,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import apiClient from "../../utils/apiClient";
import t from "../../styles/AdminTable.module.css";

function RoleBadge({ role }) {
  const isAdmin = role === "admin";
  return (
    <span className={`${t.badge} ${isAdmin ? t.badgeInProgress : t.badgeProcessing}`}>
      {isAdmin ? <Shield size={11} /> : <Headphones size={11} />}
      {isAdmin ? "Admin" : "Tech Support"}
    </span>
  );
}

function StatusBadge({ isActive }) {
  return isActive
    ? <span className={`${t.badge} ${t.badgeActive}`}><span className={t.badgeDot} />Active</span>
    : <span className={`${t.badge} ${t.badgeClosed}`}><span className={t.badgeDot} />Inactive</span>;
}

function getInitials(email) {
  return (email?.[0] ?? "S").toUpperCase();
}

function fmt(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminStaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStaff = useCallback(() => {
    setLoading(true);
    const params = { page, limit };
    if (roleFilter) params.role = roleFilter;
    if (activeFilter !== "") params.isActive = activeFilter;
    apiClient
      .get("/admin/staff", { params })
      .then((r) => {
        let data = r.data.data;
        if (search) {
          const q = search.toLowerCase();
          data = data.filter((s) => s.email.toLowerCase().includes(q));
        }
        setStaff(data);
        setTotal(r.data.total);
      })
      .catch(() => setError("Failed to load staff."))
      .finally(() => setLoading(false));
  }, [page, limit, roleFilter, activeFilter, search]);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const totalPages = Math.ceil(total / limit);

  const runAction = async (type, userId, extra) => {
    setActionLoading(true);
    try {
      if (type === "deactivate") {
        await apiClient.patch(`/admin/staff/${userId}/deactivate`);
      } else if (type === "reactivate") {
        await apiClient.patch(`/admin/staff/${userId}/reactivate`);
      } else if (type === "toggleRole") {
        await apiClient.patch(`/admin/staff/${userId}/role`, { newRole: extra });
      }
      setConfirm(null);
      fetchStaff();
    } catch {
      setError("Action failed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout
      pageTitle="Staff Management"
      pageSubtitle="Manage platform admin and technical support staff."
      breadcrumb="Staff"
    >
      {error && (
        <div style={{ marginBottom: 12, padding: "10px 16px", borderRadius: 8, background: "#fee2e2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {error}
          <button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626" }}><X size={14} /></button>
        </div>
      )}

      {/* Toolbar */}
      <div className={t.toolbar}>
        <div className={t.toolbarLeft}>
          <div className={t.searchBox}>
            <Search size={14} className={t.searchIcon} />
            <input
              className={t.searchInput}
              placeholder="Search by email…"
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
            <option value="admin">Admin</option>
            <option value="technical_support">Tech Support</option>
          </select>
          <select
            className={t.filterSelect}
            value={activeFilter}
            onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <span className={t.pageInfo}>{total} staff members</span>
      </div>

      {/* Table */}
      <div className={t.tableCard}>
        <div className={t.tableWrap}>
          <table className={t.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Member</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}><td colSpan={6}><span className={`${t.skeleton} ${t.skeletonRow}`} /></td></tr>
                ))
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className={t.emptyState}>
                      <div className={t.emptyIcon}><Users size={24} /></div>
                      <h3 className={t.emptyTitle}>No staff found</h3>
                    </div>
                  </td>
                </tr>
              ) : (
                staff.map((s, i) => (
                  <tr key={s.userId}>
                    <td>{(page - 1) * limit + i + 1}</td>
                    <td>
                      <div className={t.avatarCell}>
                        <div className={t.avatar}>{getInitials(s.email)}</div>
                        <div>
                          <span className={t.avatarName}>{s.email}</span>
                          <span className={t.avatarSub}>{s.profile?.department || s.profile?.jobTitle || ""}</span>
                        </div>
                      </div>
                    </td>
                    <td><RoleBadge role={s.role} /></td>
                    <td><StatusBadge isActive={s.isActive} /></td>
                    <td>{fmt(s.createdAt)}</td>
                    <td>
                      <div className={t.actions}>
                        {/* Toggle role */}
                        <button
                          className={`${t.actionBtn} ${t.edit}`}
                          title={s.role === "admin" ? "Change to Tech Support" : "Change to Admin"}
                          onClick={() => setConfirm({
                            type: "toggleRole",
                            userId: s.userId,
                            newRole: s.role === "admin" ? "technical_support" : "admin",
                            label: `Change role to ${s.role === "admin" ? "Technical Support" : "Admin"}?`,
                            danger: false,
                          })}
                        >
                          <Shield size={14} />
                        </button>

                        {/* Deactivate / Reactivate */}
                        {s.isActive ? (
                          <button
                            className={t.actionBtn}
                            title="Deactivate"
                            onClick={() => setConfirm({
                              type: "deactivate",
                              userId: s.userId,
                              label: "Deactivate this staff member?",
                              danger: false,
                            })}
                          >
                            <ToggleRight size={14} />
                          </button>
                        ) : (
                          <button
                            className={`${t.actionBtn} ${t.approve}`}
                            title="Reactivate"
                            onClick={() => setConfirm({
                              type: "reactivate",
                              userId: s.userId,
                              label: "Reactivate this staff member?",
                              danger: false,
                            })}
                          >
                            <ToggleLeft size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className={t.pagination}>
            <span className={t.pageInfo}>
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </span>
            <div className={t.pageButtons}>
              <button className={t.pageBtn} onClick={() => setPage((p) => p - 1)} disabled={page === 1}>←</button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => (
                <button
                  key={i + 1}
                  className={`${t.pageBtn} ${page === i + 1 ? t.pageBtnActive : ""}`}
                  onClick={() => setPage(i + 1)}
                >{i + 1}</button>
              ))}
              <button className={t.pageBtn} onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>→</button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {confirm && (
        <div className={t.modalBackdrop} onClick={() => setConfirm(null)}>
          <div className={`${t.modal} ${t.modalSm}`} onClick={(e) => e.stopPropagation()}>
            <div className={t.modalBody} style={{ alignItems: "center", textAlign: "center", paddingTop: 28, paddingBottom: 28 }}>
              <div className={t.confirmIcon}>
                <AlertTriangle size={24} />
              </div>
              <h3 className={t.modalTitle}>{confirm.label}</h3>
              <p className={t.confirmText}>This action can be reversed later.</p>
            </div>
            <div className={t.modalFoot} style={{ justifyContent: "center" }}>
              <button className={`${t.btn} ${t.btnOutline}`} onClick={() => setConfirm(null)}>Cancel</button>
              <button
                className={`${t.btn} ${confirm.danger ? t.btnDanger : t.btnPrimary}`}
                onClick={() => runAction(confirm.type, confirm.userId, confirm.newRole)}
                disabled={actionLoading}
              >
                {actionLoading ? "Working…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
