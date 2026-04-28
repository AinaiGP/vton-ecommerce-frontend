import { useState, useRef } from "react";
import {
  X, MessageSquare, CheckCircle, Search, AlertTriangle,
  Paperclip, Send, ImageIcon, FileText, Filter,
  ArrowUpRight, UserCheck, ShieldAlert, Tag, Clock
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import t from "../../styles/AdminTable.module.css";

/* ─── Seed ─── */
const SEED = [
  {
    id: "TKT-6001", subject: "Order #ORD-2841 never arrived", user: "Sara Al-Rashid", email: "sara@example.com",
    userType: "Customer", category: "Order Issue", priority: "High", status: "Open",
    date: "Apr 20, 2026", assignedTo: null,
    messages: [
      { from: "user", name: "Sara Al-Rashid", text: "My order was placed on April 12 and tracking hasn't updated in 8 days.", time: "Apr 20, 09:30 AM", attachment: null },
    ],
  },
  {
    id: "TKT-6002", subject: "VTON model not loading on Safari", user: "Urban Threads", email: "hello@urbanthreads.dev",
    userType: "Vendor", category: "Technical Issue", priority: "High", status: "Escalated to Admin",
    date: "Apr 18, 2026", assignedTo: "Ahmed (Support)",
    messages: [
      { from: "user", name: "Urban Threads", text: "The virtual try-on shows a blank screen on Safari. Customers are complaining.", time: "Apr 18, 10:00 AM", attachment: { name: "safari_bug.png", type: "image" } },
      { from: "support", name: "Ahmed (Support)", text: "We've escalated this to the admin team for a platform-level fix.", time: "Apr 18, 11:30 AM", attachment: null },
    ],
  },
  {
    id: "TKT-6003", subject: "Refund request — Velvet Abaya", user: "Yasmin Bakr", email: "yasmin@example.com",
    userType: "Customer", category: "Return / Refund", priority: "Medium", status: "In Progress",
    date: "Apr 17, 2026", assignedTo: "Layla (Support)",
    messages: [
      { from: "user", name: "Yasmin Bakr", text: "I received the wrong size and would like a full refund.", time: "Apr 17, 02:00 PM", attachment: null },
      { from: "admin", name: "Admin", text: "We've reviewed your case and confirmed the refund is approved. It will be processed in 3–5 business days.", time: "Apr 17, 04:00 PM", attachment: null },
    ],
  },
  {
    id: "TKT-6004", subject: "Vendor payout delay — March", user: "Silk & Satin", email: "contact@silksatin.com",
    userType: "Vendor", category: "Payment", priority: "High", status: "Open",
    date: "Apr 16, 2026", assignedTo: null,
    messages: [
      { from: "user", name: "Silk & Satin", text: "We haven't received the March payout of EGP 8,400. It is 12 days overdue.", time: "Apr 16, 10:00 AM", attachment: null },
    ],
  },
  {
    id: "TKT-6005", subject: "Bug in checkout promo code field", user: "Amira Fayed", email: "amira@example.com",
    userType: "Customer", category: "Technical Issue", priority: "Low", status: "Solved",
    date: "Apr 14, 2026", assignedTo: "Ahmed (Support)",
    messages: [
      { from: "user", name: "Amira Fayed", text: "The promo code field shows 'invalid' even with valid codes.", time: "Apr 14, 11:00 AM", attachment: null },
      { from: "support", name: "Ahmed (Support)", text: "Fixed! The issue was a caching problem. Please clear your browser cache and try again.", time: "Apr 14, 03:00 PM", attachment: null },
      { from: "user", name: "Amira Fayed", text: "It works now, thank you!", time: "Apr 14, 04:00 PM", attachment: null },
    ],
  },
  {
    id: "TKT-6006", subject: "Account suspended — appeal", user: "Fashion Hub", email: "admin@fashionhub.eg",
    userType: "Vendor", category: "Account", priority: "High", status: "Escalated to Admin",
    date: "Apr 12, 2026", assignedTo: null,
    messages: [
      { from: "user", name: "Fashion Hub", text: "Our account was suspended without notice. We believe this was an error. Please review.", time: "Apr 12, 09:00 AM", attachment: { name: "account_docs.pdf", type: "file" } },
    ],
  },
];

const STATUS_ALL = ["Open", "In Progress", "Waiting for Customer", "Solved", "Closed", "Escalated to Admin"];
const STATUS_CFG = {
  "Open":                  { color: "#ef4444", bg: "#fee2e2" },
  "In Progress":           { color: "#f59e0b", bg: "#fef3c7" },
  "Waiting for Customer":  { color: "#8b5cf6", bg: "#f5f3ff" },
  "Solved":                { color: "#16a34a", bg: "#dcfce7" },
  "Closed":                { color: "#94a3b8", bg: "#f1f5f9" },
  "Escalated to Admin":    { color: "#dc2626", bg: "#fff1f2" },
};
const SUPPORT_AGENTS = ["Ahmed (Support)", "Layla (Support)", "Rania (Support)"];
const CATEGORIES = ["All", "Order Issue", "Technical Issue", "Return / Refund", "Payment", "Account", "Other"];
const USER_TYPES = ["All", "Customer", "Vendor"];
const PAGE_SIZE = 5;

function getInitials(name) { return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2); }

