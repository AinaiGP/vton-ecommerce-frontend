import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Search,
  MessageSquare,
  Clock,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  ArrowUpDown,
  Paperclip,
  Send,
  X,
  AlertTriangle,
  FileText,
  Headphones,
  Tag,
  User,
} from "lucide-react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import styles from "../styles/CustomerTickets.module.css";
import apiClient, { multipartClient } from "../utils/apiClient";

/* ─── Mapping ─── */
const TICKET_TYPES = [
  { value: "GENERAL_SUPPORT", label: "General Support" },
  { value: "SYSTEM_BUG", label: "Technical Support" },
  { value: "ORDER_DISPUTE", label: "Order Issue" },
];

const STATUS_CFG = {
  PENDING: { color: "#64748b", bg: "#f1f5f9", label: "Pending" },
  OPEN: { color: "#ef4444", bg: "#fee2e2", label: "Open" },
  IN_PROGRESS: { color: "#f59e0b", bg: "#fef3c7", label: "In Progress" },
  AWAITING_RESPONSE: {
    color: "#8b5cf6",
    bg: "#f5f3ff",
    label: "Awaiting Response",
  },
  ESCALATED: { color: "#dc2626", bg: "#fff1f2", label: "Escalated" },
  RESOLVED: { color: "#16a34a", bg: "#dcfce7", label: "Resolved" },
  CLOSED: { color: "#94a3b8", bg: "#f1f5f9", label: "Closed" },
  CANCELED: { color: "#94a3b8", bg: "#f1f5f9", label: "Canceled" },
};

function getStatusLabel(status) {
  return STATUS_CFG[status]?.label || status;
}

function getCategoryLabel(type) {
  return TICKET_TYPES.find((t) => t.value === type)?.label || type;
}

function isImageUrl(url) {
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(url);
}

function extractLegacyAttachment(content) {
  if (!content) return { text: "", urls: [] };
  const match = content.match(/\(attachment:\s*(https?:\/\/[^\s)]+)\)/i);
  if (!match) return { text: content, urls: [] };
  const cleaned = content.replace(match[0], "").trim();
  return { text: cleaned || "Attachment", urls: [match[1]] };
}

