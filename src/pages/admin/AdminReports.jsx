import {
  Line, Bar
} from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Tooltip, Legend, Filler
} from "chart.js";
import { Download, FileText, FileSpreadsheet, TrendingUp, TrendingDown } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import t from "../../styles/AdminTable.module.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler);

const MONTHS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];

const revenueData = {
  labels: MONTHS,
  datasets: [
    {
      label: "Revenue (EGP)",
      data: [62000, 78000, 95000, 88000, 102000, 115000, 128500],
      borderColor: "#8b4852",
      backgroundColor: "rgba(139,72,82,0.08)",
      borderWidth: 2.5,
      pointRadius: 4,
      pointBackgroundColor: "#8b4852",
      fill: true,
      tension: 0.45,
    },
    {
      label: "Expenses (EGP)",
      data: [38000, 42000, 55000, 50000, 61000, 68000, 72000],
      borderColor: "#d4af7a",
      backgroundColor: "rgba(212,175,122,0.08)",
      borderWidth: 2,
      pointRadius: 3,
      pointBackgroundColor: "#d4af7a",
      fill: true,
      tension: 0.45,
    },
  ],
};

const ordersData = {
  labels: MONTHS,
  datasets: [
    {
      label: "Orders",
      data: [320, 410, 480, 390, 520, 580, 620],
      backgroundColor: (ctx) => {
        const canvas = ctx.chart.ctx;
        const gradient = canvas.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, "rgba(139,72,82,0.85)");
        gradient.addColorStop(1, "rgba(212,175,122,0.45)");
        return gradient;
      },
      borderRadius: 7,
      borderSkipped: false,
    },
  ],
};

const TOP_PRODUCTS = [
  { rank: 1, name: "Silk Evening Gown", vendor: "Silk & Satin", sales: 248, revenue: "EGP 19,840", growth: 12.4 },
  { rank: 2, name: "Urban Jogger Set", vendor: "Urban Threads", sales: 195, revenue: "EGP 11,700", growth: 8.2 },
  { rank: 3, name: "Desert Kaftan", vendor: "Desert Rose", sales: 172, revenue: "EGP 8,600", growth: -3.1 },
  { rank: 4, name: "Pearl Hijab Collection", vendor: "Noor Fashion", sales: 154, revenue: "EGP 6,160", growth: 22.7 },
  { rank: 5, name: "Business Abaya", vendor: "Noor Fashion", sales: 138, revenue: "EGP 16,554", growth: 5.9 },
];

const TOP_VENDORS = [
  { name: "Urban Threads", orders: 487, revenue: "EGP 68,200", rating: 4.8, growth: 18.2 },
  { name: "Noor Fashion", orders: 312, revenue: "EGP 44,680", rating: 4.7, growth: 11.5 },
  { name: "Silk & Satin", orders: 248, revenue: "EGP 22,320", rating: 4.6, growth: 6.3 },
  { name: "Desert Rose", orders: 184, revenue: "EGP 14,720", rating: 4.3, growth: -2.4 },
  { name: "Blossom & Bloom", orders: 127, revenue: "EGP 9,144", rating: 4.5, growth: 9.1 },
];

const chartOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: "top", labels: { usePointStyle: true, padding: 16, font: { size: 12 } } },
    tooltip: { mode: "index", intersect: false },
  },
  scales: {
    x: { grid: { display: false }, border: { display: false }, ticks: { color: "#94a3b8", font: { size: 12 } } },
    y: { grid: { color: "rgba(0,0,0,0.04)" }, border: { display: false }, ticks: { color: "#94a3b8", font: { size: 12 } } },
  },
};

const barOpts = { ...chartOpts, plugins: { ...chartOpts.plugins, legend: { display: false } } };

