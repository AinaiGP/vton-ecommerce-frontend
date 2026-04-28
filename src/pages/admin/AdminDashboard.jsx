import { useState, useEffect, useRef } from "react";
import {
  Line, Bar, Doughnut
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler
} from "chart.js";
import {
  Users, Store, ShoppingCart, DollarSign,
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle,
  UserPlus, Package, TrendingUp, Activity
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import t from "../../styles/AdminTable.module.css";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler
);

/* ── Mock data ── */
const STATS = [
  { label:"Total Users",    value:"12,840", change:"+22.5%", icon:Users,        up:true,  meta:"vs last month",   color:"#3a302b", bg:"#f7f3ed" },
  { label:"Customers",      value:"12,142", change:"+20.1%", icon:Users,        up:true,  meta:"vs last month",   color:"#6d28d9", bg:"#f5f3ff" },
  { label:"Active Vendors", value:"142",    change:"+4.1%",  icon:Store,        up:true,  meta:"vs last month",   color:"#d4af7a", bg:"#fcf8f2" },
  { label:"Total Orders",   value:"3,284",  change:"+18.7%", icon:ShoppingCart, up:true,  meta:"vs last month",   color:"#a8b5a0", bg:"#f4f6f2" },
  { label:"Total Revenue",  value:"EGP 428,500", change:"+15.2%", icon:DollarSign, up:true, meta:"vs last month",  color:"#8b4852", bg:"#fbf5f6" },
  { label:"Pending Applications", value:"7", change:"+2",   icon:Clock,        up:false, meta:"awaiting review", color:"#ca8a04", bg:"#fef9c3" },
  { label:"Open Tickets",   value:"23",     change:"-5",     icon:Activity,     up:true,  meta:"vs yesterday",    color:"#2563eb", bg:"#dbeafe" },
  { label:"Return Requests",value:"14",     change:"+3",     icon:Package,      up:false, meta:"this week",       color:"#dc2626", bg:"#fee2e2" },
  { label:"Staff Count",    value:"18",     change:"+1",     icon:UserPlus,     up:true,  meta:"vs last month",   color:"#0891b2", bg:"#ecfeff" },
];

const MONTHS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
const SALES_DATA = [62000, 78000, 95000, 88000, 102000, 115000, 128500];
const ORDERS_DATA = [320, 410, 480, 390, 520, 580, 620];

const ACTIVITY = [
  { icon: UserPlus, type: "success", text: "New vendor approved: Urban Threads", time: "2 hours ago" },
  { icon: Package, type: "info", text: "Order #1082 shipped to Sara Al-Rashid", time: "4 hours ago" },
  { icon: Users, type: "warning", text: "User Amira Fayed account was banned", time: "5 hours ago" },
  { icon: Store, type: "error", text: "Vendor Desert Rose flagged for review", time: "8 hours ago" },
  { icon: TrendingUp, type: "success", text: "Monthly revenue target reached: EGP 128,500", time: "1 day ago" },
  { icon: Activity, type: "info", text: "VTON Engine updated to v2.1", time: "2 days ago" },
];

