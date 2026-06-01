import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { ShoppingCart, Search, Eye, X, Package, AlertTriangle } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import apiClient from "../../utils/apiClient";
import { formatPrice } from "../../utils/formatPrice";
import t from "../../styles/AdminTable.module.css";

const ORDER_STATUSES = [
  { value: "", label: "All Status" },
  { value: "pending_payment", label: "Pending Payment" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "completed", label: "Completed" },
  { value: "canceled", label: "Canceled" },
  { value: "refunded", label: "Refunded" },
  { value: "return_requested", label: "Return Requested" },
  { value: "returned", label: "Returned" },
];

const STATUS_CLASS = {
  pending_payment: t.badgePending,
  confirmed: t.badgeProcessing,
  processing: t.badgeProcessing,
  shipped: t.badgeShipped,
  completed: t.badgeActive,
  canceled: t.badgeCancelled,
  refunded: t.badgeSuspended,
  return_requested: t.badgePending,
  returned: t.badgeSuspended,
};

function StatusBadge({ status }) {
  return (
    <span className={`${t.badge} ${STATUS_CLASS[status] || t.badgeDraft}`}>
      <span className={t.badgeDot} />
      {status?.replace(/_/g, " ")}
    </span>
  );
}

function fmt(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function OrderModal({ orderId, onClose }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient
      .get(`/admin/orders/${orderId}`)
      .then((r) => setOrder(r.data))
      .catch(() => setError("Failed to load order details."))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleCancel = async () => {
    if (!cancelReason.trim()) return;
    setActionLoading(true);
    try {
      await apiClient.post(`/admin/orders/${orderId}/cancel`, { reason: cancelReason });
      const r = await apiClient.get(`/admin/orders/${orderId}`);
      setOrder(r.data);
      setCancelModal(false);
      setCancelReason("");
    } catch {
      setError("Failed to cancel order.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveReturn = async () => {
    setActionLoading(true);
    try {
      await apiClient.post(`/admin/orders/${orderId}/return/approve`, {});
      const r = await apiClient.get(`/admin/orders/${orderId}`);
      setOrder(r.data);
    } catch {
      setError("Failed to approve return.");
    } finally {
      setActionLoading(false);
    }
  };

  const terminalStatuses = ["completed", "canceled", "refunded", "returned"];
  const canCancel = order && !terminalStatuses.includes(order.status);
  const canApproveReturn = order?.status === "return_requested";

  return (
    <div className={t.modalBackdrop} onClick={onClose}>
      <div className={`${t.modal} ${t.modalLg}`} onClick={(e) => e.stopPropagation()}>
        <div className={t.modalHead}>
          <div>
            <h2 className={t.modalTitle}>{order ? `Order ${order.orderNumber}` : "Order Details"}</h2>
            {order && <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--adm-text-muted)" }}>Placed on {fmt(order.createdAt)}</p>}
          </div>
          <button className={t.modalClose} onClick={onClose}><X size={18} /></button>
        </div>

        <div className={t.modalBody}>
          {loading ? (
            <div>
              {Array.from({ length: 4 }).map((_, i) => (
                <span key={i} className={`${t.skeleton} ${t.skeletonRow}`} style={{ marginBottom: 8, display: "block" }} />
              ))}
            </div>
          ) : error ? (
            <p style={{ color: "#dc2626" }}>{error}</p>
          ) : order ? (
            <>
              {/* Status row */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <StatusBadge status={order.status} />
              </div>

              {/* Info grid */}
              <div className={t.formRow}>
                <div className={t.formGroup}>
                  <label className={t.label}>Customer Email</label>
                  <p style={{ margin: 0 }}>{order.customerEmail}</p>
                </div>
                <div className={t.formGroup}>
                  <label className={t.label}>Shipping Address</label>
                  <p style={{ margin: 0 }}>{[order.shippingStreet, order.shippingCity].filter(Boolean).join(", ") || "—"}</p>
                </div>
                <div className={t.formGroup}>
                  <label className={t.label}>Subtotal</label>
                  <p style={{ margin: 0, fontWeight: 700 }}>{formatPrice(order.subtotal)}</p>
                </div>
                <div className={t.formGroup}>
                  <label className={t.label}>Shipping</label>
                  <p style={{ margin: 0 }}>{formatPrice(order.shippingCost)}</p>
                </div>
                {order.cancellationReason && (
                  <div className={t.formGroup} style={{ gridColumn: "1 / -1" }}>
                    <label className={t.label}>Cancellation Reason</label>
                    <p style={{ margin: 0 }}>{order.cancellationReason}</p>
                  </div>
                )}
                {order.returnReason && (
                  <div className={t.formGroup} style={{ gridColumn: "1 / -1" }}>
                    <label className={t.label}>Return Reason</label>
                    <p style={{ margin: 0 }}>{order.returnReason}</p>
                  </div>
                )}
              </div>

              {/* Items */}
              <div>
                <p className={t.label} style={{ marginBottom: 10 }}>Items ({order.items?.length ?? 0})</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(order.items ?? []).map((item) => (
                    <div key={item.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 14px", background: "var(--adm-bg)", borderRadius: 10 }}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.productName} style={{ width: 44, height: 54, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 44, height: 54, borderRadius: 6, background: "var(--adm-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Package size={18} />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 13.5 }}>{item.productName}</p>
                        <p style={{ margin: 0, fontSize: 12, color: "var(--adm-text-muted)" }}>
                          {[item.variantColor, item.variantSize].filter(Boolean).join(" · ")} · Qty: {item.quantity}
                        </p>
                      </div>
                      <p style={{ margin: 0, fontWeight: 700, whiteSpace: "nowrap" }}>{formatPrice(item.lineTotal)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 12, borderTop: "1px solid var(--adm-border)" }}>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Total: {formatPrice(order.total)}</p>
              </div>
            </>
          ) : null}
        </div>

        {order && (
          <div className={t.modalFoot}>
            {canApproveReturn && (
              <button className={`${t.btn} ${t.btnPrimary}`} onClick={handleApproveReturn} disabled={actionLoading}>
                {actionLoading ? "Processing…" : "Approve Return"}
              </button>
            )}
            {canCancel && (
              <button className={`${t.btn} ${t.btnDanger}`} onClick={() => setCancelModal(true)}>
                Cancel Order
              </button>
            )}
            <button className={`${t.btn} ${t.btnOutline}`} onClick={onClose}>Close</button>
          </div>
        )}
      </div>

      {/* Cancel sub-modal */}
      {cancelModal && (
        <div className={t.modalBackdrop} onClick={() => setCancelModal(false)}>
          <div className={`${t.modal} ${t.modalSm}`} onClick={(e) => e.stopPropagation()}>
            <div className={t.modalHead}>
              <h2 className={t.modalTitle}>Cancel Order</h2>
              <button className={t.modalClose} onClick={() => setCancelModal(false)}><X size={18} /></button>
            </div>
            <div className={t.modalBody}>
              <div className={t.confirmIcon}><AlertTriangle size={24} /></div>
              <p className={t.confirmText}>Provide a reason for cancellation:</p>
              <div className={t.formGroup}>
                <textarea
                  className={t.textarea}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Reason for cancellation..."
                  rows={3}
                  required
                />
              </div>
            </div>
            <div className={t.modalFoot}>
              <button className={`${t.btn} ${t.btnOutline}`} onClick={() => setCancelModal(false)}>Back</button>
              <button
                className={`${t.btn} ${t.btnDanger}`}
                onClick={handleCancel}
                disabled={actionLoading || !cancelReason.trim()}
              >
                {actionLoading ? "Cancelling…" : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [error, setError] = useState(null);
  
  const location = useLocation();

  useEffect(() => {
    if (location.state?.openOrderId) {
      setActiveOrderId(location.state.openOrderId);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    const params = { page, limit };
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    apiClient
      .get("/admin/orders/all", { params })
      .then((r) => {
        setOrders(r.data.data);
        setTotal(r.data.total);
      })
      .catch(() => setError("Failed to load orders."))
      .finally(() => setLoading(false));
  }, [page, limit, search, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const totalPages = Math.ceil(total / limit);

  return (
    <AdminLayout
      pageTitle="Orders Management"
      pageSubtitle="View and manage all orders across the platform."
      breadcrumb="Orders"
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
              placeholder="Search by order number…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className={t.filterSelect}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <span className={t.pageInfo}>{total} orders</span>
      </div>

      {/* Table */}
      <div className={t.tableCard}>
        <div className={t.tableWrap}>
          <table className={t.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Order #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8}><span className={`${t.skeleton} ${t.skeletonRow}`} /></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className={t.emptyState}>
                      <div className={t.emptyIcon}><ShoppingCart size={24} /></div>
                      <h3 className={t.emptyTitle}>No orders found</h3>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((o, i) => (
                  <tr key={o.id}>
                    <td>{(page - 1) * limit + i + 1}</td>
                    <td>
                      <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 12, color: "var(--adm-accent)" }}>
                        {o.orderNumber}
                      </span>
                    </td>
                    <td>{o.customerEmail}</td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        {(o.items ?? []).slice(0, 2).map((item, idx) => (
                          item.imageUrl ? (
                            <img key={idx} src={item.imageUrl} alt={item.productName} title={item.productName} style={{ width: 32, height: 38, borderRadius: 6, objectFit: "cover", border: "1px solid var(--adm-border)" }} />
                          ) : (
                            <div key={idx} style={{ width: 32, height: 38, borderRadius: 6, background: "var(--adm-bg)", border: "1px solid var(--adm-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Package size={14} />
                            </div>
                          )
                        ))}
                        {(o.items ?? []).length > 2 && (
                          <span style={{ width: 32, height: 38, borderRadius: 6, background: "var(--adm-bg)", border: "1px solid var(--adm-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "var(--adm-text-muted)" }}>
                            +{o.items.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700 }}>{formatPrice(o.total)}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td style={{ color: "var(--adm-text-muted)" }}>{fmt(o.createdAt)}</td>
                    <td>
                      <button className={`${t.actionBtn} ${t.approve}`} title="View" onClick={() => setActiveOrderId(o.id)}>
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

      {activeOrderId && (
        <OrderModal
          orderId={activeOrderId}
          onClose={() => { setActiveOrderId(null); fetchOrders(); }}
        />
      )}
    </AdminLayout>
  );
}
