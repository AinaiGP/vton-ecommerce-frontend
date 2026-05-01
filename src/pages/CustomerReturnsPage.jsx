import { useState, useRef } from "react";
import {
  Plus,
  Search,
  Package,
  ChevronRight,
  X,
  Paperclip,
  Send,
  AlertTriangle,
  CheckCircle,
  Clock,
  ImageIcon,
  FileText,
  Eye,
} from "lucide-react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import styles from "../styles/CustomerTickets.module.css";

/* ─── Seed orders (for select) ── */
const MY_ORDERS = [
  {
    id: "#ORD-2841",
    items: ["Silk Evening Gown", "Cashmere Wrap Dress"],
    date: "Apr 18, 2026",
  },
  { id: "#ORD-2839", items: ["Embroidered Kaftan"], date: "Apr 14, 2026" },
  { id: "#ORD-2836", items: ["Velvet Abaya"], date: "Apr 10, 2026" },
];

const RETURN_REASONS = [
  "Wrong size / doesn't fit",
  "Received wrong item",
  "Item damaged or defective",
  "Not as described / different from photos",
  "Changed my mind",
  "Late delivery",
  "Other",
];

const SEED_RETURNS = [
  {
    id: "RET-001",
    orderId: "#ORD-2836",
    product: "Velvet Abaya",
    reason: "Wrong size / doesn't fit",
    status: "Pending",
    created: "Apr 20, 2026",
    updated: "2 hours ago",
    vendorName: "Urban Threads",
    messages: [
      {
        from: "customer",
        text: "Hi, I received size L but I ordered M. Please initiate a refund or exchange.",
        time: "Apr 20, 10:00 AM",
        attachment: null,
      },
      {
        from: "vendor",
        text: "Hi! We're sorry about that. Could you please provide a photo showing the size label? This will help us process this quickly.",
        time: "Apr 20, 11:30 AM",
        attachment: null,
      },
    ],
  },
  {
    id: "RET-002",
    orderId: "#ORD-2839",
    product: "Embroidered Kaftan",
    reason: "Item damaged or defective",
    status: "Approved",
    created: "Apr 15, 2026",
    updated: "3 days ago",
    vendorName: "Urban Threads",
    messages: [
      {
        from: "customer",
        text: "The kaftan arrived with a visible tear near the sleeve. I've attached photos.",
        time: "Apr 15, 09:00 AM",
        attachment: { name: "damage_photo.jpg", type: "image" },
      },
      {
        from: "vendor",
        text: "We sincerely apologize! We can confirm a full refund of EGP 450. It will be processed within 3–5 business days.",
        time: "Apr 15, 01:00 PM",
        attachment: null,
      },
    ],
  },
];

const STATUS_CFG = {
  Pending: { color: "#f59e0b", bg: "#fef3c7" },
  "Vendor Replied": { color: "#3b82f6", bg: "#eff6ff" },
  Approved: { color: "#16a34a", bg: "#dcfce7" },
  Rejected: { color: "#ef4444", bg: "#fee2e2" },
  "Escalated to Admin": { color: "#7c3aed", bg: "#f5f3ff" },
  Closed: { color: "#94a3b8", bg: "#f1f5f9" },
};

function StatusBadge({ status }) {
  const c = STATUS_CFG[status] || { color: "#94a3b8", bg: "#f1f5f9" };
  return (
    <span className={styles.badge} style={{ background: c.bg, color: c.color }}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: c.color,
          display: "inline-block",
        }}
      />
      {status}
    </span>
  );
}

function FileAtt({ att }) {
  if (!att) return null;
  return (
    <div className={styles.attachment}>
      {att.type === "image" ? <ImageIcon size={13} /> : <FileText size={13} />}
      <span>{att.name}</span>
    </div>
  );
}

