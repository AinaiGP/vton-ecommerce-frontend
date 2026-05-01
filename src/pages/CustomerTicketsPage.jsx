import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Search,
  MessageSquare,
  Clock,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  Paperclip,
  Send,
  X,
  AlertTriangle,
  FileText,
  ImageIcon,
  Headphones,
  Tag,
  RotateCcw,
  Package,
  ShoppingBag,
  Zap,
  User,
  Loader2,
} from "lucide-react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import apiClient, { multipartClient } from "../utils/apiClient";
import styles from "../styles/CustomerTickets.module.css";

const TICKET_TYPES = [
  { value: "GENERAL_SUPPORT", label: "General Support" },
  { value: "ORDER_DISPUTE", label: "Order Issue" },
  { value: "SYSTEM_BUG", label: "Technical Support / Bug" },
];

const STATUS_CFG = {
  OPEN: { color: "#ef4444", bg: "#fee2e2", label: "Open" },
  IN_PROGRESS: { color: "#f59e0b", bg: "#fef3c7", label: "In Progress" },
  WAITING_FOR_CUSTOMER: { color: "#8b5cf6", bg: "#f5f3ff", label: "Waiting" },
  SOLVED: { color: "#16a34a", bg: "#dcfce7", label: "Solved" },
  CLOSED: { color: "#94a3b8", bg: "#f1f5f9", label: "Closed" },
  ESCALATED_TO_ADMIN: { color: "#dc2626", bg: "#fff1f2", label: "Escalated" },
};

function StatusBadge({ status }) {
  const s = status?.toUpperCase();
  const c = STATUS_CFG[s] || { color: "#94a3b8", bg: "#f1f5f9", label: status };
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

function PriorityBadge({ priority }) {
  const p = priority?.charAt(0).toUpperCase() + priority?.slice(1).toLowerCase();
  const cfg = { High: "#ef4444", Medium: "#f59e0b", Low: "#16a34a" };
  return (
    <span
      className={styles.priorityBadge}
      style={{ color: cfg[p], background: (cfg[p] || "#94a3b8") + "18" }}
    >
      {p || priority}
    </span>
  );
}

function FileAttachment({ url }) {
  if (!url) return null;
  const name = url.split("/").pop();
  const isImg = /\.(jpg|jpeg|png|webp|gif)$/i.test(url);
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={styles.attachment}>
      {isImg ? <ImageIcon size={13} /> : <FileText size={13} />}
      <span>{name}</span>
    </a>
  );
}

