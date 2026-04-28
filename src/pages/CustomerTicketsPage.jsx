import { useState, useEffect, useRef } from "react";
import {
  Plus, Search, MessageSquare, Clock, ChevronRight, ChevronLeft,
  CheckCircle2, XCircle, ArrowUpDown, Paperclip, Send, X,
  AlertTriangle, FileText, ImageIcon, Headphones, Tag,
  RotateCcw, Package, ShoppingBag, Zap, User
} from "lucide-react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import styles from "../styles/CustomerTickets.module.css";

/* ─── Seed ── */
const SEED = [
  {
    id: "TKT-5010", subject: "Order #ORD-2841 never arrived", category: "Order Issue",
    priority: "High", status: "Open", created: "Apr 20, 2026", updated: "1 hour ago",
    messages: [
      { from: "customer", text: "My order was placed on April 12 and tracking hasn't updated in 8 days. Please help!", time: "Apr 20, 09:30 AM", attachment: null },
      { from: "support", text: "Hi! We're sorry to hear that. We've flagged your order to our logistics team. You should receive an update within 24 hours.", time: "Apr 20, 10:15 AM", attachment: null },
    ],
  },
  {
    id: "TKT-5009", subject: "Virtual try-on not working on Safari", category: "Technical Support",
    priority: "Medium", status: "In Progress", created: "Apr 18, 2026", updated: "3 hours ago",
    messages: [
      { from: "customer", text: "The VTON feature shows a blank screen on Safari 17 (macOS Sonoma). Chrome works fine.", time: "Apr 18, 02:00 PM", attachment: { name: "safari_screenshot.png", type: "image" } },
      { from: "support", text: "Thank you for the screenshot! Our tech team is investigating a WebGL compatibility issue on Safari. We'll have a fix deployed by April 22.", time: "Apr 18, 04:30 PM", attachment: null },
    ],
  },
  {
    id: "TKT-5008", subject: "Refund request for Velvet Abaya", category: "Return / Refund",
    priority: "High", status: "Waiting for Customer", created: "Apr 15, 2026", updated: "2 days ago",
    messages: [
      { from: "customer", text: "I received the wrong size. I ordered M but received L. I'd like a full refund.", time: "Apr 15, 11:00 AM", attachment: null },
      { from: "support", text: "We're sorry for the mix-up! Could you please send us a photo of the item showing the size label? This will help us process the refund faster.", time: "Apr 15, 12:30 PM", attachment: null },
    ],
  },
  {
    id: "TKT-5007", subject: "Promo code AINAI20 not applying", category: "General Support",
    priority: "Low", status: "Solved", created: "Apr 10, 2026", updated: "5 days ago",
    messages: [
      { from: "customer", text: "I'm trying to use AINAI20 at checkout but it says 'invalid promo code'.", time: "Apr 10, 03:00 PM", attachment: null },
      { from: "support", text: "This code is valid for first-time purchases only. Since you have a previous order, it won't apply. We can offer you a one-time 15% discount. Would you like that?", time: "Apr 10, 04:00 PM", attachment: null },
      { from: "customer", text: "Yes please! Thank you.", time: "Apr 10, 04:30 PM", attachment: null },
      { from: "support", text: "Done! A 15% discount code NEW15AINAI has been added to your account. Enjoy! 🎉", time: "Apr 10, 05:00 PM", attachment: null },
    ],
  },
];

const STATUSES = ["Open", "In Progress", "Waiting for Customer", "Solved", "Closed", "Escalated to Admin"];
const STATUS_NEXT = { Open: "In Progress", "In Progress": "Solved", Solved: "Closed" };
const CATEGORIES = ["General Support", "Technical Support", "Return / Refund", "Order Issue", "Product Issue"];

const STATUS_CFG = {
  "Open":                  { color: "#ef4444", bg: "#fee2e2" },
  "In Progress":           { color: "#f59e0b", bg: "#fef3c7" },
  "Waiting for Customer":  { color: "#8b5cf6", bg: "#f5f3ff" },
  "Solved":                { color: "#16a34a", bg: "#dcfce7" },
  "Closed":                { color: "#94a3b8", bg: "#f1f5f9" },
  "Escalated to Admin":    { color: "#dc2626", bg: "#fff1f2" },
};