export default function AdminReports() {
  return (
    <AdminLayout pageTitle="Reports & Analytics" pageSubtitle="Platform-wide revenue, order trends, and performance insights." breadcrumb="Reports">

      {/* Summary KPIs */}
      <div className={t.statsGrid}>
        {[
          { label: "Total Revenue (Apr)", value: "EGP 128,500", change: "+15.2%", up: true, color: "#8b4852", bg: "#fdf5f6" },
          { label: "Total Orders (Apr)", value: "620", change: "+6.9%", up: true, color: "#d4af7a", bg: "#fdf8ed" },
          { label: "Avg. Order Value", value: "EGP 207.26", change: "+7.7%", up: true, color: "#6d3640", bg: "#f7eced" },
          { label: "Refund Rate", value: "2.4%", change: "-0.8%", up: false, color: "#dc2626", bg: "#fee2e2" },
        ].map((s) => (
          <div key={s.label} className={t.statCard} style={{ "--stat-accent": s.color, "--stat-accent-bg": s.bg }}>
            <div>
              <p className={t.statLabel}>{s.label}</p>
              <p className={t.statValue}>{s.value}</p>
            </div>
            <span className={`${t.statChange} ${s.up ? t.up : t.down}`}>
              {s.up ? <TrendingUp size={13} /> : <TrendingDown size={13} />} {s.change}
            </span>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className={t.chartCard}>
        <div className={t.chartHead}>
          <div>
            <h3 className={t.chartTitle}>Revenue vs. Expenses</h3>
            <p className={t.chartSubtitle}>Last 7 months · EGP</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className={`${t.btn} ${t.btnOutline} ${t.btnSm}`}><FileSpreadsheet size={14} /> CSV</button>
            <button className={`${t.btn} ${t.btnOutline} ${t.btnSm}`}><FileText size={14} /> PDF</button>
          </div>
        </div>
        <div className={t.chartBody} style={{ height: 280 }}>
          <Line data={revenueData} options={chartOpts} />
        </div>
      </div>

      {/* Orders bar chart */}
      <div className={t.chartCard}>
        <div className={t.chartHead}>
          <div>
            <h3 className={t.chartTitle}>Monthly Orders Volume</h3>
            <p className={t.chartSubtitle}>Last 7 months</p>
          </div>
          <button className={`${t.btn} ${t.btnOutline} ${t.btnSm}`}><Download size={14} /> Export</button>
        </div>
        <div className={t.chartBody} style={{ height: 220 }}>
          <Bar data={ordersData} options={barOpts} />
        </div>
      </div>

      {/* Two tables */}
      <div className={t.chartGrid2}>
        {/* Best-selling products */}
        <div className={t.chartCard}>
          <div className={t.chartHead}>
            <h3 className={t.chartTitle}>Best-Selling Products</h3>
            <button className={`${t.btn} ${t.btnOutline} ${t.btnSm}`}><Download size={13} /> Export</button>
          </div>
          <div className={t.tableWrap}>
            <table className={t.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Sales</th>
                  <th>Revenue</th>
                  <th>Growth</th>
                </tr>
              </thead>
              <tbody>
                {TOP_PRODUCTS.map((p) => (
                  <tr key={p.rank}>
                    <td style={{ fontWeight: 700, color: "var(--adm-accent)" }}>#{p.rank}</td>
                    <td>
                      <span style={{ fontWeight: 600, display: "block", fontSize: 13 }}>{p.name}</span>
                      <span style={{ fontSize: 11, color: "var(--adm-text-subtle)" }}>{p.vendor}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{p.sales}</td>
                    <td style={{ fontWeight: 700 }}>{p.revenue}</td>
                    <td>
                      <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 700, color: p.growth >= 0 ? "#16a34a" : "#dc2626" }}>
                        {p.growth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {Math.abs(p.growth)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top vendors */}
        <div className={t.chartCard}>
          <div className={t.chartHead}>
            <h3 className={t.chartTitle}>Top Vendors</h3>
            <button className={`${t.btn} ${t.btnOutline} ${t.btnSm}`}><Download size={13} /> Export</button>
          </div>
          <div className={t.tableWrap}>
            <table className={t.table}>
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Orders</th>
                  <th>Revenue</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {TOP_VENDORS.map((v, i) => (
                  <tr key={v.name}>
                    <td>
                      <div className={t.avatarCell}>
                        <div className={t.avatar} style={{ width: 28, height: 28, fontSize: 11, background: "#fdf5f6", color: "#8b4852" }}>
                          {v.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{v.name}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{v.orders}</td>
                    <td style={{ fontWeight: 700, color: "#16a34a" }}>{v.revenue}</td>
                    <td>
                      <span style={{ fontWeight: 700 }}>★ {v.rating}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