/* ─── Create Ticket Modal ── */
function CreateTicketModal({ onSave, onClose }) {
  const [subject, setSubject] = useState("");
  const [type, setType] = useState(TICKET_TYPES[0].value);
  const [priority, setPriority] = useState("Medium");
  const [msg, setMsg] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({ subject, type, priority, description: msg, file });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <h2 className={styles.modalTitle}>Open New Support Ticket</h2>
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
                placeholder="Briefly describe the issue…"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Ticket Type</label>
                <select
                  className={styles.select}
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  {TICKET_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Priority</label>
                <select
                  className={styles.select}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Message *</label>
              <textarea
                className={styles.textarea}
                rows={4}
                placeholder="Provide as much detail as possible…"
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Attachment (Optional)</label>
              <div
                className={styles.attachZone}
                onClick={() => fileRef.current?.click()}
              >
                <Paperclip size={20} style={{ color: "var(--burgundy)" }} />
                <div>
                  <p className={styles.attachTitle}>
                    {file ? file.name : "Click to upload file"}
                  </p>
                  <p className={styles.attachSub}>Max 10 MB (Image/PDF)</p>
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
                onChange={(e) => setFile(e.target.files[0] || null)}
              />
            </div>
          </div>
          <div className={styles.modalFoot}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnOutline}`}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={loading}
            >
              {loading ? <Loader2 size={14} className={styles.spin} /> : <Plus size={14} />} 
              Create Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Ticket Detail View ── */
function TicketDetail({ ticketId, onBack }) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const bottomRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages]);

  const fetchTicket = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/customers/support/tickets/${ticketId}`);
      setTicket(res.data);
    } catch (err) {
      console.error("Failed to fetch ticket detail", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!reply.trim() && !file) return;

    setSending(true);
    try {
      const res = await apiClient.post(`/customers/support/tickets/${ticketId}/messages`, {
        content: reply
      });
      const messageId = res.data.id;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        await multipartClient.post(`/customers/support/tickets/${ticketId}/messages/${messageId}/attachments`, formData);
      }

      setReply("");
      setFile(null);
      fetchTicket();
    } catch (err) {
      alert("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleCloseTicket = async () => {
    try {
      await apiClient.patch(`/customers/support/tickets/${ticketId}/close`);
      setConfirmClose(false);
      fetchTicket();
    } catch (err) {
      alert("Failed to close ticket.");
    }
  };

  if (loading || !ticket) {
    return (
      <div className={styles.detailShell} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <Loader2 size={32} className={styles.spin} style={{ color: 'var(--charcoal-muted)' }} />
      </div>
    );
  }

  const isClosed = ticket.status === "CLOSED" || ticket.status === "SOLVED";

  return (
    <div className={styles.detailShell}>
      <div className={styles.detailHeader}>
        <button className={styles.backBtn} onClick={onBack}>
          <ChevronLeft size={16} /> All Tickets
        </button>
        <div className={styles.detailTitleGroup}>
          <span className={styles.detailId}>#{ticket.id.slice(0, 8)}</span>
          <h2 className={styles.detailTitle}>{ticket.subject}</h2>
        </div>
        <div className={styles.detailBadges}>
          <span className={styles.catTag}>
            <Tag size={11} />
            {ticket.type}
          </span>
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
        </div>
        {!isClosed && (
          <button
            className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
            onClick={() => setConfirmClose(true)}
          >
            <XCircle size={13} /> Close Ticket
          </button>
        )}
      </div>

      <div className={styles.chatArea}>
        <div className={styles.sysEvent}>
          <span>Ticket created · {new Date(ticket.createdAt).toLocaleString()}</span>
        </div>
        {ticket.messages.map((msg, i) => {
          const isSystem = msg.isSystemMessage;
          const isMe = msg.senderRole === "CUSTOMER";
          
          if (isSystem) {
            return (
              <div key={i} className={styles.sysEvent}>
                <span>{msg.content} · {new Date(msg.createdAt).toLocaleTimeString()}</span>
              </div>
            );
          }

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
                <p className={styles.bubbleText}>{msg.content}</p>
                {msg.attachments?.map((att, idx) => (
                  <FileAttachment key={idx} url={att} />
                ))}
                <span className={styles.bubbleTime}>{new Date(msg.createdAt).toLocaleTimeString()}</span>
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
              disabled={sending}
            >
              <Paperclip size={17} />
            </button>
            <input
              ref={fileRef}
              type="file"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files[0] || null)}
            />
            <input
              className={styles.replyInput}
              placeholder="Type your message…"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              disabled={sending}
            />
            <button
              type="submit"
              className={styles.sendBtn}
              disabled={(!reply.trim() && !file) || sending}
            >
              {sending ? <Loader2 size={16} className={styles.spin} /> : <Send size={16} />}
            </button>
          </div>
        </form>
      ) : (
        <div className={styles.closedBanner}>
          <CheckCircle2 size={18} />
          <p>This ticket has been resolved and is now closed.</p>
          <button className={styles.reopenBtn} onClick={() => alert("Please open a new ticket for further assistance.")}>
            Need more help?
          </button>
        </div>
      )}

      {confirmClose && (
        <div className={styles.backdrop} onClick={() => setConfirmClose(false)}>
          <div className={styles.modalSm} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalBody} style={{ textAlign: "center", padding: "30px 20px" }}>
              <AlertTriangle
                size={40}
                style={{ color: "#ef4444", marginBottom: 12 }}
              />
              <h3 style={{ fontSize: 18, marginBottom: 8 }}>Close Ticket?</h3>
              <p style={{ fontSize: 14, color: "var(--charcoal-muted)", marginBottom: 20 }}>
                Are you sure you want to close this ticket? You won't be able to send more messages.
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button
                  className={`${styles.btn} ${styles.btnOutline}`}
                  onClick={() => setConfirmClose(false)}
                >
                  Cancel
                </button>
                <button
                  className={`${styles.btn} ${styles.btnDanger}`}
                  onClick={handleCloseTicket}
                >
                  Yes, Close It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Hub Page ─── */
export default function CustomerTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/customers/support/tickets");
      setTickets(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      const res = await apiClient.post("/customers/support/tickets", {
        subject: data.subject,
        type: data.type,
        priority: data.priority,
        description: data.description
      });
      
      if (data.file && res.data.id) {
        // Attachment for the first message (message ID is in the response usually, or we find it)
        // Actually the backend creates the first message. Let's find its ID or the ticket ID endpoint.
        const ticketRes = await apiClient.get(`/customers/support/tickets/${res.data.id}`);
        const firstMsgId = ticketRes.data.messages?.[0]?.id;
        if (firstMsgId) {
          const formData = new FormData();
          formData.append("file", data.file);
          await multipartClient.post(`/customers/support/tickets/${res.data.id}/messages/${firstMsgId}/attachments`, formData);
        }
      }

      setShowCreate(false);
      fetchTickets();
    } catch (err) {
      alert("Failed to create ticket.");
    }
  };

  const filtered = tickets.filter((t) => {
    const matchesSearch =
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || (statusFilter === "Active" ? (t.status !== "CLOSED" && t.status !== "SOLVED") : t.status === statusFilter);
    return matchesSearch && matchesStatus;
  });

  if (selectedId) {
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
        <main className={styles.pageContent} style={{ flex: 1 }}>
          <TicketDetail
            ticketId={selectedId}
            onBack={() => {
              setSelectedId(null);
              fetchTickets();
            }}
          />
        </main>
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
      <main className={styles.pageContent} style={{ flex: 1 }}>
        <div className={styles.pageHead}>
          <div>
            <h1 className={styles.pageTitle}>Support Center</h1>
            <p className={styles.pageSub}>
              Need help? Open a ticket and our team will get back to you.
            </p>
          </div>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={() => setShowCreate(true)}
          >
            <Plus size={16} /> New Support Ticket
          </button>
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <MessageSquare size={20} style={{ color: "#4f46e5" }} />
            <div>
              <p className={styles.statVal}>{tickets.length}</p>
              <p className={styles.statLabel}>Total Tickets</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <Clock size={20} style={{ color: "#f59e0b" }} />
            <div>
              <p className={styles.statVal}>{tickets.filter(t => t.status !== 'CLOSED' && t.status !== 'SOLVED').length}</p>
              <p className={styles.statLabel}>Active Tickets</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <CheckCircle2 size={20} style={{ color: "#16a34a" }} />
            <div>
              <p className={styles.statVal}>{tickets.filter(t => t.status === 'SOLVED').length}</p>
              <p className={styles.statLabel}>Resolved</p>
            </div>
          </div>
        </div>

        <div className={styles.tableCard}>
          <div className={styles.tableControls}>
            <div className={styles.searchBox}>
              <Search size={16} />
              <input
                placeholder="Search by subject or ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className={styles.filters}>
              {["All", "Active", "CLOSED", "SOLVED"].map((f) => (
                <button
                  key={f}
                  className={`${styles.filterTab} ${statusFilter === f ? styles.filterActive : ""}`}
                  onClick={() => setStatusFilter(f)}
                >
                  {f === 'CLOSED' ? 'Closed' : f === 'SOLVED' ? 'Solved' : f}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.tableWrap}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <Loader2 size={24} className={styles.spin} />
              </div>
            ) : filtered.length === 0 ? (
              <div className={styles.empty}>
                <MessageSquare size={40} strokeWidth={1} />
                <p>No tickets found.</p>
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Subject</th>
                    <th>Type</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedId(t.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <td className={styles.idCell}>#{t.id.slice(0, 8)}</td>
                      <td className={styles.subjCell}>{t.subject}</td>
                      <td>
                        <span className={styles.catTag}>{t.type}</span>
                      </td>
                      <td>
                        <PriorityBadge priority={t.priority} />
                      </td>
                      <td>
                        <StatusBadge status={t.status} />
                      </td>
                      <td className={styles.dateCell}>{new Date(t.updatedAt).toLocaleDateString()}</td>
                      <td className={styles.actionCell}>
                        <ChevronRight size={18} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {showCreate && (
        <CreateTicketModal
          onSave={handleCreate}
          onClose={() => setShowCreate(false)}
        />
      )}

      <Footer />
    </div>
  );
}