function StatusBadge({ status }) {
  const c = STATUS_CFG[status] || { color: "#94a3b8", bg: "#f1f5f9" };
  return (
    <span className={styles.badge} style={{ background: c.bg, color: c.color }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.color, display: "inline-block" }} />
      {status}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const cfg = { High: "#ef4444", Medium: "#f59e0b", Low: "#16a34a" };
  return <span className={styles.priorityBadge} style={{ color: cfg[priority], background: cfg[priority] + "18" }}>{priority}</span>;
}

function FileAttachment({ att }) {
  if (!att) return null;
  return (
    <div className={styles.attachment}>
      {att.type === "image" ? <ImageIcon size={13} /> : <FileText size={13} />}
      <span>{att.name}</span>
    </div>
  );
}

/* ─── Create Ticket Modal ── */
function CreateModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ subject: "", category: "General Support", priority: "Medium", description: "", relatedOrder: "" });
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <h2 className={styles.modalTitle}>Create New Ticket</h2>
          <button className={styles.modalClose} onClick={onClose}><X size={17} /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSubmit({ ...form, file }); }}>
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Subject *</label>
              <input className={styles.input} value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required placeholder="Briefly describe your issue…" />
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Category</label>
                <select className={styles.select} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Priority</label>
                <select className={styles.select} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                  <option>Low</option><option>Medium</option><option>High</option>
                </select>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Related Order ID <span style={{ fontWeight: 400, color: "var(--charcoal-muted)" }}>(optional)</span></label>
              <input className={styles.input} value={form.relatedOrder} onChange={e => setForm({ ...form, relatedOrder: e.target.value })} placeholder="e.g. #ORD-2841" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Description *</label>
              <textarea className={styles.textarea} rows={5} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required placeholder="Describe your issue in detail…" />
            </div>
            {/* Attach */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Attachment <span style={{ fontWeight: 400, color: "var(--charcoal-muted)" }}>(optional)</span></label>
              <div className={styles.attachZone} onClick={() => fileRef.current?.click()}>
                <Paperclip size={20} style={{ color: "var(--burgundy)" }} />
                <div>
                  <p className={styles.attachTitle}>{file ? file.name : "Click to attach a file or image"}</p>
                  <p className={styles.attachSub}>{file ? `${(file.size / 1024).toFixed(1)} KB` : "PNG, JPG, PDF — Max 10 MB"}</p>
                </div>
                {file && <button type="button" className={styles.attachRemove} onClick={e => { e.stopPropagation(); setFile(null); }}><X size={13} /></button>}
              </div>
              <input ref={fileRef} type="file" style={{ display: "none" }} onChange={e => setFile(e.target.files[0] || null)} />
            </div>
            {form.priority === "High" && (
              <div className={styles.highCallout}><AlertTriangle size={15} /> High priority tickets are reviewed within 2 business hours.</div>
            )}
          </div>
          <div className={styles.modalFoot}>
            <button type="button" className={`${styles.btn} ${styles.btnOutline}`} onClick={onClose}>Cancel</button>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}><Send size={14} /> Submit Ticket</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Ticket Detail (Chat) ── */
