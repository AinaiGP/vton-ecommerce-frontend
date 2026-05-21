import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import {
  Eye,
  ShoppingCart,
  TrendingUp,
  Package,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
} from "lucide-react";
import VendorLayout from "../components/vendor/VendorLayout";
import p from "../styles/VendorPage.module.css";
import apiClient from "../utils/apiClient";
import { formatPrice } from "../utils/formatPrice";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const barOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: "top",
      labels: { usePointStyle: true, font: { size: 12 }, padding: 16 },
    },
    tooltip: { mode: "index", intersect: false },
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: { color: "#9ca3af", font: { size: 11 } },
    },
    y: {
      grid: { color: "rgba(0,0,0,0.04)" },
      border: { display: false },
      ticks: { color: "#9ca3af", font: { size: 11 } },
    },
  },
};

export default function VendorAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [statsRes, prodRes] = await Promise.all([
        apiClient.get("/vendors/orders/stats"),
        apiClient.get("/products/my/products", { params: { limit: 20 } })
      ]);
      setStats(statsRes.data);
      // Using popularityScore as real Views and totalSold as real Purchases
      setProducts((prodRes.data?.data || []).map(p => ({
        ...p,
        views: p.popularityScore || 0,
        purchases: p.totalSold || 0,
      })));
    } catch (err) {
      console.error("Failed to fetch analytics", err);
    } finally {
      setLoading(false);
    }
  };

  const barData = {
    labels: products.map(p => p.name.split(" ").slice(0, 2).join(" ")),
    datasets: [
      {
        label: "Views",
        data: products.map(p => p.views),
        backgroundColor: "rgba(139,72,82,0.8)",
        borderRadius: 6,
      },
      {
        label: "Purchases",
        data: products.map(p => p.purchases * 10), // Scaled for visibility
        backgroundColor: "rgba(212,175,122,0.8)",
        borderRadius: 6,
      },
    ],
  };

  const totalOrders =
    (stats?.pending || 0) +
    (stats?.processing || 0) +
    (stats?.shipped || 0) +
    (stats?.delivered || 0);

  const totalViews = products.reduce((s, pr) => s + pr.views, 0);
  const totalPurchases = products.reduce((s, pr) => s + pr.purchases, 0);
  const overallConversion =
    totalViews > 0 ? ((totalPurchases / totalViews) * 100).toFixed(1) + "%" : "—";

  const kpis = [
    { label: "Total Revenue", value: formatPrice(stats?.totalRevenue || 0), color: "#16a34a", bg: "#dcfce7", icon: DollarSign, change: "All time", up: true },
    { label: "Total Orders", value: totalOrders, color: "#8b4852", bg: "#f5e8e9", icon: ShoppingCart, change: "All statuses", up: true },
    { label: "Conversion Rate", value: overallConversion, color: "#d97706", bg: "#fef3c7", icon: Zap, change: "Views → Sales", up: true },
    { label: "Active Products", value: products.length, color: "#0891b2", bg: "#ecfeff", icon: Package, change: "Stable", up: true },
  ];

  return (
    <VendorLayout pageTitle="Sales Analytics" pageSubtitle="Monitor your store's performance and sales trends." breadcrumb="Analytics">
      <div className={p.statsGrid} style={{ marginBottom: 24 }}>
        {kpis.map((m) => (
          <div key={m.label} className={p.statCard} style={{ "--stat-color": m.color, "--stat-bg": m.bg }}>
            <div className={p.statTop}>
              <div><p className={p.statLabel}>{m.label}</p><p className={p.statValue}>{m.value}</p></div>
              <div className={p.statIcon}><m.icon size={20} /></div>
            </div>
            <div className={p.statFoot}>
              <span className={`${p.statChange} ${m.up ? p.up : p.down}`}>
                {m.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {m.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className={p.chartCard} style={{ marginBottom: 24 }}>
        <div className={p.chartHead}><div><h3 className={p.chartTitle}>Views vs Purchases by Product</h3><p className={p.chartSub}>Last 30 days (Purchases scaled x10)</p></div></div>
        <div className={p.chartBody} style={{ height: 260 }}>
          <Bar data={barData} options={barOpts} />
        </div>
      </div>

      <div className={p.tableCard}>
        <div className={p.chartHead} style={{ padding: "16px 20px" }}><h3 className={p.chartTitle}>Product-Level Sales Metrics</h3></div>
        <div className={p.tableWrap}>
          <table className={p.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Views</th>
                <th>Purchases</th>
                <th>Conversion</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className={p.skeleton} style={{ height: 100 }}></td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="6"><div className={p.emptyState}><TrendingUp size={22} /><h3 className={p.emptyTitle}>No data yet</h3></div></td></tr>
              ) : (
                products.map((prod) => {
                  const rateNum = prod.views > 0 ? (prod.purchases / prod.views) * 100 : 0;
                  const rateLabel = prod.views > 0 ? rateNum.toFixed(1) + "%" : "—";
                  const barWidth = Math.min(rateNum, 100).toFixed(1) + "%";
                  return (
                    <tr key={prod.id}>
                      <td style={{ fontWeight: 600 }}>{prod.name}</td>
                      <td>{prod.category?.name}</td>
                      <td style={{ color: "var(--vdr-text-muted)" }}>{prod.views}</td>
                      <td style={{ fontWeight: 700, color: "#16a34a" }}>{prod.purchases}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ flex: 1, height: 6, background: "var(--vdr-border)", borderRadius: 3, minWidth: 60 }}>
                            <div style={{ height: "100%", width: barWidth, background: "var(--vdr-accent)", borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--vdr-accent)" }}>{rateLabel}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`${p.badge} ${prod.status === "active" ? p.badgeActive : p.badgeCancelled}`}>
                          {prod.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </VendorLayout>
  );
}
