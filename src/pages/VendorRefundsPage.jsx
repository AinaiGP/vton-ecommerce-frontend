import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Check,
  X,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import VendorLayout from "../components/vendor/VendorLayout";
import p from "../styles/VendorPage.module.css";

const SEED = [];

const STATUS_BADGE = {
  Pending: p.badgePending,
  Approved: p.badgeDelivered,
  Rejected: p.badgeCancelled,
};

function getInitials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function VendorRefundsPage() {
  const [refunds, setRefunds] = useState(SEED);
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // TODO: wire refund requests to real API — Phase X
  }, []);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2800);
  };

  const approve = (id) => {
    setRefunds((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Approved" } : r)),
    );
    setViewing(null);
    showToast("Refund approved successfully.");
  };

  const reject = (id) => {
    if (!rejectReason.trim()) {
      showToast("Please enter a reason for rejection.", false);
      return;
    }
    setRefunds((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "Rejected", rejectReason } : r,
      ),
    );
    setViewing(null);
    setShowRejectBox(false);
    setRejectReason("");
    showToast("Refund rejected.");
  };

  const filtered = refunds.filter((r) => {
    const q =
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.customer.toLowerCase().includes(search.toLowerCase()) ||
      r.orderId.toLowerCase().includes(search.toLowerCase());
    return q && (tab === "All" || r.status === tab);
  });

  const counts = {
    Pending: refunds.filter((r) => r.status === "Pending").length,
    Approved: refunds.filter((r) => r.status === "Approved").length,
    Rejected: refunds.filter((r) => r.status === "Rejected").length,
  };

  return (
    <VendorLayout
      pageTitle="Refund Requests"
      pageSubtitle="Review and manage customer refund requests."
      breadcrumb="Refunds"
    >
      {toast && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "11px 18px",
            background: toast.ok ? "#dcfce7" : "#fee2e2",
            border: `1px solid ${toast.ok ? "#bbf7d0" : "#fca5a5"}`,
            borderRadius: 10,
            color: toast.ok ? "#16a34a" : "#dc2626",
            fontWeight: 600,
            fontSize: 13.5,
            marginBottom: 16,
          }}
        >
          {toast.ok ? <Check size={15} /> : <AlertTriangle size={15} />}{" "}
          {toast.msg}
        </div>
      )}

      {/* Tabs */}
      <div className={p.filterTabs}>
        {["All", "Pending", "Approved", "Rejected"].map((t) => (
          <button
            key={t}
            className={`${p.filterTab} ${tab === t ? p.active : ""}`}
            onClick={() => setTab(t)}
          >
            {t}{" "}
            {t !== "All" && (
              <span style={{ opacity: 0.6 }}>({counts[t] ?? 0})</span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className={p.toolbar}>
        <div className={p.searchBox}>
          <Search size={14} className={p.searchIcon} />
          <input
            className={p.searchInput}
            placeholder="Search by refund ID, order or customer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className={p.pageInfo}>{filtered.length} requests</span>
      </div>

      {/* Table */}
      <div className={p.tableCard}>
        <div className={p.tableWrap}>
          <table className={p.table}>
            <thead>
              <tr>
                <th>Refund ID</th>
                <th>Customer</th>
                <th>Order</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ width: 80 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className={p.emptyState}>
                      <div className={p.emptyIcon}>
                        <MessageSquare size={22} />
                      </div>
                      <h3 className={p.emptyTitle}>No refund requests</h3>
                      <p className={p.emptyText}>
                        No requests match your current filter.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 700, color: "var(--vdr-accent)" }}>
                      {r.id}
                    </td>
                    <td>
                      <div className={p.productCell}>
                        <div className={p.avatar}>
                          {getInitials(r.customer)}
                        </div>
                        <div>
                          <span style={{ fontWeight: 600, display: "block" }}>
                            {r.customer}
                          </span>
                          <span
                            style={{
                              fontSize: 11.5,
                              color: "var(--vdr-text-subtle)",
                            }}
                          >
                            {r.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td
                      style={{ color: "var(--vdr-text-muted)", fontSize: 13 }}
                    >
                      {r.orderId}
                    </td>
                    <td style={{ fontWeight: 500 }}>{r.product}</td>
                    <td style={{ fontWeight: 700 }}>{r.amount}</td>
                    <td style={{ color: "var(--vdr-text-muted)" }}>{r.date}</td>
                    <td>
                      <span className={`${p.badge} ${STATUS_BADGE[r.status]}`}>
                        <span className={p.badgeDot} />
                        {r.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className={p.actionBtn}
                        title="View Details"
                        onClick={() => {
                          setViewing(r);
                          setShowRejectBox(false);
                          setRejectReason("");
                        }}
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {viewing && (
        <div className={p.modalBackdrop} onClick={() => setViewing(null)}>
          <div
            className={`${p.modal} ${p.modalLg}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={p.modalHead}>
              <div>
                <h2 className={p.modalTitle}>Refund {viewing.id}</h2>
                <p
                  style={{
                    margin: "3px 0 0",
                    fontSize: 12,
                    color: "var(--vdr-text-muted)",
                  }}
                >
                  Order: {viewing.orderId} · {viewing.date}
                </p>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span className={`${p.badge} ${STATUS_BADGE[viewing.status]}`}>
                  <span className={p.badgeDot} />
                  {viewing.status}
                </span>
                <button
                  className={p.modalClose}
                  onClick={() => setViewing(null)}
                >
                  <X size={17} />
                </button>
              </div>
            </div>
            <div className={p.modalBody}>
              {/* Customer info */}
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  padding: "12px 16px",
                  background: "var(--vdr-bg)",
                  borderRadius: 10,
                  marginBottom: 16,
                }}
              >
                <div
                  className={p.avatar}
                  style={{ width: 40, height: 40, fontSize: 14 }}
                >
                  {getInitials(viewing.customer)}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>
                    {viewing.customer}
                  </p>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: 12,
                      color: "var(--vdr-text-muted)",
                    }}
                  >
                    {viewing.email}
                  </p>
                </div>
                <span
                  style={{
                    marginLeft: "auto",
                    fontWeight: 800,
                    fontSize: 20,
                    color: "var(--vdr-accent)",
                  }}
                >
                  {viewing.amount}
                </span>
              </div>

              {/* Product */}
              <div
                style={{
                  padding: "12px 16px",
                  border: "1px solid var(--vdr-border)",
                  borderRadius: 10,
                  marginBottom: 16,
                }}
              >
                <p className={p.label}>Product</p>
                <p style={{ margin: "4px 0 0", fontWeight: 600 }}>
                  {viewing.product}
                </p>
              </div>

              {/* Reason */}
              <div
                style={{
                  padding: "12px 16px",
                  background: "#fef3c7",
                  border: "1px solid #fde68a",
                  borderRadius: 10,
                  marginBottom: 16,
                }}
              >
                <p className={p.label} style={{ color: "#92400e" }}>
                  Customer Reason
                </p>
                <p
                  style={{ margin: "4px 0 0", color: "#78350f", fontSize: 14 }}
                >
                  {viewing.reason}
                </p>
              </div>

              {/* Rejected reason */}
              {viewing.status === "Rejected" && viewing.rejectReason && (
                <div
                  style={{
                    padding: "12px 16px",
                    background: "#fee2e2",
                    border: "1px solid #fca5a5",
                    borderRadius: 10,
                    marginBottom: 16,
                  }}
                >
                  <p className={p.label} style={{ color: "#991b1b" }}>
                    Rejection Reason
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      color: "#7f1d1d",
                      fontSize: 14,
                    }}
                  >
                    {viewing.rejectReason}
                  </p>
                </div>
              )}

              {/* Actions */}
              {viewing.status === "Pending" && (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    className={`${p.btn} ${p.btnPrimary}`}
                    onClick={() => approve(viewing.id)}
                    style={{ background: "#16a34a", boxShadow: "none" }}
                  >
                    <Check size={14} /> Approve Refund
                  </button>
                  <button
                    className={`${p.btn} ${p.btnOutline}`}
                    onClick={() => setShowRejectBox((v) => !v)}
                    style={{ color: "#dc2626", borderColor: "#fca5a5" }}
                  >
                    <X size={14} /> Reject Refund
                  </button>
                </div>
              )}

              {showRejectBox && viewing.status === "Pending" && (
                <div
                  style={{
                    marginTop: 14,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <label className={p.label}>Reason for Rejection *</label>
                  <textarea
                    className={p.textarea}
                    rows={3}
                    placeholder="Explain why this refund is being rejected…"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className={`${p.btn} ${p.btnPrimary}`}
                      style={{ background: "#dc2626", boxShadow: "none" }}
                      onClick={() => reject(viewing.id)}
                    >
                      Confirm Rejection
                    </button>
                    <button
                      className={`${p.btn} ${p.btnOutline}`}
                      onClick={() => {
                        setShowRejectBox(false);
                        setRejectReason("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className={p.modalFoot}>
              <button
                className={`${p.btn} ${p.btnOutline}`}
                onClick={() => setViewing(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </VendorLayout>
  );
}
