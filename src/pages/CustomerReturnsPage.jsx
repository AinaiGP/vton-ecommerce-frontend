import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Search,
  Package,
  ChevronRight,
  X,
  Paperclip,
  Send,
  Clock,
  ImageIcon,
  FileText,
  CheckCircle,
} from "lucide-react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import styles from "../styles/CustomerTickets.module.css";
import apiClient, { multipartClient } from "../utils/apiClient";

/* ─── Return reasons (free text options matching ReturnRequestDto expectation) ─── */
const RETURN_REASONS = [
  "Wrong size / doesn't fit",
  "Received wrong item",
  "Item damaged or defective",
  "Not as described / different from photos",
  "Changed my mind",
  "Late delivery",
  "Other",
];

/* ─── Return status uses exact ReturnStatus enum values from backend ─── */
// Returns are stored as support tickets with type=RETURN_REQUEST
// The ticket status maps to return progress
const STATUS_CFG = {
  // Ticket statuses (returns go through the ticket system)
  OPEN:               { color: "#f59e0b", bg: "#fef3c7", label: "Pending" },
  IN_PROGRESS:        { color: "#3b82f6", bg: "#eff6ff", label: "In Review" },
  AWAITING_RESPONSE:  { color: "#8b5cf6", bg: "#f5f3ff", label: "Vendor Replied" },
  ESCALATED:          { color: "#7c3aed", bg: "#f5f3ff", label: "Escalated to Admin" },
  RESOLVED:           { color: "#16a34a", bg: "#dcfce7", label: "Approved" },
  CLOSED:             { color: "#94a3b8", bg: "#f1f5f9", label: "Closed" },
  CANCELED:           { color: "#ef4444", bg: "#fee2e2", label: "Rejected" },
};

function getStatusLabel(status) {
  return STATUS_CFG[status]?.label || status;
}

function extractLegacyAttachment(content) {
  if (!content) return { text: "", urls: [] };
  const match = content.match(/\(attachment:\s*(https?:\/\/[^\s)]+)\)/i);
  if (!match) return { text: content, urls: [] };
  const cleaned = content.replace(match[0], "").trim();
  return { text: cleaned || "Attachment", urls: [match[1]] };
}

/* ─── Map a RETURN_REQUEST ticket to the shape the JSX expects ─── */
function mapReturnTicket(ticket) {
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
          String(m.senderRole || "").toLowerCase() === "customer"
            ? "customer"
            : "vendor",
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
    id:         ticket.id,
    orderId:    ticket.orderId || "—",
    product:    ticket.subject || "Return Request",
    reason:     ticket.returnReason || "—",
    status:     ticket.status, // raw enum value
    created:    new Date(ticket.createdAt).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    }),
    updated:    new Date(ticket.updatedAt).toLocaleString("en-US", {
      month: "short", day: "numeric",
    }),
    vendorName: "Vendor",
    messages,
    _raw: ticket,
  };
}

/* ─── Map an order to the selector shape ─── */
function mapOrderForSelector(o) {
  return {
    id:    o.id,
    number: o.orderNumber || o.id,
    date:  new Date(o.createdAt).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    }),
    items: (o.items || []).map((item) => ({
      id:   item.id,
      name: item.productName,
      qty:  item.quantity,
    })),
  };
}

