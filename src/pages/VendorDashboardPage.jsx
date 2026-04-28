import { useState, useEffect } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Tooltip, Legend, Filler
} from "chart.js";
import { Package, ShoppingCart, DollarSign, Clock, ArrowUpRight, ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import VendorLayout from "../components/vendor/VendorLayout";
import p from "../styles/VendorPage.module.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler);

const MONTHS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
const SALES = [4200, 5800, 7200, 6400, 8100, 9500, 11200];
const ORDERS_DATA = [18, 24, 31, 26, 39, 44, 52];

const STATS = [
  { label: "Total Revenue", value: "EGP 52,400", change: "+18.2%", up: true, icon: DollarSign, color: "#7c3aed", bg: "#f5f3ff" },
  { label: "Total Orders", value: "234", change: "+12.5%", up: true, icon: ShoppingCart, color: "#0891b2", bg: "#ecfeff" },
  { label: "Active Products", value: "48", change: "+3", up: true, icon: Package, color: "#16a34a", bg: "#dcfce7" },
  { label: "Pending Orders", value: "7", change: "+2", up: false, icon: Clock, color: "#dc2626", bg: "#fee2e2" },
];

const RECENT_ORDERS = [
  { id: "#ORD-2841", customer: "Sara Al-Rashid", product: "Silk Evening Gown", amount: "EGP 389", status: "Processing" },
  { id: "#ORD-2840", customer: "Layla Hassan", product: "Cashmere Wrap Dress", amount: "EGP 275", status: "Shipped" },
  { id: "#ORD-2839", customer: "Nour Khalil", product: "Embroidered Kaftan", amount: "EGP 450", status: "Delivered" },
  { id: "#ORD-2838", customer: "Amira Fayed", product: "Linen Palazzo Set", amount: "EGP 195", status: "Pending" },
  { id: "#ORD-2837", customer: "Dina Mansour", product: "Beaded Clutch Bag", amount: "EGP 120", status: "Delivered" },
];

const STATUS_BADGE = {
  Pending: p.badgePending, Processing: p.badgeProcessing,
  Shipped: p.badgeShipped, Delivered: p.badgeDelivered, Cancelled: p.badgeCancelled,
};

function getInitials(name) { return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2); }

const chartOpts = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { mode: "index", intersect: false } },
  scales: {
    x: { grid: { display: false }, border: { display: false }, ticks: { color: "#9ca3af", font: { size: 11 } } },
    y: { grid: { color: "rgba(0,0,0,0.04)" }, border: { display: false }, ticks: { color: "#9ca3af", font: { size: 11 } } },
  },
};

export default function VendorDashboardPage() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);

  const lineData = {
    labels: MONTHS,
    datasets: [{
      label: "Revenue", data: SALES,
      borderColor: "#8b4852", backgroundColor: "rgba(139,72,82,0.08)",
      borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: "#8b4852",
      fill: true, tension: 0.45,
    }],
  };

  const barData = {
    labels: MONTHS,
    datasets: [{
      label: "Orders", data: ORDERS_DATA,
      backgroundColor: "rgba(212,175,122,0.8)", borderRadius: 6, borderSkipped: false,
    }],
  };

  const addBtn = (
    <Link to="/vendor/products" className={`${p.btn} ${p.btnPrimary}`}>
      <Package size={15} /> Add Product
    </Link>
  );

  return (
    <VendorLayout pageTitle="Dashboard" pageSubtitle="Welcome back! Here's your store overview." headerAction={addBtn}>
      {/* KPI Cards */}
      {loading ? (
        <div className={p.statsGrid}>
          {[1,2,3,4].map(i => <span key={i} className={`${p.skeleton} ${p.skeletonStat}`} />)}
        </div>
      ) : (
        <div className={p.statsGrid}>
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={p.statCard} style={{ "--stat-color": s.color, "--stat-bg": s.bg }}>
                <div className={p.statTop}>
                  <div>
                    <p className={p.statLabel}>{s.label}</p>
                    <p className={p.statValue}>{s.value}</p>
                  </div>
                  <div className={p.statIcon}><Icon size={20} /></div>
                </div>
                <div className={p.statFoot}>
                  <span className={`${p.statChange} ${s.up ? p.up : p.down}`}>
                    <ArrowUpRight size={12} />{s.change}
                  </span>
                  <span className={p.statMeta}>vs last month</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Charts */}
      <div className={p.chartsGrid2}>
        <div className={p.chartCard}>
          <div className={p.chartHead}>
            <div>
              <h3 className={p.chartTitle}>Revenue Trend</h3>
              <p className={p.chartSub}>Last 7 months · EGP</p>
            </div>
          </div>
          <div className={p.chartBody} style={{ height: 220 }}>
            <Line data={lineData} options={chartOpts} />
          </div>
        </div>
        <div className={p.chartCard}>
          <div className={p.chartHead}>
            <h3 className={p.chartTitle}>Monthly Orders</h3>
          </div>
          <div className={p.chartBody} style={{ height: 220 }}>
            <Bar data={barData} options={chartOpts} />
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className={p.chartCard}>
        <div className={p.chartHead}>
          <h3 className={p.chartTitle}>Recent Orders</h3>
          <Link to="/vendor/orders" className={`${p.btn} ${p.btnOutline} ${p.btnSm}`}>
            View All <ArrowRight size={13} />
          </Link>
        </div>
        <div className={p.tableWrap}>
          <table className={p.table}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_ORDERS.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 700, color: "var(--vdr-accent)" }}>{o.id}</td>
                  <td>
                    <div className={p.productCell}>
                      <div className={p.avatar}>{getInitials(o.customer)}</div>
                      <span style={{ fontWeight: 500 }}>{o.customer}</span>
                    </div>
                  </td>
                  <td style={{ color: "var(--vdr-text-muted)" }}>{o.product}</td>
                  <td style={{ fontWeight: 700 }}>{o.amount}</td>
                  <td><span className={`${p.badge} ${STATUS_BADGE[o.status]}`}><span className={p.badgeDot} />{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VTON tip */}
      <div className={p.insightCallout}>
        <div className={p.insightCalloutIcon}><Zap size={20} /></div>
        <div>
          <p className={p.insightCalloutTitle}>💡 Boost Sales with Virtual Try-On</p>
          <p className={p.insightCalloutText}>Products with VTON enabled convert 3.2× more than standard listings. Enable try-on for your top products in the Products page.</p>
        </div>
      </div>
    </VendorLayout>
  );
}
