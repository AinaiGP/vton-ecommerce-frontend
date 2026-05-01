import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  ChevronRight,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Paperclip,
  X,
  Send,
  Eye,
  ChevronDown,
  Loader2,
  ExternalLink,
} from "lucide-react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import apiClient, { multipartClient } from "../utils/apiClient";
import styles from "../styles/OrdersPage.module.css";
import t from "../styles/CustomerTickets.module.css"; // reuse ticket modal styles

const RETURN_REASONS = [
  "Wrong size / doesn't fit",
  "Received wrong item",
  "Item damaged or defective",
  "Not as described / different from photos",
  "Changed my mind",
  "Late delivery",
  "Other",
];

const STATUS_CFG = {
  DELIVERED: { color: "#16a34a", bg: "#dcfce7", icon: CheckCircle2, label: "Delivered" },
  SHIPPED: { color: "#0891b2", bg: "#ecfeff", icon: Truck, label: "Shipped" },
  PROCESSING: { color: "#ca8a04", bg: "#fef9c3", icon: Clock, label: "Processing" },
  PENDING: { color: "#6b7280", bg: "#f3f4f6", icon: Clock, label: "Pending" },
  CONFIRMED: { color: "#2563eb", bg: "#dbeafe", icon: Package, label: "Confirmed" },
  CANCELED: { color: "#dc2626", bg: "#fee2e2", icon: XCircle, label: "Canceled" },
  CANCELLED: { color: "#dc2626", bg: "#fee2e2", icon: XCircle, label: "Canceled" }, // compatibility
};

const PAY_CFG = {
  PAID: { color: "#16a34a", bg: "#dcfce7", label: "Paid" },
  REFUNDED: { color: "#0891b2", bg: "#ecfeff", label: "Refunded" },
  PENDING: { color: "#ca8a04", bg: "#fef9c3", label: "Pending" },
  FAILED: { color: "#dc2626", bg: "#fee2e2", label: "Failed" },
};

