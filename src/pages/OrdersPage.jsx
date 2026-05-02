import { useState, useRef, useEffect } from "react";
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
} from "lucide-react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import styles from "../styles/OrdersPage.module.css";
import t from "../styles/CustomerTickets.module.css"; // reuse ticket modal styles
import apiClient from "../utils/apiClient";
import { formatPrice } from "../utils/formatPrice";

/* ─── Order status progression for tracker ─── */
// Using exact enum values from order-status.enum.ts
const TRACK_STEPS = [
  { key: "pending_payment", label: "Ordered" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "completed", label: "Delivered" },
];

function getTrackStep(status) {
  const idx = TRACK_STEPS.findIndex((s) => s.key === status);
  // canceled / refunded / return_requested / returned — show at step 0
  return idx >= 0 ? idx : 0;
}

/* ─── Map backend status → display label ─── */
const STATUS_LABEL = {
  pending_payment: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  completed: "Delivered",
  canceled: "Canceled",
  refunded: "Refunded",
  return_requested: "Return Requested",
  returned: "Returned",
};

const STATUS_CFG = {
  Delivered: { color: "#16a34a", bg: "#dcfce7", icon: CheckCircle2 },
  Shipped: { color: "#0891b2", bg: "#ecfeff", icon: Truck },
  Processing: { color: "#ca8a04", bg: "#fef9c3", icon: Clock },
  Pending: { color: "#6b7280", bg: "#f3f4f6", icon: Clock },
  Confirmed: { color: "#2563eb", bg: "#eff6ff", icon: CheckCircle2 },
  Canceled: { color: "#dc2626", bg: "#fee2e2", icon: XCircle },
  Refunded: { color: "#0891b2", bg: "#ecfeff", icon: RotateCcw },
  "Return Requested": { color: "#f59e0b", bg: "#fef3c7", icon: RotateCcw },
  Returned: { color: "#16a34a", bg: "#dcfce7", icon: RotateCcw },
};

const PAY_CFG = {
  Paid: { color: "#16a34a", bg: "#dcfce7" },
  Refunded: { color: "#0891b2", bg: "#ecfeff" },
  Pending: { color: "#ca8a04", bg: "#fef9c3" },
};

