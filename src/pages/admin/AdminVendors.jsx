import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Check,
  X,
  ShieldOff,
  AlertTriangle,
  Pencil,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import t from "../../styles/AdminTable.module.css";

const INITIAL_VENDORS = [];

const PAGE_SIZE = 5;

function StatusBadge({ status }) {
  const map = {
    Approved: t.badgeApproved,
    Pending: t.badgePending,
    Rejected: t.badgeRejected,
    Suspended: t.badgeSuspended,
  };
  return (
    <span className={`${t.badge} ${map[status] || t.badgeDraft}`}>
      <span className={t.badgeDot} />
      {status}
    </span>
  );
}

function getInitials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function AdminVendors() {
  const [vendors, setVendors] = useState(INITIAL_VENDORS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [viewVendor, setViewVendor] = useState(null);
  const [confirm, setConfirm] = useState(null); // { vendor, action }

  useEffect(() => {
    // TODO: wire admin vendors to real API — Phase X
  }, []);

  const filtered = vendors.filter((v) => {
    const matchSearch =
      v.store.toLowerCase().includes(search.toLowerCase()) ||
      v.owner.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const applyAction = () => {
    const { vendor, action } = confirm;
    const statusMap = {
      approve: "Approved",
      reject: "Rejected",
      suspend: "Suspended",
      restore: "Approved",
    };
    setVendors(
      vendors.map((v) =>
        v.id === vendor.id ? { ...v, status: statusMap[action] } : v,
      ),
    );
    setConfirm(null);
    setViewVendor(null);
  };

  const actionLabel = {
    approve: "Approve",
    reject: "Reject",
    suspend: "Suspend",
    restore: "Restore",
  };
  const actionColor = {
    approve: t.btnPrimary,
    reject: t.btnDanger,
    suspend: t.btnDanger,
    restore: t.btnPrimary,
  };

  return (
    <AdminLayout
      pageTitle="Vendor Management"
      pageSubtitle="Review applications and manage vendor accounts."
      breadcrumb="Vendors"
    >
      {/* Toolbar */}
      <div className={t.toolbar}>
        <div className={t.toolbarLeft}>
          <div className={t.searchBox}>
            <Search size={15} className={t.searchIcon} />
            <input
              className={t.searchInput}
              placeholder="Search store or owner..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <select
            className={t.filterSelect}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={t.tableCard}>
        <div className={t.tableWrap}>
          <table className={t.table}>
            <thead>
              <tr>
                <th>Store</th>
                <th>Owner</th>
                <th>Products</th>
                <th>Revenue</th>
                <th>Status</th>
                <th>Joined</th>
                <th style={{ width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className={t.emptyState}>
                      <div className={t.emptyIcon}>
                        <Search size={24} />
                      </div>
                      <h3 className={t.emptyTitle}>No vendors found</h3>
                      <p className={t.emptyText}>
                        Try adjusting your search or status filter.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paged.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <div className={t.avatarCell}>
                        <div
                          className={t.avatar}
                          style={{ background: "#f3e8ff", color: "#7c3aed" }}
                        >
                          {getInitials(v.store)}
                        </div>
                        <div>
                          <span className={t.avatarName}>{v.store}</span>
                          <span className={t.avatarSub}>{v.email}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{v.owner}</td>
                    <td style={{ fontWeight: 600 }}>{v.products}</td>
                    <td style={{ fontWeight: 700, color: "#16a34a" }}>
                      {v.revenue}
                    </td>
                    <td>
                      <StatusBadge status={v.status} />
                    </td>
                    <td style={{ color: "var(--adm-text-muted)" }}>
                      {v.joined}
                    </td>
                    <td>
                      <div className={t.actions}>
                        <button
                          className={t.actionBtn}
                          title="View Details"
                          onClick={() => setViewVendor(v)}
                        >
                          <Eye size={15} />
                        </button>
                        {v.status === "Pending" && (
                          <>
                            <button
                              className={`${t.actionBtn} ${t.approve}`}
                              title="Approve"
                              onClick={() =>
                                setConfirm({ vendor: v, action: "approve" })
                              }
                            >
                              <Check size={15} />
                            </button>
                            <button
                              className={`${t.actionBtn} ${t.reject}`}
                              title="Reject"
                              onClick={() =>
                                setConfirm({ vendor: v, action: "reject" })
                              }
                            >
                              <X size={15} />
                            </button>
                          </>
                        )}
                        {v.status === "Approved" && (
                          <button
                            className={`${t.actionBtn} ${t.delete}`}
                            title="Suspend"
                            onClick={() =>
                              setConfirm({ vendor: v, action: "suspend" })
                            }
                          >
                            <ShieldOff size={15} />
                          </button>
                        )}
                        {(v.status === "Suspended" ||
                          v.status === "Rejected") && (
                          <button
                            className={`${t.actionBtn} ${t.approve}`}
                            title="Restore"
                            onClick={() =>
                              setConfirm({ vendor: v, action: "restore" })
                            }
                          >
                            <Check size={15} />
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
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}{" "}
              vendors
            </span>
            <div className={t.pageButtons}>
              <button
                className={t.pageBtn}
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
              >
                ←
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`${t.pageBtn} ${page === i + 1 ? t.pageBtnActive : ""}`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className={t.pageBtn}
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Detail Modal */}
      {viewVendor && (
        <div className={t.modalBackdrop} onClick={() => setViewVendor(null)}>
          <div
            className={`${t.modal} ${t.modalLg}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={t.modalHead}>
              <h2 className={t.modalTitle}>
                Vendor Details — {viewVendor.store}
              </h2>
              <button
                className={t.modalClose}
                onClick={() => setViewVendor(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className={t.modalBody}>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <div
                  className={t.avatar}
                  style={{
                    width: 52,
                    height: 52,
                    fontSize: 18,
                    background: "#f3e8ff",
                    color: "#7c3aed",
                  }}
                >
                  {getInitials(viewVendor.store)}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 17 }}>
                    {viewVendor.store}
                  </p>
                  <p
                    style={{
                      margin: "3px 0 0",
                      color: "var(--adm-text-muted)",
                      fontSize: 13,
                    }}
                  >
                    {viewVendor.email}
                  </p>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <StatusBadge status={viewVendor.status} />
                </div>
              </div>
              <div className={t.formRow}>
                <div className={t.formGroup}>
                  <label className={t.label}>Owner Name</label>
                  <p style={{ margin: 0, fontWeight: 600 }}>
                    {viewVendor.owner}
                  </p>
                </div>
                <div className={t.formGroup}>
                  <label className={t.label}>Join Date</label>
                  <p style={{ margin: 0 }}>{viewVendor.joined}</p>
                </div>
                <div className={t.formGroup}>
                  <label className={t.label}>Products Listed</label>
                  <p style={{ margin: 0, fontWeight: 700 }}>
                    {viewVendor.products}
                  </p>
                </div>
                <div className={t.formGroup}>
                  <label className={t.label}>Total Revenue</label>
                  <p style={{ margin: 0, fontWeight: 700, color: "#16a34a" }}>
                    {viewVendor.revenue}
                  </p>
                </div>
              </div>
            </div>
            <div className={t.modalFoot}>
              {viewVendor.status === "Pending" && (
                <>
                  <button
                    className={`${t.btn} ${t.btnDanger}`}
                    onClick={() =>
                      setConfirm({ vendor: viewVendor, action: "reject" })
                    }
                  >
                    <X size={14} /> Reject
                  </button>
                  <button
                    className={`${t.btn} ${t.btnPrimary}`}
                    onClick={() =>
                      setConfirm({ vendor: viewVendor, action: "approve" })
                    }
                  >
                    <Check size={14} /> Approve
                  </button>
                </>
              )}
              {viewVendor.status === "Approved" && (
                <button
                  className={`${t.btn} ${t.btnDanger}`}
                  onClick={() =>
                    setConfirm({ vendor: viewVendor, action: "suspend" })
                  }
                >
                  <ShieldOff size={14} /> Suspend
                </button>
              )}
              <button
                className={`${t.btn} ${t.btnOutline}`}
                onClick={() => setViewVendor(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirm && (
        <div className={t.modalBackdrop} onClick={() => setConfirm(null)}>
          <div
            className={`${t.modal} ${t.modalSm}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={t.modalBody}
              style={{
                alignItems: "center",
                textAlign: "center",
                paddingTop: 28,
                paddingBottom: 28,
              }}
            >
              <div className={t.confirmIcon}>
                <AlertTriangle size={24} />
              </div>
              <h3 className={t.modalTitle}>
                {actionLabel[confirm.action]} Vendor?
              </h3>
              <p className={t.confirmText}>
                Are you sure you want to <strong>{confirm.action}</strong>{" "}
                <strong>{confirm.vendor.store}</strong>?
              </p>
            </div>
            <div className={t.modalFoot} style={{ justifyContent: "center" }}>
              <button
                className={`${t.btn} ${t.btnOutline}`}
                onClick={() => setConfirm(null)}
              >
                Cancel
              </button>
              <button
                className={`${t.btn} ${actionColor[confirm.action]}`}
                onClick={applyAction}
              >
                {actionLabel[confirm.action]}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
