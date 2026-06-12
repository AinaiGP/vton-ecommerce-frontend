import { useEffect, useState, useCallback } from "react";
import { Search, Eye, X, Ticket } from "lucide-react";
import SupportLayout from "../../components/support/SupportLayout";
import apiClient from "../../utils/apiClient";
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
  LOW: "Low", NORMAL: "Normal", HIGH: "High", URGENT: "Urgent",
};

const ROLE_DISPLAY = {
  customer:          "Customer",
  vendor:            "Vendor",
  technical_support: "Tech Support",
  admin:             "Admin",
};

const ROLE_BADGE = {
  customer: "rCustomer",
  vendor:   "rVendor",
};

export default function SupportUsers() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState(null);

  const fetchTickets = useCallback(() => {
    setLoading(true);
    apiClient
      .get("/tech-support/support/tickets", { params: { limit: 100 } })
      .then((r) => {
        const data = r.data.data || r.data || [];
        setTickets(data);
      })
      .catch(() => setError("Failed to load ticket data."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  // Derive unique users from ticket creators
  const userMap = {};
  tickets.forEach((tk) => {
    if (!userMap[tk.creatorId]) {
      userMap[tk.creatorId] = {
        id:     tk.creatorId,
        role:   tk.creatorRole?.toLowerCase() || "customer",
        tickets: [],
      };
    }
    userMap[tk.creatorId].tickets.push(tk);
  });
  const users = Object.values(userMap);

  const filtered = users.filter((u) => {
    const roleMatch = roleFilter === "All" || u.role === roleFilter.toLowerCase();
    const searchMatch = !search || u.id.toLowerCase().includes(search.toLowerCase());
    return roleMatch && searchMatch;
  });

  const detailUser = detail ? userMap[detail] : null;

  return (
    <SupportLayout
      pageTitle="Users"
      pageSubtitle="Users visible from your ticket queue."
      breadcrumb="Users"
    >
      {error && (
        <div style={{ marginBottom: 12, padding: "10px 16px", borderRadius: 8, background: "#fee2e2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
          {error}
          <button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626" }}><X size={14} /></button>
        </div>
      )}

      <div className={p.panel}>
        <div className={p.filterBar}>
          <div className={p.searchWrap}>
            <Search size={14} className={p.searchIcon} />
            <input
              className={p.searchInput}
              placeholder="Search by user ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className={p.filterSelect}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="All">All Roles</option>
            <option value="Customer">Customer</option>
            <option value="Vendor">Vendor</option>
          </select>
          <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--sup-text-muted)" }}>
            {filtered.length} user{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className={p.tableWrap}>
          <table className={p.table}>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Role</th>
                <th>Total Tickets</th>
                <th>Open</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j}><div className={p.skel} style={{ height: 14, borderRadius: 6 }} /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className={p.emptyState}>
                      <p className={p.emptyTitle}>No users found</p>
                      <p style={{ margin: 0, fontSize: 13, color: "var(--sup-text-muted)" }}>
                        Users appear here based on ticket creators in your queue.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((u) => {
                  const openCount = u.tickets.filter((tk) =>
                    ["PENDING", "OPEN", "IN_PROGRESS", "AWAITING_RESPONSE", "ESCALATED"].includes(tk.status),
                  ).length;
                  return (
                    <tr key={u.id} className={p.clickable} onClick={() => setDetail(u.id)}>
                      <td style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "var(--sup-accent)" }}>
                        {u.id.slice(0, 12)}…
                      </td>
                      <td>
                        <span className={`${p.badge} ${p[ROLE_BADGE[u.role]] || ""}`}>
                          {ROLE_DISPLAY[u.role] || u.role}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, textAlign: "center" }}>{u.tickets.length}</td>
                      <td style={{ textAlign: "center" }}>
                        {openCount > 0 ? (
                          <span className={`${p.badge} ${p.bOpen}`}>{openCount}</span>
                        ) : (
                          <span style={{ color: "var(--sup-text-subtle)", fontSize: 12 }}>—</span>
                        )}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button className={`${p.btn} ${p.btnGhost} ${p.btnXs}`} onClick={() => setDetail(u.id)}>
                          <Eye size={13} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User detail modal */}
      {detail && detailUser && (
        <div className={p.modalBackdrop} onClick={(e) => e.target === e.currentTarget && setDetail(null)}>
          <div className={p.modal} style={{ maxWidth: 600 }}>
            <div className={p.modalHead}>
              <div className={p.avatarCell}>
                <div className={p.avatar} style={{ width: 44, height: 44, fontSize: 14 }}>
                  {detailUser.role[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <h3 className={p.modalTitle} style={{ marginBottom: 4 }}>
                    {detailUser.id.slice(0, 16)}…
                  </h3>
                  <span className={`${p.badge} ${p[ROLE_BADGE[detailUser.role]] || ""}`}>
                    {ROLE_DISPLAY[detailUser.role] || detailUser.role}
                  </span>
                </div>
              </div>
              <button className={`${p.btn} ${p.btnGhost} ${p.btnIcon}`} onClick={() => setDetail(null)}>
                <X size={16} />
              </button>
            </div>

            <div className={p.modalBody}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                {[
                  ["Total Tickets", detailUser.tickets.length],
                  ["Open", detailUser.tickets.filter((tk) => ["PENDING", "OPEN", "IN_PROGRESS", "AWAITING_RESPONSE", "ESCALATED"].includes(tk.status)).length],
                  ["Resolved", detailUser.tickets.filter((tk) => tk.status === "RESOLVED").length],
                ].map(([l, v]) => (
                  <div key={l} style={{ background: "var(--sup-bg)", borderRadius: 10, padding: "12px 14px" }}>
                    <p style={{ margin: "0 0 4px", fontSize: 11, color: "var(--sup-text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</p>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: 18, color: "var(--sup-text)" }}>{v}</p>
                  </div>
                ))}
              </div>

              <h4 style={{ margin: "8px 0", fontSize: 13, fontWeight: 700, color: "var(--sup-text)" }}>
                <Ticket size={13} style={{ verticalAlign: "middle" }} /> Tickets
              </h4>
              <div className={p.tableWrap} style={{ borderRadius: 10, border: "1px solid var(--sup-border)", overflow: "hidden" }}>
                <table className={p.table} style={{ fontSize: 12 }}>
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailUser.tickets.slice(0, 10).map((tk) => (
                      <tr key={tk.id}>
                        <td style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>
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
                        <td style={{ color: "var(--sup-text-subtle)" }}>
                          {new Date(tk.updatedAt || tk.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </td>
                      </tr>
                    ))}
                    {detailUser.tickets.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ textAlign: "center", padding: 20, color: "var(--sup-text-muted)" }}>
                          No tickets found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={p.modalFoot}>
              <button className={`${p.btn} ${p.btnOutline}`} onClick={() => setDetail(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </SupportLayout>
  );
}
