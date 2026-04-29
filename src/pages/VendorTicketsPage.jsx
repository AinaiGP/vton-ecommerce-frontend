import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Search,
  MessageSquare,
  Clock,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  XCircle,
  ArrowUpDown,
  Paperclip,
  Send,
  X,
  Check,
  RefreshCw,
  Filter,
  AlertTriangle,
  FileText,
  ImageIcon,
  Headphones,
  Tag,
} from "lucide-react";
import VendorLayout from "../components/vendor/VendorLayout";
import p from "../styles/VendorPage.module.css";
import s from "../styles/VendorTickets.module.css";

const STATUS_ORDER = ["Open", "In Progress", "Resolved", "Closed"];
const STATUS_NEXT = {
  Open: "In Progress",
  "In Progress": "Resolved",
  Resolved: "Closed",
};
const CATEGORIES = ["Technical Issue", "Payment", "Orders", "Other"];

/* ─── Badge helpers ──────────────────────────────── */
function StatusBadge({ status }) {
  const cfg = {
    Open: { cls: s.sOpen, dot: "#ef4444" },
    "In Progress": { cls: s.sProgress, dot: "#f59e0b" },
    Resolved: { cls: s.sResolved, dot: "#16a34a" },
    Closed: { cls: s.sClosed, dot: "#94a3b8" },
  };
  const { cls, dot } = cfg[status] || {};
  return (
    <span className={`${s.badge} ${cls}`}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: dot,
          display: "inline-block",
        }}
      />{" "}
      {status}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const cfg = { High: s.pHigh, Medium: s.pMedium, Low: s.pLow };
  return <span className={`${s.priority} ${cfg[priority]}`}>{priority}</span>;
}

function FileAttachment({ att }) {
  if (!att) return null;
  const isImg = att.type === "image";
  return (
    <div className={s.attachment}>
      {isImg ? <ImageIcon size={14} /> : <FileText size={14} />}
      <span>{att.name}</span>
    </div>
  );
}

/* ─── Skeleton ───────────────────────────────────── */
function TicketSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            background: "var(--vdr-surface)",
            border: "1px solid var(--vdr-border)",
            borderRadius: 12,
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", gap: 10 }}>
            <span
              className={p.skeleton}
              style={{ width: 80, height: 18, borderRadius: 6 }}
            />
            <span
              className={p.skeleton}
              style={{ width: 60, height: 18, borderRadius: 6 }}
            />
          </div>
          <span
            className={p.skeleton}
            style={{ width: "70%", height: 20, borderRadius: 6 }}
          />
          <span
            className={p.skeleton}
            style={{ width: "40%", height: 14, borderRadius: 6 }}
          />
        </div>
      ))}
    </div>
  );
}

