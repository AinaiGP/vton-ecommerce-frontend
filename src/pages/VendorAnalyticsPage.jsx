import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend
} from "chart.js";
import { Eye, ShoppingCart, TrendingUp, Users, Zap, ArrowUpRight, ArrowDownRight } from "lucide-react";
import VendorLayout from "../components/vendor/VendorLayout";
import p from "../styles/VendorPage.module.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const VTON_PRODUCTS = [
  { name: "Silk Evening Gown", tryOns: 312, views: 1240, purchases: 89, rate: "28.5%", trend: "+12%" },
  { name: "Cashmere Wrap Dress", tryOns: 245, views: 980, purchases: 67, rate: "27.3%", trend: "+8%" },
  { name: "Velvet Abaya", tryOns: 176, views: 760, purchases: 42, rate: "23.9%", trend: "+3%" },
  { name: "Embroidered Kaftan", tryOns: 198, views: 870, purchases: 54, rate: "27.3%", trend: "-2%" },
  { name: "Linen Palazzo Set", tryOns: 134, views: 620, purchases: 38, rate: "28.4%", trend: "+15%" },
];

const METRICS = [
  { label: "Total Try-Ons", value: "1,205", change: "+18.4%", up: true, icon: Eye, color: "#7c3aed", bg: "#f5f3ff" },
  { label: "Led to Purchase", value: "226", change: "+22.1%", up: true, icon: ShoppingCart, color: "#16a34a", bg: "#dcfce7" },
  { label: "VTON Conversion", value: "18.7%", change: "+3.2%", up: true, icon: TrendingUp, color: "#0891b2", bg: "#ecfeff" },
  { label: "Unique Users", value: "892", change: "+9.6%", up: true, icon: Users, color: "#ca8a04", bg: "#fef9c3" },
];

const barData = {
  labels: VTON_PRODUCTS.map(p => p.name.split(" ").slice(0, 2).join(" ")),
  datasets: [
    {
      label: "Try-Ons",
      data: VTON_PRODUCTS.map(p => p.tryOns),
      backgroundColor: "rgba(139,72,82,0.8)", borderRadius: 6, borderSkipped: false,
    },
    {
      label: "Purchases",
      data: VTON_PRODUCTS.map(p => p.purchases),
      backgroundColor: "rgba(212,175,122,0.8)", borderRadius: 6, borderSkipped: false,
    },
  ],
};

const barOpts = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: "top", labels: { usePointStyle: true, font: { size: 12 }, padding: 16 } },
    tooltip: { mode: "index", intersect: false },
  },
  scales: {
    x: { grid: { display: false }, border: { display: false }, ticks: { color: "#9ca3af", font: { size: 11 } } },
    y: { grid: { color: "rgba(0,0,0,0.04)" }, border: { display: false }, ticks: { color: "#9ca3af", font: { size: 11 } } },
  },
};

export default function VendorAnalyticsPage() {
  return (
    <VendorLayout pageTitle="Try-On Analytics" pageSubtitle="Virtual Try-On performance and conversion insights." breadcrumb="Try-On Analytics">

      {/* Insight callout */}
      <div className={p.insightCallout}>
        <div className={p.insightCalloutIcon}><Zap size={20} /></div>
        <div>
          <p className={p.insightCalloutTitle}>⭐ Products with VTON perform 3.2× better</p>
          <p className={p.insightCalloutText}>Your VTON-enabled products have an average conversion rate of 18.7% — compared to just 5.8% for non-VTON products. Enable try-on on more products to boost revenue.</p>
        </div>
      </div>

      {/* Metric cards */}
      <div className={p.statsGrid}>
        {METRICS.map(m => {
          const Icon = m.icon;
          return (
            <div key={m.label} className={p.statCard} style={{ "--stat-color": m.color, "--stat-bg": m.bg }}>
              <div className={p.statTop}>
                <div>
                  <p className={p.statLabel}>{m.label}</p>
                  <p className={p.statValue}>{m.value}</p>
                </div>
                <div className={p.statIcon}><Icon size={20} /></div>
              </div>
              <div className={p.statFoot}>
                <span className={`${p.statChange} ${m.up ? p.up : p.down}`}>
                  {m.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{m.change}
                </span>
                <span className={p.statMeta}>vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bar chart */}
      <div className={p.chartCard}>
        <div className={p.chartHead}>
          <div>
            <h3 className={p.chartTitle}>Try-Ons vs Purchases by Product</h3>
            <p className={p.chartSub}>Last 30 days</p>
          </div>
        </div>
        <div className={p.chartBody} style={{ height: 260 }}>
          <Bar data={barData} options={barOpts} />
        </div>
      </div>

      {/* Per-product table */}
      <div className={p.tableCard}>
        <div className={p.chartHead} style={{ padding: "16px 20px" }}>
          <h3 className={p.chartTitle}>Product-Level VTON Metrics</h3>
          <span style={{ fontSize: 12, color: "var(--vdr-text-subtle)" }}>Sorted by try-ons</span>
        </div>
        <div className={p.tableWrap}>
          <table className={p.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Views</th>
                <th>Try-Ons</th>
                <th>Purchases</th>
                <th>Conversion</th>
                <th>Trend</th>
                <th>Insight</th>
              </tr>
            </thead>
            <tbody>
              {VTON_PRODUCTS.map((prod, i) => (
                <tr key={prod.name}>
                  <td style={{ fontWeight: 600 }}>{prod.name}</td>
                  <td style={{ color: "var(--vdr-text-muted)" }}>{prod.views.toLocaleString()}</td>
                  <td style={{ fontWeight: 700 }}>{prod.tryOns}</td>
                  <td style={{ fontWeight: 700, color: "#16a34a" }}>{prod.purchases}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: "var(--vdr-border)", borderRadius: 3, minWidth: 60 }}>
                        <div style={{ height: "100%", width: prod.rate, background: "linear-gradient(90deg, var(--vdr-accent), #a78bfa)", borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--vdr-accent)", flexShrink: 0 }}>{prod.rate}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 700, color: prod.trend.startsWith("+") ? "#16a34a" : "#dc2626" }}>
                      {prod.trend.startsWith("+") ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {prod.trend}
                    </span>
                  </td>
                  <td>
                    {i === 0 && <span className={`${p.badge} ${p.badgeShipped}`}>🏆 Top Performer</span>}
                    {prod.trend.startsWith("+") && parseFloat(prod.trend) >= 10 && i !== 0 && (
                      <span className={`${p.badge} ${p.badgeActive}`}>📈 Growing</span>
                    )}
                    {prod.trend.startsWith("-") && (
                      <span className={`${p.badge} ${p.badgePending}`}>⚠ Review</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </VendorLayout>
  );
}
