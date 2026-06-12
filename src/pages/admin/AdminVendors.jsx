import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Eye,
  X,
  ShieldOff,
  Shield,
  ExternalLink,
  Store,
  AlertTriangle,
  Lock,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import apiClient from "../../utils/apiClient";
import t from "../../styles/AdminTable.module.css";

function StatusBadge({ isSuspended }) {
  if (isSuspended) {
    return (
      <span className={`${t.badge} ${t.badgeSuspended}`}>
        <span className={t.badgeDot} />Suspended
      </span>
    );
  }
  return (
    <span className={`${t.badge} ${t.badgeActive}`}>
      <span className={t.badgeDot} />Active
    </span>
  );
}

function getInitials(name) {
  if (!name) return "V";
  return name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
}

function fmt(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  const [search, setSearch] = useState("");
  const [suspendedFilter, setSuspendedFilter] = useState("");

  const [viewVendor, setViewVendor] = useState(null);
  const [suspendTarget, setSuspendTarget] = useState(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVendors = useCallback(() => {
    setLoading(true);
    const params = { page, limit };
    if (search) params.search = search;
    if (suspendedFilter !== "") params.isSuspended = suspendedFilter;
    apiClient
      .get("/admin/vendors", { params })
      .then((r) => {
        setVendors(r.data.data);
        setTotal(r.data.total);
      })
      .catch(() => setError("Failed to load vendors."))
      .finally(() => setLoading(false));
  }, [page, limit, search, suspendedFilter]);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  const totalPages = Math.ceil(total / limit);

  const handleSuspend = async () => {
    if (!suspendTarget) return;
    setActionLoading(true);
    try {
      await apiClient.patch(`/admin/users/${suspendTarget.userId}/suspend`, {
        reason: suspendReason || undefined,
      });
      setSuspendTarget(null);
      setSuspendReason("");
      fetchVendors();
    } catch {
      setError("Failed to suspend vendor.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnsuspend = async (vendor) => {
    setActionLoading(true);
    try {
      await apiClient.patch(`/admin/users/${vendor.userId}/unsuspend`);
      fetchVendors();
    } catch {
      setError("Failed to unsuspend vendor.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout
      pageTitle="Vendor Management"
      pageSubtitle="Monitor vendor accounts and control access."
      breadcrumb="Vendors"
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
            <Search size={15} className={t.searchIcon} />
            <input
              className={t.searchInput}
              placeholder="Search by brand or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
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
                <th>Brand</th>
                <th>Business Email</th>
                <th>Total Sold</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8}><span className={`${t.skeleton} ${t.skeletonRow}`} /></td>
                  </tr>
                ))
              ) : vendors.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className={t.emptyState}>
                      <div className={t.emptyIcon}><Store size={24} /></div>
                      <h3 className={t.emptyTitle}>No vendors found</h3>
                      <p className={t.emptyText}>Try adjusting your filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                vendors.map((v, i) => (
                  <tr key={v.id}>
                    <td>{(page - 1) * limit + i + 1}</td>
                    <td>
                      <div className={t.avatarCell}>
                        {v.logoUrl ? (
                          <div className={t.productThumb}>
                            <img src={v.logoUrl} alt={v.brandName} />
                          </div>
                        ) : (
                          <div className={t.avatar}>{getInitials(v.brandName)}</div>
                        )}
                        <div>
                          <span className={t.avatarName}>{v.brandName}</span>
                          <span className={t.avatarSub}>{v.user?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{v.businessEmail}</td>
                    <td>{v.totalSold}</td>
                    <td>{v.averageRating ? Number(v.averageRating).toFixed(1) : "—"}</td>
                    <td><StatusBadge isSuspended={v.isSuspended} /></td>
                    <td>{fmt(v.createdAt)}</td>
                    <td>
                      <div className={t.actions}>
                        <button className={t.actionBtn} title="View Details" onClick={() => setViewVendor(v)}>
                          <Eye size={15} />
                        </button>
                        <a
                          className={t.actionBtn}
                          title="View Storefront"
                          href={`/vendors/storefront/${v.id}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink size={15} />
                        </a>
                        {v.isSuspended ? (
                          <button
                            className={`${t.actionBtn} ${t.approve}`}
                            title="Unsuspend"
                            onClick={() => handleUnsuspend(v)}
                            disabled={actionLoading}
                          >
                            <Shield size={15} />
                          </button>
                        ) : (
                          <button
                            className={`${t.actionBtn} ${t.reject}`}
                            title="Suspend"
                            onClick={() => { setSuspendTarget(v); setSuspendReason(""); }}
                          >
                            <ShieldOff size={15} />
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
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} vendors
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

      {/* View Detail Modal */}
      {viewVendor && (
        <div className={t.modalBackdrop} onClick={() => setViewVendor(null)}>
          <div className={`${t.modal} ${t.modalLg}`} onClick={(e) => e.stopPropagation()}>
            <div className={t.modalHead}>
              <h2 className={t.modalTitle}>Vendor — {viewVendor.brandName}</h2>
              <button className={t.modalClose} onClick={() => setViewVendor(null)}><X size={18} /></button>
            </div>
            <div className={t.modalBody}>
              <div className={t.avatarCell}>
                {viewVendor.logoUrl ? (
                  <div className={t.productThumb}>
                    <img src={viewVendor.logoUrl} alt={viewVendor.brandName} />
                  </div>
                ) : (
                  <div className={t.avatar} style={{ width: 52, height: 52, fontSize: 18 }}>
                    {getInitials(viewVendor.brandName)}
                  </div>
                )}
                <div>
                  <span className={t.avatarName}>{viewVendor.brandName}</span>
                  <span className={t.avatarSub}>{viewVendor.user?.email}</span>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <StatusBadge isSuspended={viewVendor.isSuspended} />
                </div>
              </div>
              <div className={t.formRow}>
                <div className={t.formGroup}>
                  <label className={t.label}>Business Email</label>
                  <p style={{ margin: 0 }}>{viewVendor.businessEmail}</p>
                </div>
                <div className={t.formGroup}>
                  <label className={t.label}>Business Phone</label>
                  <p style={{ margin: 0 }}>{viewVendor.businessPhone || "—"}</p>
                </div>
                <div className={t.formGroup}>
                  <label className={t.label}>Total Sold</label>
                  <p style={{ margin: 0, fontWeight: 700 }}>{viewVendor.totalSold}</p>
                </div>
                <div className={t.formGroup}>
                  <label className={t.label}>Average Rating</label>
                  <p style={{ margin: 0, fontWeight: 700 }}>
                    {viewVendor.averageRating ? Number(viewVendor.averageRating).toFixed(1) : "—"}
                  </p>
                </div>
                <div className={t.formGroup}>
                  <label className={t.label}>Joined</label>
                  <p style={{ margin: 0 }}>{fmt(viewVendor.createdAt)}</p>
                </div>
              </div>
            </div>
            <div className={t.modalFoot}>
              <a
                className={`${t.btn} ${t.btnOutline}`}
                href={`/vendors/storefront/${viewVendor.id}`}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink size={14} /> View Storefront
              </a>
              {viewVendor.isSuspended ? (
                <button
                  className={`${t.btn} ${t.btnPrimary}`}
                  onClick={() => { handleUnsuspend(viewVendor); setViewVendor(null); }}
                  disabled={actionLoading}
                >
                  <Shield size={14} /> Unsuspend
                </button>
              ) : (
                <button
                  className={`${t.btn} ${t.btnDanger}`}
                  onClick={() => { setSuspendTarget(viewVendor); setSuspendReason(""); setViewVendor(null); }}
                >
                  <ShieldOff size={14} /> Suspend
                </button>
              )}
              <button className={`${t.btn} ${t.btnOutline}`} onClick={() => setViewVendor(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {suspendTarget && (
        <div className={t.modalBackdrop} onClick={() => setSuspendTarget(null)}>
          <div className={`${t.modal} ${t.modalSm}`} onClick={(e) => e.stopPropagation()}>
            <div className={t.modalHead}>
              <h2 className={t.modalTitle}>Suspend Vendor</h2>
              <button className={t.modalClose} onClick={() => setSuspendTarget(null)}><X size={18} /></button>
            </div>
            <div className={t.modalBody}>
              <div className={t.confirmIcon}><AlertTriangle size={24} /></div>
              <p className={t.confirmText}>
                Suspend <strong>{suspendTarget.brandName}</strong>? Their storefront will be hidden and they cannot log in.
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
    </AdminLayout>
  );
}
