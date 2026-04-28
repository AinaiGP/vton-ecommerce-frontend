import { useState, useRef, useEffect } from "react";
import {
  Search, MessageSquare, Send, Paperclip, X, Bell,
  CheckCircle2, Shield, User, Headphones, Package,
  ImageIcon, FileText, Clock, ArrowUpRight, Filter,
  UserCheck, ShieldAlert, RefreshCw, ChevronDown,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import m from "../../styles/MessagingThread.module.css";

/* ─── Seed data ──────────────────────────── */
const SEED = [
  {
    id: "ADM-MSG-001",
    subject: "Return Request — Velvet Abaya #ORD-2835",
    from: { name: "Yasmin Bakr", role: "customer", initials: "YB", color: "#1d4ed8" },
    assignedTo: "Layla (Support)",
    priority: "High",
    status: "In Progress",
    category: "Return / Refund",
    relatedOrder: "#ORD-2835",
    updated: "1 hour ago",
    unread: true,
    messages: [
      { id: 1, from: "customer", name: "Yasmin Bakr", role: "customer", text: "I received the wrong colour for the Velvet Abaya. I want to return it and get a full refund.", time: "Apr 28, 08:00 AM", attachment: { name: "colour_compare.jpg", type: "image" } },
      { id: 2, from: "support", name: "Layla (Support)", role: "support", text: "Hi Yasmin, I've forwarded this to the vendor. Expecting a response within 24 hours.", time: "Apr 28, 08:45 AM", attachment: null },
      { id: 3, from: "vendor", name: "Urban Threads", role: "vendor", text: "We apologise for the inconvenience. We can offer a replacement or full refund. Please confirm your preference.", time: "Apr 28, 10:00 AM", attachment: null },
    ],
  },
  {
    id: "ADM-MSG-002",
    subject: "VTON Blank Screen on Safari — Escalated",
    from: { name: "Urban Threads", role: "vendor", initials: "UT", color: "#7c3aed" },
    assignedTo: "Ahmed (Support)",
    priority: "High",
    status: "Escalated to Admin",
    category: "Technical Issue",
    relatedOrder: null,
    updated: "3 hours ago",
    unread: true,
    messages: [
      { id: 1, from: "vendor", name: "Urban Threads", role: "vendor", text: "Customers on Safari are getting a blank screen on the VTON feature. This is affecting sales significantly.", time: "Apr 28, 07:00 AM", attachment: { name: "safari_error.png", type: "image" } },
      { id: 2, from: "support", name: "Ahmed (Support)", role: "support", text: "This has been escalated to the admin team. We are investigating.", time: "Apr 28, 08:30 AM", attachment: null },
    ],
  },
  {
    id: "ADM-MSG-003",
    subject: "Payout Delay — March Settlement #SILK-834",
    from: { name: "Silk & Satin", role: "vendor", initials: "SS", color: "#0891b2" },
    assignedTo: null,
    priority: "High",
    status: "Open",
    category: "Payment",
    relatedOrder: null,
    updated: "5 hours ago",
    unread: false,
    messages: [
      { id: 1, from: "vendor", name: "Silk & Satin", role: "vendor", text: "Our March payout of EGP 8,400 is 12 days overdue. We'd like an urgent resolution.", time: "Apr 27, 10:00 AM", attachment: null },
    ],
  },
  {
    id: "ADM-MSG-004",
    subject: "Order #ORD-2841 — Never Arrived",
    from: { name: "Sara Al-Rashid", role: "customer", initials: "SA", color: "#0f766e" },
    assignedTo: "Rania (Support)",
    priority: "Medium",
    status: "In Progress",
    category: "Order Issue",
    relatedOrder: "#ORD-2841",
    updated: "1 day ago",
    unread: false,
    messages: [
      { id: 1, from: "customer", name: "Sara Al-Rashid", role: "customer", text: "My order placed on April 12 hasn't arrived and tracking hasn't updated in 8 days.", time: "Apr 27, 09:00 AM", attachment: null },
      { id: 2, from: "support", name: "Rania (Support)", role: "support", text: "We've contacted the carrier and are investigating. We'll update you within 24 hours.", time: "Apr 27, 10:30 AM", attachment: null },
      { id: 3, from: "admin", name: "Admin", role: "admin", text: "We've confirmed a carrier delay. A replacement order will be dispatched by Apr 29. We sincerely apologise.", time: "Apr 27, 02:00 PM", attachment: null },
    ],
  },
  {
    id: "ADM-MSG-005",
    subject: "Account Suspended — Dispute #Fashion-Hub",
    from: { name: "Fashion Hub", role: "vendor", initials: "FH", color: "#dc2626" },
    assignedTo: null,
    priority: "High",
    status: "Escalated to Admin",
    category: "Account",
    relatedOrder: null,
    updated: "2 days ago",
    unread: false,
    messages: [
      { id: 1, from: "vendor", name: "Fashion Hub", role: "vendor", text: "Our account was suspended without warning. We believe this was an error and request an urgent review.", time: "Apr 26, 09:00 AM", attachment: { name: "account_docs.pdf", type: "file" } },
    ],
  },
];

const STATUSES = ["Open", "In Progress", "Waiting for Customer", "Waiting for Vendor", "Solved", "Closed", "Escalated to Admin"];
const AGENTS = ["", "Ahmed (Support)", "Layla (Support)", "Rania (Support)"];
const CATEGORIES = ["All", "Return / Refund", "Technical Issue", "Payment", "Order Issue", "Account", "Other"];
const USER_TYPES = ["All", "Customer", "Vendor"];
const PRIORITIES = ["All", "High", "Medium", "Low"];

const STATUS_CFG = {
  "Open":                  { dot: "#ef4444", bg: "#fee2e2", color: "#dc2626" },
  "In Progress":           { dot: "#f59e0b", bg: "#fef3c7", color: "#ca8a04" },
  "Waiting for Customer":  { dot: "#8b5cf6", bg: "#f5f3ff", color: "#7c3aed" },
  "Waiting for Vendor":    { dot: "#8b5cf6", bg: "#f5f3ff", color: "#7c3aed" },
  "Solved":                { dot: "#16a34a", bg: "#dcfce7", color: "#15803d" },
  "Closed":                { dot: "#94a3b8", bg: "#f1f5f9", color: "#64748b" },
  "Escalated to Admin":    { dot: "#dc2626", bg: "#fff1f2", color: "#dc2626" },
};

const ROLE_BG = { customer: "#1d4ed8", vendor: "#7c3aed", admin: "#dc2626", support: "#059669" };
const BUBBLE_MAP = { customer: m.bubbleCustomer, vendor: m.bubbleVendor, admin: m.bubbleAdmin, support: m.bubbleSupport };

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG["Closed"];
  return (
    <span className={m.badge} style={{ background: cfg.bg, color: cfg.color }}>
      <span className={m.badgeDot} style={{ background: cfg.dot }} />
      {status}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const cls = { High: m.priorityHigh, Medium: m.priorityMedium, Low: m.priorityLow };
  return <span className={`${m.badge} ${cls[priority]}`}>{priority}</span>;
}

function RoleBadge({ role }) {
  const cls = { customer: m.roleCustomer, vendor: m.roleVendor, admin: m.roleAdmin, support: m.roleSupport };
  return <span className={`${m.badge} ${cls[role] || ""}`}>{role.charAt(0).toUpperCase() + role.slice(1)}</span>;
}

function FileAttachment({ att }) {
  if (!att) return null;
  return (
    <div className={m.bubbleAttachment}>
      {att.type === "image" ? <ImageIcon size={13} /> : <FileText size={13} />}
      <span>{att.name}</span>
    </div>
  );
}

/* ─── Thread item ─────────────────────────── */
function ThreadItem({ conv, active, onClick }) {
  const cfg = STATUS_CFG[conv.status] || STATUS_CFG["Closed"];
  return (
    <button
      className={`${m.threadItem} ${active ? m.threadActive : ""} ${conv.unread ? m.threadItemUnread : ""}`}
      onClick={onClick}
      style={{ width: "100%", border: "none", background: "none", textAlign: "left", cursor: "pointer" }}
    >
      {conv.unread && <span className={m.threadUnreadDot} />}
      <div className={m.threadAvatar} style={{ background: conv.from.color }}>{conv.from.initials}</div>
      <div className={m.threadItemBody}>
        <div className={m.threadItemTop}>
          <span className={m.threadItemName}>{conv.from.name}</span>
          <span className={m.threadItemTime}>{conv.updated}</span>
        </div>
        <div className={m.threadItemSubject}>{conv.subject}</div>
        <div style={{ display: "flex", gap: 5, marginTop: 4, flexWrap: "wrap", alignItems: "center" }}>
          <RoleBadge role={conv.from.role} />
          <span className={m.badge} style={{ background: cfg.bg, color: cfg.color, fontSize: 10, padding: "2px 7px" }}>
            <span className={m.badgeDot} style={{ background: cfg.dot }} />{conv.status}
          </span>
          {conv.priority === "High" && (
            <span className={`${m.badge} ${m.priorityHigh}`} style={{ fontSize: 10, padding: "2px 7px" }}>High</span>
          )}
        </div>
      </div>
    </button>
  );
}

/* ─── Conversation detail ─────────────────── */
function ConvDetail({ conv, onClose, onUpdate, onReply }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [replyAs, setReplyAs] = useState("admin");
  const fileRef = useRef(null);
  const bottomRef = useRef(null);
  const isClosed = conv.status === "Closed" || conv.status === "Solved";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conv.messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() && !file) return;
    onReply(conv.id, text, file ? { name: file.name, type: file.type?.startsWith("image") ? "image" : "file" } : null, replyAs);
    setText(""); setFile(null);
  };

  return (
    <div className={m.convPanel}>
      {/* Header */}
      <div className={m.convHeader}>
        <div className={m.convHeaderInfo}>
          <div className={m.convHeaderTop}>
            <span className={m.convHeaderName}>{conv.subject}</span>
            <PriorityBadge priority={conv.priority} />
          </div>
          <div className={m.convHeaderMeta}>
            <RoleBadge role={conv.from.role} />
            <span>{conv.from.name}</span>
            {conv.relatedOrder && <span><Package size={12} /> {conv.relatedOrder}</span>}
            <span style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: 20, fontSize: 11 }}><Filter size={10} style={{ marginRight: 3, verticalAlign: "middle" }} />{conv.category}</span>
            <span><Clock size={12} /> {conv.updated}</span>
          </div>
        </div>
        <div className={m.convHeaderActions}>
          <button className={m.ctrlBtn + " " + m.ctrlBtnDanger} onClick={() => onUpdate(conv.id, "status", "Escalated to Admin")} style={{ display: "flex", alignItems: "center", gap: 5, border: "1.5px solid #fca5a5", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontFamily: "inherit" }}>
            <ShieldAlert size={13} /> Escalate
          </button>
          {!isClosed ? (
            <button className={m.ctrlBtn + " " + m.ctrlBtnSuccess} onClick={() => onUpdate(conv.id, "status", "Solved")} style={{ display: "flex", alignItems: "center", gap: 5, border: "1.5px solid #86efac", borderRadius: 8, padding: "6px 12px", cursor: "pointer", background: "#dcfce7", color: "#15803d", fontFamily: "inherit" }}>
              <CheckCircle2 size={13} /> Mark Solved
            </button>
          ) : (
            <button className={m.ctrlBtn} onClick={() => onUpdate(conv.id, "status", "Open")} style={{ display: "flex", alignItems: "center", gap: 5, border: "1.5px solid var(--adm-border)", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontFamily: "inherit" }}>
              <RefreshCw size={13} /> Reopen
            </button>
          )}
        </div>
      </div>

      {/* Controls strip */}
      <div className={m.controlStrip}>
        <select
          value={conv.status}
          onChange={e => onUpdate(conv.id, "status", e.target.value)}
          style={{ padding: "6px 10px", border: "1.5px solid var(--adm-border, #e8e0d5)", borderRadius: 8, fontSize: 12, background: "var(--adm-surface, #fff)", color: "var(--adm-text, #1a1210)", fontFamily: "inherit" }}
        >
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <UserCheck size={14} style={{ color: "var(--adm-text-muted, #7a6a60)" }} />
          <select
            value={conv.assignedTo || ""}
            onChange={e => onUpdate(conv.id, "assignedTo", e.target.value || null)}
            style={{ padding: "6px 10px", border: "1.5px solid var(--adm-border, #e8e0d5)", borderRadius: 8, fontSize: 12, background: "var(--adm-surface, #fff)", color: "var(--adm-text, #1a1210)", fontFamily: "inherit" }}
          >
            <option value="">Unassigned</option>
            {AGENTS.filter(Boolean).map(a => <option key={a}>{a}</option>)}
          </select>
        </div>

        {conv.assignedTo && (
          <span style={{ fontSize: 12, color: "var(--adm-text-muted, #7a6a60)", display: "flex", alignItems: "center", gap: 5 }}>
            <UserCheck size={12} /> Assigned to {conv.assignedTo}
          </span>
        )}
      </div>

      {/* Messages */}
      <div className={m.messagesArea}>
        <div className={m.sysEvent}>
          <span className={m.sysEventLabel}>Thread started · {conv.messages[0]?.time}</span>
        </div>

        {conv.messages.map(msg => {
          const isRight = msg.role === "admin";
          const bubbleCls = BUBBLE_MAP[msg.role] || m.bubbleSupport;
          return (
            <div key={msg.id} className={`${m.msgRow} ${isRight ? m.msgRight : m.msgLeft}`}>
              {!isRight && (
                <div className={m.msgAvatar} style={{ background: ROLE_BG[msg.role] || "#059669" }}>
                  {msg.role === "customer" ? <User size={14} /> : msg.role === "vendor" ? "V" : <Headphones size={14} />}
                </div>
              )}
              <div className={m.msgContent}>
                <span className={m.msgSenderLabel}>{msg.name} · <RoleBadge role={msg.role} /></span>
                <div className={`${m.bubble} ${bubbleCls}`}>
                  <p className={m.bubbleText}>{msg.text}</p>
                  <FileAttachment att={msg.attachment} />
                  <span className={m.bubbleTime}>{msg.time}</span>
                </div>
              </div>
              {isRight && (
                <div className={m.msgAvatar} style={{ background: "#dc2626", fontSize: 10, fontWeight: 800 }}>ADM</div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Reply box */}
      {!isClosed ? (
        <form className={m.replyBox} onSubmit={handleSend}>
          <div className={m.replyToSelect}>
            <span className={m.replyToLabel}>Reply as:</span>
            {[{ v: "admin", l: "Admin" }, { v: "support", l: "Support Agent" }].map(rt => (
              <button
                key={rt.v}
                type="button"
                className={`${m.replyToBtn} ${replyAs === rt.v ? m.replyToBtnActive : ""}`}
                onClick={() => setReplyAs(rt.v)}
              >
                {rt.l}
              </button>
            ))}
          </div>
          {file && (
            <div className={m.fileChip}>
              <Paperclip size={12} />
              <span>{file.name}</span>
              <button type="button" onClick={() => setFile(null)}><X size={11} /></button>
            </div>
          )}
          <div className={m.replyInputRow}>
            <button type="button" className={m.attachBtn} onClick={() => fileRef.current?.click()}>
              <Paperclip size={17} />
            </button>
            <input type="file" ref={fileRef} style={{ display: "none" }} onChange={e => setFile(e.target.files[0] || null)} />
            <textarea
              className={m.replyTextarea}
              rows={2}
              placeholder={`Reply as ${replyAs === "admin" ? "Admin" : "Support Agent"}…`}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
            />
            <button type="submit" className={m.sendBtn} style={{ background: "#dc2626" }} disabled={!text.trim() && !file}>
              <Send size={16} />
            </button>
          </div>
          <p className={m.replyHint}>Press Enter to send · Shift+Enter for new line</p>
        </form>
      ) : (
        <div className={m.closedBanner}>
          <CheckCircle2 size={15} />
          This ticket is {conv.status.toLowerCase()}.
          <button className={m.reopenBtn} style={{ color: "#dc2626" }} onClick={() => onUpdate(conv.id, "status", "Open")}>Reopen</button>
        </div>
      )}
    </div>
  );
}

/* ─── Main page ───────────────────────────── */
export default function AdminMessagesPage() {
  const [convs, setConvs] = useState(SEED);
  const [active, setActive] = useState(null);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [prioFilter, setPrioFilter] = useState("All");
  const [notification, setNotification] = useState(null);

  const showNotif = (msg, kind = "notifSuccess") => {
    setNotification({ msg, kind });
    setTimeout(() => setNotification(null), 3000);
  };

  const unread = convs.filter(c => c.unread).length;
  const escalated = convs.filter(c => c.status === "Escalated to Admin").length;

  const filtered = convs.filter(c => {
    const qs = c.subject.toLowerCase().includes(search.toLowerCase()) || c.from.name.toLowerCase().includes(search.toLowerCase());
    const qcat = catFilter === "All" || c.category === catFilter;
    const qtype = typeFilter === "All" || c.from.role.toLowerCase() === typeFilter.toLowerCase();
    const qprio = prioFilter === "All" || c.priority === prioFilter;
    return qs && qcat && qtype && qprio;
  });

  const openConv = (conv) => {
    setActive(conv);
    if (conv.unread) setConvs(prev => prev.map(c => c.id === conv.id ? { ...c, unread: false } : c));
  };

  const handleUpdate = (id, field, value) => {
    const updated = convs.map(c => c.id === id ? { ...c, [field]: value, updated: "Just now" } : c);
    setConvs(updated);
    setActive(updated.find(c => c.id === id));
    showNotif(`Updated: ${field} → ${value}`);
  };

  const handleReply = (id, text, attachment, replyAs) => {
    const names = { admin: "Admin", support: "Support Agent" };
    const now = new Date();
    const timeStr = `${now.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    const msg = { id: Date.now(), from: replyAs, name: names[replyAs] || "Admin", role: replyAs, text, time: timeStr, attachment };
    const updated = convs.map(c => c.id === id ? {
      ...c,
      messages: [...c.messages, msg],
      updated: "Just now",
      status: c.status === "Open" ? "In Progress" : c.status,
    } : c);
    setConvs(updated);
    setActive(updated.find(c => c.id === id));
    showNotif("Reply sent!");
  };

  return (
    <AdminLayout pageTitle="Messages & Tickets" pageSubtitle="Full oversight of all system communications." breadcrumb="Messages">

      {notification && (
        <div className={`${m.notifBanner} ${m[notification.kind]}`} style={{ marginBottom: 12 }}>
          <Bell size={15} /> {notification.msg}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Unread", value: unread, color: "#7c3aed", bg: "#f3e8ff" },
          { label: "Escalated", value: escalated, color: "#dc2626", bg: "#fff1f2" },
          { label: "Open", value: convs.filter(c => c.status === "Open").length, color: "#ef4444", bg: "#fee2e2" },
          { label: "In Progress", value: convs.filter(c => c.status === "In Progress").length, color: "#f59e0b", bg: "#fef3c7" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1.5px solid ${s.color}30`, borderRadius: 12, padding: "14px 18px" }}>
            <p style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: s.color, opacity: 0.75 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div className={m.threadSearch} style={{ flex: 1, minWidth: 220 }}>
          <Search size={14} style={{ color: "var(--adm-text-muted, #7a6a60)" }} />
          <input
            className={m.threadSearchInput}
            placeholder="Search messages by subject or name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid var(--adm-border, #e8e0d5)", fontSize: 12, fontFamily: "inherit", background: "var(--adm-surface, #fff)", color: "var(--adm-text, #1a1210)" }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid var(--adm-border, #e8e0d5)", fontSize: 12, fontFamily: "inherit", background: "var(--adm-surface, #fff)", color: "var(--adm-text, #1a1210)" }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          {USER_TYPES.map(u => <option key={u}>{u}</option>)}
        </select>
        <select style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid var(--adm-border, #e8e0d5)", fontSize: 12, fontFamily: "inherit", background: "var(--adm-surface, #fff)", color: "var(--adm-text, #1a1210)" }} value={prioFilter} onChange={e => setPrioFilter(e.target.value)}>
          {PRIORITIES.map(p => <option key={p}>{p}</option>)}
        </select>
        <span style={{ fontSize: 12, color: "var(--adm-text-muted, #7a6a60)", whiteSpace: "nowrap" }}>{filtered.length} threads</span>
      </div>

      <div className={`${m.msgShell} ${m.msgShellAdmin}`} style={{ "--vdr-accent": "var(--adm-accent, #8B4852)" }}>
        {/* Thread sidebar */}
        <div className={m.threadSidebar}>
          <div className={m.threadSidebarHead}>
            <p className={m.threadSidebarTitle}>
              All Conversations
              {unread > 0 && (
                <span style={{ marginLeft: 8, background: "#dc2626", color: "white", borderRadius: 20, fontSize: 10, fontWeight: 800, padding: "2px 7px" }}>
                  {unread} new
                </span>
              )}
            </p>
          </div>
          <div className={m.threadList}>
            {filtered.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "var(--adm-text-muted, #7a6a60)", fontSize: 13 }}>
                <MessageSquare size={28} style={{ opacity: 0.4, marginBottom: 8 }} />
                <p>No conversations found</p>
              </div>
            ) : (
              filtered.map(conv => (
                <ThreadItem
                  key={conv.id}
                  conv={conv}
                  active={active?.id === conv.id}
                  onClick={() => openConv(conv)}
                />
              ))
            )}
          </div>
        </div>

        {/* Detail panel */}
        {active ? (
          <ConvDetail
            conv={active}
            onClose={() => setActive(null)}
            onUpdate={handleUpdate}
            onReply={handleReply}
          />
        ) : (
          <div className={m.emptyConv}>
            <div className={m.emptyConvIcon}>
              <MessageSquare size={30} />
            </div>
            <h3 className={m.emptyConvTitle}>Select a thread</h3>
            <p className={m.emptyConvText}>
              Pick any message thread on the left to view the full conversation, reply, assign, or escalate.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
