import { useEffect, useRef, useState } from "react";
import {
  Search,
  Filter,
  Plus,
  X,
  ChevronUp,
  ChevronDown,
  Paperclip,
  Send,
  UserCheck,
  AlertCircle,
  ShieldAlert,
  CheckCircle,
} from "lucide-react";
import SupportLayout from "../../components/support/SupportLayout";
import p from "../../styles/SupportPage.module.css";

const STATUS_MAP = {
  Open: "bOpen",
  Progress: "bProgress",
  Resolved: "bResolved",
  Closed: "bClosed",
};
const PRIORITY_MAP = {
  Urgent: "pUrgent",
  High: "pHigh",
  Medium: "pMed",
  Low: "pLow",
};
const ROLE_MAP = { Customer: "rCustomer", Vendor: "rVendor" };
const SLA_LABEL = {
  slaOk: "On Track",
  slaWarn: "Warning",
  slaBreached: "Breached",
};

export default function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [messages, setMessages] = useState({});
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const [role, setRole] = useState("All");
  const [sort, setSort] = useState({ col: "updated", dir: "asc" });
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState("");
  const [page, setPage] = useState(1);
  const [newOpen, setNewOpen] = useState(false);
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const PER_PAGE = 6;

  useEffect(() => {
    // TODO: wire to real API endpoint — Phase X
    setTickets([]);
    setMessages({});
  }, []);

  const getMessages = (id) => messages[id] || [];

  const sendReply = () => {
    if (!reply.trim() && !file) return;
    const msg = {
      from: "agent",
      text: reply,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      ...(file ? { att: file.name } : {}),
    };
    setMessages((prev) => ({
      ...prev,
      [selected]: [...(prev[selected] || []), msg],
    }));
    setReply("");
    setFile(null);
  };

  const changeStatus = (id, newStatus) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)),
    );
  };

  const escalate = (id) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: "Escalated", priority: "Urgent" } : t,
      ),
    );
    const msg = {
      from: "agent",
      text: "This ticket has been escalated to Admin for further review.",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => ({ ...prev, [id]: [...(prev[id] || []), msg] }));
  };

  const filtered = tickets.filter(
    (t) =>
      (status === "All" || t.status === status) &&
      (priority === "All" || t.priority === priority) &&
      (role === "All" || t.role === role) &&
      (t.subject.toLowerCase().includes(search.toLowerCase()) ||
        t.user.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toLowerCase().includes(search.toLowerCase())),
  );

  const total = filtered.length;
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const pages = Math.ceil(total / PER_PAGE);

  const toggleSort = (col) =>
    setSort((s) => ({
      col,
      dir: s.col === col && s.dir === "asc" ? "desc" : "asc",
    }));
  const SortIcon = ({ col }) =>
    sort.col === col ? (
      sort.dir === "asc" ? (
        <ChevronUp size={12} />
      ) : (
        <ChevronDown size={12} />
      )
    ) : null;

  const ticket = tickets.find((t) => t.id === selected);

  return (
    <SupportLayout
      pageTitle="Tickets"
      pageSubtitle="Manage and resolve all customer and vendor tickets."
      breadcrumb="Tickets"
      headerAction={
        <button
          className={`${p.btn} ${p.btnPrimary}`}
          onClick={() => setNewOpen(true)}
        >
          <Plus size={14} /> New Ticket
        </button>
      }
    >
      {selected ? (
        /* ── Ticket Detail Split View ── */
        <div className={p.splitLayout}>
          {/* Left: conversation */}
          <div className={p.splitMain}>
            <div className={p.panelHead}>
              <div>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--sup-text-muted)",
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontWeight: 700, color: "var(--sup-accent)" }}>
                    {ticket.id}
                  </span>{" "}
                  · opened by {ticket.user}
                </p>
                <h2
                  style={{
                    font: "700 16px/1.3 Inter, sans-serif",
                    color: "var(--sup-text)",
                    margin: 0,
                  }}
                >
                  {ticket.subject}
                </h2>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <select
                  value={ticket.status}
                  onChange={(e) => changeStatus(ticket.id, e.target.value)}
                  style={{
                    padding: "5px 9px",
                    border: "1px solid var(--sup-border)",
                    borderRadius: 7,
                    fontSize: 12,
                    background: "var(--sup-surface)",
                    color: "var(--sup-text)",
                  }}
                >
                  {["Open", "Progress", "Resolved", "Closed"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <span className={`${p.badge} ${p[STATUS_MAP[ticket.status]]}`}>
                  {ticket.status}
                </span>
                <button
                  className={`${p.btn} ${p.btnGhost} ${p.btnSm}`}
                  onClick={() => setSelected(null)}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className={p.ticketConv}>
              {getMessages(selected).map((m, i) => (
                <div
                  key={i}
                  className={`${p.msgRow} ${m.from === "agent" ? p.mine : ""}`}
                >
                  <div className={p.msgAvat}>
                    {m.from === "agent"
                      ? "SP"
                      : ticket.user.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className={p.msgBubble}>
                      {m.text}
                      {m.att && (
                        <span
                          style={{
                            display: "block",
                            fontSize: 11,
                            opacity: 0.7,
                            marginTop: 4,
                          }}
                        >
                          📎 {m.att}
                        </span>
                      )}
                    </div>
                    <span className={p.msgTime}>{m.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply box */}
            <div className={p.ticketReply}>
              <textarea
                className={p.replyInput}
                placeholder="Type your reply..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendReply();
                  }
                }}
              />
              <div className={p.replyActions}>
                <button
                  className={`${p.btn} ${p.btnGhost} ${p.btnSm}`}
                  onClick={() => fileRef.current?.click()}
                >
                  <Paperclip size={14} />{" "}
                  {file ? file.name.slice(0, 12) + "…" : "Attach"}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  style={{ display: "none" }}
                  onChange={(e) => setFile(e.target.files[0] || null)}
                />
                <button
                  className={`${p.btn} ${p.btnOutline} ${p.btnSm}`}
                  style={{ color: "#dc2626", borderColor: "#fca5a5" }}
                  onClick={() => escalate(ticket.id)}
                >
                  <ShieldAlert size={14} /> Escalate to Admin
                </button>
                <button
                  className={`${p.btn} ${p.btnOutline} ${p.btnSm}`}
                  onClick={() => changeStatus(ticket.id, "Resolved")}
                >
                  <CheckCircle size={14} /> Resolve
                </button>
                <button
                  className={`${p.btn} ${p.btnOutline} ${p.btnSm}`}
                  onClick={() => changeStatus(ticket.id, "Closed")}
                >
                  <AlertCircle size={14} /> Close
                </button>
                <button
                  className={`${p.btn} ${p.btnPrimary}`}
                  disabled={!reply.trim() && !file}
                  onClick={sendReply}
                >
                  <Send size={14} /> Send Reply
                </button>
              </div>
            </div>
          </div>

          {/* Right: meta panels */}
          <div className={p.splitLeft}>
            <div className={p.metaCard}>
              <div className={p.metaHead}>Ticket Details</div>
              <div className={p.metaBody}>
                {[
                  [
                    "Status",
                    <span
                      className={`${p.badge} ${p[STATUS_MAP[ticket.status]]}`}
                    >
                      {ticket.status}
                    </span>,
                  ],
                  [
                    "Priority",
                    <span
                      className={`${p.badge} ${p[PRIORITY_MAP[ticket.priority]]}`}
                    >
                      {ticket.priority}
                    </span>,
                  ],
                  [
                    "SLA",
                    <span className={`${p.badge} ${p[ticket.sla]}`}>
                      {SLA_LABEL[ticket.sla]}
                    </span>,
                  ],
                  [
                    "Assigned",
                    <span style={{ fontWeight: 600 }}>{ticket.agent}</span>,
                  ],
                  [
                    "Updated",
                    <span style={{ color: "var(--sup-text-muted)" }}>
                      {ticket.updated}
                    </span>,
                  ],
                ].map(([l, v]) => (
                  <div key={l} className={p.metaRow}>
                    <span className={p.metaLabel}>{l}</span>
                    {v}
                  </div>
                ))}
              </div>
            </div>

            <div className={p.metaCard}>
              <div className={p.metaHead}>Requester</div>
              <div className={p.metaBody}>
                <div className={p.avatarCell}>
                  <div
                    className={p.avatar}
                    style={{ width: 40, height: 40, fontSize: 14 }}
                  >
                    {ticket.user.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>
                      {ticket.user}
                    </p>
                    <span
                      className={`${p.badge} ${p[ROLE_MAP[ticket.role]]}`}
                      style={{ marginTop: 4 }}
                    >
                      {ticket.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className={p.metaCard}>
              <div className={p.metaHead}>Quick Actions</div>
              <div className={p.metaBody}>
                <button
                  className={`${p.btn} ${p.btnPrimary}`}
                  style={{ width: "100%" }}
                >
                  Mark as Resolved
                </button>
                <button
                  className={`${p.btn} ${p.btnOutline}`}
                  style={{ width: "100%" }}
                >
                  Reassign Agent
                </button>
                <button
                  className={`${p.btn} ${p.btnDanger}`}
                  style={{ width: "100%" }}
                >
                  Close Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Tickets Table ── */
        <div className={p.panel}>
          {/* Filter bar */}
          <div className={p.filterBar}>
            <div className={p.searchWrap}>
              <Search size={14} className={p.searchIcon} />
              <input
                className={p.searchInput}
                placeholder="Search tickets, users..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <select
              className={p.filterSelect}
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="All">All Status</option>
              {["Open", "Progress", "Resolved", "Closed"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              className={p.filterSelect}
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setPage(1);
              }}
            >
              <option value="All">All Priority</option>
              {["Urgent", "High", "Medium", "Low"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              className={p.filterSelect}
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
            >
              <option value="All">All Users</option>
              <option>Customer</option>
              <option>Vendor</option>
            </select>
            <span
              style={{
                marginLeft: "auto",
                fontSize: 12,
                color: "var(--sup-text-muted)",
              }}
            >
              {total} ticket{total !== 1 ? "s" : ""}
            </span>
          </div>

          <div className={p.tableWrap}>
            <table className={p.table}>
              <thead>
                <tr>
                  <th
                    onClick={() => toggleSort("id")}
                    style={{ cursor: "pointer" }}
                  >
                    ID <SortIcon col="id" />
                  </th>
                  <th>User</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>SLA</th>
                  <th>Assigned</th>
                  <th
                    onClick={() => toggleSort("updated")}
                    style={{ cursor: "pointer" }}
                  >
                    Updated <SortIcon col="updated" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className={p.emptyState}>
                        <div className={p.emptyIcon}>
                          <Filter size={40} />
                        </div>
                        <p className={p.emptyTitle}>No tickets found</p>
                        <p style={{ margin: 0, fontSize: 13 }}>
                          Try adjusting your filters
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paged.map((t) => (
                    <tr
                      key={t.id}
                      className={p.clickable}
                      onClick={() => setSelected(t.id)}
                    >
                      <td
                        style={{ fontWeight: 700, color: "var(--sup-accent)" }}
                      >
                        {t.id}
                      </td>
                      <td>
                        <div className={p.avatarCell}>
                          <div className={p.avatar}>
                            {t.user.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span
                              style={{
                                fontWeight: 600,
                                fontSize: 13,
                                display: "block",
                              }}
                            >
                              {t.user}
                            </span>
                            <span
                              className={`${p.badge} ${p[ROLE_MAP[t.role]]}`}
                              style={{ fontSize: 10 }}
                            >
                              {t.role}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td
                        style={{
                          maxWidth: 220,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {t.subject}
                      </td>
                      <td>
                        <span
                          className={`${p.badge} ${p[STATUS_MAP[t.status]]}`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`${p.badge} ${p[PRIORITY_MAP[t.priority]]}`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`${p.badge} ${p[t.sla]}`}>
                          {SLA_LABEL[t.sla]}
                        </span>
                      </td>
                      <td
                        style={{ fontSize: 13, color: "var(--sup-text-muted)" }}
                      >
                        {t.agent}
                      </td>
                      <td
                        style={{
                          fontSize: 12,
                          color: "var(--sup-text-subtle)",
                        }}
                      >
                        {t.updated}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className={p.pagination}>
              <span className={p.pageInfo}>
                Showing {(page - 1) * PER_PAGE + 1}–
                {Math.min(page * PER_PAGE, total)} of {total}
              </span>
              <div className={p.pageButtons}>
                <button
                  className={p.pageBtn}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ‹
                </button>
                {Array.from({ length: pages }, (_, i) => (
                  <button
                    key={i + 1}
                    className={`${p.pageBtn} ${page === i + 1 ? p.active : ""}`}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className={p.pageBtn}
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page === pages}
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* New Ticket Modal */}
      {newOpen && (
        <div
          className={p.modalBackdrop}
          onClick={(e) => e.target === e.currentTarget && setNewOpen(false)}
        >
          <div className={p.modal}>
            <div className={p.modalHead}>
              <h3 className={p.modalTitle}>Create New Ticket</h3>
              <button
                className={`${p.btn} ${p.btnGhost} ${p.btnIcon}`}
                onClick={() => setNewOpen(false)}
              >
                <X size={16} />
              </button>
            </div>
            <div className={p.modalBody}>
              <div className={p.formGroup}>
                <label className={p.label}>Subject</label>
                <input
                  className={p.input}
                  placeholder="Brief description of the issue"
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div className={p.formGroup}>
                  <label className={p.label}>Priority</label>
                  <select className={p.select}>
                    <option>Low</option>
                    <option>Medium</option>
                    <option selected>High</option>
                    <option>Urgent</option>
                  </select>
                </div>
                <div className={p.formGroup}>
                  <label className={p.label}>User Type</label>
                  <select className={p.select}>
                    <option>Customer</option>
                    <option>Vendor</option>
                  </select>
                </div>
              </div>
              <div className={p.formGroup}>
                <label className={p.label}>User Name / ID</label>
                <input className={p.input} placeholder="Search user..." />
              </div>
              <div className={p.formGroup}>
                <label className={p.label}>Description</label>
                <textarea
                  className={p.textarea}
                  placeholder="Detailed description of the issue..."
                />
              </div>
              <div className={p.formGroup}>
                <label className={p.label}>Assign To</label>
                <select className={p.select}>
                  <option>Jamie Sullivan</option>
                  <option>Mike R.</option>
                  <option>Elena V.</option>
                  <option>David K.</option>
                </select>
              </div>
            </div>
            <div className={p.modalFoot}>
              <button
                className={`${p.btn} ${p.btnOutline}`}
                onClick={() => setNewOpen(false)}
              >
                Cancel
              </button>
              <button className={`${p.btn} ${p.btnPrimary}`}>
                Create Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </SupportLayout>
  );
}