/* ─── Map backend order to UI shape ─── */
function mapOrder(o) {
  const statusLabel = STATUS_LABEL[o.status] || o.status;

  // Derive payment method: if stripe intent exists → Credit Card, else → Cash on Delivery
  const paymentMethod = o.stripePaymentIntentId
    ? "Credit Card"
    : "Cash on Delivery";

  // Payment status: canceled/refunded → Refunded, else → Paid
  const paymentStatus =
    o.status === "canceled" || o.status === "refunded" ? "Refunded" : "Paid";

  const address = [o.shippingName, o.shippingStreet, o.shippingCity]
    .filter(Boolean)
    .join(", ");

  const items = (o.items || []).map((item) => ({
    id: item.id,
    name: item.productName,
    qty: item.quantity,
    size: item.variantSize || "—",
    color: item.variantColor || "—",
    price: item.unitPrice, // piasters
    image: item.imageUrl || "",
  }));

  const trackStep = getTrackStep(o.status);
  const track = TRACK_STEPS.map((s) => s.label);

  return {
    id: o.id,
    orderNumber: o.orderNumber,
    date: new Date(o.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    status: statusLabel,
    rawStatus: o.status,
    total: o.total, // piasters
    paymentStatus,
    paymentMethod,
    address,
    items,
    track,
    trackStep,
  };
}

/* ─── Cancel Confirm Modal ─── */
function CancelModal({ order, onConfirm, onClose, loading, error }) {
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
            Are you sure you want to cancel{" "}
            <strong>{order.orderNumber || order.id}</strong>? This action cannot
            be undone.
          </p>
          {error && (
            <p style={{ color: "#dc2626", fontSize: 12, marginBottom: 12 }}>
              {error}
            </p>
          )}
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
              Keep Order
            </button>
            <button
              onClick={onConfirm}
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
                opacity: loading ? 0.7 : 1,
              }}
            >
              <XCircle size={14} style={{ marginRight: 4 }} />
              {loading ? "Cancelling…" : "Cancel Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Return Request Modal ─── */
function ReturnModal({ order, onSubmit, onClose, loading, error }) {
  // Store the full item object (not just name) so we have item.id for DTO
  const [selectedItem, setSelectedItem] = useState(order.items[0] || null);
  const [reason, setReason] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);

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
          <div className={t.formGroup}>
            <label className={t.label}>Order</label>
            <input
              className={t.input}
              value={order.orderNumber || order.id}
              disabled
              style={{ opacity: 0.7 }}
            />
          </div>
          <div className={t.formGroup}>
            <label className={t.label}>Item to Return *</label>
            <select
              className={t.select}
              value={selectedItem?.id || ""}
              onChange={(e) => {
                const found = order.items.find((i) => i.id === e.target.value);
                setSelectedItem(found || null);
              }}
            >
              {order.items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className={t.formGroup}>
            <label className={t.label}>Reason for Return *</label>
            <textarea
              className={t.textarea}
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe the reason for your return…"
              required
            />
          </div>
          <div className={t.formGroup}>
            <label className={t.label}>Additional Description</label>
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
              Proof Photo / File{" "}
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
                  {file ? file.name : "Click to upload image or file"}
                </p>
                <p className={t.attachSub}>
                  {file
                    ? `${(file.size / 1024).toFixed(1)} KB`
                    : "PNG, JPG, PDF — Max 10 MB"}
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
              accept="image/*,.pdf"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files[0] || null)}
            />
          </div>
          {error && (
            <p style={{ color: "#dc2626", fontSize: 12, marginTop: 8 }}>
              {error}
            </p>
          )}
        </div>
        <div className={t.modalFoot}>
          <button
            className={`${t.btn} ${t.btnOutline}`}
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={`${t.btn} ${t.btnPrimary}`}
            disabled={loading || !reason.trim() || !selectedItem}
            onClick={() =>
              onSubmit({
                orderItemId: selectedItem?.id,
                quantity: selectedItem?.qty || 1,
                reason,
                note: desc || undefined,
                file,
              })
            }
          >
            <Send size={14} />{" "}
            {loading ? "Submitting…" : "Submit Return Request"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Loading Spinner ─── */
function LoadingSpinner() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "80px 0",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          border: "3px solid var(--ivory-dark)",
          borderTop: "3px solid var(--burgundy)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ─── Main Page ─── */
export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [cancelModal, setCancelModal] = useState(null); // order id
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const [returnModal, setReturnModal] = useState(null); // order object
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnError, setReturnError] = useState(null);
  const [toasts, setToasts] = useState([]);

  /* ── Fetch orders on mount ── */
  useEffect(() => {
    let cancelled = false;
    async function fetchOrders() {
      setOrdersLoading(true);
      try {
        const res = await apiClient.get("/customers/orders", {
          params: { limit: 50, page: 1 },
        });
        if (!cancelled) {
          const raw = res.data?.data || res.data || [];
          setOrders(Array.isArray(raw) ? raw.map(mapOrder) : []);
        }
      } catch (err) {
        if (!cancelled) setOrders([]);
      } finally {
        if (!cancelled) setOrdersLoading(false);
      }
    }
    fetchOrders();
    return () => {
      cancelled = true;
    };
  }, []);

  const addToast = (text, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3500,
    );
  };

  /* ── Cancel order ── */
  const handleCancelConfirm = async () => {
    if (!cancelModal) return;
    setCancelLoading(true);
    setCancelError(null);
    try {
      await apiClient.patch(`/customers/orders/${cancelModal}/cancel`, {
        reason: "Cancelled by customer",
      });
      setOrders((prev) =>
        prev.map((o) =>
          o.id === cancelModal
            ? {
                ...o,
                status: "Canceled",
                paymentStatus: "Refunded",
                rawStatus: "canceled",
              }
            : o,
        ),
      );
      setCancelModal(null);
      addToast("Order has been cancelled.", "success");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Failed to cancel order. Please try again.";
      setCancelError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setCancelLoading(false);
    }
  };

  /* ── Submit return ── */
  const handleReturnSubmit = async (data) => {
    if (!returnModal) return;
    setReturnLoading(true);
    setReturnError(null);
    try {
      await apiClient.post(`/customers/orders/${returnModal.id}/return`, {
        orderItemId: data.orderItemId,
        quantity: data.quantity,
        reason: data.reason,
        ...(data.note ? { note: data.note } : {}),
      });
      setReturnModal(null);
      addToast("Return request submitted!", "success");
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Failed to submit return request.";
      setReturnError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setReturnLoading(false);
    }
  };

  // Status filter tabs use display labels
  const STATUS_FILTER_OPTIONS = [
    "All",
    "Confirmed",
    "Processing",
    "Shipped",
    "Delivered",
    "Canceled",
  ];

  const filtered =
    statusFilter === "All"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

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
              background: "#dcfce7",
              border: "1px solid #86efac",
              color: "#15803d",
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
            <CheckCircle2 size={15} /> {toast.text}
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
            <h1 className={styles.title}>
              <Package size={22} style={{ verticalAlign: "middle" }} /> My
              Orders
            </h1>
            <p className={styles.sub}>{orders.length} orders total</p>
          </div>
          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {STATUS_FILTER_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 99,
                  border: "1.5px solid",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  background: statusFilter === s ? "var(--burgundy)" : "white",
                  color: statusFilter === s ? "white" : "var(--charcoal-muted)",
                  borderColor:
                    statusFilter === s
                      ? "var(--burgundy)"
                      : "var(--ivory-dark)",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {ordersLoading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <Package size={64} strokeWidth={1} />
            <h2>No orders found</h2>
            <p>No orders match your current filter.</p>
            <Link to="/browse" className={styles.browseCta}>
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className={styles.list}>
            {filtered.map((order) => {
              const cfg = STATUS_CFG[order.status] || STATUS_CFG.Ordered;
              const payCfg = PAY_CFG[order.paymentStatus] || PAY_CFG.Pending;
              const Icon = cfg.icon;
              const isOpen = expanded === order.id;
              const canCancel =
                order.rawStatus === "confirmed" ||
                order.rawStatus === "processing" ||
                order.rawStatus === "pending_payment";
              const canReturn = order.rawStatus === "completed";

              return (
                <div key={order.id} className={styles.orderCard}>
                  {/* Order header */}
                  <button
                    className={styles.orderHead}
                    onClick={() => setExpanded(isOpen ? null : order.id)}
                  >
                    <div className={styles.orderMeta}>
                      <span className={styles.orderId}>
                        {order.orderNumber || order.id}
                      </span>
                      <span className={styles.orderDate}>{order.date}</span>
                    </div>
                    <div className={styles.orderMeta}>
                      <span
                        className={styles.orderBadge}
                        style={{ color: cfg.color, background: cfg.bg }}
                      >
                        <Icon size={12} /> {order.status}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 99,
                          background: payCfg.bg,
                          color: payCfg.color,
                        }}
                      >
                        {order.paymentStatus}
                      </span>
                      <span className={styles.orderTotal}>
                        {formatPrice(order.total)}
                      </span>
                    </div>
                    <div className={styles.orderMeta}>
                      <button
                        className={styles.trackBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/orders/${order.id}`);
                        }}
                      >
                        <Eye size={13} /> Track
                      </button>
                      {canCancel && (
                        <button
                          style={{
                            padding: "5px 12px",
                            borderRadius: 8,
                            border: "1.5px solid #fca5a5",
                            background: "#fee2e2",
                            color: "#dc2626",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCancelError(null);
                            setCancelModal(order.id);
                          }}
                        >
                          <XCircle
                            size={13}
                            style={{ verticalAlign: "middle" }}
                          />{" "}
                          Cancel
                        </button>
                      )}
                      {canReturn && (
                        <button
                          style={{
                            padding: "5px 12px",
                            borderRadius: 8,
                            border: "1.5px solid #bfdbfe",
                            background: "#eff6ff",
                            color: "#1d4ed8",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setReturnError(null);
                            setReturnModal(order);
                          }}
                        >
                          <RotateCcw
                            size={13}
                            style={{ verticalAlign: "middle" }}
                          />{" "}
                          Return
                        </button>
                      )}
                      <ChevronRight
                        size={16}
                        className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
                      />
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className={styles.orderBody}>
                      {/* Order info strip */}
                      <div
                        style={{
                          display: "flex",
                          gap: 16,
                          flexWrap: "wrap",
                          padding: "12px 0 16px",
                          borderBottom: "1px solid var(--ivory-dark)",
                          marginBottom: 16,
                          fontSize: 12.5,
                          color: "var(--charcoal-muted)",
                        }}
                      >
                        <span>📍 {order.address}</span>
                        <span>💳 {order.paymentMethod}</span>
                        <span>
                          {order.items.length} item
                          {order.items.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      {/* Tracker */}
                      <div className={styles.tracker}>
                        {order.track.map((step, i) => (
                          <div key={step} className={styles.trackStep}>
                            <div
                              className={`${styles.trackDot} ${i <= order.trackStep ? styles.trackDotActive : ""}`}
                            >
                              {i <= order.trackStep ? "✓" : i + 1}
                            </div>
                            <span
                              className={`${styles.trackLabel} ${i <= order.trackStep ? styles.trackLabelActive : ""}`}
                            >
                              {step}
                            </span>
                            {i < order.track.length - 1 && (
                              <div
                                className={`${styles.trackLine} ${i < order.trackStep ? styles.trackLineActive : ""}`}
                              />
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Items */}
                      <div className={styles.items}>
                        {order.items.map((item) => (
                          <div key={item.id} className={styles.item}>
                            <img
                              src={item.image}
                              alt={item.name}
                              className={styles.itemImg}
                            />
                            <div className={styles.itemInfo}>
                              <p className={styles.itemName}>{item.name}</p>
                              <p className={styles.itemMeta}>
                                Qty: {item.qty} · Size: {item.size} · Color:{" "}
                                {item.color}
                              </p>
                            </div>
                            <p className={styles.itemPrice}>
                              {formatPrice(item.price)}
                            </p>
                          </div>
                        ))}
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
          order={orders.find((o) => o.id === cancelModal)}
          onConfirm={handleCancelConfirm}
          onClose={() => {
            setCancelModal(null);
            setCancelError(null);
          }}
          loading={cancelLoading}
          error={cancelError}
        />
      )}
      {returnModal && (
        <ReturnModal
          order={returnModal}
          onSubmit={handleReturnSubmit}
          onClose={() => {
            setReturnModal(null);
            setReturnError(null);
          }}
          loading={returnLoading}
          error={returnError}
        />
      )}

      <Footer />
    </div>
  );
}
