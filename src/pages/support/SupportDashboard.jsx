import { useEffect, useState } from "react";
import { Ticket, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import SupportLayout from "../../components/support/SupportLayout";
import apiClient from "../../utils/apiClient";
import { useAuth } from "../../context/AuthContext";
import p from "../../styles/SupportPage.module.css";

const STATUS_MAP = {
  PENDING:           "bOpen",
  OPEN:              "bOpen",
  IN_PROGRESS:       "bProgress",
  AWAITING_RESPONSE: "bProgress",
  ESCALATED:         "bProgress",
  RESOLVED:          "bResolved",
  CLOSED:            "bClosed",
  CANCELED:          "bClosed",
};

const STATUS_LABEL = {
  PENDING:           "Pending",
  OPEN:              "Open",
  IN_PROGRESS:       "In Progress",
  AWAITING_RESPONSE: "Awaiting Response",
  ESCALATED:         "Escalated",
  RESOLVED:          "Resolved",
  CLOSED:            "Closed",
  CANCELED:          "Canceled",
};

const PRIORITY_MAP = {
  LOW:    "pLow",
  NORMAL: "pMed",
  HIGH:   "pHigh",
  URGENT: "pUrgent",
};

const PRIORITY_LABEL = {
  LOW:    "Low",
  NORMAL: "Normal",
  HIGH:   "High",
  URGENT: "Urgent",
};

export default function SupportDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recentTickets, setRecentTickets] = useState([]);
  const [stats, setStats] = useState({ total: 0, mine: 0, pending: 0, inProgress: 0, escalated: 0, resolved: 0 });

  useEffect(() => {
    setLoading(true);
    apiClient
      .get("/tech-support/support/tickets", { params: { limit: 20, page: 1 } })
      .then((r) => {
        const data = r.data.data || r.data || [];
        const total = r.data.total ?? data.length;
        const mine = data.filter((tk) => tk.assigneeId === user?.sub).length;
        const pending = data.filter((tk) => tk.status === "PENDING").length;
        const inProgress = data.filter((tk) => tk.status === "IN_PROGRESS").length;
        const escalated = data.filter((tk) => tk.status === "ESCALATED").length;
        const resolved = data.filter((tk) => tk.status === "RESOLVED").length;
        setStats({ total, mine, pending, inProgress, escalated, resolved });
        setRecentTickets(data.slice(0, 10));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.sub]);

  const KPI_CARDS = [
    { label: "Total Visible", value: stats.total, color: "#8b4852", bg: "#fdf5f6" },
    { label: "Claimed by Me", value: stats.mine,  color: "#7c3aed", bg: "#f5f3ff" },
    { label: "Pending",       value: stats.pending, color: "#ef4444", bg: "#fee2e2" },
    { label: "In Progress",   value: stats.inProgress, color: "#f59e0b", bg: "#fef3c7" },
    { label: "Escalated",     value: stats.escalated, color: "#dc2626", bg: "#fff1f2" },
    { label: "Resolved",      value: stats.resolved, color: "#16a34a", bg: "#dcfce7" },
  ];

  return (
    <SupportLayout pageTitle="Dashboard" pageSubtitle="Your support queue at a glance." breadcrumb="Dashboard">
      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 24 }}>
        {KPI_CARDS.map((c) => (
          <div key={c.label} style={{ background: c.bg, border: `1.5px solid ${c.color}30`, borderRadius: 12, padding: "14px 18px" }}>
            {loading ? (
              <div className={p.skel} style={{ height: 28, width: "60%", borderRadius: 6, marginBottom: 6 }} />
            ) : (
              <p style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 800, color: c.color, lineHeight: 1 }}>{c.value}</p>
            )}
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: c.color, opacity: 0.75 }}>{c.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Tickets */}
      <div className={p.panel}>
        <div className={p.panelHead}>
          <div>
            <h3 className={p.panelTitle}>Recent Tickets</h3>
            <p className={p.panelSubtitle}>Latest support requests in your queue</p>
          </div>
          <Link to="/support/tickets" className={`${p.btn} ${p.btnOutline} ${p.btnSm}`} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            View All <ArrowRight size={13} />
          </Link>
        </div>
        <div className={p.tableWrap}>
          <table className={p.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assigned</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j}><div className={p.skel} style={{ height: 14, borderRadius: 6 }} /></td>
                    ))}
                  </tr>
                ))
              ) : recentTickets.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className={p.emptyState}>
                      <div className={p.emptyIcon}><Ticket size={22} /></div>
                      <h3 className={p.emptyTitle}>No tickets yet</h3>
                      <p className={p.emptyText}>Tickets will appear here once assigned.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                recentTickets.map((tk) => (
                  <tr key={tk.id}>
                    <td style={{ fontWeight: 700, color: "var(--sup-accent)", fontSize: 12, fontFamily: "monospace" }}>
                      {tk.id.slice(0, 8)}…
                    </td>
                    <td style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600, fontSize: 13 }}>
                      {tk.subject}
                    </td>
                    <td>
                      <span className={`${p.badge} ${p[STATUS_MAP[tk.status]] || p.bOpen}`}>
                        {STATUS_LABEL[tk.status] || tk.status}
                      </span>
                    </td>
                    <td>
                      <span className={`${p.badge} ${p[PRIORITY_MAP[tk.priority]] || p.pMed}`}>
                        {PRIORITY_LABEL[tk.priority] || tk.priority}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--sup-text-muted)" }}>
                      {tk.assigneeId ? "Assigned" : "Unassigned"}
                    </td>
                    <td style={{ fontSize: 12, color: "var(--sup-text-subtle)" }}>
                      {new Date(tk.updatedAt || tk.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SupportLayout>
  );
}
