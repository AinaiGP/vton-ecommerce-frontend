import { useEffect, useState } from "react";
import {
  Search,
  Eye,
  ChevronRight,
  X,
  ShoppingCart,
  Package,
  MapPin,
  Calendar,
} from "lucide-react";
import VendorLayout from "../components/vendor/VendorLayout";
import p from "../styles/VendorPage.module.css";

const TABS = [
  "All",
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];
const PAGE_SIZE = 5;
const STATUS_NEXT = {
  Pending: "Processing",
  Processing: "Shipped",
  Shipped: "Delivered",
};
const STATUS_BADGE = {
  Pending: p.badgePending,
  Processing: p.badgeProcessing,
  Shipped: p.badgeShipped,
  Delivered: p.badgeDelivered,
  Cancelled: p.badgeCancelled,
};

function getInitials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewOrder, setViewOrder] = useState(null);

  useEffect(() => {
    // TODO: wire to real API endpoint — Phase X
    setOrders([]);
  }, []);

  const filtered = orders.filter((o) => {
    const ms =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase());
    const mt = tab === "All" || o.status === tab;
    return ms && mt;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const advance = (id) => {
    setOrders(
      orders.map((o) => {
        if (o.id !== id || !STATUS_NEXT[o.status]) return o;
        return { ...o, status: STATUS_NEXT[o.status] };
      }),
    );
    setViewOrder((prev) =>
      prev?.id === id && STATUS_NEXT[prev.status]
        ? { ...prev, status: STATUS_NEXT[prev.status] }
        : prev,
    );
  };

  return (
    <VendorLayout
      pageTitle="Orders"
      pageSubtitle={`${orders.length} orders this month`}
      breadcrumb="Orders"
    >
      {/* Filter tabs */}
      <div className={p.filterTabs}>
        {TABS.map((t) => (
          <button
            key={t}
            className={`${p.filterTab} ${tab === t ? p.active : ""}`}
            onClick={() => {
              setTab(t);
              setPage(1);
            }}
          >
            {t}{" "}
            {t !== "All" && (
              <span style={{ opacity: 0.6 }}>
                ({orders.filter((o) => o.status === t).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className={p.toolbar}>
        <div className={p.toolbarLeft}>
          <div className={p.searchBox}>
            <Search size={14} className={p.searchIcon} />
            <input
              className={p.searchInput}
              placeholder="Search by order ID or customer..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
        <span className={p.pageInfo}>{filtered.length} orders</span>
      </div>

      {/* Table */}
      <div className={p.tableCard}>
        <div className={p.tableWrap}>
          <table className={p.table}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ width: 110 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className={p.emptyState}>
                      <div className={p.emptyIcon}>
                        <ShoppingCart size={22} />
                      </div>
                      <h3 className={p.emptyTitle}>No orders found</h3>
                      <p className={p.emptyText}>
                        No orders match your current filter.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paged.map((o) => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 700, color: "var(--vdr-accent)" }}>
                      {o.id}
                    </td>
                    <td>
                      <div className={p.productCell}>
                        <div className={p.avatar}>
                          {getInitials(o.customer)}
                        </div>
                        <div>
                          <span style={{ fontWeight: 600, display: "block" }}>
                            {o.customer}
                          </span>
                          <span
                            style={{
                              fontSize: 11.5,
                              color: "var(--vdr-text-subtle)",
                            }}
                          >
                            {o.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{o.items}</td>
                    <td style={{ fontWeight: 700 }}>{o.total}</td>
                    <td>
                      <span className={`${p.badge} ${STATUS_BADGE[o.status]}`}>
                        <span className={p.badgeDot} />
                        {o.status}
                      </span>
                    </td>
                    <td style={{ color: "var(--vdr-text-muted)" }}>{o.date}</td>
                    <td>
                      <div className={p.actions}>
                        <button
                          className={p.actionBtn}
                          title="View Details"
                          onClick={() => setViewOrder(o)}
                        >
                          <Eye size={14} />
                        </button>
                        {STATUS_NEXT[o.status] && (
                          <button
                            className={`${p.actionBtn} ${p.edit}`}
                            title={`Mark as ${STATUS_NEXT[o.status]}`}
                            onClick={() => advance(o.id)}
                          >
                            <ChevronRight size={14} />
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
          <div className={p.pagination}>
            <span className={p.pageInfo}>
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className={p.pageButtons}>
              <button
                className={p.pageBtn}
                onClick={() => setPage((v) => v - 1)}
                disabled={page === 1}
              >
                ←
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`${p.pageBtn} ${page === i + 1 ? p.pageBtnActive : ""}`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className={p.pageBtn}
                onClick={() => setPage((v) => v + 1)}
                disabled={page === totalPages}
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {viewOrder && (
        <div className={p.modalBackdrop} onClick={() => setViewOrder(null)}>
          <div
            className={`${p.modal} ${p.modalLg}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={p.modalHead}>
              <div>
                <h2 className={p.modalTitle}>Order {viewOrder.id}</h2>
                <p
                  style={{
                    margin: "3px 0 0",
                    fontSize: 12,
                    color: "var(--vdr-text-muted)",
                  }}
                >
                  {viewOrder.date}
                </p>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span
                  className={`${p.badge} ${STATUS_BADGE[viewOrder.status]}`}
                >
                  <span className={p.badgeDot} />
                  {viewOrder.status}
                </span>
                <button
                  className={p.modalClose}
                  onClick={() => setViewOrder(null)}
                >
                  <X size={17} />
                </button>
              </div>
            </div>
            <div className={p.modalBody}>
              {/* Customer */}
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  padding: "12px 16px",
                  background: "var(--vdr-bg)",
                  borderRadius: 10,
                }}
              >
                <div
                  className={p.avatar}
                  style={{ width: 40, height: 40, fontSize: 14 }}
                >
                  {getInitials(viewOrder.customer)}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>
                    {viewOrder.customer}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: 14,
                      flexWrap: "wrap",
                      marginTop: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--vdr-text-muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <MapPin size={12} />
                      {viewOrder.address}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--vdr-text-muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Calendar size={12} />
                      {viewOrder.date}
                    </span>
                  </div>
                </div>
                <span
                  style={{
                    marginLeft: "auto",
                    fontWeight: 800,
                    fontSize: 20,
                    color: "var(--vdr-accent)",
                  }}
                >
                  {viewOrder.total}
                </span>
              </div>

              {/* Products */}
              <div>
                <p className={p.label} style={{ marginBottom: 10 }}>
                  Ordered Products
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {viewOrder.products.map((prod, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        padding: "10px 14px",
                        border: "1px solid var(--vdr-border)",
                        borderRadius: 8,
                      }}
                    >
                      <div className={p.productThumb}>
                        <Package size={14} />
                      </div>
                      <span style={{ fontWeight: 500, fontSize: 14 }}>
                        {prod}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Update status */}
              {STATUS_NEXT[viewOrder.status] && (
                <div
                  style={{
                    padding: "14px 16px",
                    background: "var(--vdr-accent-light)",
                    border: "1px solid #c4b5fd",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <p style={{ margin: 0, fontSize: 13.5, fontWeight: 500 }}>
                    Ready to advance this order?
                  </p>
                  <button
                    className={`${p.btn} ${p.btnPrimary}`}
                    onClick={() => advance(viewOrder.id)}
                  >
                    <ChevronRight size={14} /> Mark as{" "}
                    {STATUS_NEXT[viewOrder.status]}
                  </button>
                </div>
              )}
            </div>
            <div className={p.modalFoot}>
              <button
                className={`${p.btn} ${p.btnOutline}`}
                onClick={() => setViewOrder(null)}
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
