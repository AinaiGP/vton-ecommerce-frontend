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
  Truck,
} from "lucide-react";
import VendorLayout from "../components/vendor/VendorLayout";
import p from "../styles/VendorPage.module.css";
import apiClient from "../utils/apiClient";
import { formatPrice } from "../utils/formatPrice";

const TABS = [
  { label: "All", value: "All" },
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "canceled" },
];

const PAGE_SIZE = 10;

const STATUS_BADGE = {
  pending: p.badgePending,
  processing: p.badgeProcessing,
  shipped: p.badgeShipped,
  delivered: p.badgeDelivered,
  canceled: p.badgeCancelled,
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
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewOrderId, setViewOrderId] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [tracking, setTracking] = useState("");
  const [updating, setUpdating] = useState(null); // itemId

  useEffect(() => {
    fetchOrders();
  }, [tab, page, search]);

  useEffect(() => {
    if (viewOrderId) fetchOrderDetail(viewOrderId);
    else setOrderDetail(null);
  }, [viewOrderId]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: PAGE_SIZE,
        fulfillmentStatus: tab === "All" ? undefined : tab,
        search: search || undefined
      };
      const res = await apiClient.get("/vendors/orders", { params });
      setOrders(res.data?.data || []);
      setTotal(res.data?.total || 0);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetail = async (id) => {
    try {
      const res = await apiClient.get(`/vendors/orders/${id}`);
      setOrderDetail(res.data);
    } catch (err) {
      console.error("Failed to fetch order detail", err);
    }
  };

  const updateFulfillment = async (itemId, currentStatus) => {
    const nextMap = { pending: "processing", processing: "shipped", shipped: "delivered" };
    const nextStatus = nextMap[currentStatus];
    if (!nextStatus) return;

    if (nextStatus === "shipped" && !tracking) {
      alert("Tracking number is required for shipping.");
      return;
    }

    setUpdating(itemId);
    try {
      await apiClient.patch(`/vendors/orders/${orderDetail.id}/items/${itemId}/fulfillment`, {
        status: nextStatus,
        trackingNumber: nextStatus === "shipped" ? tracking : undefined,
        carrierName: nextStatus === "shipped" ? "Standard" : undefined
      });
      fetchOrderDetail(orderDetail.id);
      fetchOrders();
      setTracking("");
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <VendorLayout
      pageTitle="Orders"
      pageSubtitle={`${total} orders found`}
      breadcrumb="Orders"
    >
      <div className={p.filterTabs}>
        {TABS.map((t) => (
          <button
            key={t.value}
            className={`${p.filterTab} ${tab === t.value ? p.active : ""}`}
            onClick={() => {
              setTab(t.value);
              setPage(1);
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={p.toolbar}>
        <div className={p.toolbarLeft}>
          <div className={p.searchBox}>
            <Search size={14} className={p.searchIcon} />
            <input
              className={p.searchInput}
              placeholder="Order # or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={p.tableCard}>
        <div className={p.tableWrap}>
          <table className={p.table}>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ width: 60 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className={p.skeleton} style={{ height: 100 }}></td></tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className={p.emptyState}>
                      <ShoppingCart size={22} />
                      <h3 className={p.emptyTitle}>No orders found</h3>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 700, color: "var(--vdr-accent)" }}>#{o.orderNumber}</td>
                    <td>
                      <div>
                        <span style={{ fontWeight: 600, display: "block" }}>{o.shippingName || "Guest"}</span>
                        <span style={{ fontSize: 11, color: "var(--vdr-text-muted)" }}>{o.customerEmail}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{o.itemCount} items</td>
                    <td style={{ fontWeight: 700 }}>{formatPrice(o.vendorSubtotal)}</td>
                    <td>
                      <span className={`${p.badge} ${STATUS_BADGE[o.displayFulfillmentStatus] || p.badgePending}`}>
                        <span className={p.badgeDot} />
                        {o.displayFulfillmentStatus || o.status}
                      </span>
                    </td>
                    <td style={{ color: "var(--vdr-text-muted)", fontSize: 13 }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className={p.actionBtn} onClick={() => setViewOrderId(o.id)}>
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {total > PAGE_SIZE && (
          <div className={p.pagination}>
            <span className={p.pageInfo}>Page {page} of {Math.ceil(total / PAGE_SIZE)}</span>
            <div className={p.pageButtons}>
              <button className={p.pageBtn} onClick={() => setPage(v => v - 1)} disabled={page === 1}>←</button>
              <button className={p.pageBtn} onClick={() => setPage(v => v + 1)} disabled={page * PAGE_SIZE >= total}>→</button>
            </div>
          </div>
        )}
      </div>

      {viewOrderId && (
        <div className={p.modalBackdrop} onClick={() => setViewOrderId(null)}>
          <div className={`${p.modal} ${p.modalLg}`} onClick={(e) => e.stopPropagation()}>
            <div className={p.modalHead}>
              <div>
                <h2 className={p.modalTitle}>Order #{orderDetail?.orderNumber || "..."}</h2>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--vdr-text-muted)" }}>
                  {orderDetail && new Date(orderDetail.createdAt).toLocaleString()}
                </p>
              </div>
              <button className={p.modalClose} onClick={() => setViewOrderId(null)}><X size={17} /></button>
            </div>
            <div className={p.modalBody} style={{ padding: 24 }}>
              {!orderDetail ? (
                <div className={p.skeleton} style={{ height: 300 }}></div>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 24, marginBottom: 32 }}>
                    <div style={{ background: "var(--vdr-bg)", padding: 20, borderRadius: 16, border: "1px solid var(--vdr-border)" }}>
                      <h3 className={p.label} style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                        <MapPin size={14} /> Shipping Information
                      </h3>
                      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <div className={p.avatar} style={{ width: 44, height: 44, background: "var(--vdr-accent)", color: "white", fontWeight: 700 }}>
                          {getInitials(orderDetail.shippingAddress?.shippingName || orderDetail.shippingName || "Guest")}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{orderDetail.shippingAddress?.shippingName || orderDetail.shippingName}</p>
                          <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--vdr-text-muted)" }}>{orderDetail.customerEmail}</p>
                          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--vdr-text-muted)", lineHeight: 1.5 }}>
                            {orderDetail.shippingAddress?.shippingStreet}<br />
                            {orderDetail.shippingAddress?.shippingCity}
                            {orderDetail.shippingAddress?.shippingLabel ? ` · ${orderDetail.shippingAddress.shippingLabel}` : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div style={{ background: "var(--vdr-bg)", padding: 20, borderRadius: 16, border: "1px solid var(--vdr-border)", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <p style={{ margin: 0, fontSize: 12, color: "var(--vdr-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Revenue</p>
                      <p style={{ margin: "8px 0 0", fontWeight: 900, color: "var(--vdr-accent)", fontSize: 24 }}>{formatPrice(orderDetail.vendorSubtotal)}</p>
                      <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--vdr-text-muted)" }}>{orderDetail.items.length} items</p>
                    </div>
                  </div>

                  <div>
                    <h3 className={p.label} style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      <Package size={14} /> Line Items & Fulfillment
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {orderDetail.items.map((item) => {
                        const nextStatus = { pending: "processing", processing: "shipped", shipped: "delivered" }[item.fulfillmentStatus];
                        return (
                          <div key={item.id} style={{ padding: 20, border: "1px solid var(--vdr-border)", borderRadius: 16, background: "white", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}>
                              <div style={{ display: "flex", gap: 16, flex: 1 }}>
                                <div className={p.productThumb} style={{ width: 64, height: 80, borderRadius: 8, overflow: "hidden" }}>
                                  {item.imageUrl ? <img src={item.imageUrl} alt="" /> : <Package size={24} style={{ opacity: 0.3 }} />}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{item.productName}</p>
                                  <div style={{ display: "flex", gap: 12, marginTop: 4, flexWrap: "wrap" }}>
                                    {(item.variantColor || item.variantSize) && (
                                      <span style={{ fontSize: 12, color: "var(--vdr-text-muted)", background: "#f1f5f9", padding: "2px 8px", borderRadius: 4 }}>
                                        Variant: <strong>{[item.variantColor, item.variantSize].filter(Boolean).join(" / ")}</strong>
                                      </span>
                                    )}
                                    <span style={{ fontSize: 12, color: "var(--vdr-text-muted)", background: "#f1f5f9", padding: "2px 8px", borderRadius: 4 }}>
                                      SKU: <strong>{item.sku || "—"}</strong>
                                    </span>
                                  </div>
                                  <p style={{ margin: "12px 0 0", fontWeight: 700, fontSize: 14 }}>
                                    {item.quantity} × {formatPrice(item.unitPrice)} = <span style={{ color: "var(--vdr-accent)" }}>{formatPrice(item.unitPrice * item.quantity)}</span>
                                  </p>
                                </div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <span className={`${p.badge} ${STATUS_BADGE[item.fulfillmentStatus] || p.badgePending}`} style={{ marginBottom: 8, fontSize: 11, padding: "4px 10px" }}>
                                  <span className={p.badgeDot} />
                                  {item.fulfillmentStatus}
                                </span>
                                {item.trackingNumber && (
                                  <div style={{ marginTop: 8, padding: "8px 12px", background: "var(--vdr-accent-light)", borderRadius: 8, border: "1px solid #c4b5fd" }}>
                                    <p style={{ margin: 0, fontSize: 10, color: "var(--vdr-accent)", fontWeight: 700, textTransform: "uppercase" }}>Tracking</p>
                                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--vdr-accent)", fontWeight: 800 }}>{item.trackingNumber}</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {nextStatus && (
                              <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px dashed var(--vdr-border)", display: "flex", gap: 12, alignItems: "center" }}>
                                {nextStatus === "shipped" && (
                                  <div style={{ flex: 1, display: "flex", gap: 8 }}>
                                    <div className={p.searchBox} style={{ flex: 1, height: 40, border: "1.5px solid var(--vdr-border)" }}>
                                      <Truck size={14} className={p.searchIcon} />
                                      <input
                                        className={p.searchInput}
                                        style={{ fontSize: 13 }}
                                        placeholder="Tracking Number..."
                                        value={tracking}
                                        onChange={(e) => setTracking(e.target.value)}
                                      />
                                    </div>
                                  </div>
                                )}
                                <button
                                  className={`${p.btn} ${p.btnPrimary}`}
                                  style={{ height: 40, padding: "0 24px", marginLeft: "auto", fontWeight: 700, borderRadius: 10 }}
                                  disabled={updating === item.id}
                                  onClick={() => updateFulfillment(item.id, item.fulfillmentStatus)}
                                >
                                  {updating === item.id ? "Updating..." : `Mark as ${nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}`}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className={p.modalFoot}>
              <button className={`${p.btn} ${p.btnOutline}`} onClick={() => setViewOrderId(null)}>Close Order</button>
            </div>
          </div>
        </div>
      )}
    </VendorLayout>
  );
}