/* ─── Cancel Confirm Modal ─── */
function CancelModal({ order, onConfirm, onClose }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(order.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={t.backdrop} onClick={onClose}>
      <div
        className={t.modalSm}
        onClick={(e) => e.stopPropagation()}
        style={{ background: "white", borderRadius: 16 }}
      >
        <div style={{ textAlign: "center", padding: "28px 24px" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <AlertTriangle size={26} style={{ color: "#dc2626" }} />
          </div>
          <h3
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 18,
              fontWeight: 700,
              color: "var(--charcoal)",
              margin: "0 0 8px",
            }}
          >
            Cancel Order?
          </h3>
          <p
            style={{
              fontSize: 13.5,
              color: "var(--charcoal-muted)",
              marginBottom: 20,
            }}
          >
            Are you sure you want to cancel order <strong>#{order.orderNumber}</strong>? This
            action cannot be undone.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button
              onClick={onClose}
              disabled={loading}
              style={{
                padding: "10px 20px",
                borderRadius: 10,
                border: "1.5px solid var(--ivory-dark)",
                background: "white",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Back
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              style={{
                padding: "10px 20px",
                borderRadius: 10,
                border: "none",
                background: "#dc2626",
                color: "white",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              {loading ? <Loader2 size={14} className={styles.spin} /> : <XCircle size={14} />} 
              Confirm Cancellation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Return Request Modal ─── */
function ReturnModal({ order, onSubmit, onClose }) {
  const [selectedItemId, setSelectedItemId] = useState(order.items[0]?.id || "");
  const [reason, setReason] = useState(RETURN_REASONS[0]);
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const selectedItem = order.items.find(i => i.id === selectedItemId);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit({ 
        orderItemId: selectedItemId, 
        quantity: selectedItem?.quantity || 1, 
        reason, 
        description: desc, 
        file 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={t.backdrop} onClick={onClose}>
      <div className={t.modal} onClick={(e) => e.stopPropagation()}>
        <div className={t.modalHead}>
          <h2 className={t.modalTitle}>Submit Return Request</h2>
          <button className={t.modalClose} onClick={onClose}>
            <X size={17} />
          </button>
        </div>
        <div className={t.modalBody}>
          <p style={{ fontSize: 13, color: 'var(--charcoal-muted)', marginBottom: 16 }}>
            Returns are only available for items delivered within the last 14 days.
          </p>
          <div className={t.formGroup}>
            <label className={t.label}>Order Number</label>
            <input
              className={t.input}
              value={order.orderNumber}
              disabled
              style={{ opacity: 0.7 }}
            />
          </div>
          <div className={t.formGroup}>
            <label className={t.label}>Item to Return *</label>
            <select
              className={t.select}
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
            >
              {order.items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.productName} (Qty: {item.quantity})
                </option>
              ))}
            </select>
          </div>
          <div className={t.formGroup}>
            <label className={t.label}>Reason for Return *</label>
            <select
              className={t.select}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              {RETURN_REASONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className={t.formGroup}>
            <label className={t.label}>Additional Details</label>
            <textarea
              className={t.textarea}
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Describe the issue in detail…"
            />
          </div>
          <div className={t.formGroup}>
            <label className={t.label}>
              Proof Photo{" "}
              <span style={{ fontWeight: 400, color: "var(--charcoal-muted)" }}>
                (optional)
              </span>
            </label>
            <div
              className={t.attachZone}
              onClick={() => fileRef.current?.click()}
            >
              <Paperclip size={20} style={{ color: "var(--burgundy)" }} />
              <div>
                <p className={t.attachTitle}>
                  {file ? file.name : "Click to upload image"}
                </p>
                <p className={t.attachSub}>
                  {file
                    ? `${(file.size / 1024).toFixed(1)} KB`
                    : "PNG, JPG, WEBP — Max 5 MB"}
                </p>
              </div>
              {file && (
                <button
                  type="button"
                  className={t.attachRemove}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files[0] || null)}
            />
          </div>
        </div>
        <div className={t.modalFoot}>
          <button className={`${t.btn} ${t.btnOutline}`} onClick={onClose}>
            Cancel
          </button>
          <button
            className={`${t.btn} ${t.btnPrimary}`}
            onClick={handleSubmit}
            disabled={loading || !selectedItemId}
          >
            {loading ? <Loader2 size={14} className={styles.spin} /> : <Send size={14} />} 
            Submit Return Request
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [cancelModal, setCancelModal] = useState(null); 
  const [returnModal, setReturnModal] = useState(null); 
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== "All") params.status = statusFilter;
      const res = await apiClient.get("/customers/orders", { params });
      // Backend returns { items: Order[], meta: {...} }
      setOrders(res.data.items || []);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  const addToast = (text, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4000,
    );
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await apiClient.patch(`/customers/orders/${orderId}/cancel`, { reason: "Customer requested cancellation" });
      addToast(`Order has been cancelled. Refund is being processed.`, "success");
      setCancelModal(null);
      fetchOrders();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to cancel order.", "error");
    }
  };

  const submitReturn = async (data) => {
    try {
      const orderId = returnModal.id;
      const res = await apiClient.post(`/customers/orders/${orderId}/return`, {
        orderItemId: data.orderItemId,
        quantity: data.quantity,
        reason: data.reason,
        description: data.description
      });

      // If there's a file, upload it as an attachment to the created ticket
      if (data.file && res.data.id) {
        const formData = new FormData();
        formData.append("file", data.file);
        await multipartClient.post(`/customers/support/tickets/${res.data.id}/messages/attachments`, formData);
      }

      setReturnModal(null);
      addToast(`Return request submitted successfully! Ticket #${res.data.id}`, "success");
      fetchOrders();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to submit return request.", "error");
    }
  };

  const filtered = orders; // Filtering is handled by API

  const formatPrice = (price, currency = "EGP") => {
    return `${currency} ${price.toLocaleString()}`;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={styles.page}>
      <Header />

      {/* Toast notifications */}
      <div
        style={{
          position: "fixed",
          top: 80,
          right: 20,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              background: toast.type === "error" ? "#fee2e2" : "#dcfce7",
              border: `1px solid ${toast.type === "error" ? "#fecaca" : "#86efac"}`,
              color: toast.type === "error" ? "#991b1b" : "#15803d",
              padding: "12px 18px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
              animation: "fadeIn 0.2s ease",
            }}
          >
            {toast.type === "error" ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />} 
            {toast.text}
          </div>
        ))}
      </div>

      <main className={styles.main}>
        {/* Header */}
        <div
          className={styles.pageHead}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h1 className={styles.pageTitle}>My Orders</h1>
            <p className={styles.pageSub}>
              Track your deliveries and manage returns.
            </p>
          </div>
          <div className={styles.filterBar}>
            {["All", "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELED"].map((f) => (
              <button
                key={f}
                className={`${styles.filterBtn} ${statusFilter === f ? styles.filterActive : ""}`}
                onClick={() => setStatusFilter(f)}
              >
                {f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--charcoal-muted)' }}>
            <Loader2 size={32} className={styles.spin} style={{ margin: '0 auto 12px' }} />
            <p>Loading your orders…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Package size={48} strokeWidth={1} />
            </div>
            <h2 className={styles.emptyTitle}>No orders yet</h2>
            <p className={styles.emptyText}>
              Looks like you haven't placed any orders. Start exploring our
              collection!
            </p>
            <Link to="/browse" className={styles.shopBtn}>
              Explore Shop
            </Link>
          </div>
        ) : (
          <div className={styles.orderList}>
            {filtered.map((order) => {
              const status = STATUS_CFG[order.status] || STATUS_CFG.PENDING;
              const pay = PAY_CFG[order.paymentStatus] || PAY_CFG.PENDING;
              const isExpanded = expanded === order.id;
              const canCancel = order.status === "PENDING" || order.status === "CONFIRMED";
              const canReturn = order.status === "DELIVERED";

              return (
                <div key={order.id} className={styles.orderCard}>
                  <div
                    className={styles.cardHeader}
                    onClick={() => setExpanded(isExpanded ? null : order.id)}
                  >
                    <div className={styles.headerGrid}>
                      <div className={styles.headerInfo}>
                        <p className={styles.orderLabel}>Order Number</p>
                        <p className={styles.orderVal}>#{order.orderNumber}</p>
                      </div>
                      <div className={styles.headerInfo}>
                        <p className={styles.orderLabel}>Date Placed</p>
                        <p className={styles.orderVal}>{formatDate(order.createdAt)}</p>
                      </div>
                      <div className={styles.headerInfo}>
                        <p className={styles.orderLabel}>Total Amount</p>
                        <p className={styles.orderVal}>
                          {formatPrice(order.totalAmount, order.currency)}
                        </p>
                      </div>
                      <div className={styles.headerBadges}>
                        <span
                          className={styles.statusBadge}
                          style={{ background: status.bg, color: status.color }}
                        >
                          <status.icon size={12} /> {status.label}
                        </span>
                        <span
                          className={styles.payBadge}
                          style={{ background: pay.bg, color: pay.color }}
                        >
                          {pay.label}
                        </span>
                      </div>
                      <div className={styles.headerAction}>
                        <ChevronDown
                          size={20}
                          style={{
                            transform: isExpanded ? "rotate(180deg)" : "none",
                            transition: "transform 0.2s",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className={styles.cardBody}>
                      <div className={styles.itemsSection}>
                        {order.items.map((item, idx) => (
                          <div key={idx} className={styles.itemRow}>
                            <div className={styles.itemImgWrap}>
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.productName}
                                  className={styles.itemImg}
                                />
                              ) : (
                                <div className={styles.itemImgPlaceholder}>
                                  <Package size={20} />
                                </div>
                              )}
                            </div>
                            <div className={styles.itemInfo}>
                              <p className={styles.itemName}>{item.productName}</p>
                              <p className={styles.itemMeta}>
                                {item.variantColor && `Color: ${item.variantColor}`}
                                {item.variantSize && ` · Size: ${item.variantSize}`}
                                {` · Qty: ${item.quantity}`}
                              </p>
                            </div>
                            <div className={styles.itemPrice}>
                              {formatPrice(item.lineTotal, order.currency)}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className={styles.orderFooter}>
                        <div className={styles.footerLeft}>
                          {order.trackingNumber && (
                            <div className={styles.trackingInfo}>
                              <p className={styles.trackingLabel}>
                                Tracking Number
                              </p>
                              <p className={styles.trackingVal}>
                                {order.trackingNumber}
                                <Link to="#" className={styles.trackLink}>
                                  Track Package <ExternalLink size={12} />
                                </Link>
                              </p>
                            </div>
                          )}
                        </div>
                        <div className={styles.footerActions}>
                          {canCancel && (
                            <button
                              className={styles.actionBtnOutline}
                              onClick={() => setCancelModal(order)}
                            >
                              Cancel Order
                            </button>
                          )}
                          {canReturn && (
                            <button
                              className={styles.actionBtnPrimary}
                              onClick={() => setReturnModal(order)}
                            >
                              <RotateCcw size={14} /> Request Return
                            </button>
                          )}
                          <Link
                            to={`/customers/support`}
                            className={styles.actionBtnGhost}
                          >
                            Need Help?
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {cancelModal && (
        <CancelModal
          order={cancelModal}
          onConfirm={handleCancelOrder}
          onClose={() => setCancelModal(null)}
        />
      )}

      {returnModal && (
        <ReturnModal
          order={returnModal}
          onSubmit={submitReturn}
          onClose={() => setReturnModal(null)}
        />
      )}

      <Footer />
    </div>
  );
}