/* ─── Status Badge ─── */
function StatusBadge({ status }) {
  const c = STATUS_CFG[status] || { color: "#94a3b8", bg: "#f1f5f9", label: status };
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

function isImageUrl(url) {
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(url);
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
    <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
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

/* ─── Create Return Modal ─── */
function CreateReturnModal({ onClose, onSubmit, myOrders }) {
  const [selectedOrderId, setSelectedOrderId] = useState(myOrders[0]?.id || "");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [reason, setReason] = useState(RETURN_REASONS[0]);
  const [desc, setDesc] = useState("");
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

  const selectedOrder = myOrders.find((o) => o.id === selectedOrderId);

  useEffect(() => {
    if (selectedOrder?.items?.length > 0) {
      setSelectedItemId(selectedOrder.items[0].id);
    } else {
      setSelectedItemId("");
    }
  }, [selectedOrderId, selectedOrder]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItemId || !reason.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ orderId: selectedOrderId, itemId: selectedItemId, reason, desc, file });
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to submit return request.";
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <h2 className={styles.modalTitle}>Submit Return Request</h2>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={17} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Select Order *</label>
              <select
                className={styles.select}
                value={selectedOrderId}
                onChange={(e) => {
                  setSelectedOrderId(e.target.value);
                  setSelectedItemId("");
                }}
              >
                {myOrders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.number} — {o.date}
                  </option>
                ))}
              </select>
            </div>
            {selectedOrder && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Item to Return *</label>
                <select
                  className={styles.select}
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  required
                >
                  <option value="">Select item…</option>
                  {selectedOrder.items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
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
                    {file ? file.name : "Click to attach proof or item photo"}
                  </p>
                  <p className={styles.attachSub}>
                    {file
                      ? `${(file.size / 1024).toFixed(1)} KB`
                      : "JPG, PNG, WebP — Max 5 MB"}
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
                accept="image/jpeg,image/png,image/webp,image/gif"
                style={{ display: "none" }}
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
            {error && (
              <p style={{ color: "#dc2626", fontSize: 12 }}>{error}</p>
            )}
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
              disabled={!selectedItemId || submitting}
            >
              <Send size={14} /> {submitting ? "Submitting…" : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Return Detail (chat) ─── */
function ReturnDetail({ ret, onBack, onReply, onCancel, onImageClick }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const fileRef = useRef(null);
  const isClosed =
    ret.status === "RESOLVED" ||
    ret.status === "CLOSED" ||
    ret.status === "CANCELED";

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() && !file) return;
    setSending(true);
    try {
      await onReply(ret.id, text, file);
      setText("");
      setFile(null);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.detailShell}>
      <div className={styles.detailHeader}>
        <button className={styles.backBtn} onClick={onBack}>
          ← All Return Requests
        </button>
        <div className={styles.detailTitleGroup}>
          <span className={styles.detailId}>{ret.id.slice(0, 8)}…</span>
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
        {!isClosed && (ret.status === "OPEN" || ret.status === "AWAITING_RESPONSE") && (
          <button
            className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
            onClick={() => setShowCancelModal(true)}
            style={{ marginLeft: 12 }}
          >
            Cancel Request
          </button>
        )}
        {showCancelModal && (
          <div className={styles.backdrop} onClick={() => setShowCancelModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
              <div className={styles.modalHead}>
                <h2 className={styles.modalTitle}>Cancel Return</h2>
                <button className={styles.modalClose} onClick={() => setShowCancelModal(false)}>
                  <X size={17} />
                </button>
              </div>
              <div className={styles.modalBody}>
                <p style={{ margin: 0, fontSize: 14, color: "var(--charcoal-muted)" }}>
                  Are you sure you want to cancel this return request? This action cannot be undone.
                </p>
              </div>
              <div className={styles.modalFoot}>
                <button
                  className={`${styles.btn} ${styles.btnOutline}`}
                  onClick={() => setShowCancelModal(false)}
                  disabled={canceling}
                >
                  Keep Request
                </button>
                <button
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  style={{ background: "#dc2626", borderColor: "#dc2626" }}
                  onClick={async () => {
                    setCanceling(true);
                    await onCancel(ret.id);
                    setCanceling(false);
                    setShowCancelModal(false);
                  }}
                  disabled={canceling}
                >
                  {canceling ? "Canceling…" : "Yes, Cancel It"}
                </button>
              </div>
            </div>
          </div>
        )}
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
                <AttachmentList attachments={msg.attachments} onImageClick={onImageClick} />
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
              disabled={(!text.trim() && !file) || sending}
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      ) : (
        <div className={styles.closedBanner}>
          <CheckCircle size={16} /> This return request is{" "}
          {STATUS_CFG[ret.status]?.label?.toLowerCase() || ret.status.toLowerCase()}.
        </div>
      )}
    </div>
  );
}

