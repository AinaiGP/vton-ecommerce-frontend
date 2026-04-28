import { useState, useEffect } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Filler } from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import {
  Inbox, AlertTriangle, CheckCircle2, ArrowRight, TrendingUp,
  Ticket, Zap, Store, ExternalLink, ArrowLeft, Star, Package, MapPin, Phone, Clock, X
} from "lucide-react";
import { Link } from "react-router-dom";
import SupportLayout from "../../components/support/SupportLayout";
import p from "../../styles/SupportPage.module.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Filler);

/* ── Chart data ─────────────────────────────── */
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const lineData = {
  labels: DAYS,
  datasets: [{
    label: "Tickets Created", data: [42, 56, 38, 71, 65, 23, 18],
    borderColor: "#8b4852", backgroundColor: "rgba(139, 72, 82, 0.08)",
    borderWidth: 2.5, tension: 0.4, fill: true,
    pointRadius: 4, pointBackgroundColor: "#8b4852",
  }]
};

const barData = {
  labels: ["< 1h", "1-4h", "4-12h", "12-24h", "> 24h"],
  datasets: [{
    label: "Tickets", data: [145, 89, 42, 18, 5],
    backgroundColor: ["#6d3640", "#8b4852", "#b07080", "#d4af7a", "#c9a065"],
    borderRadius: 6, borderSkipped: false,
  }]
};

const chartOpts = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { mode: "index", intersect: false } },
  scales: {
    y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.04)" }, border: { display: false }, ticks: { font: { size: 11 }, color: "#b5a89e" } },
    x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 11 }, color: "#b5a89e" } }
  }
};

/* ── Static data ────────────────────────────── */
const RECENT = [
  { id: "TKT-1089", user: "Sara Al-Rashid", role: "Customer", subject: "Payment failed during checkout", status: "Open",     priority: "High",   sla: "slaWarn",    wait: "12m" },
  { id: "TKT-1088", user: "Urban Threads",  role: "Vendor",   subject: "VTON quota exceeded",           status: "Progress", priority: "Medium", sla: "slaOk",      wait: "1h",  storeId: 2 },
  { id: "TKT-1087", user: "Omar Ali",       role: "Customer", subject: "Cannot reset password",          status: "Open",     priority: "Urgent", sla: "slaBreached",wait: "3h 10m" },
  { id: "TKT-1086", user: "Noor Fashion",   role: "Vendor",   subject: "Product images not uploading",  status: "Resolved", priority: "Low",    sla: "slaOk",      wait: "—",   storeId: 3 },
  { id: "TKT-1085", user: "Layla Hassan",   role: "Customer", subject: "Order not delivered",            status: "Progress", priority: "High",   sla: "slaWarn",    wait: "45m" },
];

const STATUS_MAP   = { Open: "bOpen", Progress: "bProgress", Resolved: "bResolved", Closed: "bClosed" };
const PRIORITY_MAP = { Urgent: "pUrgent", High: "pHigh", Medium: "pMed", Low: "pLow" };

const STORES = [
  { id: 1, name: "Silk & Satin",       owner: "Hana Mansour",   category: "Evening Wear",   products: 48, rating: 4.8, location: "Cairo, EG",    phone: "+20 1012 345 678", status: "Active",  joined: "Jan 2024", orders: 312, revenue: "EGP 24,960" },
  { id: 2, name: "Urban Threads",      owner: "Khalid Ramzi",   category: "Streetwear",     products: 32, rating: 4.5, location: "Alex, EG",     phone: "+20 1023 456 789", status: "Active",  joined: "Mar 2024", orders: 195, revenue: "EGP 11,700" },
  { id: 3, name: "Noor Fashion",       owner: "Nour El-Sherif", category: "Hijab & Modest", products: 61, rating: 4.9, location: "Giza, EG",     phone: "+20 1034 567 890", status: "Active",  joined: "Feb 2024", orders: 421, revenue: "EGP 16,840" },
  { id: 4, name: "Desert Rose",        owner: "Amira Fayed",    category: "Abayas",         products: 27, rating: 4.2, location: "Luxor, EG",    phone: "+20 1045 678 901", status: "Flagged", joined: "Apr 2024", orders: 88,  revenue: "EGP 4,400"  },
  { id: 5, name: "Pearl Collections", owner: "Mariam Youssef", category: "Accessories",    products: 85, rating: 4.7, location: "Hurghada, EG", phone: "+20 1056 789 012", status: "Active",  joined: "Dec 2023", orders: 560, revenue: "EGP 22,400" },
];

