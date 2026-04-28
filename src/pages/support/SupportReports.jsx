import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler } from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { Download, TrendingUp, Clock, Star, CheckCircle2 } from "lucide-react";
import SupportLayout from "../../components/support/SupportLayout";
import p from "../../styles/SupportPage.module.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler);

const MONTHS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];

const volumeData = {
  labels: MONTHS,
  datasets: [
    {
      label: "Tickets Created",
      data: [280, 310, 265, 340, 295, 320, 313],
      borderColor: "#8b4852", backgroundColor: "rgba(139,72,82,0.08)",
      borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: "#8b4852",
      fill: true, tension: 0.4,
    },
    {
      label: "Tickets Resolved",
      data: [245, 280, 250, 310, 270, 295, 290],
      borderColor: "#d4af7a", backgroundColor: "rgba(212,175,122,0.06)",
      borderWidth: 2, pointRadius: 3, pointBackgroundColor: "#d4af7a",
      fill: true, tension: 0.4,
    },
  ],
};

const agentData = {
  labels: ["Sarah J.", "Mike R.", "David K.", "Elena V.", "Jamie S."],
  datasets: [{
    label: "Tickets Resolved",
    data: [145, 120, 98, 112, 42],
    backgroundColor: ["#6d3640", "#8b4852", "#b07080", "#d4af7a", "#c9a065"],
    borderRadius: 7, borderSkipped: false,
  }],
};

const chartOpts = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: "top", labels: { usePointStyle: true, padding: 16, font: { size: 12 } } },
    tooltip: { mode: "index", intersect: false },
  },
  scales: {
    x: { grid: { display: false }, border: { display: false }, ticks: { color: "#b5a89e", font: { size: 12 } } },
    y: { grid: { color: "rgba(0,0,0,0.04)" }, border: { display: false }, ticks: { color: "#b5a89e", font: { size: 12 } } },
  },
};

const barOpts = { ...chartOpts, plugins: { ...chartOpts.plugins, legend: { display: false } } };

const AGENTS = [
  { rank: 1, name: "Sarah Johnson", resolved: 145, csat: 98.2, frt: "8m",  handle: "1.2h" },
  { rank: 2, name: "Elena Vasquez", resolved: 112, csat: 96.5, frt: "12m", handle: "1.5h" },
  { rank: 3, name: "Mike Reynolds", resolved: 120, csat: 94.1, frt: "15m", handle: "1.8h" },
  { rank: 4, name: "David Kim",     resolved: 98,  csat: 91.8, frt: "18m", handle: "2.1h" },
  { rank: 5, name: "Jamie Sullivan",resolved: 42,  csat: 95.0, frt: "11m", handle: "1.4h" },
];

export default function SupportReports() {
  return (
    <SupportLayout
      pageTitle="Reports & Analytics"
      pageSubtitle="Team performance, ticket trends, and SLA tracking."
      breadcrumb="Reports"
      headerAction={<button className={`${p.btn} ${p.btnOutline} ${p.btnSm}`}><Download size={13} /> Export PDF</button>}
    >
      {/* KPIs */}
      <div className={p.statsGrid}>
        {[
          { label: "CSAT Score",        value: "94.2%", delta: "+1.8%", up: true,  icon: Star,          color: "#8b4852", bg: "#fdf5f6" },
          { label: "Avg First Reply",   value: "14m",   delta: "-3m",   up: true,  icon: Clock,         color: "#d4af7a", bg: "#fdf8ed" },
          { label: "Avg Resolution",    value: "2.4h",  delta: "-18%",  up: true,  icon: TrendingUp,    color: "#6d3640", bg: "#f7eced" },
          { label: "Resolution Rate",   value: "92.6%", delta: "+4.1%", up: true,  icon: CheckCircle2,  color: "#8b4852", bg: "#fdf5f6" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={p.statCard} style={{ "--stat-color": s.color, "--stat-bg": s.bg }}>
              <div className={p.statIcon}><Icon size={22} /></div>
              <div className={p.statInfo}>
                <span className={p.statLabel}>{s.label}</span>
                <span className={p.statValue}>{s.value}</span>
                <span className={`${p.statDelta} ${s.up ? p.up : p.down}`}>{s.delta} vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ticket volume chart */}
      <div className={p.panel}>
        <div className={p.panelHead}>
          <div>
            <h3 className={p.panelTitle}>Ticket Volume — Created vs Resolved</h3>
            <p className={p.panelSubtitle}>Last 7 months</p>
          </div>
          <button className={`${p.btn} ${p.btnOutline} ${p.btnSm}`}><Download size={13} /> CSV</button>
        </div>
        <div className={p.chartBody} style={{ height: 260, paddingTop: 16 }}>
          <Line data={volumeData} options={chartOpts} />
        </div>
      </div>

      {/* Agent perf chart + leaderboard */}
      <div className={p.chartGrid}>
        <div className={p.panel}>
          <div className={p.panelHead}>
            <div>
              <h3 className={p.panelTitle}>Agent Performance</h3>
              <p className={p.panelSubtitle}>Total resolved this month</p>
            </div>
          </div>
          <div className={p.chartBody} style={{ height: 240, paddingTop: 16 }}>
            <Bar data={agentData} options={barOpts} />
          </div>
        </div>

        <div className={p.panel}>
          <div className={p.panelHead}><h3 className={p.panelTitle}>Top Agents — Leaderboard</h3></div>
          <div className={p.tableWrap}>
            <table className={p.table}>
              <thead><tr><th>#</th><th>Agent</th><th>Resolved</th><th>CSAT</th><th>Avg FRT</th></tr></thead>
              <tbody>
                {AGENTS.map(a => (
                  <tr key={a.rank}>
                    <td style={{ fontWeight: 700, color: a.rank === 1 ? "#d4af7a" : "var(--sup-text-muted)" }}>
                      {a.rank === 1 ? "🥇" : a.rank === 2 ? "🥈" : a.rank === 3 ? "🥉" : `#${a.rank}`}
                    </td>
                    <td>
                      <div className={p.avatarCell}>
                        <div className={p.avatar}>{a.name.split(" ").map(w => w[0]).join("").slice(0, 2)}</div>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{a.name}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700 }}>{a.resolved}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: a.csat >= 95 ? "#16a34a" : "#d4af7a" }}>{a.csat}%</span>
                    </td>
                    <td style={{ color: "var(--sup-text-muted)" }}>{a.frt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SupportLayout>
  );
}
