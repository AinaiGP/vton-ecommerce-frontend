import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
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
} from "lucide-react";
import { useState, useEffect } from "react";
import VendorLayout from "../components/vendor/VendorLayout";
import p from "../styles/VendorPage.module.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
);

const MONTHS = [];
const EARNINGS = [];
const PAYMENTS = [];
const STATS = [];

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
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // TODO: wire vendor earnings and payments to real API
  }, []);

  const lineData = {
    labels: MONTHS,
    datasets: [
      {
        label: "Earnings (EGP)",
        data: EARNINGS,
        borderColor: "#8b4852",
        backgroundColor: "rgba(139,72,82,0.1)",
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: "#8b4852",
        fill: true,
        tension: 0.42,
      },
    ],
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

  return (
    <VendorLayout
      pageTitle="Earnings & Payments"
      pageSubtitle="Track your revenue and manage payouts."
      breadcrumb="Earnings"
    >
      {/* KPIs */}
      <div className={p.statsGrid}>
        {STATS.length === 0 ? (
          <div className={p.emptyState}>
            <div className={p.emptyIcon}>
              <DollarSign size={22} />
            </div>
            <h3 className={p.emptyTitle}>No data available.</h3>
            <p className={p.emptyText}>
              Earnings metrics will appear once the API is connected.
            </p>
          </div>
        ) : (
          STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className={p.statCard}
                style={{ "--stat-color": s.color, "--stat-bg": s.bg }}
              >
                <div className={p.statTop}>
                  <div>
                    <p className={p.statLabel}>{s.label}</p>
                    <p className={p.statValue}>{s.value}</p>
                  </div>
                  <div className={p.statIcon}>
                    <Icon size={20} />
                  </div>
                </div>
                <div className={p.statFoot}>
                  <span className={`${p.statChange} ${s.up ? p.up : p.down}`}>
                    {typeof s.change === "string" &&
                      s.change.startsWith("+") && <ArrowUpRight size={12} />}
                    {s.change}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Earnings chart */}
      <div className={p.chartCard}>
        <div className={p.chartHead}>
          <div>
            <h3 className={p.chartTitle}>Earnings Over Time</h3>
            <p className={p.chartSub}>Last 7 months · EGP</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className={`${p.btn} ${p.btnOutline} ${p.btnSm}`}>
              <Download size={13} /> Export CSV
            </button>
            <button
              className={`${p.btn} ${p.btnPrimary}`}
              onClick={() => setWithdrawOpen(true)}
            >
              <DollarSign size={15} /> Request Payout
            </button>
          </div>
        </div>
        <div className={p.chartBody} style={{ height: 260 }}>
          <Line data={lineData} options={lineOpts} />
        </div>
      </div>

      {/* Payment history */}
      <div className={p.tableCard}>
        <div className={p.chartHead} style={{ padding: "16px 20px" }}>
          <h3 className={p.chartTitle}>Payment History</h3>
        </div>
        <div className={p.tableWrap}>
          <table className={p.table}>
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {PAYMENTS.map((pay) => (
                <tr key={pay.id}>
                  <td style={{ fontWeight: 700, color: "var(--vdr-accent)" }}>
                    {pay.id}
                  </td>
                  <td style={{ color: "var(--vdr-text-muted)" }}>{pay.date}</td>
                  <td
                    style={{ fontWeight: 800, color: "#16a34a", fontSize: 15 }}
                  >
                    {pay.amount}
                  </td>
                  <td style={{ color: "var(--vdr-text-muted)" }}>
                    {pay.method}
                  </td>
                  <td>
                    <span className={`${p.badge} ${p.badgeDelivered}`}>
                      <span className={p.badgeDot} />
                      {pay.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdraw Modal */}
      {withdrawOpen && (
        <div className={p.modalBackdrop} onClick={() => setWithdrawOpen(false)}>
          <div
            className={`${p.modal} ${p.modalSm}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={p.modalHead}>
              <h2 className={p.modalTitle}>Request Payout</h2>
              <button
                className={p.modalClose}
                onClick={() => setWithdrawOpen(false)}
              >
                <X size={17} />
              </button>
            </div>
            {submitted ? (
              <div
                className={p.modalBody}
                style={{
                  alignItems: "center",
                  textAlign: "center",
                  padding: "32px 22px",
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "#dcfce7",
                    color: "#16a34a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <Check size={24} />
                </div>
                <h3 className={p.modalTitle} style={{ marginTop: 0 }}>
                  Request Submitted!
                </h3>
                <p className={p.confirmText}>
                  Your payout request of <strong>{amount}</strong> has been
                  submitted. Processing takes 2–5 business days.
                </p>
              </div>
            ) : (
              <form onSubmit={handleWithdraw}>
                <div className={p.modalBody}>
                  <div
                    style={{
                      padding: "14px 16px",
                      background: "var(--vdr-accent-light)",
                      border: "1px solid #c4b5fd",
                      borderRadius: 10,
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 4px",
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      Available Balance
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 800,
                        fontSize: 22,
                        color: "var(--vdr-accent)",
                      }}
                    >
                      EGP 3,200.00
                    </p>
                  </div>
                  <div className={p.formGroup}>
                    <label className={p.label}>Withdrawal Amount</label>
                    <input
                      className={p.input}
                      type="number"
                      min={50}
                      max={3200}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 1000"
                      required
                    />
                    <span
                      style={{ fontSize: 12, color: "var(--vdr-text-subtle)" }}
                    >
                      Minimum withdrawal: EGP 50
                    </span>
                  </div>
                  <div className={p.formGroup}>
                    <label className={p.label}>Payout Method</label>
                    <select className={p.select}>
                      <option>Bank Transfer (••• 4872)</option>
                      <option>PayPal</option>
                    </select>
                  </div>
                </div>
                <div className={p.modalFoot}>
                  <button
                    type="button"
                    className={`${p.btn} ${p.btnOutline}`}
                    onClick={() => setWithdrawOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={`${p.btn} ${p.btnPrimary}`}>
                    <DollarSign size={14} /> Confirm Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </VendorLayout>
  );
}