/* ══════════════════════════════════════════════════════════════════ */
export default function SupportDashboard() {
  const [loading, setLoading]       = useState(true);
  const [selectedStore, setSelectedStore] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <SupportLayout
      pageTitle="Dashboard"
      pageSubtitle="Real-time overview of all support activity."
      breadcrumb="Overview"
    >
      {/* ── KPIs ── */}
      <div className={p.statsGrid}>
        {[
          { label: "Total Tickets (7d)", value: "313", delta: "+12%", up: true,  icon: Ticket,        color: "#a85a66", bg: "rgba(168, 90, 102, 0.12)" },
          { label: "Open Tickets",       value: "47",  delta: "-5%",  up: true,  icon: Inbox,         color: "#d4af7a", bg: "rgba(212, 175, 122, 0.12)" },
          { label: "SLA Breaches",       value: "4",   delta: "+2",   up: false, icon: AlertTriangle, color: "#ef4444", bg: "rgba(239, 68, 68, 0.12)" },
          { label: "Avg Resolution",     value: "2.4h",delta: "-18%", up: true,  icon: CheckCircle2,  color: "#8b4852", bg: "rgba(139, 72, 82, 0.12)" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={p.statCard} style={{ "--stat-color": s.color, "--stat-bg": s.bg }}>
              {loading ? (
                <>
                  <div className={p.skel} style={{ width: 48, height: 48, borderRadius: 12 }} />
                  <div style={{ flex: 1 }}>
                    <div className={p.skel} style={{ height: 12, marginBottom: 8, width: "60%" }} />
                    <div className={p.skel} style={{ height: 26, width: "40%" }} />
                  </div>
                </>
              ) : (
                <>
                  <div className={p.statIcon}><Icon size={22} /></div>
                  <div className={p.statInfo}>
                    <span className={p.statLabel}>{s.label}</span>
                    <span className={p.statValue}>{s.value}</span>
                    <span className={`${p.statDelta} ${s.up ? p.up : p.down}`}>{s.delta} vs last week</span>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Charts ── */}
      <div className={p.chartGrid}>
        <div className={p.panel}>
          <div className={p.panelHead}>
            <div>
              <h3 className={p.panelTitle}>Ticket Volume</h3>
              <p className={p.panelSubtitle}>Last 7 days · all channels</p>
            </div>
            <TrendingUp size={16} style={{ color: "#8b4852" }} />
          </div>
          <div className={p.chartBody} style={{ height: 220, paddingTop: 16 }}>
            <Line data={lineData} options={chartOpts} />
          </div>
        </div>

        <div className={p.panel}>
          <div className={p.panelHead}>
            <div>
              <h3 className={p.panelTitle}>Resolution Speed</h3>
              <p className={p.panelSubtitle}>By time-to-close bracket</p>
            </div>
            <Zap size={16} style={{ color: "#d4af7a" }} />
          </div>
          <div className={p.chartBody} style={{ height: 220, paddingTop: 16 }}>
            <Bar data={barData} options={chartOpts} />
          </div>
        </div>
      </div>

      {/* ── Recent Tickets ── */}
      <div className={p.panel}>
        <div className={p.panelHead}>
          <div>
            <h3 className={p.panelTitle}>Needs Attention</h3>
            <p className={p.panelSubtitle}>High-priority and SLA-at-risk tickets</p>
          </div>
          <Link to="/support/tickets" className={`${p.btn} ${p.btnOutline} ${p.btnSm}`}>
            All Tickets <ArrowRight size={13} />
          </Link>
        </div>
        <div className={p.tableWrap}>
          <table className={p.table}>
            <thead>
              <tr>
                <th>Ticket</th>
                <th>User</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Priority</th>
                <th>SLA</th>
                <th>Waiting</th>
                <th>Store</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j}><div className={p.skel} style={{ height: 14, borderRadius: 6 }} /></td>
                    ))}
                  </tr>
                ))
                : RECENT.map(ticket => {
                  const linkedStore = ticket.storeId ? STORES.find(s => s.id === ticket.storeId) : null;
                  return (
                    <tr key={ticket.id} className={p.clickable}>
                      <td style={{ fontWeight: 700, color: "var(--sup-accent)" }}>{ticket.id}</td>
                      <td>
                        <div className={p.avatarCell}>
                          <div className={p.avatar}>{ticket.user.slice(0, 2).toUpperCase()}</div>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{ticket.user}</span>
                        </div>
                      </td>
                      <td style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {ticket.subject}
                      </td>
                      <td><span className={`${p.badge} ${p[STATUS_MAP[ticket.status]]}`}>{ticket.status}</span></td>
                      <td><span className={`${p.badge} ${p[PRIORITY_MAP[ticket.priority]]}`}>{ticket.priority}</span></td>
                      <td>
                        <span className={`${p.badge} ${p[ticket.sla]}`}>
                          {ticket.sla === "slaOk" ? "On Track" : ticket.sla === "slaWarn" ? "Warning" : "Breached"}
                        </span>
                      </td>
                      <td style={{ color: "var(--sup-text-muted)", fontSize: 12 }}>{ticket.wait}</td>
                      <td>
                        {linkedStore ? (
                          <button
                            onClick={() => setSelectedStore(linkedStore)}
                            className={`${p.badge} ${p.bProgress}`}
                            style={{
                              display: "inline-flex", alignItems: "center", gap: 4,
                              cursor: "pointer", border: "none",
                            }}
                          >
                            <Store size={11} /> View Store
                          </button>
                        ) : (
                          <span style={{ color: "var(--sup-text-muted)", fontSize: 12 }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Vendor Stores Section ── */}
      <div style={{ position: "relative" }}>
        {/* Store List */}
        <div className={p.panel}>
          <div className={p.panelHead}>
            <div>
              <h3 className={p.panelTitle}>Vendor Stores</h3>
              <p className={p.panelSubtitle}>Browse and inspect registered vendor stores</p>
            </div>
            <Store size={16} style={{ color: "#8b4852" }} />
          </div>
          <div className={p.tableWrap}>
            <table className={p.table}>
              <thead>
                <tr>
                  <th>Store</th>
                  <th>Category</th>
                  <th>Products</th>
                  <th>Orders</th>
                  <th>Rating</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {STORES.map(store => (
                  <tr
                    key={store.id}
                    className={p.clickable}
                    style={selectedStore?.id === store.id
                      ? { background: "rgba(139,72,82,0.06)", outline: "none" }
                      : {}}
                  >
                    <td>
                      <div className={p.avatarCell}>
                        <div
                          className={p.avatar}
                          style={{ background: "linear-gradient(135deg,#8b4852,#d4af7a)" }}
                        >
                          {store.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span style={{ fontWeight: 600, fontSize: 13, display: "block" }}>{store.name}</span>
                          <span style={{ fontSize: 11, color: "var(--sup-text-muted)" }}>{store.owner}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{store.category}</td>
                    <td>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
                        <Package size={12} style={{ color: "var(--sup-text-muted)" }} /> {store.products}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, fontSize: 13 }}>{store.orders}</td>
                    <td>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: "#b45309" }}>
                        <Star size={12} fill="#d4af7a" color="#d4af7a" /> {store.rating}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--sup-text-muted)" }}>
                        <MapPin size={11} /> {store.location}
                      </span>
                    </td>
                    <td>
                      <span className={`${p.badge} ${store.status === "Active" ? p.bResolved : p.pUrgent}`}>
                        {store.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedStore(store)}
                        className={`${p.btn} ${p.btnOutline} ${p.btnSm}`}
                        style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                      >
                        <ExternalLink size={12} /> View Store
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Store Detail Slide-in Panel ── */}
        {selectedStore && (
          <div className={p.storePanel}>
            {/* Panel header */}
            <div className={p.storePanelHead}>
              <button
                onClick={() => setSelectedStore(null)}
                className={`${p.btn} ${p.btnOutline} ${p.btnSm}`}
                style={{ gap: 6 }}
              >
                <ArrowLeft size={14} /> Back to Dashboard
              </button>
              <button
                onClick={() => setSelectedStore(null)}
                className={p.btnGhost}
                style={{ width: 32, height: 32, padding: 0, justifyContent: "center" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Store identity */}
            <div className={p.storePanelContent}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                <div style={{
                  width: 60, height: 60, borderRadius: 14,
                  background: "linear-gradient(135deg, var(--sup-accent), var(--sup-text-muted))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontSize: 20, fontWeight: 700, flexShrink: 0,
                }}>
                  {selectedStore.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--sup-text)" }}>
                    {selectedStore.name}
                  </h2>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--sup-text-muted)" }}>
                    {selectedStore.category} · Joined {selectedStore.joined}
                  </p>
                </div>
              </div>

              {/* Status badge */}
              <span
                className={`${p.badge} ${selectedStore.status === "Active" ? p.bResolved : p.pUrgent}`}
                style={{ marginBottom: 20, display: "inline-flex" }}
              >
                {selectedStore.status}
              </span>

              {/* KPI mini-cards */}
              <div className={p.storeKpiGrid}>
                {[
                  { label: "Products",  value: selectedStore.products, icon: Package,  color: "#a85a66" },
                  { label: "Orders",    value: selectedStore.orders,   icon: Store,    color: "#d4af7a" },
                  { label: "Rating",    value: `${selectedStore.rating}/5`, icon: Star, color: "#c9a065" },
                  { label: "Revenue",   value: selectedStore.revenue,  icon: ArrowRight, color: "#16a34a" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className={p.storeKpiCard}>
                    <p style={{ margin: 0, fontSize: 11, color: "var(--sup-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>{label}</p>
                    <p style={{ margin: "5px 0 0", fontSize: 15, fontWeight: 700, color: "var(--sup-text)", display: "flex", alignItems: "center", gap: 6 }}>
                      <Icon size={14} color={color} /> {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Contact info */}
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--sup-text-muted)", marginBottom: 10 }}>
                  Contact Info
                </p>
                {[
                  { icon: MapPin, text: selectedStore.location },
                  { icon: Phone,  text: selectedStore.phone },
                  { icon: Clock,  text: `Member since ${selectedStore.joined}` },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className={p.storeInfoRow}>
                    <Icon size={14} color="var(--sup-accent)" />
                    {text}
                  </div>
                ))}
              </div>

              {/* Owner */}
              <div style={{ marginBottom: 28 }}>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--sup-text-muted)", marginBottom: 10 }}>
                  Owner
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, background: "var(--sup-accent)",
                    color: "white", display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 14,
                  }}>
                    {selectedStore.owner.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: "var(--sup-text)" }}>{selectedStore.owner}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--sup-text-muted)" }}>Store Owner</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Link
                  to="/vendor"
                  className={`${p.btn} ${p.btnPrimary}`}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 0" }}
                >
                  <ExternalLink size={14} /> Open Vendor Portal
                </Link>
                <Link
                  to="/support/tickets"
                  className={`${p.btn} ${p.btnOutline}`}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 0" }}
                >
                  <Ticket size={14} /> View Related Tickets
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Slide-in animation */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
      `}</style>
    </SupportLayout>
  );
}