/* ─── Map a backend ticket to UI ─── */
function mapTicket(ticket) {
  const messages = (ticket.messages || [])
    .filter((m) => !m.isSystemMessage)
    .map((m) => {
      const legacy = extractLegacyAttachment(m.content);
      const attachmentUrls = [...(m.attachments || []), ...legacy.urls].filter(
        Boolean,
      );
      const attachments = attachmentUrls.map((url) => ({
        url,
        name: url.split("/").pop() || "Attachment",
        isImage: isImageUrl(url),
      }));

      return {
        from:
          String(m.senderRole || "").toUpperCase() === "CUSTOMER"
            ? "customer"
            : "support",
        text: legacy.text || m.content,
        time: new Date(m.createdAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        attachments,
      };
    });

  return {
    id: ticket.id,
    subject: ticket.subject,
    category: getCategoryLabel(ticket.type),
    type: ticket.type,
    status: ticket.status,
    rawStatus: ticket.status,
    created: new Date(ticket.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    updated: new Date(ticket.updatedAt).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    messages,
    _raw: ticket,
  };
}

function StatusBadge({ status }) {
  const c = STATUS_CFG[status] || {
    color: "#94a3b8",
    bg: "#f1f5f9",
    label: status,
  };
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
      {c.label}
    </span>
  );
}
function AttachmentList({ attachments, onImageClick }) {
  if (!attachments?.length) return null;
  return (
    <div className={styles.attachmentList}>
      {attachments.map((att) =>
        att.isImage ? (
          <div
            key={att.url}
            className={styles.attachmentImageLink}
            onClick={() => onImageClick(att.url)}
            style={{ cursor: "zoom-in" }}
          >
            <img
              src={att.url}
              alt={att.name}
              className={styles.attachmentImage}
            />
          </div>
        ) : (
          <a
            key={att.url}
            href={att.url}
            target="_blank"
            rel="noreferrer"
            className={styles.attachment}
          >
            <FileText size={13} />
            <span>{att.name}</span>
          </a>
        ),
      )}
    </div>
  );
}

/* ─── Loading Spinner ─── */
function LoadingSpinner() {
  return (
    <div
      style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          border: "3px solid var(--ivory-dark)",
          borderTop: "3px solid var(--burgundy)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ─── Confirm Cancel Modal ─── */
function ConfirmCancelModal({ onConfirm, onClose, loading }) {
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className={styles.modalHead}>
          <h2 className={styles.modalTitle}>Cancel Ticket</h2>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={17} />
          </button>
        </div>
        <div className={styles.modalBody}>
          <p style={{ color: "var(--charcoal-muted)", fontSize: 14, margin: 0 }}>
            Are you sure you want to cancel this ticket? This action cannot be undone.
          </p>
        </div>
        <div className={styles.modalFoot}>
          <button
            className={`${styles.btn} ${styles.btnOutline}`}
            onClick={onClose}
            disabled={loading}
          >
            Keep Ticket
          </button>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={onConfirm}
            disabled={loading}
            style={{ background: "#dc2626", borderColor: "#dc2626" }}
          >
            {loading ? "Canceling…" : "Yes, Cancel It"}
          </button>
        </div>
      </div>
    </div>
  );
}


function CreateModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    subject: "",
    type: "GENERAL_SUPPORT",
    description: "",
    orderId: "",
  });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ ...form, file });
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to create ticket.";
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <h2 className={styles.modalTitle}>Create New Ticket</h2>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={17} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Subject *</label>
              <input
                className={styles.input}
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
                placeholder="Briefly describe your issue…"
              />
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup} style={{ width: "100%" }}>
                <label className={styles.label}>Category</label>
                <select
                  className={styles.select}
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  {TICKET_TYPES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {form.type === "ORDER_DISPUTE" && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Related Order ID *</label>
                <input
                  className={styles.input}
                  value={form.orderId}
                  onChange={(e) =>
                    setForm({ ...form, orderId: e.target.value })
                  }
                  required
                  placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                />
              </div>
            )}
            <div className={styles.formGroup}>
              <label className={styles.label}>Description *</label>
              <textarea
                className={styles.textarea}
                rows={5}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                required
                placeholder="Describe your issue in detail…"
              />
            </div>
            {/* Attach */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Attachment{" "}
                <span
                  style={{ fontWeight: 400, color: "var(--charcoal-muted)" }}
                >
                  (optional)
                </span>
              </label>
              <div
                className={styles.attachZone}
                onClick={() => fileRef.current?.click()}
              >
                <Paperclip size={20} style={{ color: "var(--burgundy)" }} />
                <div>
                  <p className={styles.attachTitle}>
                    {file ? file.name : "Click to attach a file or image"}
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
                style={{ display: "none" }}
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => setFile(e.target.files[0] || null)}
              />
              {file && (
                <div className={styles.attachmentPreview}>
                  {file.type?.startsWith("image/") && previewUrl && (
                    <img
                      src={previewUrl}
                      alt={file.name}
                      className={styles.attachmentPreviewImage}
                    />
                  )}
                  <div className={styles.attachmentPreviewInfo}>
                    <span className={styles.attachmentPreviewName}>
                      {file.name}
                    </span>
                    <span className={styles.attachmentPreviewMeta}>
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <button
                    type="button"
                    className={styles.attachmentPreviewRemove}
                    onClick={() => setFile(null)}
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
            {error && <p style={{ color: "#dc2626", fontSize: 12 }}>{error}</p>}
            {form.priority === "HIGH" || form.priority === "URGENT" ? (
              <div className={styles.highCallout}>
                <AlertTriangle size={15} /> High priority tickets are reviewed
                within 2 business hours.
              </div>
            ) : null}
          </div>
          <div className={styles.modalFoot}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnOutline}`}
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={submitting}
            >
              <Send size={14} /> {submitting ? "Submitting…" : "Submit Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Ticket Detail (Chat) ─── */
function TicketDetail({ ticket, onBack, onReply, onCancel, onImageClick }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const fileRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket.messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() && !file) return;
    setSending(true);
    try {
      await onReply(ticket.id, text, file);
      setText("");
      setFile(null);
    } catch (err) {
      console.error("Message send failed:", err);
      // addToast or other UI feedback is handled inside onReply if it's an attachment issue.
      // We just need to catch the error here so finally block runs properly.
    } finally {
      setSending(false);
    }
  };

  const isClosed =
    ticket.status === "CLOSED" ||
    ticket.status === "RESOLVED" ||
    ticket.status === "CANCELED";
  const canCancel = ["PENDING", "OPEN", "AWAITING_RESPONSE"].includes(
    ticket.status,
  );

  return (
    <div className={styles.detailShell}>
      <div className={styles.detailHeader}>
        <button className={styles.backBtn} onClick={onBack}>
          <ChevronLeft size={16} /> All Tickets
        </button>
        <div className={styles.detailTitleGroup}>
          <span className={styles.detailId}>{ticket.id.slice(0, 8)}…</span>
          <h2 className={styles.detailTitle}>{ticket.subject}</h2>
        </div>
        <div className={styles.detailBadges}>
          <span className={styles.catTag}>
            <Tag size={11} />
            {ticket.category}
          </span>
          <StatusBadge status={ticket.status} />
        </div>
        {!isClosed && canCancel && (
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
              onClick={() => setShowCancelModal(true)}
            >
              Cancel
            </button>
          </div>
        )}
        {showCancelModal && (
          <ConfirmCancelModal
            loading={canceling}
            onClose={() => setShowCancelModal(false)}
            onConfirm={async () => {
              setCanceling(true);
              await onCancel(ticket.id);
              setCanceling(false);
              setShowCancelModal(false);
            }}
          />
        )}
      </div>

      <div className={styles.chatArea}>
        <div className={styles.sysEvent}>
          <span>Ticket created · {ticket.created}</span>
        </div>
        {ticket.messages.map((msg, i) => {
          const isMe = msg.from === "customer";
          return (
            <div
              key={i}
              className={`${styles.msgRow} ${isMe ? styles.msgRight : styles.msgLeft}`}
            >
              {!isMe && (
                <div
                  className={styles.msgAvatar}
                  style={{ background: "#4f46e5" }}
                >
                  <Headphones size={14} />
                </div>
              )}
              <div
                className={`${styles.bubble} ${isMe ? styles.bubbleCustomer : styles.bubbleSupport}`}
              >
                <p className={styles.bubbleText}>{msg.text}</p>
                <AttachmentList attachments={msg.attachments} onImageClick={onImageClick} />
                <span className={styles.bubbleTime}>{msg.time}</span>
              </div>
              {isMe && (
                <div
                  className={styles.msgAvatar}
                  style={{ background: "var(--burgundy)" }}
                >
                  <User size={14} />
                </div>
              )}
            </div>
          );
        })}
        {ticket.status !== "OPEN" && (
          <div className={styles.sysEvent}>
            <span>
              Status is <strong>{getStatusLabel(ticket.status)}</strong> ·{" "}
              {ticket.updated}
            </span>
          </div>
        )}
        <div ref={bottomRef} />
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
              title="Attach file"
            >
              <Paperclip size={17} />
            </button>
            <input
              type="file"
              ref={fileRef}
              style={{ display: "none" }}
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => setFile(e.target.files[0] || null)}
            />
            <textarea
              className={styles.replyInput}
              rows={2}
              placeholder="Write a reply…"
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
              disabled={(!text.trim() && !file) || sending}
            >
              <Send size={16} />
            </button>
          </div>
          <p className={styles.replyHint}>
            Press Enter to send · Shift+Enter for new line
          </p>
        </form>
      ) : (
        <div className={styles.closedBanner}>
          <CheckCircle2 size={16} /> This ticket is{" "}
          {getStatusLabel(ticket.status).toLowerCase()}.
        </div>
      )}
    </div>
  );
}

/* ─── Main page ─── */
export default function CustomerTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortDir, setSortDir] = useState("desc");
  const [fullscreenImage, setFullscreenImage] = useState(null);

  const [toasts, setToasts] = useState([]);
  const addToast = (text, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3500,
    );
  };

  /* ── Fetch tickets ── */
  useEffect(() => {
    let cancelled = false;
    async function fetchTickets() {
      setLoading(true);
      try {
        const res = await apiClient.get("/customers/support/tickets", {
          params: { limit: 50, page: 1 },
        });
        if (!cancelled) {
          const raw = res.data?.data || res.data || [];
          // filter out returns
          const nonReturns = raw.filter((t) => t.type !== "RETURN_REQUEST");
          setTickets(nonReturns.map(mapTicket));
        }
      } catch {
        if (!cancelled) setTickets([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchTickets();
    return () => {
      cancelled = true;
    };
  }, []);

  const refetchTickets = async () => {
    try {
      const res = await apiClient.get("/customers/support/tickets", {
        params: { limit: 50, page: 1 },
      });
      const raw = res.data?.data || res.data || [];
      const nonReturns = raw.filter((t) => t.type !== "RETURN_REQUEST");
      setTickets(nonReturns.map(mapTicket));
    } catch {
      // silent
    }
  };

  /* ── Create ticket ── */
  const handleCreate = async (form) => {
    const payload = {
      type: form.type,
      subject: form.subject,
      description: form.description,
      priority: form.priority,
    };
    if (form.orderId) payload.orderId = form.orderId;

    const res = await apiClient.post("/customers/support/tickets", payload);

    if (form.file) {
      try {
        const formData = new FormData();
        formData.append("file", form.file);
        const uploadRes = await multipartClient.post(
          `/customers/support/tickets/${res.data.id}/messages/attachments`,
          formData,
        );
        const attachmentUrl = uploadRes.data?.url || null;
        if (attachmentUrl) {
          await apiClient.post(
            `/customers/support/tickets/${res.data.id}/messages`,
            {
              content: "Attachment",
              attachments: [attachmentUrl],
            },
          );
        }
      } catch (err) {
        addToast("Ticket created, but attachment failed (must be image < 5MB).", "error");
        setShowCreate(false);
        await refetchTickets();
        const newTk = (
          await apiClient.get(`/customers/support/tickets/${res.data.id}`)
        ).data;
        if (newTk) {
          setSelected(mapTicket(newTk));
          setView("detail");
        }
        return;
      }
    }

    setShowCreate(false);
    addToast("Ticket created successfully!");
    await refetchTickets();
    // find newly created ticket to open
    const newTk = (
      await apiClient.get(`/customers/support/tickets/${res.data.id}`)
    ).data;
    if (newTk) {
      setSelected(mapTicket(newTk));
      setView("detail");
    }
  };

  /* ── Reply to ticket ── */
  const handleReply = async (id, text, file) => {
    let attachmentUrl = null;
    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await multipartClient.post(
          `/customers/support/tickets/${id}/messages/attachments`,
          formData,
        );
        attachmentUrl = uploadRes.data?.url || null;
      } catch (err) {
        addToast("Failed to upload attachment. It must be an image under 5MB.", "error");
        throw err; // Stop reply process
      }
    }

    const content = text?.trim() || "Attachment";
    await apiClient.post(`/customers/support/tickets/${id}/messages`, {
      content,
      attachments: attachmentUrl ? [attachmentUrl] : undefined,
    });

    const res = await apiClient.get(`/customers/support/tickets/${id}`);
    const updated = mapTicket(res.data);
    setSelected(updated);
    setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  /* ── Cancel ticket ── */
  const handleCancel = async (id) => {
    try {
      await apiClient.patch(`/customers/support/tickets/${id}/cancel`);
      // Try to refetch the updated ticket; if it fails, still update local state
      try {
        const res = await apiClient.get(`/customers/support/tickets/${id}`);
        const updated = mapTicket(res.data);
        setSelected(updated);
        setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
      } catch {
        // GET failed — update status optimistically so UI reflects the cancel
        setTickets((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status: "CANCELED" } : t))
        );
        setSelected((prev) =>
          prev?.id === id ? { ...prev, status: "CANCELED" } : prev
        );
      }
      addToast("Ticket canceled.");
    } catch {
      addToast("Failed to cancel ticket.", "error");
    }
  };

  // Limit one active ticket constraint handling
  // Wait, the prompt says: "Requirement: Implement one-active-ticket limit logic using status checks (!CLOSED_STATUSES). UX: 'New Ticket' button must be conditionally disabled when an open ticket exists."
  const activeTickets = tickets.filter(
    (t) =>
      t.status !== "CLOSED" &&
      t.status !== "RESOLVED" &&
      t.status !== "CANCELED",
  );
  const hasActiveTicket = activeTickets.length > 0;

  const counts = {};
  tickets.forEach((t) => {
    let stat = "Pending";
    if (t.status === "RESOLVED") stat = "Resolved";
    else if (t.status === "CLOSED") stat = "Closed";
    else if (t.status === "CANCELED") stat = "Canceled";
    else if (t.status === "IN_PROGRESS" || t.status === "AWAITING_RESPONSE" || t.status === "ESCALATED") {
      stat = "In Progress";
    } else {
      stat = "Pending"; // PENDING or OPEN
    }
    counts[stat] = (counts[stat] || 0) + 1;
  });

  const filtered = tickets
    .filter((t) => {
      const ms =
        t.subject.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toLowerCase().includes(search.toLowerCase());
      
      const st = t.status;
      const mv =
        statusFilter === "All" ||
        (statusFilter === "Pending" && (st === "PENDING" || st === "OPEN")) ||
        (statusFilter === "In Progress" && (st === "IN_PROGRESS" || st === "AWAITING_RESPONSE" || st === "ESCALATED")) ||
        (statusFilter === "Resolved" && st === "RESOLVED") ||
        (statusFilter === "Closed" && st === "CLOSED") ||
        (statusFilter === "Canceled" && st === "CANCELED");
      
      return ms && mv;
    })
    .sort((a, b) =>
      sortDir === "desc" ? (b.id > a.id ? 1 : -1) : a.id > b.id ? 1 : -1,
    );

  const openDetail = async (ticket) => {
    try {
      const res = await apiClient.get(
        `/customers/support/tickets/${ticket.id}`,
      );
      setSelected(mapTicket(res.data));
      setView("detail");
    } catch (err) {
      addToast("Failed to load ticket details", "error");
    }
  };

  if (view === "detail" && selected) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--ivory)" }}>
        <Header />
        {/* Fullscreen Image Modal */}
        {fullscreenImage && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.9)",
              zIndex: 10000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "zoom-out",
              padding: 40,
              animation: "fadeIn 0.2s ease",
            }}
            onClick={() => setFullscreenImage(null)}
          >
            <button
              style={{
                position: "absolute",
                top: 30,
                right: 30,
                background: "rgba(255,255,255,0.1)",
                border: "none",
                color: "white",
                padding: 12,
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                backdropFilter: "blur(10px)",
              }}
              onClick={() => setFullscreenImage(null)}
            >
              <X size={24} />
            </button>
            <img
              src={fullscreenImage}
              alt="Fullscreen Preview"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                borderRadius: 8,
                boxShadow: "0 20px 80px rgba(0,0,0,0.5)",
                animation: "zoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              onClick={(e) => e.stopPropagation()}
            />
            <style>{`
              @keyframes zoomIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}</style>
          </div>
        )}
        {/* Toasts */}
        <div
          style={{
            position: "fixed",
            top: 80,
            right: 20,
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              style={{
                background: toast.type === "error" ? "#fee2e2" : "#dcfce7",
                border: `1px solid ${toast.type === "error" ? "#fca5a5" : "#86efac"}`,
                color: toast.type === "error" ? "#dc2626" : "#15803d",
                padding: "12px 18px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                animation: "fadeIn 0.2s ease",
              }}
            >
              {toast.type === "error" ? (
                <AlertTriangle size={15} />
              ) : (
                <CheckCircle2 size={15} />
              )}{" "}
              {toast.text}
            </div>
          ))}
        </div>
        <div className={styles.pageContent}>
          <TicketDetail
            ticket={selected}
            onBack={() => setView("list")}
            onReply={handleReply}
            onCancel={handleCancel}
            onImageClick={setFullscreenImage}
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
      {/* Toasts */}
      <div
        style={{
          position: "fixed",
          top: 80,
          right: 20,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              background: toast.type === "error" ? "#fee2e2" : "#dcfce7",
              border: `1px solid ${toast.type === "error" ? "#fca5a5" : "#86efac"}`,
              color: toast.type === "error" ? "#dc2626" : "#15803d",
              padding: "12px 18px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
              animation: "fadeIn 0.2s ease",
            }}
          >
            {toast.type === "error" ? (
              <AlertTriangle size={15} />
            ) : (
              <CheckCircle2 size={15} />
            )}{" "}
            {toast.text}
          </div>
        ))}
      </div>

      <div className={styles.pageContent} style={{ flex: 1 }}>
        <div className={styles.pageHead}>
          <div>
            <h1 className={styles.pageTitle}>My Support Tickets</h1>
            <p className={styles.pageSubtitle}>
              Track and manage all your support requests with AINAI.
            </p>
          </div>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={() => setShowCreate(true)}
            disabled={hasActiveTicket}
            title={hasActiveTicket ? "You already have an active ticket" : ""}
            style={
              hasActiveTicket ? { opacity: 0.6, cursor: "not-allowed" } : {}
            }
          >
            <Plus size={15} /> New Ticket
          </button>
        </div>
        {hasActiveTicket && (
          <div
            style={{
              marginBottom: 20,
              padding: 12,
              background: "#eff6ff",
              color: "#1d4ed8",
              borderRadius: 8,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <AlertTriangle size={16} /> You currently have an open support
            ticket. Please wait for it to be resolved or close it before opening
            a new one.
          </div>
        )}

        {/* Summary cards */}
        <div className={styles.summaryRow}>
          {[
            { label: "Pending", color: "#64748b", bg: "#f1f5f9" },
            { label: "In Progress", color: "#f59e0b", bg: "#fef3c7" },
            { label: "Resolved", color: "#16a34a", bg: "#dcfce7" },
            { label: "Closed", color: "#94a3b8", bg: "#f1f5f9" },
            { label: "Canceled", color: "#94a3b8", bg: "#f1f5f9" },
          ].map(({ label, color, bg }) => (
            <button
              key={label}
              className={`${styles.summaryCard} ${statusFilter === label ? styles.sumActive : ""}`}
              style={{ "--sum-color": color, "--sum-bg": bg }}
              onClick={() =>
                setStatusFilter((p) => (p === label ? "All" : label))
              }
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
            <input
              className={styles.searchInput}
              placeholder="Search tickets by subject or ID…"
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
            {[
              "Open",
              "In Progress",
              "Waiting for Customer",
              "Escalated to Admin",
              "Solved",
              "Closed",
              "Canceled",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <button
            className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
            onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
          >
            <ArrowUpDown size={13} /> {sortDir === "desc" ? "Newest" : "Oldest"}
          </button>
          <span className={styles.pageInfo}>{filtered.length} tickets</span>
        </div>

        {/* Ticket list */}
        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <MessageSquare
              size={36}
              style={{ color: "var(--charcoal-muted)" }}
            />
            <h3>No tickets found</h3>
            <p>
              You haven't raised any support tickets yet. We're here to help!
            </p>
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={() => setShowCreate(true)}
              disabled={hasActiveTicket}
            >
              <Plus size={14} /> Create Your First Ticket
            </button>
          </div>
        ) : (
          <div className={styles.ticketList}>
            {filtered.map((tk) => (
              <article
                key={tk.id}
                className={styles.ticketCard}
                onClick={() => openDetail(tk)}
              >
                <div className={styles.cardMain}>
                  <div className={styles.cardLeft}>
                    <div className={styles.cardTopRow}>
                      <span className={styles.ticketId}>
                        {tk.id.slice(0, 8)}…
                      </span>
                      <span className={styles.catTag}>
                        <Tag size={10} />
                        {tk.category}
                      </span>
                    </div>
                    <h3 className={styles.ticketSubject}>{tk.subject}</h3>
                    <div className={styles.ticketMeta}>
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
                  <div className={styles.cardRight}>
                    <StatusBadge status={tk.status} />
                    <button
                      className={styles.viewBtn}
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
      </div>

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreate}
        />
      )}
      <Footer />
    </div>
  );
}
