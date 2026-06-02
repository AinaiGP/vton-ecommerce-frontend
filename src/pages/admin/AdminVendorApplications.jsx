import { useState, useEffect, useCallback } from "react";
import {
  Store,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  X,
  Phone,
  Mail,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import apiClient from "../../utils/apiClient";
import t from "../../styles/AdminTable.module.css";

const STATUS_CLASS = {
  pending: t.badgePending,
  approved: t.badgeActive,
  rejected: t.badgeBanned,
  canceled: t.badgeClosed,
};

function StatusBadge({ status }) {
  const icons = { pending: Clock, approved: CheckCircle, rejected: XCircle, canceled: XCircle };
  const Icon = icons[status] || Clock;
  return (
    <span className={`${t.badge} ${STATUS_CLASS[status] || t.badgeDraft}`}>
      <Icon size={11} /> {status}
    </span>
  );
}

function fmt(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function AppModal({ app, onClose, onApprove, onReject, loading }) {
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const isPending = app.status === "pending";

  return (
    <div className={t.modalBackdrop} onClick={onClose}>
      <div className={`${t.modal} ${t.modalLg}`} onClick={(e) => e.stopPropagation()}>
        <div className={t.modalHead}>
          <div>
            <h2 className={t.modalTitle}>{app.brandName} — Application</h2>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--adm-text-muted)" }}>
              Submitted {fmt(app.createdAt)}
            </p>
          </div>
          <button className={t.modalClose} onClick={onClose}><X size={18} /></button>
        </div>
        <div className={t.modalBody}>
          <div style={{ display: "flex", gap: 8 }}>
            <StatusBadge status={app.status} />
          </div>

          <div className={t.formRow}>
            <div className={t.formGroup}>
              <label className={t.label}><Mail size={11} /> Business Email</label>
              <p style={{ margin: 0, fontWeight: 600 }}>{app.businessEmail}</p>
            </div>
            <div className={t.formGroup}>
              <label className={t.label}><Phone size={11} /> Business Phone</label>
              <p style={{ margin: 0, fontWeight: 600 }}>{app.businessPhone}</p>
            </div>
            {app.user?.email && (
              <div className={t.formGroup}>
                <label className={t.label}>Account Email</label>
                <p style={{ margin: 0 }}>{app.user.email}</p>
              </div>
            )}
          </div>

          {app.description && (
            <div className={t.formGroup}>
              <label className={t.label}>Description</label>
              <p style={{ margin: 0 }}>{app.description}</p>
            </div>
          )}

          {app.categories?.length > 0 && (
            <div className={t.formGroup}>
              <label className={t.label}>Categories</label>
              <p style={{ margin: 0 }}>{app.categories.join(', ')}</p>
            </div>
          )}

          {app.documents?.length > 0 && (
            <div className={t.formGroup}>
              <label className={t.label}>Documents</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {app.documents.map((doc, i) => {
                  let label = "Document";
                  let url = doc;
                  if (doc.includes("|")) {
                    const parts = doc.split("|");
                    label = parts[0];
                    url = parts.slice(1).join("|");
                  }
                  return (
                    <a key={i} href={url} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "var(--adm-accent)" }}>
                      {label}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {app.rejectionReason && (
            <div className={t.formGroup}>
              <label className={t.label}>Rejection Reason</label>
              <p style={{ margin: 0, color: "#dc2626" }}>{app.rejectionReason}</p>
            </div>
          )}

          {showReject && (
            <div className={t.formGroup}>
              <label className={t.label}>Rejection Reason * (min. 10 characters)</label>
              <textarea
                className={t.textarea}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="State why this application is being rejected…"
                rows={3}
              />
            </div>
          )}
        </div>

        <div className={t.modalFoot}>
          {isPending && !showReject && (
            <>
              <button
                className={`${t.btn} ${t.btnDanger}`}
                onClick={() => setShowReject(true)}
              >
                <XCircle size={14} /> Reject
              </button>
              <button
                className={`${t.btn} ${t.btnPrimary}`}
                onClick={onApprove}
                disabled={loading}
              >
                <CheckCircle size={14} /> {loading ? "Approving…" : "Approve"}
              </button>
            </>
          )}
          {showReject && (
            <>
              <button className={`${t.btn} ${t.btnOutline}`} onClick={() => setShowReject(false)}>Back</button>
              <button
                className={`${t.btn} ${t.btnDanger}`}
                onClick={() => onReject(rejectReason)}
                disabled={loading || rejectReason.trim().length < 10}
              >
                <XCircle size={14} /> {loading ? "Rejecting…" : "Confirm Reject"}
              </button>
            </>
          )}
          <button className={`${t.btn} ${t.btnOutline}`} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminVendorApplicationsPage() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [active, setActive] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchApps = useCallback(() => {
    setLoading(true);
    const params = { page, limit };
    if (statusFilter) params.status = statusFilter;
    apiClient
      .get("/admin/vendor-applications", { params })
      .then((r) => {
        let data = r.data.data;
        if (search) {
          const q = search.toLowerCase();
          data = data.filter(
            (a) =>
              a.brandName?.toLowerCase().includes(q) ||
              a.businessEmail?.toLowerCase().includes(q) ||
              a.user?.email?.toLowerCase().includes(q),
          );
        }
        setApps(data);
        setTotal(r.data.total);
      })
      .catch(() => setError("Failed to load applications."))
      .finally(() => setLoading(false));
  }, [page, limit, statusFilter, search]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const totalPages = Math.ceil(total / limit);

  const handleApprove = async () => {
    if (!active) return;
    setActionLoading(true);
    try {
      await apiClient.patch(`/admin/vendor-applications/${active.id}/approve`);
      setActive(null);
      fetchApps();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to approve application.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason) => {
    if (!active) return;
    setActionLoading(true);
    try {
      await apiClient.patch(`/admin/vendor-applications/${active.id}/reject`, { reason });
      setActive(null);
      fetchApps();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to reject application.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout
      pageTitle="Vendor Applications"
      pageSubtitle="Review and manage vendor applications submitted by customers."
      breadcrumb="Vendor Applications"
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
              placeholder="Search brand or email…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className={t.filterSelect}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>
        <span className={t.pageInfo}>{total} applications</span>
      </div>

      {/* Table */}
      <div className={t.tableCard}>
        <div className={t.tableWrap}>
          <table className={t.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Brand</th>
                <th>Business Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}><td colSpan={7}><span className={`${t.skeleton} ${t.skeletonRow}`} /></td></tr>
                ))
              ) : apps.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className={t.emptyState}>
                      <div className={t.emptyIcon}><Store size={24} /></div>
                      <h3 className={t.emptyTitle}>No applications found</h3>
                    </div>
                  </td>
                </tr>
              ) : (
                apps.map((a, i) => (
                  <tr key={a.id}>
                    <td>{(page - 1) * limit + i + 1}</td>
                    <td>
                      <span className={t.avatarName}>{a.brandName}</span>
                    </td>
                    <td>{a.businessEmail}</td>
                    <td>{a.businessPhone}</td>
                    <td><StatusBadge status={a.status} /></td>
                    <td>{fmt(a.createdAt)}</td>
                    <td>
                      <button className={`${t.actionBtn} ${t.approve}`} title="Review" onClick={() => setActive(a)}>
                        <Eye size={15} />
                      </button>
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

      {active && (
        <AppModal
          app={active}
          onClose={() => setActive(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          loading={actionLoading}
        />
      )}
    </AdminLayout>
  );
}