const TOP_PRODUCTS = [
  { name: "Silk Evening Gown", vendor: "Silk & Satin", sales: 248, revenue: "EGP 19,840" },
  { name: "Urban Jogger Set", vendor: "Urban Threads", sales: 195, revenue: "EGP 11,700" },
  { name: "Desert Kaftan", vendor: "Desert Rose", sales: 172, revenue: "EGP 8,600" },
  { name: "Pearl Hijab Collection", vendor: "Noor Fashion", sales: 154, revenue: "EGP 6,160" },
];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  const lineData = {
    labels: MONTHS,
    datasets: [
      {
        label: "Revenue (EGP)",
        data: SALES_DATA,
        borderColor: "#8b4852",
        backgroundColor: "rgba(139,72,82,0.08)",
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: "#8b4852",
        fill: true,
        tension: 0.45,
      },
    ],
  };

  const barData = {
    labels: MONTHS,
    datasets: [
      {
        label: "Orders",
        data: ORDERS_DATA,
        backgroundColor: "rgba(212,175,122,0.8)",
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  // High-contrast, accessible palette — each hue is visually distinct
  const DONUT_COLORS = {
    Delivered:  { bg: "#8b4852", border: "#6d3640" },  // Burgundy
    Processing: { bg: "#d4af7a", border: "#b8925a" },  // Gold
    Pending:    { bg: "#a8b5a0", border: "#8a9c80" },  // Sage
    Cancelled:  { bg: "#3a302b", border: "#1a1a1a" },  // Charcoal
  };

  const doughnutData = {
    labels: ["Delivered", "Processing", "Pending", "Cancelled"],
    datasets: [
      {
        data: [52, 24, 16, 8],
        backgroundColor: Object.values(DONUT_COLORS).map(c => c.bg),
        borderColor:     Object.values(DONUT_COLORS).map(c => c.border),
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { mode: "index", intersect: false } },
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { color: "#94a3b8", font: { size: 12 } } },
      y: { grid: { color: "rgba(0,0,0,0.04)" }, border: { display: false }, ticks: { color: "#94a3b8", font: { size: 12 } } },
    },
  };

  const doughnutOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 18,
          font: { size: 12, weight: "600" },
          usePointStyle: true,
          pointStyleWidth: 10,
          color: "#3a302b",
        },
      },
      tooltip: {
        callbacks: {
          label: ctx => ` ${ctx.label}: ${ctx.parsed}%`,
        },
      },
    },
    cutout: "68%",
  };

  return (
    <AdminLayout
      pageTitle="Administrative Overview"
      pageSubtitle="Monitor global platform performance and recent system events."
      breadcrumb="Dashboard"
    >
      {/* KPI Cards */}
      {loading ? (
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
          {[1,2,3,4,5,6,7,8,9].map(i=>(
            <span key={i} className={`${t.skeleton} ${t.skeletonStat}`}/>
          ))}
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className={t.statCard}
                style={{ "--stat-accent": s.color, "--stat-accent-bg": s.bg }}
              >
                <div className={t.statTop}>
                  <div>
                    <p className={t.statLabel}>{s.label}</p>
                    <p className={t.statValue}>{s.value}</p>
                  </div>
                  <div className={t.statIcon}>
                    <Icon size={22} />
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className={`${t.statChange} ${s.up ? t.up : t.down}`}>
                    {s.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    {s.change}
                  </span>
                  <span className={t.statMeta}>{s.meta}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Charts row */}
      <div className={t.chartGrid2}>
        <div className={t.chartCard}>
          <div className={t.chartHead}>
            <div>
              <h3 className={t.chartTitle}>Revenue Over Time</h3>
              <p className={t.chartSubtitle}>Last 7 months · EGP</p>
            </div>
          </div>
          <div className={t.chartBody} style={{ height: 240 }}>
            <Line data={lineData} options={chartOpts} />
          </div>
        </div>

        <div className={t.chartCard}>
          <div className={t.chartHead}>
            <div>
              <h3 className={t.chartTitle}>Orders Distribution</h3>
              <p className={t.chartSubtitle}>By status · All time · 3,284 total</p>
            </div>
          </div>
          <div className={t.chartBody} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Donut - constrained height so legend fits */}
            <div style={{ height: 180, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Doughnut data={doughnutData} options={doughnutOpts} />
              {/* Centre label */}
              <div style={{ position: "absolute", textAlign: "center", pointerEvents: "none" }}>
                <p style={{ fontSize: 20, fontWeight: 800, color: "var(--adm-text)", margin: 0, lineHeight: 1 }}>3,284</p>
                <p style={{ fontSize: 10, fontWeight: 600, color: "var(--adm-text-muted)", margin: "3px 0 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Orders</p>
              </div>
            </div>
            {/* Legend table */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }}>
              {[
                { label: "Delivered",  pct: 52, count: 1708, color: "#8b4852" },
                { label: "Processing", pct: 24, count: 788,  color: "#d4af7a" },
                { label: "Pending",    pct: 16, count: 525,  color: "#a8b5a0" },
                { label: "Cancelled",  pct: 8,  count: 263,  color: "#3a302b" },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", background: "var(--adm-bg)", borderRadius: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: row.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 11.5, fontWeight: 600, color: "var(--adm-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.label}</p>
                    <p style={{ margin: 0, fontSize: 10.5, color: "var(--adm-text-muted)" }}>{row.count.toLocaleString()} orders</p>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: row.color, flexShrink: 0 }}>{row.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Orders Bar */}
      <div className={t.chartCard}>
        <div className={t.chartHead}>
          <div>
            <h3 className={t.chartTitle}>Monthly Orders Volume</h3>
            <p className={t.chartSubtitle}>Last 7 months</p>
          </div>
        </div>
        <div className={t.chartBody} style={{ height: 200 }}>
          <Bar data={barData} options={chartOpts} />
        </div>
      </div>

      {/* Bottom row: Activity + Top Products */}
      <div className={t.chartGrid2}>
        {/* Activity feed */}
        <div className={t.chartCard}>
          <div className={t.chartHead}>
            <h3 className={t.chartTitle}>Recent Activity</h3>
          </div>
          <ul className={t.activityList}>
            {ACTIVITY.map((a, i) => {
              const Icon = a.icon;
              return (
                <li key={i} className={t.activityItem}>
                  <div className={`${t.activityDot} ${t[a.type]}`}>
                    <Icon size={15} />
                  </div>
                  <div className={t.activityContent}>
                    <p className={t.activityText}>{a.text}</p>
                    <span className={t.activityTime}>
                      <Clock size={11} /> {a.time}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Top products */}
        <div className={t.chartCard}>
          <div className={t.chartHead}>
            <h3 className={t.chartTitle}>Top Products</h3>
          </div>
          <div className={t.tableWrap}>
            <table className={t.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Sales</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {TOP_PRODUCTS.map((p, i) => (
                  <tr key={i}>
                    <td>
                      <span style={{ fontWeight: 600, color: "var(--adm-text)", display: "block", fontSize: "13px" }}>
                        {p.name}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--adm-text-subtle)" }}>{p.vendor}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{p.sales}</td>
                    <td style={{ fontWeight: 700, color: "#16a34a" }}>{p.revenue}</td>
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
