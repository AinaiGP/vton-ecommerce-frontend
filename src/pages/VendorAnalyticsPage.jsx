import { Bar } from "react-chartjs-2";
import { useEffect, useMemo, useState } from "react";
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
  Users,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import VendorLayout from "../components/vendor/VendorLayout";
import p from "../styles/VendorPage.module.css";

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
  const [vtonProducts, setVtonProducts] = useState([]);
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    // TODO: wire to real API endpoint — Phase X
    setVtonProducts([]);
    setMetrics([]);
  }, []);

  const barData = useMemo(
    () => ({
      labels: vtonProducts.map((p) => p.name.split(" ").slice(0, 2).join(" ")),
      datasets: [
        {
          label: "Views",
          data: vtonProducts.map((p) => p.tryOns),
          backgroundColor: "rgba(139,72,82,0.8)",
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: "Purchases",
          data: vtonProducts.map((p) => p.purchases),
          backgroundColor: "rgba(212,175,122,0.8)",
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    }),
    [vtonProducts],
  );

  return (
    <VendorLayout
      pageTitle="Sales Analytics"
      pageSubtitle="Monitor your store's performance and sales trends."
      breadcrumb="Analytics"
    >

      {/* Metric cards */}
      {metrics.length === 0 ? (
        <div className={p.emptyState}>
          <div className={p.emptyIcon}>
            <TrendingUp size={22} />
          </div>
          <h3 className={p.emptyTitle}>No data yet.</h3>
          <p className={p.emptyText}>
            Analytics will appear once sales data is available.
          </p>
        </div>
      ) : (
        <div className={p.statsGrid}>
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                className={p.statCard}
                style={{ "--stat-color": m.color, "--stat-bg": m.bg }}
              >
                <div className={p.statTop}>
                  <div>
                    <p className={p.statLabel}>{m.label}</p>
                    <p className={p.statValue}>{m.value}</p>
                  </div>
                  <div className={p.statIcon}>
                    <Icon size={20} />
                  </div>
                </div>
                <div className={p.statFoot}>
                  <span className={`${p.statChange} ${m.up ? p.up : p.down}`}>
                    {m.up ? (
                      <ArrowUpRight size={12} />
                    ) : (
                      <ArrowDownRight size={12} />
                    )}
                    {m.change}
                  </span>
                  <span className={p.statMeta}>vs last month</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bar chart */}
      <div className={p.chartCard}>
        <div className={p.chartHead}>
          <div>
            <h3 className={p.chartTitle}>Views vs Purchases by Product</h3>
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
          <h3 className={p.chartTitle}>Product-Level Sales Metrics</h3>
          <span style={{ fontSize: 12, color: "var(--vdr-text-subtle)" }}>
            Sorted by purchases
          </span>
        </div>
        <div className={p.tableWrap}>
          <table className={p.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Views</th>
                <th>Orders</th>
                <th>Purchases</th>
                <th>Conversion</th>
                <th>Trend</th>
                <th>Insight</th>
              </tr>
            </thead>
            <tbody>
              {vtonProducts.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className={p.emptyState}>
                      <div className={p.emptyIcon}>
                        <TrendingUp size={22} />
                      </div>
                      <h3 className={p.emptyTitle}>No data yet.</h3>
                      <p className={p.emptyText}>
                        Product-level metrics will appear once sales data is
                        available.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                vtonProducts.map((prod, i) => (
                  <tr key={prod.name}>
                    <td style={{ fontWeight: 600 }}>{prod.name}</td>
                    <td style={{ color: "var(--vdr-text-muted)" }}>
                      {prod.views.toLocaleString()}
                    </td>
                    <td style={{ fontWeight: 700 }}>{prod.tryOns}</td>
                    <td style={{ fontWeight: 700, color: "#16a34a" }}>
                      {prod.purchases}
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            height: 6,
                            background: "var(--vdr-border)",
                            borderRadius: 3,
                            minWidth: 60,
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: prod.rate,
                              background:
                                "linear-gradient(90deg, var(--vdr-accent), #a78bfa)",
                              borderRadius: 3,
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "var(--vdr-accent)",
                            flexShrink: 0,
                          }}
                        >
                          {prod.rate}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                          fontSize: 12,
                          fontWeight: 700,
                          color: prod.trend.startsWith("+")
                            ? "#16a34a"
                            : "#dc2626",
                        }}
                      >
                        {prod.trend.startsWith("+") ? (
                          <ArrowUpRight size={12} />
                        ) : (
                          <ArrowDownRight size={12} />
                        )}
                        {prod.trend}
                      </span>
                    </td>
                    <td>
                      {i === 0 && (
                        <span className={`${p.badge} ${p.badgeShipped}`}>
                          🏆 Top Performer
                        </span>
                      )}
                      {prod.trend.startsWith("+") &&
                        parseFloat(prod.trend) >= 10 &&
                        i !== 0 && (
                          <span className={`${p.badge} ${p.badgeActive}`}>
                            📈 Growing
                          </span>
                        )}
                      {prod.trend.startsWith("-") && (
                        <span className={`${p.badge} ${p.badgePending}`}>
                          ⚠ Review
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </VendorLayout>
  );
}