function StatusBadge({ status }) {
  const c = STATUS_CFG[status] || { color: "#94a3b8", bg: "#f1f5f9" };
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: c.bg, color: c.color }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: c.color, display: "inline-block" }} />{status}</span>;
}

function PriorityBadge({ priority }) {
  const cfg = { High: "#ef4444", Medium: "#f59e0b", Low: "#16a34a" };
  return <span style={{ padding: "2px 9px", borderRadius: 99, fontSize: 11, fontWeight: 700, color: cfg[priority], background: cfg[priority] + "18" }}>{priority}</span>;
}

function FileAtt({ att }) {
  if (!att) return null;
  return <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 9px", background: "rgba(255,255,255,0.2)", borderRadius: 6, fontSize: 11, marginTop: 6 }}>{att.type === "image" ? <ImageIcon size={12} /> : <FileText size={12} />}<span>{att.name}</span></div>;
}

/* ─── Ticket Detail Modal ─── */
function TicketModal({ ticket, onClose, onReply, onStatusChange, onAssign, onEscalate }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [newStatus, setNewStatus] = useState(ticket.status);
  const [assignTo, setAssignTo] = useState(ticket.assignedTo || "");
  const fileRef = useRef(null);
  const isClosed = ticket.status === "Closed" || ticket.status === "Solved";

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() && !file) return;
    onReply(ticket.id, text, file ? { name: file.name, type: file.type.startsWith("image") ? "image" : "file" } : null);
    setText(""); setFile(null);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "var(--adm-surface)", borderRadius: 16, width: "100%", maxWidth: 700, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>

        {/* Head */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--adm-border)", display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
              <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "var(--adm-accent)" }}>{ticket.id}</span>
              <PriorityBadge priority={ticket.priority} />
              <span style={{ padding: "2px 8px", background: "var(--adm-border)", borderRadius: 99, fontSize: 11, color: "var(--adm-text-muted)" }}><Tag size={10} /> {ticket.category}</span>
              <StatusBadge status={ticket.status} />
            </div>
            <h2 style={{ fontFamily: "var(--adm-font-serif, serif)", fontSize: 16, fontWeight: 700, color: "var(--adm-text)", margin: 0 }}>{ticket.subject}</h2>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--adm-text-muted)" }}>{ticket.user} · {ticket.email} · {ticket.date}</p>
          </div>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--adm-text-muted)", padding: 4 }} onClick={onClose}><X size={18} /></button>
        </div>

        {/* Controls strip */}
        <div style={{ padding: "12px 24px", borderBottom: "1px solid var(--adm-border)", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", background: "var(--adm-bg)" }}>
          <select
            value={newStatus}
            onChange={e => { setNewStatus(e.target.value); onStatusChange(ticket.id, e.target.value); }}
            style={{ padding: "6px 10px", border: "1px solid var(--adm-border)", borderRadius: 7, fontSize: 12, background: "var(--adm-surface)", color: "var(--adm-text)" }}
          >
            {STATUS_ALL.map(s => <option key={s}>{s}</option>)}
          </select>
          <select
            value={assignTo}
            onChange={e => { setAssignTo(e.target.value); onAssign(ticket.id, e.target.value); }}
            style={{ padding: "6px 10px", border: "1px solid var(--adm-border)", borderRadius: 7, fontSize: 12, background: "var(--adm-surface)", color: "var(--adm-text)" }}
          >
            <option value="">Unassigned</option>
            {SUPPORT_AGENTS.map(a => <option key={a}>{a}</option>)}
          </select>
          <button
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600, border: "1px solid #fca5a5", background: "#fee2e2", color: "#dc2626", cursor: "pointer" }}
            onClick={() => onEscalate(ticket.id)}
          >
            <ShieldAlert size={13} /> Escalate to Admin
          </button>
          {!isClosed && (
            <button
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600, border: "1px solid var(--adm-border)", background: "var(--adm-surface)", color: "var(--adm-text-muted)", cursor: "pointer" }}
              onClick={() => onStatusChange(ticket.id, "Closed")}
            >
              <CheckCircle size={13} /> Mark Solved & Close
            </button>
          )}
        </div>

        {/* Chat */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ textAlign: "center" }}><span style={{ display: "inline-block", background: "var(--adm-border)", color: "var(--adm-text-muted)", fontSize: 11, padding: "3px 12px", borderRadius: 99 }}>Ticket created · {ticket.created || ticket.date}</span></div>
          {ticket.messages.map((msg, i) => {
            const isAdmin = msg.from === "admin" || msg.from === "support";
            return (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-end", justifyContent: isAdmin ? "flex-end" : "flex-start" }}>
                {!isAdmin && (
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--adm-accent)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                    {getInitials(msg.name)}
                  </div>
                )}
                <div style={{ maxWidth: "70%", padding: "10px 14px", borderRadius: isAdmin ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: isAdmin ? "var(--adm-accent)" : "var(--adm-bg)", border: isAdmin ? "none" : "1px solid var(--adm-border)" }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, opacity: 0.7, marginBottom: 4, color: isAdmin ? "rgba(255,255,255,0.8)" : "var(--adm-text-muted)" }}>{msg.name}</p>
                  <p style={{ margin: 0, fontSize: 13.5, color: isAdmin ? "white" : "var(--adm-text)", lineHeight: 1.5 }}>{msg.text}</p>
                  <FileAtt att={msg.attachment} />
                  <span style={{ fontSize: 10.5, opacity: 0.6, color: isAdmin ? "white" : "var(--adm-text-muted)" }}>{msg.time}</span>
                </div>
                {isAdmin && (
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#7c3aed", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>ADM</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Reply */}
        {!isClosed ? (
          <form style={{ padding: "12px 24px", borderTop: "1px solid var(--adm-border)", display: "flex", gap: 8, alignItems: "flex-end" }} onSubmit={handleSend}>
            <button type="button" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--adm-text-muted)", padding: 8 }} onClick={() => fileRef.current?.click()}>
              <Paperclip size={17} />
            </button>
            <input type="file" ref={fileRef} style={{ display: "none" }} onChange={e => setFile(e.target.files[0] || null)} />
            <textarea
              style={{ flex: 1, padding: "10px 14px", border: "1.5px solid var(--adm-border)", borderRadius: 12, fontSize: 13.5, resize: "none", outline: "none", background: "var(--adm-bg)", color: "var(--adm-text)", fontFamily: "inherit" }}
              rows={2}
              placeholder="Reply as Admin…"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
            />
            <button type="submit" disabled={!text.trim() && !file} style={{ background: "var(--adm-accent)", color: "white", border: "none", borderRadius: 10, padding: "10px 14px", cursor: "pointer", opacity: (!text.trim() && !file) ? 0.4 : 1 }}>
              <Send size={16} />
            </button>
          </form>
        ) : (
          <div style={{ padding: "12px 24px", borderTop: "1px solid var(--adm-border)", textAlign: "center", color: "var(--adm-text-muted)", fontSize: 13 }}>
            <CheckCircle size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />This ticket is {ticket.status.toLowerCase()}.
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main page ─── */
export default function AdminTickets() {
  const [tickets, setTickets] = useState(SEED);
  const [search, setSearch]   = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [userTypeFilter, setUserTypeFilter] = useState("All");
  const [page, setPage]       = useState(1);
  const [active, setActive]   = useState(null);

  const filtered = tickets.filter(tk => {
    const q = tk.subject.toLowerCase().includes(search.toLowerCase()) || tk.user.toLowerCase().includes(search.toLowerCase()) || tk.id.toLowerCase().includes(search.toLowerCase());
    return q
      && (statusFilter   === "All" || tk.status    === statusFilter)
      && (priorityFilter === "All" || tk.priority  === priorityFilter)
      && (categoryFilter === "All" || tk.category  === categoryFilter)
      && (userTypeFilter === "All" || tk.userType  === userTypeFilter);
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const update = (id, changes) => {
    const updated = tickets.map(tk => tk.id === id ? { ...tk, ...changes } : tk);
    setTickets(updated);
    if (active?.id === id) setActive(prev => ({ ...prev, ...changes }));
  };

  const handleReply = (id, text, attachment) => {
    const msg = { from: "admin", name: "Admin", text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), attachment };
    const updated = tickets.map(tk => tk.id === id ? { ...tk, messages: [...tk.messages, msg], status: tk.status === "Open" ? "In Progress" : tk.status } : tk);
    setTickets(updated);
    setActive(updated.find(tk => tk.id === id));
  };

  const stats = {
    open: tickets.filter(t => t.status === "Open").length,
    escalated: tickets.filter(t => t.status === "Escalated to Admin").length,
    inProgress: tickets.filter(t => t.status === "In Progress").length,
    solved: tickets.filter(t => t.status === "Solved" || t.status === "Closed").length,
  };

  return (
    <AdminLayout pageTitle="Tickets Management" pageSubtitle="Full control over all customer, vendor, and support tickets." breadcrumb="Tickets">

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Open", value: stats.open, color: "#ef4444", bg: "#fee2e2" },
          { label: "Escalated", value: stats.escalated, color: "#dc2626", bg: "#fff1f2" },
          { label: "In Progress", value: stats.inProgress, color: "#f59e0b", bg: "#fef3c7" },
          { label: "Solved / Closed", value: stats.solved, color: "#16a34a", bg: "#dcfce7" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1.5px solid ${s.color}30`, borderRadius: 12, padding: "14px 18px" }}>
            <p style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: s.color, opacity: 0.75 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className={t.toolbar}>
        <div className={t.toolbarLeft}>
          <div className={t.searchBox}>
            <Search size={15} className={t.searchIcon} />
            <input className={t.searchInput} placeholder="Search by ID, subject or user…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className={t.filterSelect} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="All">All Status</option>
            {STATUS_ALL.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className={t.filterSelect} value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(1); }}>
            <option value="All">All Priority</option>
            <option>High</option><option>Medium</option><option>Low</option>
          </select>
          <select className={t.filterSelect} value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className={t.filterSelect} value={userTypeFilter} onChange={e => { setUserTypeFilter(e.target.value); setPage(1); }}>
            {USER_TYPES.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <span className={t.pageInfo}>{filtered.length} tickets</span>
      </div>

      {/* Table */}
      <div className={t.tableCard}>
        <div className={t.tableWrap}>
          <table className={t.table}>
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Subject</th>
                <th>Reported By</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Date</th>
                <th style={{ width: 80 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={9}>
                  <div className={t.emptyState}>
                    <div className={t.emptyIcon}><CheckCircle size={24} /></div>
                    <h3 className={t.emptyTitle}>No tickets found</h3>
                    <p className={t.emptyText}>No tickets match your current filters.</p>
                  </div>
                </td></tr>
              ) : paged.map(tk => (
                <tr key={tk.id}>
                  <td style={{ fontWeight: 700, color: "var(--adm-accent)", fontFamily: "monospace", fontSize: 12 }}>{tk.id}</td>
                  <td style={{ fontWeight: 600, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tk.subject}</td>
                  <td>
                    <div className={t.avatarCell}>
                      <div className={t.avatar} style={{ width: 28, height: 28, fontSize: 11 }}>{getInitials(tk.user)}</div>
                      <div>
                        <span className={t.avatarName}>{tk.user}</span>
                        <span className={t.avatarSub} style={{ display: "block" }}>{tk.userType}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--adm-text-muted)" }}>{tk.category}</td>
                  <td><PriorityBadge priority={tk.priority} /></td>
                  <td><StatusBadge status={tk.status} /></td>
                  <td style={{ fontSize: 12, color: tk.assignedTo ? "var(--adm-text)" : "var(--adm-text-muted)" }}>{tk.assignedTo || "—"}</td>
                  <td style={{ fontSize: 12, color: "var(--adm-text-muted)" }}>{tk.date}</td>
                  <td>
                    <button className={`${t.actionBtn} ${t.approve}`} title="Open Ticket" onClick={() => setActive(tk)}>
                      <ArrowUpRight size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className={t.pagination}>
            <span className={t.pageInfo}>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
            <div className={t.pageButtons}>
              <button className={t.pageBtn} onClick={() => setPage(p => p - 1)} disabled={page === 1}>←</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i + 1} className={`${t.pageBtn} ${page === i + 1 ? t.pageBtnActive : ""}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
              ))}
              <button className={t.pageBtn} onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>→</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {active && (
        <TicketModal
          ticket={active}
          onClose={() => setActive(null)}
          onReply={handleReply}
          onStatusChange={(id, status) => update(id, { status })}
          onAssign={(id, agent) => update(id, { assignedTo: agent || null })}
          onEscalate={(id) => update(id, { status: "Escalated to Admin" })}
        />
      )}
    </AdminLayout>
  );
}
