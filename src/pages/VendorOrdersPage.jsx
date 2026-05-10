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
                      <span className={`${p.badge} ${STATUS_BADGE[o.fulfillmentStatus] || p.badgePending}`}>
                        <span className={p.badgeDot} />
                        {o.fulfillmentStatus}
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
                <h2 className={p.modalTitle}>Order #{orderDetail?.orderNumber}</h2>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--vdr-text-muted)" }}>
                  {orderDetail && new Date(orderDetail.createdAt).toLocaleString()}
                </p>
              </div>
              <button className={p.modalClose} onClick={() => setViewOrderId(null)}><X size={17} /></button>
            </div>
            <div className={p.modalBody}>
              {!orderDetail ? (
                <div className={p.skeleton} style={{ height: 200 }}></div>
              ) : (
                <>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "16px", background: "var(--vdr-bg)", borderRadius: 12 }}>
                    <div className={p.avatar} style={{ width: 44, height: 44 }}>{orderDetail.shippingName?.[0]}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 700 }}>{orderDetail.shippingName}</p>
                      <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--vdr-text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                        <MapPin size={12} /> {orderDetail.shippingAddress}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: 0, fontSize: 12, color: "var(--vdr-text-muted)" }}>Vendor Subtotal</p>
                      <p style={{ margin: 0, fontWeight: 800, color: "var(--vdr-accent)", fontSize: 18 }}>{formatPrice(orderDetail.vendorSubtotal)}</p>
                    </div>
                  </div>

                  <div style={{ marginTop: 24 }}>
                    <h3 className={p.label} style={{ marginBottom: 12 }}>Items & Fulfillment</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {orderDetail.items.map((item) => {
                        const nextStatus = { pending: "processing", processing: "shipped", shipped: "delivered" }[item.fulfillmentStatus];
                        return (
                          <div key={item.id} style={{ padding: 16, border: "1px solid var(--vdr-border)", borderRadius: 12, background: "white" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <div style={{ display: "flex", gap: 12 }}>
                                <div className={p.productThumb} style={{ width: 50, height: 60 }}>
                                  {item.product?.images?.[0] ? <img src={item.product.images[0].url} alt="" /> : <Package size={20} />}
                                </div>
                                <div>
                                  <p style={{ margin: 0, fontWeight: 700 }}>{item.productName}</p>
                                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--vdr-text-muted)" }}>
                                    Variant: {item.variantLabel} | SKU: {item.sku}
                                  </p>
                                  <p style={{ margin: "4px 0 0", fontWeight: 600 }}>Qty: {item.quantity} × {formatPrice(item.unitPrice)}</p>
                                </div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <span className={`${p.badge} ${STATUS_BADGE[item.fulfillmentStatus] || p.badgePending}`} style={{ marginBottom: 8 }}>
                                  {item.fulfillmentStatus}
                                </span>
                                {item.trackingNumber && (
                                  <p style={{ margin: 0, fontSize: 11, color: "var(--vdr-accent)", fontWeight: 700 }}>
                                    <Truck size={10} /> {item.trackingNumber}
                                  </p>
                                )}
                              </div>
                            </div>

                            {nextStatus && (
                              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px dashed var(--vdr-border)", display: "flex", gap: 12, alignItems: "center" }}>
                                {nextStatus === "shipped" && (
                                  <input
                                    className={p.input}
                                    style={{ flex: 1, fontSize: 13, height: 36 }}
                                    placeholder="Enter Tracking Number..."
                                    value={tracking}
                                    onChange={(e) => setTracking(e.target.value)}
                                  />
                                )}
                                <button
                                  className={`${p.btn} ${p.btnPrimary}`}
                                  style={{ height: 36, padding: "0 16px", marginLeft: "auto" }}
                                  disabled={updating === item.id}
                                  onClick={() => updateFulfillment(item.id, item.fulfillmentStatus)}
                                >
                                  {updating === item.id ? "Updating..." : `Mark as ${nextStatus}`}
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
              <button className={`${p.btn} ${p.btnOutline}`} onClick={() => setViewOrderId(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </VendorLayout>
  );
}
