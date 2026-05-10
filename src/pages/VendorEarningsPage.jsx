import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";
import {
  DollarSign,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Download,
  Check,
  X,
  Package,
} from "lucide-react";
import VendorLayout from "../components/vendor/VendorLayout";
import p from "../styles/VendorPage.module.css";
import apiClient from "../utils/apiClient";
import { formatPrice } from "../utils/formatPrice";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
);

const lineOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
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
      ticks: {
        color: "#9ca3af",
        font: { size: 11 },
        callback: (v) => `EGP ${(v / 1000).toFixed(0)}K`,
      },
    },
  },
};

export default function VendorEarningsPage() {
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        apiClient.get("/vendors/orders/stats"),
        apiClient.get("/vendors/orders", { params: { fulfillmentStatus: "delivered", limit: 100 } })
      ]);
      setStats(statsRes.data);
      setPayments(ordersRes.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch earnings data", err);
    } finally {
      setLoading(false);
    }
  };

  // Process chart data: Group delivered orders by month
  const monthlyData = payments.reduce((acc, p) => {
    const month = new Date(p.createdAt).toLocaleString('default', { month: 'short' });
    acc[month] = (acc[month] || 0) + (p.vendorSubtotal / 100);
    return acc;
  }, {});

  const labels = Object.keys(monthlyData).reverse();
  const dataPoints = Object.values(monthlyData).reverse();

  const lineData = {
    labels: labels.length ? labels : ["No Data"],
    datasets: [
      {
        label: "Earnings (EGP)",
        data: dataPoints.length ? dataPoints : [0],
        borderColor: "#8b4852",
        backgroundColor: "rgba(139,72,82,0.1)",
        borderWidth: 2.5,
        pointRadius: 4,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const lineOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#9ca3af", font: { size: 11 } } },
      y: { grid: { color: "rgba(0,0,0,0.04)" }, ticks: { color: "#9ca3af", font: { size: 11 } } },
    },
  };

  const handleWithdraw = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setWithdrawOpen(false);
      setSubmitted(false);
      setAmount("");
    }, 1500);
  };

  const kpis = [
    { label: "Total Revenue", value: formatPrice(stats?.totalRevenue || 0), color: "#16a34a", bg: "#dcfce7", icon: DollarSign, change: "+12.5%", up: true },
    { label: "Pending Payouts", value: formatPrice(stats?.pendingValue || 0), color: "#d97706", bg: "#fef3c7", icon: Clock, change: "Current", up: true },
    { label: "Total Orders", value: stats?.totalOrders || 0, color: "#8b4852", bg: "#f5e8e9", icon: Package, change: "+4.2%", up: true },
  ];

  return (
    <VendorLayout pageTitle="Earnings & Payments" pageSubtitle="Track your revenue and manage payouts." breadcrumb="Earnings">
      <div className={p.statsGrid} style={{ marginBottom: 24 }}>
        {kpis.map((s) => (
          <div key={s.label} className={p.statCard} style={{ "--stat-color": s.color, "--stat-bg": s.bg }}>
            <div className={p.statTop}>
              <div><p className={p.statLabel}>{s.label}</p><p className={p.statValue}>{s.value}</p></div>
              <div className={p.statIcon}><s.icon size={20} /></div>
            </div>
            <div className={p.statFoot}>
              <span className={`${p.statChange} ${s.up ? p.up : p.down}`}>
                {s.up && <ArrowUpRight size={12} />} {s.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className={p.chartCard} style={{ marginBottom: 24 }}>
        <div className={p.chartHead}>
          <div><h3 className={p.chartTitle}>Earnings Over Time</h3><p className={p.chartSub}>By Month · EGP</p></div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className={`${p.btn} ${p.btnPrimary}`} onClick={() => setWithdrawOpen(true)}>
              <DollarSign size={15} /> Request Payout
            </button>
          </div>
        </div>
        <div className={p.chartBody} style={{ height: 260 }}>
          <Line data={lineData} options={lineOpts} />
        </div>
      </div>

      <div className={p.tableCard}>
        <div className={p.chartHead} style={{ padding: "16px 20px" }}><h3 className={p.chartTitle}>Recent Delivered Orders</h3></div>
        <div className={p.tableWrap}>
          <table className={p.table}>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Items</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className={p.skeleton} style={{ height: 100 }}></td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: "center", padding: 32 }}>No delivered orders yet.</td></tr>
              ) : (
                payments.map((o) => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 700, color: "var(--vdr-accent)" }}>#{o.orderNumber}</td>
                    <td style={{ color: "var(--vdr-text-muted)" }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 800, color: "#16a34a", fontSize: 15 }}>{formatPrice(o.vendorSubtotal)}</td>
                    <td style={{ color: "var(--vdr-text-muted)" }}>{o.itemCount} items</td>
                    <td>
                      <span className={`${p.badge} ${p.badgeDelivered}`}>
                        <span className={p.badgeDot} /> Delivered
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {withdrawOpen && (
        <div className={p.modalBackdrop} onClick={() => setWithdrawOpen(false)}>
          <div className={`${p.modal} ${p.modalSm}`} onClick={(e) => e.stopPropagation()}>
            <div className={p.modalHead}><h2 className={p.modalTitle}>Request Payout</h2><button className={p.modalClose} onClick={() => setWithdrawOpen(false)}><X size={17} /></button></div>
            {submitted ? (
              <div className={p.modalBody} style={{ alignItems: "center", textAlign: "center", padding: "32px 22px" }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}><Check size={24} /></div>
                <h3 className={p.modalTitle} style={{ marginTop: 0 }}>Request Submitted!</h3>
                <p className={p.confirmText}>Your payout request has been submitted. Processing takes 2–5 business days.</p>
              </div>
            ) : (
              <form onSubmit={handleWithdraw}>
                <div className={p.modalBody}>
                  <div style={{ padding: "14px 16px", background: "var(--vdr-accent-light)", border: "1px solid #c4b5fd", borderRadius: 10 }}>
                    <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 13 }}>Available Balance</p>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: 22, color: "var(--vdr-accent)" }}>{formatPrice(stats?.totalRevenue || 0)}</p>
                  </div>
                  <div className={p.formGroup} style={{ marginTop: 16 }}>
                    <label className={p.label}>Withdrawal Amount</label>
                    <input className={p.input} type="number" min={50} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 1000" required />
                  </div>
                </div>
                <div className={p.modalFoot}>
                  <button type="button" className={`${p.btn} ${p.btnOutline}`} onClick={() => setWithdrawOpen(false)}>Cancel</button>
                  <button type="submit" className={`${p.btn} ${p.btnPrimary}`}><DollarSign size={14} /> Confirm Request</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </VendorLayout>
  );
}