/* ─── Create Return Modal ── */
function CreateReturnModal({ onClose, onSubmit }) {
  const [orderId, setOrderId] = useState(MY_ORDERS[0].id);
  const [product, setProduct] = useState("");
  const [reason, setReason] = useState(RETURN_REASONS[0]);
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);

  const selectedOrder = MY_ORDERS.find((o) => o.id === orderId);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <h2 className={styles.modalTitle}>Submit Return Request</h2>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={17} />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ orderId, product, reason, desc, file });
          }}
        >
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Select Order *</label>
              <select
                className={styles.select}
                value={orderId}
                onChange={(e) => {
                  setOrderId(e.target.value);
                  setProduct("");
                }}
              >
                {MY_ORDERS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.id} — {o.date}
                  </option>
                ))}
              </select>
            </div>
            {selectedOrder && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Item to Return *</label>
                <select
                  className={styles.select}
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  required
                >
                  <option value="">Select item…</option>
                  {selectedOrder.items.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className={styles.formGroup}>
              <label className={styles.label}>Reason for Return *</label>
              <select
                className={styles.select}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                {RETURN_REASONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Additional Details</label>
              <textarea
                className={styles.textarea}
                rows={4}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Please describe the issue in detail…"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Upload Proof{" "}
                <span
                  style={{ fontWeight: 400, color: "var(--charcoal-muted)" }}
                >
                  (photo of item — optional)
                </span>
              </label>
              <div
                className={styles.attachZone}
                onClick={() => fileRef.current?.click()}
              >
                <Paperclip size={20} style={{ color: "var(--burgundy)" }} />
                <div>
                  <p className={styles.attachTitle}>
                    {file ? file.name : "Click to upload image or file"}
                  </p>
                  <p className={styles.attachSub}>
                    {file
                      ? `${(file.size / 1024).toFixed(1)} KB`
                      : "PNG, JPG, PDF — Max 10 MB"}
                  </p>
                </div>
                {file && (
                  <button
                    type="button"
                    className={styles.attachRemove}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,.pdf"
                style={{ display: "none" }}
                onChange={(e) => setFile(e.target.files[0] || null)}
              />
            </div>
          </div>
          <div className={styles.modalFoot}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnOutline}`}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={!product}
            >
              <Send size={14} /> Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Return Detail (chat) ── */
function ReturnDetail({ ret, onBack, onReply }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);
  const isClosed =
    ret.status === "Approved" ||
    ret.status === "Rejected" ||
    ret.status === "Closed";

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() && !file) return;
    onReply(
      ret.id,
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

  return (
    <div className={styles.detailShell}>
      <div className={styles.detailHeader}>
        <button className={styles.backBtn} onClick={onBack}>
          ← All Return Requests
        </button>
        <div className={styles.detailTitleGroup}>
          <span className={styles.detailId}>{ret.id}</span>
          <h2 className={styles.detailTitle}>
            {ret.product} — {ret.orderId}
          </h2>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 12,
              color: "var(--charcoal-muted)",
            }}
          >
            Vendor: {ret.vendorName} · Reason: {ret.reason}
          </p>
        </div>
        <StatusBadge status={ret.status} />
      </div>

      <div className={styles.chatArea} style={{ marginTop: 16 }}>
        <div className={styles.sysEvent}>
          <span>Return request submitted · {ret.created}</span>
        </div>
        {ret.messages.map((msg, i) => {
          const isMe = msg.from === "customer";
          return (
            <div
              key={i}
              className={`${styles.msgRow} ${isMe ? styles.msgRight : styles.msgLeft}`}
            >
              {!isMe && (
                <div
                  className={styles.msgAvatar}
                  style={{ background: "#7c3aed", fontSize: 10 }}
                >
                  V
                </div>
              )}
              <div
                className={`${styles.bubble} ${isMe ? styles.bubbleCustomer : styles.bubbleSupport}`}
              >
                <p className={styles.bubbleText}>{msg.text}</p>
                <FileAtt att={msg.attachment} />
                <span className={styles.bubbleTime}>{msg.time}</span>
              </div>
              {isMe && (
                <div
                  className={styles.msgAvatar}
                  style={{ background: "var(--burgundy)" }}
                >
                  Me
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!isClosed ? (
        <form className={styles.replyBox} onSubmit={handleSend}>
          {file && (
            <div className={styles.replyFileChip}>
              <Paperclip size={12} />
              <span>{file.name}</span>
              <button type="button" onClick={() => setFile(null)}>
                <X size={11} />
              </button>
            </div>
          )}
          <div className={styles.replyInputRow}>
            <button
              type="button"
              className={styles.replyAttachBtn}
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
              className={styles.replyInput}
              rows={2}
              placeholder="Message the vendor…"
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
              className={styles.sendBtn}
              disabled={!text.trim() && !file}
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      ) : (
        <div className={styles.closedBanner}>
          <CheckCircle size={16} /> This return request is{" "}
          {ret.status.toLowerCase()}.
        </div>
      )}
    </div>
  );
}

/* ─── Main page ── */
let nextRetId = 3;

export default function CustomerReturnsPage() {
  const [returns, setReturns] = useState(SEED_RETURNS);
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = returns.filter((r) => {
    const ms =
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.product.toLowerCase().includes(search.toLowerCase()) ||
      r.orderId.toLowerCase().includes(search.toLowerCase());
    const mv = statusFilter === "All" || r.status === statusFilter;
    return ms && mv;
  });

  const handleCreate = (form) => {
    const newRet = {
      id: `RET-00${nextRetId++}`,
      orderId: form.orderId,
      product: form.product,
      reason: form.reason,
      status: "Pending",
      created: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      updated: "Just now",
      vendorName: "Urban Threads",
      messages: [
        {
          from: "customer",
          text: form.desc || form.reason,
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
    setReturns([newRet, ...returns]);
    setShowCreate(false);
    setSelected(newRet);
    setView("detail");
  };

  const handleReply = (id, text, attachment) => {
    const msg = {
      from: "customer",
      text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      attachment,
    };
    const updated = returns.map((r) =>
      r.id === id
        ? { ...r, messages: [...r.messages, msg], updated: "Just now" }
        : r,
    );
    setReturns(updated);
    setSelected(updated.find((r) => r.id === id));
  };

  if (view === "detail" && selected) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--ivory)" }}>
        <Header />
        <div className={styles.pageContent}>
          <ReturnDetail
            ret={selected}
            onBack={() => setView("list")}
            onReply={handleReply}
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--ivory)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />
      <div className={styles.pageContent} style={{ flex: 1 }}>
        <div className={styles.pageHead}>
          <div>
            <h1 className={styles.pageTitle}>Return Requests</h1>
            <p className={styles.pageSubtitle}>
              Message vendors about returns and track your refund requests.
            </p>
          </div>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={() => setShowCreate(true)}
          >
            <Plus size={15} /> New Return Request
          </button>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <Search size={14} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Search by order, product…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            {Object.keys(STATUS_CFG).map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <span className={styles.pageInfo}>{filtered.length} requests</span>
        </div>

        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <Package size={36} style={{ color: "var(--charcoal-muted)" }} />
            <h3>No return requests</h3>
            <p>You haven't submitted any return requests yet.</p>
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={() => setShowCreate(true)}
            >
              <Plus size={14} /> Submit Return Request
            </button>
          </div>
        ) : (
          <div className={styles.ticketList}>
            {filtered.map((ret) => (
              <article
                key={ret.id}
                className={styles.ticketCard}
                onClick={() => {
                  setSelected(ret);
                  setView("detail");
                }}
              >
                <div className={styles.cardMain}>
                  <div className={styles.cardLeft}>
                    <div className={styles.cardTopRow}>
                      <span className={styles.ticketId}>{ret.id}</span>
                      <span className={styles.catTag}>{ret.orderId}</span>
                    </div>
                    <h3 className={styles.ticketSubject}>{ret.product}</h3>
                    <div className={styles.ticketMeta}>
                      <span>
                        <Clock size={11} /> {ret.created}
                      </span>
                      <span>Reason: {ret.reason}</span>
                      <span>Vendor: {ret.vendorName}</span>
                    </div>
                  </div>
                  <div className={styles.cardRight}>
                    <StatusBadge status={ret.status} />
                    <button className={styles.viewBtn}>
                      View <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateReturnModal
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreate}
        />
      )}
      <Footer />
    </div>
  );
}
