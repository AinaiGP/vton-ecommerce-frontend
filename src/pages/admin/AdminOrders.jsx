import { useState, useRef, useEffect } from "react";
import {
  ShoppingCart,
  Search,
  Eye,
  X,
  MapPin,
  CreditCard,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  ArrowUpRight,
  ChevronDown,
  Download,
  Filter,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import t from "../../styles/AdminTable.module.css";

// TODO: wire to real API — Phase X
const ORDER_STATUSES = [
  "All",
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];
const PAY_STATUSES = ["All", "Pending", "Paid", "Refunded", "Failed"];
const VENDORS = [
  "All",
  "Silk & Satin",
  "Urban Threads",
  "Desert Rose",
  "Noor Fashion",
  "Blossom & Bloom",
];

const STATUS_CFG = {
  Delivered: { bg: "#dcfce7", color: "#16a34a" },
  Shipped: { bg: "#dbeafe", color: "#2563eb" },
  Processing: { bg: "#f3e8ff", color: "#7c3aed" },
  Pending: { bg: "#fef9c3", color: "#ca8a04" },
  Cancelled: { bg: "#fee2e2", color: "#dc2626" },
};
const PAY_CFG = {
  Paid: { bg: "#dcfce7", color: "#16a34a" },
  Refunded: { bg: "#dbeafe", color: "#2563eb" },
  Pending: { bg: "#fef9c3", color: "#ca8a04" },
  Failed: { bg: "#fee2e2", color: "#dc2626" },
};

function Pill({ label, cfg }) {
  const c = cfg[label] || { bg: "#f1f5f9", color: "#64748b" };
  return (
    <span
      style={{
        padding: "3px 10px",
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 700,
        background: c.bg,
        color: c.color,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: c.color,
          display: "inline-block",
        }}
      />
      {label}
    </span>
  );
}

/* ── Order Detail Modal ── */
function OrderModal({ order, onClose }) {
  return (
    <div className={t.modalBackdrop} onClick={onClose}>
      <div
        className={`${t.modal} ${t.modalLg}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={t.modalHead}>
          <div>
            <h2 className={t.modalTitle}>{order.id}</h2>
            <p
              style={{
                margin: "2px 0 0",
                fontSize: 12,
                color: "var(--adm-text-muted)",
              }}
            >
              Placed on {order.date}
            </p>
          </div>
          <button className={t.modalClose} onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className={t.modalBody}>
          {/* Status row */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Pill label={order.orderStatus} cfg={STATUS_CFG} />
            <Pill label={order.paymentStatus} cfg={PAY_CFG} />
            <span
              style={{
                padding: "3px 10px",
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 700,
                background: "#f1f5f9",
                color: "#64748b",
              }}
            >
              {order.fulfillment}
            </span>
            {order.returnStatus && (
              <span
                style={{
                  padding: "3px 10px",
                  borderRadius: 99,
                  fontSize: 11,
                  fontWeight: 700,
                  background: "#eff6ff",
                  color: "#2563eb",
                }}
              >
                Return: {order.returnStatus}
              </span>
            )}
          </div>
          {/* Info grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              background: "var(--adm-bg)",
              padding: 16,
              borderRadius: 12,
            }}
          >
            {[
              ["Customer", order.customer],
              ["Vendor", order.vendor],
              ["Payment Method", order.payMethod],
              ["Delivery Address", order.address],
            ].map(([l, v]) => (
              <div key={l}>
                <p
                  style={{
                    margin: "0 0 2px",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--adm-text-muted)",
                    textTransform: "uppercase",
                  }}
                >
                  {l}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13.5,
                    color: "var(--adm-text)",
                    fontWeight: 600,
                  }}
                >
                  {v}
                </p>
              </div>
            ))}
          </div>
          {/* Items */}
          <div>
            <p
              style={{
                margin: "0 0 10px",
                fontSize: 12,
                fontWeight: 700,
                color: "var(--adm-text-muted)",
                textTransform: "uppercase",
              }}
            >
              Items
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {order.items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    padding: 12,
                    background: "var(--adm-bg)",
                    borderRadius: 10,
                  }}
                >
                  <img
                    src={item.img}
                    alt={item.name}
                    style={{
                      width: 48,
                      height: 58,
                      borderRadius: 8,
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        margin: "0 0 2px",
                        fontWeight: 600,
                        fontSize: 13.5,
                        color: "var(--adm-text)",
                      }}
                    >
                      {item.name}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 12,
                        color: "var(--adm-text-muted)",
                      }}
                    >
                      Qty: {item.qty}
                    </p>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      color: "var(--adm-text)",
                    }}
                  >
                    EGP {(item.price * item.qty).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
          {/* Total */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              padding: "12px 0 0",
              borderTop: "1px solid var(--adm-border)",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 800,
                color: "var(--adm-text)",
              }}
            >
              Total: EGP {order.total.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE = 6;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [orderSt, setOrderSt] = useState("All");
  const [paySt, setPaySt] = useState("All");
  const [vendor, setVendor] = useState("All");
  const [page, setPage] = useState(1);
  const [active, setActive] = useState(null);

  useEffect(() => {
    // TODO: fetch orders from API — Phase X
  }, []);

  const filtered = orders.filter((o) => {
    const q =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.vendor.toLowerCase().includes(search.toLowerCase());
    return (
      q &&
      (orderSt === "All" || o.orderStatus === orderSt) &&
      (paySt === "All" || o.paymentStatus === paySt) &&
      (vendor === "All" || o.vendor === vendor)
    );
  });
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = {
    total: orders.length || 0,
    delivered: orders.filter((o) => o.orderStatus === "Delivered").length || 0,
    pending:
      orders.filter(
        (o) => o.orderStatus === "Pending" || o.orderStatus === "Processing",
      ).length || 0,
    returns: orders.filter((o) => o.returnStatus).length || 0,
    revenue: orders.reduce((s, o) => s + o.total, 0) || 0,
  };

  return (
    <AdminLayout
      pageTitle="Orders Management"
      pageSubtitle="View and manage all orders across the platform."
      breadcrumb="Orders"
    >
      {/* Stats strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5,1fr)",
          gap: 14,
          marginBottom: 20,
        }}
      >
        {[
          {
            label: "Total Orders",
            val: stats.total,
            color: "#3a302b",
            bg: "#f7f3ed",
          },
          {
            label: "Delivered",
            val: stats.delivered,
            color: "#16a34a",
            bg: "#dcfce7",
          },
          {
            label: "Processing / Pending",
            val: stats.pending,
            color: "#ca8a04",
            bg: "#fef9c3",
          },
          {
            label: "Return Requests",
            val: stats.returns,
            color: "#2563eb",
            bg: "#dbeafe",
          },
          {
            label: "Total Revenue",
            val: `EGP ${stats.revenue.toLocaleString()}`,
            color: "#8b4852",
            bg: "#fbf5f6",
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: s.bg,
              border: `1.5px solid ${s.color}22`,
              borderRadius: 12,
              padding: "14px 16px",
            }}
          >
            <p
              style={{
                margin: "0 0 4px",
                fontSize: 22,
                fontWeight: 800,
                color: s.color,
                lineHeight: 1,
              }}
            >
              {s.val}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 11.5,
                fontWeight: 600,
                color: s.color,
                opacity: 0.75,
              }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className={t.toolbar}>
        <div className={t.toolbarLeft}>
          <div className={t.searchBox}>
            <Search size={14} className={t.searchIcon} />
            <input
              className={t.searchInput}
              placeholder="Search by order ID, customer or vendor…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <select
            className={t.filterSelect}
            value={orderSt}
            onChange={(e) => {
              setOrderSt(e.target.value);
              setPage(1);
            }}
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            className={t.filterSelect}
            value={paySt}
            onChange={(e) => {
              setPaySt(e.target.value);
              setPage(1);
            }}
          >
            {PAY_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            className={t.filterSelect}
            value={vendor}
            onChange={(e) => {
              setVendor(e.target.value);
              setPage(1);
            }}
          >
            {VENDORS.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </div>
        <span className={t.pageInfo}>{filtered.length} orders</span>
      </div>

      {/* Table */}
      <div className={t.tableCard}>
        <div className={t.tableWrap}>
          <table className={t.table}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Vendor</th>
                <th>Items</th>
                <th>Total</th>
                <th>Order Status</th>
                <th>Payment</th>
                <th>Fulfillment</th>
                <th>Return</th>
                <th>Date</th>
                <th style={{ width: 60 }}>View</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={11}>
                    <div className={t.emptyState}>
                      <div className={t.emptyIcon}>
                        <ShoppingCart size={24} />
                      </div>
                      <h3 className={t.emptyTitle}>No orders found</h3>
                    </div>
                  </td>
                </tr>
              ) : (
                paged.map((o) => (
                  <tr key={o.id}>
                    <td
                      style={{
                        fontWeight: 700,
                        color: "var(--adm-accent)",
                        fontFamily: "monospace",
                        fontSize: 12,
                      }}
                    >
                      {o.id}
                    </td>
                    <td style={{ fontWeight: 600 }}>{o.customer}</td>
                    <td
                      style={{ fontSize: 12, color: "var(--adm-text-muted)" }}
                    >
                      {o.vendor}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        {o.items.slice(0, 2).map((item, i) => (
                          <img
                            key={i}
                            src={item.img}
                            alt={item.name}
                            title={item.name}
                            style={{
                              width: 32,
                              height: 38,
                              borderRadius: 6,
                              objectFit: "cover",
                              border: "1px solid var(--adm-border)",
                            }}
                          />
                        ))}
                        {o.items.length > 2 && (
                          <span
                            style={{
                              width: 32,
                              height: 38,
                              borderRadius: 6,
                              background: "var(--adm-bg)",
                              border: "1px solid var(--adm-border)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 10,
                              fontWeight: 700,
                              color: "var(--adm-text-muted)",
                            }}
                          >
                            +{o.items.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      EGP {o.total.toLocaleString()}
                    </td>
                    <td>
                      <Pill label={o.orderStatus} cfg={STATUS_CFG} />
                    </td>
                    <td>
                      <Pill label={o.paymentStatus} cfg={PAY_CFG} />
                    </td>
                    <td
                      style={{ fontSize: 12, color: "var(--adm-text-muted)" }}
                    >
                      {o.fulfillment}
                    </td>
                    <td>
                      {o.returnStatus ? (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#2563eb",
                          }}
                        >
                          {o.returnStatus}
                        </span>
                      ) : (
                        <span
                          style={{
                            color: "var(--adm-text-subtle)",
                            fontSize: 12,
                          }}
                        >
                          —
                        </span>
                      )}
                    </td>
                    <td
                      style={{ fontSize: 12, color: "var(--adm-text-muted)" }}
                    >
                      {o.date}
                    </td>
                    <td>
                      <button
                        className={`${t.actionBtn} ${t.approve}`}
                        title="View"
                        onClick={() => setActive(o)}
                      >
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
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
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

      {active && <OrderModal order={active} onClose={() => setActive(null)} />}
    </AdminLayout>
  );
}