/* ─── Main page ─── */
export default function CustomerReturnsPage() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myOrders, setMyOrders] = useState([]);
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fullscreenImage, setFullscreenImage] = useState(null);

  /* ── Fetch return requests (RETURN_REQUEST tickets) on mount ── */
  useEffect(() => {
    let cancelled = false;
    async function fetchReturns() {
      setLoading(true);
      try {
        const res = await apiClient.get("/customers/support/tickets", {
          params: { type: "RETURN_REQUEST", limit: 50, page: 1 },
        });
        if (!cancelled) {
          const raw = res.data?.data || res.data || [];
          setReturns(Array.isArray(raw) ? raw.map(mapReturnTicket) : []);
        }
      } catch {
        if (!cancelled) setReturns([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchReturns();
    return () => { cancelled = true; };
  }, []);

  /* ── Fetch orders for the create modal ── */
  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await apiClient.get("/customers/orders", {
          params: { limit: 50, page: 1 },
        });
        const raw = res.data?.data || res.data || [];
        setMyOrders(Array.isArray(raw) ? raw.map(mapOrderForSelector) : []);
      } catch {
        setMyOrders([]);
      }
    }
    fetchOrders();
  }, []);

  /* ── Refetch return tickets ── */
  const refetchReturns = async () => {
    try {
      const res = await apiClient.get("/customers/support/tickets", {
        params: { type: "RETURN_REQUEST", limit: 50, page: 1 },
      });
      const raw = res.data?.data || res.data || [];
      setReturns(Array.isArray(raw) ? raw.map(mapReturnTicket) : []);
    } catch {
      // silent
    }
  };

  /* ── Filter ── */
  const filtered = returns.filter((r) => {
    const ms =
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.product.toLowerCase().includes(search.toLowerCase()) ||
      String(r.orderId).toLowerCase().includes(search.toLowerCase());
    const mv = statusFilter === "All" || r.status === statusFilter;
    return ms && mv;
  });

  /* ── Create return ── */
  const handleCreate = async ({ orderId, itemId, reason, desc, file }) => {
    // POST to the order return endpoint — returns a ticket
    const res = await apiClient.post(`/customers/orders/${orderId}/return`, {
      orderItemId: itemId,
      quantity: 1,
      reason: reason,
      ...(desc ? { note: desc } : {}),
    });

    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);
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
        console.error("Failed to upload return attachment:", err);
      }
    }

    setShowCreate(false);
    await refetchReturns();
    // Open the newly created ticket with full detail (messages)
    const newTicketId = res.data?.id;
    if (newTicketId) {
      try {
        setLoading(true);
        const detailRes = await apiClient.get(`/customers/support/tickets/${newTicketId}`);
        setSelected(mapReturnTicket(detailRes.data));
        setView("detail");
      } catch (err) {
        console.error("Failed to fetch new return detail:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  /* ── Reply to return (send message on the ticket) ── */
  const handleReply = async (ticketId, text, file) => {
    let attachmentUrl = null;

    // If there is a file, upload it to the attachment endpoint first
    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await multipartClient.post(
          `/customers/support/tickets/${ticketId}/messages/attachments`,
          formData,
        );
        attachmentUrl = uploadRes.data?.url || null;
      } catch (err) {
        console.error("Failed to upload return message attachment:", err);
        throw err;
      }
    }

    const content = text?.trim() || "Attachment";
    await apiClient.post(`/customers/support/tickets/${ticketId}/messages`, {
      content,
      attachments: attachmentUrl ? [attachmentUrl] : undefined,
    });

    // Refetch the ticket to get updated messages
    const res = await apiClient.get(`/customers/support/tickets/${ticketId}`);
    const updatedReturn = mapReturnTicket(res.data);
    setSelected(updatedReturn);
    setReturns((prev) =>
      prev.map((r) => (r.id === ticketId ? updatedReturn : r)),
    );
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
            onCancel={async (id) => {
              try {
                await apiClient.patch(`/customers/support/tickets/${id}/cancel`);
                await refetchReturns();
                const res = await apiClient.get(`/customers/support/tickets/${id}`);
                setSelected(mapReturnTicket(res.data));
              } catch (err) {
                console.error("Failed to cancel return:", err);
              }
            }}
            onImageClick={(url) => setFullscreenImage(url)}
          />
        </div>
        {fullscreenImage && (
          <div className={styles.fullscreenOverlay} onClick={() => setFullscreenImage(null)}>
            <div className={styles.fullscreenContent}>
              <img src={fullscreenImage} alt="Preview" className={styles.fullscreenImg} />
              <button className={styles.fullscreenClose} onClick={() => setFullscreenImage(null)}>
                <X size={24} />
              </button>
            </div>
          </div>
        )}
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
            {Object.entries(STATUS_CFG).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
          <span className={styles.pageInfo}>{filtered.length} requests</span>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
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
                onClick={async () => {
                  try {
                    setLoading(true);
                    const res = await apiClient.get(`/customers/support/tickets/${ret.id}`);
                    setSelected(mapReturnTicket(res.data));
                    setView("detail");
                  } catch (err) {
                    console.error("Failed to fetch return detail:", err);
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                <div className={styles.cardMain}>
                  <div className={styles.cardLeft}>
                    <div className={styles.cardTopRow}>
                      <span className={styles.ticketId}>{ret.id.slice(0, 8)}…</span>
                      <span className={styles.catTag}>{String(ret.orderId).slice(0, 8)}…</span>
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
          myOrders={myOrders}
        />
      )}
      <Footer />
    </div>
  );
}
