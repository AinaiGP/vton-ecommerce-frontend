import { useEffect, useState } from "react";
import { Package, ArrowRight, ArrowUpRight, Zap, DollarSign, Clock, ShoppingBag, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import VendorLayout from "../components/vendor/VendorLayout";
import p from "../styles/VendorPage.module.css";
import apiClient from "../utils/apiClient";
import { formatPrice } from "../utils/formatPrice";

export default function VendorDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const profileRes = await apiClient.get("/vendors/profile");
        const threshold = profileRes.data?.lowStockThreshold || 10;

        const [statsRes, ordersRes, stockRes] = await Promise.all([
          apiClient.get("/vendors/orders/stats"),
          apiClient.get("/vendors/orders", { params: { page: 1, limit: 5 } }),
          apiClient.get("/inventory", { params: { isLowStock: true, limit: 3, threshold } }),
        ]);

        setStats(statsRes.data);
        setRecentOrders(ordersRes.data?.data || []);
        setLowStock(stockRes.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const kpis = [
    {
      label: "Total Revenue",
      value: formatPrice(stats?.totalRevenue || 0),
      icon: DollarSign,
      color: "#8b4852",
      bg: "rgba(139,72,82,0.1)",
    },
    {
      label: "Pending / Processing",
      value: (stats?.pending || 0) + (stats?.processing || 0),
      icon: Clock,
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
    },
    {
      label: "Shipped Items",
      value: stats?.shipped || 0,
      icon: ShoppingBag,
      color: "#8b5cf6",
      bg: "rgba(139,92,246,0.1)",
    },
    {
      label: "Completed",
      value: stats?.delivered || 0,
      icon: CheckCircle2,
      color: "#16a34a",
      bg: "rgba(22,163,74,0.1)",
    },
  ];

  const addBtn = (
    <Link to="/vendor/products" className={`${p.btn} ${p.btnPrimary}`}>
      <Package size={15} /> Add Product
    </Link>
  );

  return (
    <VendorLayout
      pageTitle="Dashboard"
      pageSubtitle="Welcome back! Here's your store overview."
      headerAction={addBtn}
    >
      {/* KPI Cards */}
      <div className={p.statsGrid}>
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <span key={i} className={`${p.skeleton} ${p.skeletonStat}`} />
          ))
        ) : (
          kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.label}
                className={p.statCard}
                style={{ "--stat-color": kpi.color, "--stat-bg": kpi.bg }}
              >
                <div className={p.statTop}>
                  <div>
                    <p className={p.statLabel}>{kpi.label}</p>
                    <p className={p.statValue}>{kpi.value}</p>
                  </div>
                  <div className={p.statIcon}>
                    <Icon size={20} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, marginTop: 24 }}>
        {/* Recent Orders */}
        <div className={p.tableCard} style={{ margin: 0 }}>
          <div className={p.chartHead} style={{ padding: "16px 20px" }}>
            <h3 className={p.chartTitle}>Recent Orders</h3>
            <Link
              to="/vendor/orders"
              className={`${p.btn} ${p.btnOutline} ${p.btnSm}`}
            >
              View All <ArrowRight size={13} />
            </Link>
          </div>
          <div className={p.tableWrap}>
            <table className={p.table}>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className={p.skeleton} style={{ height: 40 }}></td></tr>
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5">
                      <div className={p.emptyState} style={{ padding: 40 }}>
                        <p className={p.emptyText}>No orders yet.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((ord) => (
                    <tr key={ord.id}>
                      <td style={{ fontWeight: 700, color: "var(--vdr-accent)" }}>
                        #{ord.orderNumber}
                      </td>
                      <td>{ord.shippingName || "Guest"}</td>
                      <td>{ord.itemCount} items</td>
                      <td style={{ fontWeight: 600 }}>{formatPrice(ord.vendorSubtotal)}</td>
                      <td>
                        <span className={`${p.badge} ${p.badgeActive}`}>
                          {ord.displayFulfillmentStatus || ord.status || "pending"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts & Tips */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Low Stock Alerts */}
          <div className={p.chartCard} style={{ padding: 20, margin: 0 }}>
            <h3 className={p.chartTitle} style={{ marginBottom: 12, fontSize: 14 }}>
              Low Stock Alerts
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {loading ? (
                <div className={p.skeleton} style={{ height: 60 }}></div>
              ) : lowStock.length === 0 ? (
                <p style={{ fontSize: 12, color: "var(--vdr-text-muted)" }}>All stock levels healthy.</p>
              ) : (
                lowStock.map(item => (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, background: "#fffaf0", border: "1px solid #feebc8", borderRadius: 8 }}>
                    <div style={{ width: 32, height: 32, background: "#fbd38d", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "#975a16" }}>
                      <AlertCircle size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{item.product?.name}</p>
                      <p style={{ fontSize: 11, color: "#975a16", margin: 0 }}>Only {item.availableQuantity} left</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={p.insightCallout} style={{ margin: 0, padding: 24, background: "linear-gradient(135deg, var(--vdr-accent), #a78bfa)", color: "white" }}>
            <div className={p.insightCalloutIcon} style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>
              <Zap size={20} />
            </div>
            <div>
              <p className={p.insightCalloutTitle} style={{ color: "white" }}>
                Sales Tip
              </p>
              <p className={p.insightCalloutText} style={{ color: "white", opacity: 0.9 }}>
                Optimize your product titles with relevant keywords to increase search visibility by up to 40%.
              </p>
            </div>
          </div>
        </div>
      </div>
    </VendorLayout>
  );
}
