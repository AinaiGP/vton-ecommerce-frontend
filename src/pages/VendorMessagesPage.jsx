import { useState, useEffect, useRef } from "react";
import {
  Search,
  MessageSquare,
  Send,
  Paperclip,
  X,
  ChevronLeft,
  RotateCcw,
  Package,
  ShoppingBag,
  Headphones,
  Shield,
  Tag,
  Clock,
  ImageIcon,
  FileText,
  AlertTriangle,
  Bell,
  CheckCircle2,
  XCircle,
  User,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import VendorLayout from "../components/vendor/VendorLayout";
import m from "../styles/MessagingThread.module.css";
import p from "../styles/VendorPage.module.css";

/* ─── Seed conversations ─────────────────── */
const SEED = [];

const STATUSES = [
  "Open",
  "Pending Vendor Reply",
  "Pending Customer Reply",
  "In Progress",
  "Resolved",
  "Closed",
  "Escalated to Admin",
];
const TYPE_LABELS = {
  customer_inquiry: "Customer Inquiry",
  return_request: "Return Request",
  refund_request: "Refund Request",
  admin_ticket: "Admin / Support Ticket",
};
const TYPE_COLORS = {
  customer_inquiry: "#1d4ed8",
  return_request: "#f59e0b",
  refund_request: "#dc2626",
  admin_ticket: "#7c3aed",
};
const TYPE_BG = {
  customer_inquiry: "#dbeafe",
  return_request: "#fef3c7",
  refund_request: "#fee2e2",
  admin_ticket: "#f3e8ff",
};

const STATUS_CFG = {
  Open: { cls: m.statusOpen, dot: "#ef4444" },
  "Pending Vendor Reply": { cls: m.statusPending, dot: "#7c3aed" },
  "Pending Customer Reply": { cls: m.statusPending, dot: "#7c3aed" },
  "In Progress": { cls: m.statusProgress, dot: "#f59e0b" },
  Resolved: { cls: m.statusResolved, dot: "#16a34a" },
  Closed: { cls: m.statusClosed, dot: "#94a3b8" },
  "Escalated to Admin": { cls: m.statusEscalated, dot: "#dc2626" },
};

const ROLE_CFG = {
  customer: { cls: m.roleCustomer, bg: "#1d4ed8" },
  vendor: { cls: m.roleVendor, bg: "#7c3aed" },
  admin: { cls: m.roleAdmin, bg: "#dc2626" },
  support: { cls: m.roleSupport, bg: "#059669" },
};

const BUBBLE_CLS = {
  customer: m.bubbleCustomer,
  support: m.bubbleSupport,
  admin: m.bubbleAdmin,
  vendor: m.bubbleSelf,
};

function TypeTag({ type }) {
  return (
    <span
      className={m.badge}
      style={{ background: TYPE_BG[type], color: TYPE_COLORS[type] }}
    >
      {type === "return_request" && <RotateCcw size={10} />}
      {type === "refund_request" && <ShoppingBag size={10} />}
      {type === "customer_inquiry" && <MessageSquare size={10} />}
      {type === "admin_ticket" && <Shield size={10} />}
      {TYPE_LABELS[type]}
    </span>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || { cls: m.statusClosed, dot: "#94a3b8" };
  return (
    <span className={`${m.badge} ${cfg.cls}`}>
      <span className={m.badgeDot} style={{ background: cfg.dot }} />
      {status}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const cls = {
    High: m.priorityHigh,
    Medium: m.priorityMedium,
    Low: m.priorityLow,
  };
  return <span className={`${m.badge} ${cls[priority]}`}>{priority}</span>;
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

/* ─── Thread list item ────────────────────── */
function ThreadItem({ conv, active, onClick }) {
  const lastMsg = conv.messages[conv.messages.length - 1];
  const p = conv.participants[0];
  return (
    <button
      className={`${m.threadItem} ${active ? m.threadActive : ""} ${conv.unread ? m.threadItemUnread : ""}`}
      onClick={onClick}
      style={{
        width: "100%",
        border: "none",
        background: "none",
        textAlign: "left",
        cursor: "pointer",
      }}
    >
      {conv.unread && <span className={m.threadUnreadDot} />}
      <div className={m.threadAvatar} style={{ background: p.color }}>
        {p.initials}
      </div>
      <div className={m.threadItemBody}>
        <div className={m.threadItemTop}>
          <span className={m.threadItemName}>{p.name}</span>
          <span className={m.threadItemTime}>{conv.updated}</span>
        </div>
        <div className={m.threadItemSubject}>{conv.subject}</div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 4,
            flexWrap: "wrap",
          }}
        >
          <span
            className={m.badge}
            style={{
              background: TYPE_BG[conv.type],
              color: TYPE_COLORS[conv.type],
              fontSize: 10,
              padding: "2px 7px",
            }}
          >
            {TYPE_LABELS[conv.type]}
          </span>
          <StatusBadge status={conv.status} />
        </div>
      </div>
    </button>
  );
}

/* ─── Conversation panel ──────────────────── */
function ConvPanel({ conv, onStatusChange, onReply, onBack }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [replyTo, setReplyTo] = useState("customer");
  const fileRef = useRef(null);
  const bottomRef = useRef(null);
  const isClosed = conv.status === "Closed" || conv.status === "Resolved";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conv.messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() && !file) return;
    onReply(
      conv.id,
      text,
      file
        ? {
            name: file.name,
            type: file.type?.startsWith("image") ? "image" : "file",
          }
        : null,
      replyTo,
    );
    setText("");
    setFile(null);
  };

  const replyTargets =
    conv.type === "admin_ticket"
      ? [
          { value: "admin", label: "Admin" },
          { value: "support", label: "Support" },
        ]
      : [
          { value: "customer", label: "Customer" },
          { value: "support", label: "Support" },
        ];

  return (
    <div className={m.convPanel}>
      {/* Header */}
      <div className={m.convHeader}>
        <button
          className={p.btn + " " + p.btnOutline + " " + p.btnSm}
          onClick={onBack}
          style={{ display: "flex", alignItems: "center", gap: 5 }}
        >
          <ChevronLeft size={14} /> All Messages
        </button>
        <div className={m.convHeaderInfo}>
          <div className={m.convHeaderTop}>
            <span className={m.convHeaderName}>{conv.subject}</span>
          </div>
          <div className={m.convHeaderMeta}>
            <TypeTag type={conv.type} />
            <PriorityBadge priority={conv.priority} />
            <StatusBadge status={conv.status} />
            {conv.relatedOrder && (
              <span>
                <Package size={12} /> {conv.relatedOrder}
              </span>
            )}
            <span>
              <Clock size={12} /> Updated {conv.updated}
            </span>
          </div>
        </div>
        <div className={m.convHeaderActions}>
          <select
            className={p.filterSelect}
            value={conv.status}
            onChange={(e) => onStatusChange(conv.id, e.target.value)}
            style={{ fontSize: 12 }}
          >
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages */}
      <div className={m.messagesArea}>
        <div className={m.sysEvent}>
          <span className={m.sysEventLabel}>
            Conversation started · {conv.messages[0]?.time || "—"}
          </span>
        </div>

        {conv.messages.map((msg) => {
          const isMe = msg.role === "vendor";
          const roleCfg = ROLE_CFG[msg.role] || ROLE_CFG.support;
          const bubbleCls = BUBBLE_CLS[msg.role] || m.bubbleSupport;
          return (
            <div
              key={msg.id}
              className={`${m.msgRow} ${isMe ? m.msgRight : m.msgLeft}`}
            >
              {!isMe && (
                <div className={m.msgAvatar} style={{ background: roleCfg.bg }}>
                  {msg.role === "customer" ? (
                    <User size={14} />
                  ) : msg.role === "admin" ? (
                    <Shield size={14} />
                  ) : (
                    <Headphones size={14} />
                  )}
                </div>
              )}
              <div className={m.msgContent}>
                <span className={m.msgSenderLabel}>
                  {msg.name} ·{" "}
                  {msg.role.charAt(0).toUpperCase() + msg.role.slice(1)}
                </span>
                <div className={`${m.bubble} ${bubbleCls}`}>
                  <p className={m.bubbleText}>{msg.text}</p>
                  <FileAttachment att={msg.attachment} />
                  <span className={m.bubbleTime}>{msg.time}</span>
                </div>
              </div>
              {isMe && (
                <div className={m.msgAvatar} style={{ background: "#7c3aed" }}>
                  V
                </div>
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
            <span className={m.replyToLabel}>Reply to:</span>
            {replyTargets.map((rt) => (
              <button
                key={rt.value}
                type="button"
                className={`${m.replyToBtn} ${replyTo === rt.value ? m.replyToBtnActive : ""}`}
                onClick={() => setReplyTo(rt.value)}
              >
                {rt.label}
              </button>
            ))}
          </div>
          {file && (
            <div className={m.fileChip}>
              <Paperclip size={12} />
              <span>{file.name}</span>
              <button type="button" onClick={() => setFile(null)}>
                <X size={11} />
              </button>
            </div>
          )}
          <div className={m.replyInputRow}>
            <button
              type="button"
              className={m.attachBtn}
              onClick={() => fileRef.current?.click()}
            >
              <Paperclip size={17} />
            </button>
            <input
              type="file"
              ref={fileRef}
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files[0] || null)}
            />
            <textarea
              className={m.replyTextarea}
              rows={2}
              placeholder={`Reply to ${replyTargets.find((r) => r.value === replyTo)?.label || ""}…`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
            />
            <button
              type="submit"
              className={m.sendBtn}
              disabled={!text.trim() && !file}
            >
              <Send size={16} />
            </button>
          </div>
          <p className={m.replyHint}>
            Press Enter to send · Shift+Enter for new line
          </p>
        </form>
      ) : (
        <div className={m.closedBanner}>
          <CheckCircle2 size={15} />
          This conversation is {conv.status.toLowerCase()}.
          <button
            className={m.reopenBtn}
            onClick={() => onStatusChange(conv.id, "Open")}
          >
            Reopen
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Main page ───────────────────────────── */
let nextId = 6;

export default function VendorMessagesPage() {
  const [convs, setConvs] = useState(SEED);
  const [active, setActive] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // TODO: wire vendor messages to real API — Phase X
  }, []);

  const showNotif = (msg, kind = "notifSuccess") => {
    setNotification({ msg, kind });
    setTimeout(() => setNotification(null), 3000);
  };

  /* counts */
  const unreadCount = convs.filter((c) => c.unread).length;

  const filtered = convs.filter((c) => {
    const qs =
      c.subject.toLowerCase().includes(search.toLowerCase()) ||
      c.participants[0].name.toLowerCase().includes(search.toLowerCase());
    const qt = typeFilter === "all" || c.type === typeFilter;
    const qst = statusFilter === "all" || c.status === statusFilter;
    return qs && qt && qst;
  });

  const openConv = (conv) => {
    setActive(conv);
    if (conv.unread) {
      setConvs((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, unread: false } : c)),
      );
    }
  };

  const handleReply = (id, text, attachment, replyTo) => {
    const now = new Date();
    const timeStr = `${now.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    const msg = {
      id: Date.now(),
      from: "vendor",
      name: "My Store",
      role: "vendor",
      text,
      time: timeStr,
      attachment,
    };
    const updated = convs.map((c) =>
      c.id === id
        ? {
            ...c,
            messages: [...c.messages, msg],
            updated: "Just now",
            status:
              c.status === "Pending Vendor Reply"
                ? "Pending Customer Reply"
                : c.status,
          }
        : c,
    );
    setConvs(updated);
    setActive(updated.find((c) => c.id === id));
    showNotif("Reply sent successfully!");
  };

  const handleStatusChange = (id, status) => {
    const updated = convs.map((c) =>
      c.id === id ? { ...c, status, updated: "Just now" } : c,
    );
    setConvs(updated);
    setActive(updated.find((c) => c.id === id));
    showNotif(`Status updated to "${status}"`);
  };

  const TYPE_FILTERS = [
    { value: "all", label: "All" },
    { value: "customer_inquiry", label: "Inquiries" },
    { value: "return_request", label: "Returns" },
    { value: "refund_request", label: "Refunds" },
    { value: "admin_ticket", label: "Admin Tickets" },
  ];

  return (
    <VendorLayout
      pageTitle="Messages & Tickets"
      pageSubtitle="Manage all customer and admin communications."
      breadcrumb="Messages"
    >
      {notification && (
        <div
          className={`${m.notifBanner} ${m[notification.kind]}`}
          style={{ marginBottom: 12 }}
        >
          <Bell size={15} /> {notification.msg}
        </div>
      )}

      {/* Summary strip */}
      <div
        style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}
      >
        {[
          {
            label: "Unread",
            value: unreadCount,
            color: "#7c3aed",
            bg: "#f3e8ff",
          },
          {
            label: "Open",
            value: convs.filter((c) => c.status === "Open").length,
            color: "#ef4444",
            bg: "#fee2e2",
          },
          {
            label: "Pending Reply",
            value: convs.filter((c) => c.status === "Pending Vendor Reply")
              .length,
            color: "#f59e0b",
            bg: "#fef3c7",
          },
          {
            label: "Resolved",
            value: convs.filter((c) => c.status === "Resolved").length,
            color: "#16a34a",
            bg: "#dcfce7",
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              flex: 1,
              minWidth: 120,
              background: s.bg,
              borderRadius: 12,
              padding: "12px 16px",
              border: `1.5px solid ${s.color}30`,
            }}
          >
            <div
              style={{
                fontSize: 26,
                fontWeight: 900,
                color: s.color,
                lineHeight: 1,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: s.color,
                opacity: 0.75,
                marginTop: 2,
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className={m.msgShell}>
        {/* Left panel */}
        <div className={m.threadSidebar}>
          <div className={m.threadSidebarHead}>
            <p className={m.threadSidebarTitle}>
              Conversations
              {unreadCount > 0 && (
                <span
                  style={{
                    marginLeft: 8,
                    background: "#7c3aed",
                    color: "white",
                    borderRadius: 20,
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "2px 7px",
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </p>
            <div className={m.threadSearch}>
              <Search size={14} style={{ color: "var(--vdr-text-subtle)" }} />
              <input
                className={m.threadSearchInput}
                placeholder="Search messages…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Type filter tabs */}
          <div className={m.filterTabs}>
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.value}
                className={`${m.filterTab} ${typeFilter === f.value ? m.activeTab : ""}`}
                onClick={() => setTypeFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div style={{ padding: "8px 16px" }}>
            <select
              style={{
                width: "100%",
                padding: "6px 10px",
                borderRadius: 8,
                border: "1.5px solid var(--vdr-border)",
                background: "var(--vdr-bg)",
                fontSize: 12,
                fontFamily: "inherit",
                color: "var(--vdr-text)",
              }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Thread list */}
          <div className={m.threadList}>
            {filtered.length === 0 ? (
              <div
                style={{
                  padding: 24,
                  textAlign: "center",
                  color: "var(--vdr-text-muted)",
                  fontSize: 13,
                }}
              >
                <MessageSquare
                  size={28}
                  style={{ opacity: 0.4, marginBottom: 8 }}
                />
                <p>No conversations found</p>
              </div>
            ) : (
              filtered.map((conv) => (
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

        {/* Right panel */}
        {active ? (
          <ConvPanel
            conv={active}
            onStatusChange={handleStatusChange}
            onReply={handleReply}
            onBack={() => setActive(null)}
          />
        ) : (
          <div className={m.emptyConv}>
            <div className={m.emptyConvIcon}>
              <MessageSquare size={30} />
            </div>
            <h3 className={m.emptyConvTitle}>Select a conversation</h3>
            <p className={m.emptyConvText}>
              Choose a message thread from the left to view the full
              conversation and reply.
            </p>
          </div>
        )}
      </div>
    </VendorLayout>
  );
}