/* ─── Create Ticket Modal ────────────────────────── */
function CreateTicketModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    subject: "",
    category: "Technical Issue",
    priority: "Medium",
    description: "",
  });
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, file });
  };

  return (
    <div className={p.modalBackdrop} onClick={onClose}>
      <div
        className={`${p.modal} ${p.modalLg}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={p.modalHead}>
          <h2 className={p.modalTitle}>Create New Support Ticket</h2>
          <button className={p.modalClose} onClick={onClose}>
            <X size={17} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={p.modalBody}>
            <div className={p.formGroup}>
              <label className={p.label}>Subject *</label>
              <input
                className={p.input}
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
                placeholder="Briefly describe your issue..."
              />
            </div>
            <div className={p.formRow}>
              <div className={p.formGroup}>
                <label className={p.label}>Category</label>
                <select
                  className={p.select}
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className={p.formGroup}>
                <label className={p.label}>Priority</label>
                <select
                  className={p.select}
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value })
                  }
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
            </div>
            <div className={p.formGroup}>
              <label className={p.label}>Description *</label>
              <textarea
                className={p.textarea}
                rows={5}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                required
                placeholder="Please describe your issue in detail. Include any relevant order IDs, product names, or error messages..."
              />
            </div>
            {/* Attachment */}
            <div className={p.formGroup}>
              <label className={p.label}>Attachment (optional)</label>
              <div
                className={s.attachZone}
                onClick={() => fileRef.current?.click()}
              >
                <Paperclip size={20} style={{ color: "var(--vdr-accent)" }} />
                <div>
                  <p className={s.attachTitle}>
                    {file ? file.name : "Click to attach a file or image"}
                  </p>
                  <p className={s.attachSub}>
                    {file
                      ? `${(file.size / 1024).toFixed(1)} KB`
                      : "PNG, JPG, PDF, CSV — Max 10 MB"}
                  </p>
                </div>
                {file && (
                  <button
                    type="button"
                    className={s.attachRemove}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                style={{ display: "none" }}
                onChange={(e) => setFile(e.target.files[0] || null)}
              />
            </div>

            {/* High priority callout */}
            {form.priority === "High" && (
              <div className={s.highCallout}>
                <AlertTriangle size={16} />
                <span>
                  High priority tickets are reviewed within 2 business hours.
                </span>
              </div>
            )}
          </div>
          <div className={p.modalFoot}>
            <button
              type="button"
              className={`${p.btn} ${p.btnOutline}`}
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className={`${p.btn} ${p.btnPrimary}`}>
              <Send size={14} /> Submit Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Ticket Detail (Chat View) ──────────────────── */
function TicketDetail({ ticket, onBack, onReply, onAdvance, onResolve }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);
  const bottomRef = useRef(null);
  const [confirmClose, setConfirmClose] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket.messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() && !file) return;
    onReply(
      ticket.id,
      text,
      file
        ? {
            name: file.name,
            type: file.type.startsWith("image") ? "image" : "file",
          }
        : null,
    );
    setText("");
    setFile(null);
  };

  const nextStatus = STATUS_NEXT[ticket.status];
  const isClosed = ticket.status === "Closed";
  const isResolved = ticket.status === "Resolved";

  return (
    <div className={s.detailShell}>
      {/* Detail header */}
      <div className={s.detailHeader}>
        <button className={s.backBtn} onClick={onBack}>
          <ChevronLeft size={16} /> All Tickets
        </button>
        <div className={s.detailTitleGroup}>
          <span className={s.detailTicketId}>{ticket.id}</span>
          <h2 className={s.detailTitle}>{ticket.subject}</h2>
        </div>
        <div className={s.detailBadges}>
          <span className={`${s.catTag}`}>
            <Tag size={11} />
            {ticket.category}
          </span>
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
        </div>
        {/* Actions */}
        <div className={s.detailActions}>
          {nextStatus && !isClosed && (
            <button
              className={`${p.btn} ${p.btnOutline} ${p.btnSm}`}
              onClick={() => onAdvance(ticket.id)}
            >
              <RefreshCw size={13} /> Mark as {nextStatus}
            </button>
          )}
          {!isClosed && (
            <button
              className={`${p.btn} ${p.btnDanger} ${p.btnSm}`}
              onClick={() => setConfirmClose(true)}
            >
              <XCircle size={13} /> Close Ticket
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className={s.chatArea}>
        {/* System event */}
        <div className={s.sysEvent}>
          <span>Ticket created · {ticket.created}</span>
        </div>

        {ticket.messages.map((msg, i) => {
          const isVendor = msg.from === "vendor";
          return (
            <div
              key={i}
              className={`${s.msgRow} ${isVendor ? s.msgRight : s.msgLeft}`}
            >
              {!isVendor && (
                <div
                  className={s.msgAvatar}
                  style={{ background: "#4f46e5", color: "white" }}
                >
                  <Headphones size={14} />
                </div>
              )}
              <div
                className={`${s.bubble} ${isVendor ? s.bubbleVendor : s.bubbleSupport}`}
              >
                <p className={s.bubbleText}>{msg.text}</p>
                {msg.attachment && <FileAttachment att={msg.attachment} />}
                <span className={s.bubbleTime}>{msg.time}</span>
              </div>
              {isVendor && (
                <div
                  className={s.msgAvatar}
                  style={{
                    background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                    color: "white",
                    fontWeight: 800,
                    fontSize: 12,
                  }}
                >
                  V
                </div>
              )}
            </div>
          );
        })}

        {/* Status change events */}
        {ticket.status !== "Open" && (
          <div className={s.sysEvent}>
            <span>
              Status changed to <strong>{ticket.status}</strong> ·{" "}
              {ticket.updated}
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Reply box */}
      {!isClosed ? (
        <form className={s.replyBox} onSubmit={handleSend}>
          {file && (
            <div className={s.replyFileChip}>
              <Paperclip size={12} />
              <span>{file.name}</span>
              <button type="button" onClick={() => setFile(null)}>
                <X size={11} />
              </button>
            </div>
          )}
          <div className={s.replyInputRow}>
            <button
              type="button"
              className={s.replyAttachBtn}
              onClick={() => fileRef.current?.click()}
              title="Attach file"
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
              className={s.replyInput}
              rows={2}
              placeholder={
                isClosed ? "This ticket is closed." : "Write a reply..."
              }
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              disabled={isClosed}
            />
            <button
              type="submit"
              className={s.sendBtn}
              disabled={!text.trim() && !file}
            >
              <Send size={16} />
            </button>
          </div>
          <p className={s.replyHint}>
            Press Enter to send · Shift+Enter for new line
          </p>
        </form>
      ) : (
        <div className={s.closedBanner}>
          <CheckCircle2 size={16} /> This ticket is closed.{" "}
          <button className={s.reopenBtn} onClick={() => onAdvance(ticket.id)}>
            Reopen
          </button>
        </div>
      )}

      {/* Confirm close modal */}
      {confirmClose && (
        <div className={p.modalBackdrop} onClick={() => setConfirmClose(false)}>
          <div
            className={`${p.modal} ${p.modalSm}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={p.modalBody}
              style={{
                alignItems: "center",
                textAlign: "center",
                paddingTop: 28,
                paddingBottom: 28,
              }}
            >
              <div className={p.confirmIcon}>
                <XCircle size={22} />
              </div>
              <h3 className={p.modalTitle} style={{ marginTop: 10 }}>
                Close Ticket?
              </h3>
              <p className={p.confirmText}>
                Are you sure you want to close <strong>{ticket.id}</strong>? You
                can still reopen it later.
              </p>
            </div>
            <div className={p.modalFoot} style={{ justifyContent: "center" }}>
              <button
                className={`${p.btn} ${p.btnOutline}`}
                onClick={() => setConfirmClose(false)}
              >
                Cancel
              </button>
              <button
                className={`${p.btn} ${p.btnDanger}`}
                onClick={() => {
                  onResolve(ticket.id);
                  setConfirmClose(false);
                }}
              >
                <XCircle size={14} /> Close Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main page ──────────────────────────────────── */
let nextId = 1025;

export default function VendorTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [view, setView] = useState("list"); // "list" | "detail"
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sortDir, setSortDir] = useState("desc"); // "desc" | "asc"

  useEffect(() => {
    // TODO: wire to real API endpoint — Phase X
    setTickets([]);
    setLoading(false);
  }, []);

  /* Derived counts */
  const counts = { Open: 0, "In Progress": 0, Resolved: 0, Closed: 0 };
  tickets.forEach((t) => {
    counts[t.status] = (counts[t.status] || 0) + 1;
  });

  /* Filter + sort */
  const filtered = tickets
    .filter((t) => {
      const ms =
        t.subject.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toLowerCase().includes(search.toLowerCase());
      const mv = statusFilter === "All" || t.status === statusFilter;
      const mp = priorityFilter === "All" || t.priority === priorityFilter;
      return ms && mv && mp;
    })
    .sort((a, b) =>
      sortDir === "desc" ? b.id.localeCompare(a.id) : a.id.localeCompare(b.id),
    );

  /* Actions */
  const openDetail = (ticket) => {
    setSelected(ticket);
    setView("detail");
  };

  const handleReply = (id, text, attachment) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const msg = {
      from: "vendor",
      text,
      time: `${now.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${timeStr}`,
      attachment,
    };
    const updated = tickets.map((t) =>
      t.id === id
        ? { ...t, messages: [...t.messages, msg], updated: "Just now" }
        : t,
    );
    setTickets(updated);
    setSelected(updated.find((t) => t.id === id));
  };

  const handleAdvance = (id) => {
    const updated = tickets.map((t) => {
      if (t.id !== id) return t;
      const next = STATUS_NEXT[t.status] || t.status;
      return { ...t, status: next, updated: "Just now" };
    });
    setTickets(updated);
    const fresh = updated.find((t) => t.id === id);
    setSelected(fresh);
  };

  const handleClose = (id) => {
    const updated = tickets.map((t) =>
      t.id === id ? { ...t, status: "Closed", updated: "Just now" } : t,
    );
    setTickets(updated);
    setSelected(updated.find((t) => t.id === id));
  };

  const handleCreate = (form) => {
    const newTicket = {
      id: `TKT-${nextId++}`,
      subject: form.subject,
      category: form.category,
      priority: form.priority,
      status: "Open",
      created: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      updated: "Just now",
      messages: [
        {
          from: "vendor",
          text: form.description,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          attachment: form.file
            ? {
                name: form.file.name,
                type: form.file.type?.startsWith("image") ? "image" : "file",
              }
            : null,
        },
      ],
    };
    setTickets([newTicket, ...tickets]);
    setShowCreate(false);
    openDetail(newTicket);
  };

  const addBtn = (
    <button
      className={`${p.btn} ${p.btnPrimary}`}
      onClick={() => setShowCreate(true)}
    >
      <Plus size={15} /> New Ticket
    </button>
  );

  /* ── Detail view ── */
  if (view === "detail" && selected) {
    return (
      <VendorLayout pageTitle="" breadcrumb="Support">
        <TicketDetail
          ticket={selected}
          onBack={() => setView("list")}
          onReply={handleReply}
          onAdvance={handleAdvance}
          onResolve={handleClose}
        />
        {showCreate && (
          <CreateTicketModal
            onClose={() => setShowCreate(false)}
            onSubmit={handleCreate}
          />
        )}
      </VendorLayout>
    );
  }

  /* ── List view ── */
  return (
    <VendorLayout
      pageTitle="Support & Tickets"
      pageSubtitle="Track and manage all your support requests."
      breadcrumb="Support"
      headerAction={addBtn}
    >
      {/* Status summary cards */}
      <div className={s.summaryRow}>
        {[
          { label: "Open", color: "#ef4444", bg: "#fee2e2" },
          { label: "In Progress", color: "#f59e0b", bg: "#fef3c7" },
          { label: "Resolved", color: "#16a34a", bg: "#dcfce7" },
          { label: "Closed", color: "#94a3b8", bg: "#f1f5f9" },
        ].map(({ label, color, bg }) => (
          <button
            key={label}
            className={`${s.summaryCard} ${statusFilter === label ? s.sumActive : ""}`}
            style={{ "--sum-color": color, "--sum-bg": bg }}
            onClick={() =>
              setStatusFilter((prev) => (prev === label ? "All" : label))
            }
          >
            <span className={s.sumCount}>{counts[label] || 0}</span>
            <span className={s.sumLabel}>{label}</span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className={p.toolbar}>
        <div className={p.toolbarLeft}>
          <div className={p.searchBox}>
            <Search size={14} className={p.searchIcon} />
            <input
              className={p.searchInput}
              placeholder="Search tickets by subject or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className={p.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            {STATUS_ORDER.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            className={p.filterSelect}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="All">All Priorities</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
        <div className={p.toolbarRight}>
          <button
            className={`${p.btn} ${p.btnOutline} ${p.btnSm}`}
            onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
            title={`Sort: ${sortDir === "desc" ? "Newest first" : "Oldest first"}`}
          >
            <ArrowUpDown size={13} /> {sortDir === "desc" ? "Newest" : "Oldest"}
          </button>
          <span className={p.pageInfo}>{filtered.length} tickets</span>
        </div>
      </div>

      {/* Ticket list */}
      {loading ? (
        <TicketSkeleton />
      ) : filtered.length === 0 ? (
        <div className={p.tableCard}>
          <div className={p.emptyState}>
            <div className={p.emptyIcon}>
              <MessageSquare size={24} />
            </div>
            <h3 className={p.emptyTitle}>No tickets found</h3>
            <p className={p.emptyText}>
              You haven't raised any support tickets yet. Click "New Ticket" to
              get help from our team.
            </p>
            <button
              className={`${p.btn} ${p.btnPrimary}`}
              onClick={() => setShowCreate(true)}
              style={{ marginTop: 8 }}
            >
              <Plus size={14} /> Create Your First Ticket
            </button>
          </div>
        </div>
      ) : (
        <div className={s.ticketList}>
          {filtered.map((tk) => (
            <article
              key={tk.id}
              className={`${s.ticketCard} ${tk.priority === "High" && tk.status === "Open" ? s.cardHighlight : ""}`}
              onClick={() => openDetail(tk)}
            >
              {tk.priority === "High" && tk.status === "Open" && (
                <div className={s.urgentStrip}>
                  <AlertTriangle size={11} /> Urgent
                </div>
              )}
              <div className={s.cardMain}>
                <div className={s.cardLeft}>
                  <div className={s.cardTopRow}>
                    <span className={s.ticketId}>{tk.id}</span>
                    <PriorityBadge priority={tk.priority} />
                    <span className={s.catTag}>
                      <Tag size={10} />
                      {tk.category}
                    </span>
                  </div>
                  <h3 className={s.ticketSubject}>{tk.subject}</h3>
                  <div className={s.ticketMeta}>
                    <span>
                      <Clock size={11} /> Created {tk.created}
                    </span>
                    <span>
                      <MessageSquare size={11} /> {tk.messages.length} message
                      {tk.messages.length !== 1 ? "s" : ""}
                    </span>
                    <span>Updated {tk.updated}</span>
                  </div>
                </div>
                <div className={s.cardRight}>
                  <StatusBadge status={tk.status} />
                  <button
                    className={s.viewBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      openDetail(tk);
                    }}
                  >
                    View <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateTicketModal
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreate}
        />
      )}
    </VendorLayout>
  );
}