function TicketDetail({ ticket, onBack, onReply, onClose }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);
  const bottomRef = useRef(null);
  const [confirmClose, setConfirmClose] = useState(false);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [ticket.messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() && !file) return;
    onReply(ticket.id, text, file ? { name: file.name, type: file.type.startsWith("image") ? "image" : "file" } : null);
    setText(""); setFile(null);
  };

  const isClosed = ticket.status === "Closed" || ticket.status === "Solved";

  return (
    <div className={styles.detailShell}>
      <div className={styles.detailHeader}>
        <button className={styles.backBtn} onClick={onBack}><ChevronLeft size={16} /> All Tickets</button>
        <div className={styles.detailTitleGroup}>
          <span className={styles.detailId}>{ticket.id}</span>
          <h2 className={styles.detailTitle}>{ticket.subject}</h2>
        </div>
        <div className={styles.detailBadges}>
          <span className={styles.catTag}><Tag size={11} />{ticket.category}</span>
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
        </div>
        {!isClosed && (
          <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`} onClick={() => setConfirmClose(true)}>
            <XCircle size={13} /> Close Ticket
          </button>
        )}
      </div>

      <div className={styles.chatArea}>
        <div className={styles.sysEvent}><span>Ticket created · {ticket.created}</span></div>
        {ticket.messages.map((msg, i) => {
          const isMe = msg.from === "customer";
          return (
            <div key={i} className={`${styles.msgRow} ${isMe ? styles.msgRight : styles.msgLeft}`}>
              {!isMe && <div className={styles.msgAvatar} style={{ background: "#4f46e5" }}><Headphones size={14} /></div>}
              <div className={`${styles.bubble} ${isMe ? styles.bubbleCustomer : styles.bubbleSupport}`}>
                <p className={styles.bubbleText}>{msg.text}</p>
                <FileAttachment att={msg.attachment} />
                <span className={styles.bubbleTime}>{msg.time}</span>
              </div>
              {isMe && <div className={styles.msgAvatar} style={{ background: "var(--burgundy)" }}><User size={14} /></div>}
            </div>
          );
        })}
        {ticket.status !== "Open" && (
          <div className={styles.sysEvent}><span>Status changed to <strong>{ticket.status}</strong> · {ticket.updated}</span></div>
        )}
        <div ref={bottomRef} />
      </div>

      {!isClosed ? (
        <form className={styles.replyBox} onSubmit={handleSend}>
          {file && (
            <div className={styles.replyFileChip}>
              <Paperclip size={12} /><span>{file.name}</span>
              <button type="button" onClick={() => setFile(null)}><X size={11} /></button>
            </div>
          )}
          <div className={styles.replyInputRow}>
            <button type="button" className={styles.replyAttachBtn} onClick={() => fileRef.current?.click()} title="Attach file"><Paperclip size={17} /></button>
            <input type="file" ref={fileRef} style={{ display: "none" }} onChange={e => setFile(e.target.files[0] || null)} />
            <textarea
              className={styles.replyInput}
              rows={2}
              placeholder="Write a reply…"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
            />
            <button type="submit" className={styles.sendBtn} disabled={!text.trim() && !file}><Send size={16} /></button>
          </div>
          <p className={styles.replyHint}>Press Enter to send · Shift+Enter for new line</p>
        </form>
      ) : (
        <div className={styles.closedBanner}>
          <CheckCircle2 size={16} /> This ticket is {ticket.status.toLowerCase()}.
        </div>
      )}

      {confirmClose && (
        <div className={styles.backdrop} onClick={() => setConfirmClose(false)}>
          <div className={styles.modalSm} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: "center", padding: "28px 24px" }}>
              <XCircle size={36} style={{ color: "#ef4444" }} />
              <h3 style={{ marginTop: 10, fontFamily: "var(--font-serif)" }}>Close Ticket?</h3>
              <p style={{ color: "var(--charcoal-muted)", fontSize: 14, marginBottom: 20 }}>
                Are you sure your issue is resolved? You can always open a new ticket if needed.
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => setConfirmClose(false)}>Cancel</button>
                <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => { onClose(ticket.id); setConfirmClose(false); }}>
                  <XCircle size={14} /> Close Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main page ── */
let nextId = 5011;

export default function CustomerTicketsPage() {
  const [tickets, setTickets] = useState(SEED);
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortDir, setSortDir] = useState("desc");

  const counts = {};
  tickets.forEach(t => { counts[t.status] = (counts[t.status] || 0) + 1; });

  const filtered = tickets
    .filter(t => {
      const ms = t.subject.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
      const mv = statusFilter === "All" || t.status === statusFilter;
      return ms && mv;
    })
    .sort((a, b) => sortDir === "desc" ? (b.id > a.id ? 1 : -1) : (a.id > b.id ? 1 : -1));

  const openDetail = (ticket) => { setSelected(ticket); setView("detail"); };

  const handleReply = (id, text, attachment) => {
    const now = new Date();
    const msg = { from: "customer", text, time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), attachment };
    const updated = tickets.map(t => t.id === id ? { ...t, messages: [...t.messages, msg], updated: "Just now" } : t);
    setTickets(updated);
    setSelected(updated.find(t => t.id === id));
  };

  const handleClose = (id) => {
    const updated = tickets.map(t => t.id === id ? { ...t, status: "Closed", updated: "Just now" } : t);
    setTickets(updated);
    setSelected(updated.find(t => t.id === id));
  };

  const handleCreate = (form) => {
    const newTicket = {
      id: `TKT-${nextId++}`,
      subject: form.subject, category: form.category,
      priority: form.priority, status: "Open",
      created: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      updated: "Just now",
      messages: [{ from: "customer", text: form.description, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), attachment: form.file ? { name: form.file.name, type: form.file.type?.startsWith("image") ? "image" : "file" } : null }],
    };
    setTickets([newTicket, ...tickets]);
    setShowCreate(false);
    openDetail(newTicket);
  };

  if (view === "detail" && selected) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--ivory)" }}>
        <Header />
        <div className={styles.pageContent}>
          <TicketDetail ticket={selected} onBack={() => setView("list")} onReply={handleReply} onClose={handleClose} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--ivory)", display: "flex", flexDirection: "column" }}>
      <Header />
      <div className={styles.pageContent} style={{ flex: 1 }}>
        <div className={styles.pageHead}>
          <div>
            <h1 className={styles.pageTitle}>My Support Tickets</h1>
            <p className={styles.pageSubtitle}>Track and manage all your support requests with AINAI.</p>
          </div>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setShowCreate(true)}>
            <Plus size={15} /> New Ticket
          </button>
        </div>

        {/* Summary cards */}
        <div className={styles.summaryRow}>
          {[
            { label: "Open", color: "#ef4444", bg: "#fee2e2" },
            { label: "In Progress", color: "#f59e0b", bg: "#fef3c7" },
            { label: "Solved", color: "#16a34a", bg: "#dcfce7" },
            { label: "Closed", color: "#94a3b8", bg: "#f1f5f9" },
          ].map(({ label, color, bg }) => (
            <button
              key={label}
              className={`${styles.summaryCard} ${statusFilter === label ? styles.sumActive : ""}`}
              style={{ "--sum-color": color, "--sum-bg": bg }}
              onClick={() => setStatusFilter(p => p === label ? "All" : label)}
            >
              <span className={styles.sumCount}>{counts[label] || 0}</span>
              <span className={styles.sumLabel}>{label}</span>
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <Search size={14} className={styles.searchIcon} />
            <input className={styles.searchInput} placeholder="Search tickets by subject or ID…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className={styles.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">All Status</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <button className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`} onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")}>
            <ArrowUpDown size={13} /> {sortDir === "desc" ? "Newest" : "Oldest"}
          </button>
          <span className={styles.pageInfo}>{filtered.length} tickets</span>
        </div>

        {/* Ticket list */}
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <MessageSquare size={36} style={{ color: "var(--charcoal-muted)" }} />
            <h3>No tickets found</h3>
            <p>You haven't raised any support tickets yet. We're here to help!</p>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setShowCreate(true)}>
              <Plus size={14} /> Create Your First Ticket
            </button>
          </div>
        ) : (
          <div className={styles.ticketList}>
            {filtered.map(tk => (
              <article
                key={tk.id}
                className={`${styles.ticketCard} ${tk.priority === "High" && tk.status === "Open" ? styles.cardHighlight : ""}`}
                onClick={() => openDetail(tk)}
              >
                {tk.priority === "High" && tk.status === "Open" && (
                  <div className={styles.urgentStrip}><AlertTriangle size={11} /> Urgent</div>
                )}
                <div className={styles.cardMain}>
                  <div className={styles.cardLeft}>
                    <div className={styles.cardTopRow}>
                      <span className={styles.ticketId}>{tk.id}</span>
                      <PriorityBadge priority={tk.priority} />
                      <span className={styles.catTag}><Tag size={10} />{tk.category}</span>
                    </div>
                    <h3 className={styles.ticketSubject}>{tk.subject}</h3>
                    <div className={styles.ticketMeta}>
                      <span><Clock size={11} /> Created {tk.created}</span>
                      <span><MessageSquare size={11} /> {tk.messages.length} message{tk.messages.length !== 1 ? "s" : ""}</span>
                      <span>Updated {tk.updated}</span>
                    </div>
                  </div>
                  <div className={styles.cardRight}>
                    <StatusBadge status={tk.status} />
                    <button className={styles.viewBtn} onClick={e => { e.stopPropagation(); openDetail(tk); }}>
                      View <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onSubmit={handleCreate} />}
      <Footer />
    </div>
  );
}
