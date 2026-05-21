import { useState, useEffect, useCallback, useRef } from "react";
import {
  MessageSquare,
  Search,
  X,
  Send,
  Paperclip,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  Shield,
  FileText,
  User,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import apiClient, { multipartClient } from "../../utils/apiClient";
import t from "../../styles/AdminTable.module.css";

const TICKET_TYPES = [
  { value: "GENERAL_SUPPORT", label: "General Support" },
  { value: "SYSTEM_BUG", label: "Technical Bug" },
  { value: "ORDER_DISPUTE", label: "Order Dispute" },
  { value: "RETURN_REQUEST", label: "Return Request" },
];

const TICKET_STATUSES = [
  "PENDING",
  "OPEN",
  "IN_PROGRESS",
  "AWAITING_RESPONSE",
  "ESCALATED",
  "RESOLVED",
  "CLOSED",
  "CANCELED",
];

const STATUS_CFG = {
  PENDING: { color: "#64748b", bg: "#f1f5f9", label: "Pending" },
  OPEN: { color: "#ef4444", bg: "#fee2e2", label: "Open" },
  IN_PROGRESS: { color: "#f59e0b", bg: "#fef3c7", label: "In Progress" },
  AWAITING_RESPONSE: { color: "#8b5cf6", bg: "#f5f3ff", label: "Awaiting Response" },
  ESCALATED: { color: "#dc2626", bg: "#fff1f2", label: "Escalated" },
  RESOLVED: { color: "#16a34a", bg: "#dcfce7", label: "Resolved" },
  CLOSED: { color: "#94a3b8", bg: "#f1f5f9", label: "Closed" },
  CANCELED: { color: "#94a3b8", bg: "#f1f5f9", label: "Canceled" },
};

const PRIORITY_CFG = {
  LOW: { color: "#16a34a", bg: "#dcfce7", label: "Low" },
  NORMAL: { color: "#ca8a04", bg: "#fef9c3", label: "Normal" },
  HIGH: { color: "#dc2626", bg: "#fee2e2", label: "High" },
  URGENT: { color: "#7c3aed", bg: "#f5f3ff", label: "Urgent" },
};

const TERMINAL_STATUSES = ["RESOLVED", "CLOSED", "CANCELED"];

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

function mapTicket(ticket) {
  const messages = (ticket.messages || [])
    .filter((m) => !m.isSystemMessage)
    .map((m) => {
      const legacy = extractLegacyAttachment(m.content);
      const attachmentUrls = [...(m.attachments || []), ...legacy.urls].filter(Boolean);
      const attachments = attachmentUrls.map((url) => ({
        url,
        name: url.split("/").pop() || "Attachment",
        isImage: isImageUrl(url),
      }));
      const senderRole = String(m.senderRole || "").toLowerCase();
      return {
        from: senderRole === "admin" ? "admin" : "user",
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

  const typeLabel =
    TICKET_TYPES.find((tp) => tp.value === ticket.type)?.label || ticket.type;

  return {
    id: ticket.id,
    subject: ticket.subject,
    typeLabel,
    type: ticket.type,
    status: ticket.status,
    priority: ticket.priority,
    creatorRole: ticket.creatorRole,
    createdAt: new Date(ticket.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    messages,
    assigneeId: ticket.assigneeId,
  };
}

function fmt(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }) {
  const c = STATUS_CFG[status] || { color: "#94a3b8", bg: "#f1f5f9", label: status };
  return (
    <span className={t.badge} style={{ background: c.bg, color: c.color }}>
      <span className={t.badgeDot} style={{ background: c.color }} />
      {c.label}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const c = PRIORITY_CFG[priority] || { color: "#64748b", bg: "#f1f5f9", label: priority };
  return (
    <span className={t.badge} style={{ background: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
}

function AttachmentList({ attachments }) {
  if (!attachments?.length) return null;
  return (
    <div className={t.ticketAttachList}>
      {attachments.map((att) =>
        att.isImage ? (
          <a
            key={att.url}
            href={att.url}
            target="_blank"
            rel="noreferrer"
            className={t.ticketAttachImg}
          >
            <img src={att.url} alt={att.name} />
          </a>
        ) : (
          <a
            key={att.url}
            href={att.url}
            target="_blank"
            rel="noreferrer"
            className={t.ticketAttach}
          >
            <FileText size={12} /> {att.name}
          </a>
        ),
      )}
    </div>
  );
}

function TicketChatModal({ ticket, onClose, onAction }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [resolveNote, setResolveNote] = useState("");
  const [showResolve, setShowResolve] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const fileRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket.messages]);

  const isTerminal = TERMINAL_STATUSES.includes(ticket.status);
  const canClaim = ticket.status === "ESCALATED" && !ticket.assigneeId;
  const canResolve = !isTerminal && ticket.status !== "PENDING";
  const canClose = !isTerminal;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() && !file) return;
    setSending(true);
    try {
      let attachmentUrl = null;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await multipartClient.post(
          `/admin/support/tickets/${ticket.id}/messages/attachments`,
          formData,
        );
        attachmentUrl = res.data?.url || null;
      }
      const content = text.trim() || "Attachment";
      await apiClient.post(`/admin/support/tickets/${ticket.id}/messages`, {
        content,
        attachments: attachmentUrl ? [attachmentUrl] : undefined,
      });
      setText("");
      setFile(null);
      await onAction("refetch", ticket.id);
    } finally {
      setSending(false);
    }
  };

  const handleClaim = async () => {
    setActionLoading(true);
    try {
      await apiClient.patch(`/admin/support/tickets/${ticket.id}/claim`);
      await onAction("refetch", ticket.id);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async () => {
    setActionLoading(true);
    try {
      await apiClient.patch(`/admin/support/tickets/${ticket.id}/resolve`, {
        resolutionNote: resolveNote || undefined,
      });
      setShowResolve(false);
      await onAction("refetch", ticket.id);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClose = async () => {
    setActionLoading(true);
    try {
      await apiClient.patch(`/admin/support/tickets/${ticket.id}/close`);
      await onAction("refetch", ticket.id);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className={t.modalBackdrop} onClick={onClose}>
      <div
        className={`${t.modal} ${t.modalLg} ${t.ticketChatModal}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={t.modalHead}>
          <div className={t.ticketChatHeadInfo}>
            <h2 className={t.modalTitle}>{ticket.subject}</h2>
            <div className={t.ticketChatMeta}>
              <StatusBadge status={ticket.status} />
              {ticket.priority && <PriorityBadge priority={ticket.priority} />}
              <span className={t.pageInfo}>
                {ticket.typeLabel} · {ticket.createdAt}
              </span>
            </div>
          </div>
          <div className={t.ticketChatActions}>
            {canClaim && (
              <button
                className={`${t.btn} ${t.btnOutline} ${t.btnSm}`}
                onClick={handleClaim}
                disabled={actionLoading}
              >
                <Shield size={13} /> Claim
              </button>
            )}
            {showResolve ? (
              <>
                <button
                  className={`${t.btn} ${t.btnOutline} ${t.btnSm}`}
                  onClick={() => setShowResolve(false)}
                >
                  Cancel
                </button>
                <button
                  className={`${t.btn} ${t.btnPrimary} ${t.btnSm}`}
                  onClick={handleResolve}
                  disabled={actionLoading}
                >
                  <CheckCircle size={13} />
                  {actionLoading ? "Resolving…" : "Confirm Resolve"}
                </button>
              </>
            ) : (
              canResolve && (
                <button
                  className={`${t.btn} ${t.btnOutline} ${t.btnSm}`}
                  onClick={() => setShowResolve(true)}
                >
                  <CheckCircle size={13} /> Resolve
                </button>
              )
            )}
            {canClose && !showResolve && (
              <button
                className={`${t.btn} ${t.btnDanger} ${t.btnSm}`}
                onClick={handleClose}
                disabled={actionLoading}
              >
                <XCircle size={13} />
                {actionLoading ? "Closing…" : "Force Close"}
              </button>
            )}
            <button className={t.modalClose} onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {showResolve && (
          <div className={t.ticketResolveBar}>
            <input
              className={t.input}
              placeholder="Resolution note (optional)…"
              value={resolveNote}
              onChange={(e) => setResolveNote(e.target.value)}
            />
          </div>
        )}

        <div className={t.ticketChatArea}>
          <div className={t.ticketSysEvent}>
            <span>Ticket opened · {ticket.createdAt}</span>
          </div>
          {ticket.messages.map((msg, i) => {
            const isAdmin = msg.from === "admin";
            return (
              <div
                key={i}
                className={`${t.ticketMsgRow} ${isAdmin ? t.ticketMsgRight : t.ticketMsgLeft}`}
              >
                {!isAdmin && (
                  <div
                    className={t.ticketMsgAvatar}
                    style={{ background: "#4f46e5" }}
                  >
                    <User size={13} />
                  </div>
                )}
                <div
                  className={`${t.ticketBubble} ${isAdmin ? t.ticketBubbleAdmin : t.ticketBubbleUser}`}
                >
                  <p className={t.ticketBubbleText}>{msg.text}</p>
                  <AttachmentList attachments={msg.attachments} />
                  <span className={t.ticketBubbleTime}>{msg.time}</span>
                </div>
                {isAdmin && (
                  <div
                    className={t.ticketMsgAvatar}
                    style={{ background: "var(--adm-accent)" }}
                  >
                    <Shield size={13} />
                  </div>
                )}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {!isTerminal ? (
          <form className={t.ticketReplyBox} onSubmit={handleSend}>
            {file && (
              <div className={t.ticketFileChip}>
                <Paperclip size={12} />
                <span>{file.name}</span>
                <button type="button" onClick={() => setFile(null)}>
                  <X size={11} />
                </button>
              </div>
            )}
            <div className={t.ticketReplyRow}>
              <button
                type="button"
                className={t.ticketAttachBtn}
                onClick={() => fileRef.current?.click()}
                title="Attach image"
              >
                <Paperclip size={16} />
              </button>
              <input
                type="file"
                ref={fileRef}
                style={{ display: "none" }}
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => setFile(e.target.files[0] || null)}
              />
              <textarea
                className={t.ticketReplyInput}
                rows={2}
                placeholder="Reply as Admin…"
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
                className={t.ticketSendBtn}
                disabled={(!text.trim() && !file) || sending}
              >
                <Send size={15} />
              </button>
            </div>
          </form>
        ) : (
          <div className={t.ticketClosedBanner}>
            <CheckCircle size={14} />
            This ticket is {STATUS_CFG[ticket.status]?.label?.toLowerCase() || "closed"}.
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [escalatedOnly, setEscalatedOnly] = useState(false);
  const [claimedByMe, setClaimedByMe] = useState(false);
  const [active, setActive] = useState(null);
  const [error, setError] = useState(null);

  const fetchTickets = useCallback(() => {
    setLoading(true);
    const params = { page, limit };
    if (statusFilter) params.status = statusFilter;
    if (typeFilter) params.type = typeFilter;
    if (escalatedOnly) params.escalatedOnly = true;
    if (claimedByMe) params.claimedByMe = true;
    apiClient
      .get("/admin/support/tickets", { params })
      .then((r) => {
        let data = r.data.data || r.data || [];
        if (search) {
          const q = search.toLowerCase();
          data = data.filter(
            (tk) =>
              tk.subject?.toLowerCase().includes(q) ||
              tk.id?.toLowerCase().includes(q),
          );
        }
        setTickets(data);
        setTotal(r.data.total ?? data.length);
      })
      .catch(() => setError("Failed to load tickets."))
      .finally(() => setLoading(false));
  }, [page, limit, statusFilter, typeFilter, escalatedOnly, claimedByMe, search]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    const id = setInterval(fetchTickets, 30000);
    return () => clearInterval(id);
  }, [fetchTickets]);

  const openTicket = async (tk) => {
    try {
      const res = await apiClient.get(`/admin/support/tickets/${tk.id}`);
      setActive(mapTicket(res.data));
    } catch {
      setError("Failed to load ticket details.");
    }
  };

  const handleAction = async (type, id) => {
    if (type === "refetch") {
      const res = await apiClient.get(`/admin/support/tickets/${id}`);
      const updated = mapTicket(res.data);
      setActive(updated);
      fetchTickets();
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <AdminLayout
      pageTitle="Tickets Management"
      pageSubtitle="Full control over all customer, vendor, and support tickets."
      breadcrumb="Tickets"
    >
      {error && (
        <div
          style={{
            marginBottom: 12,
            padding: "10px 16px",
            borderRadius: 8,
            background: "#fee2e2",
            color: "#dc2626",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {error}
          <button
            onClick={() => setError(null)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#dc2626",
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className={t.toolbar}>
        <div className={t.toolbarLeft}>
          <div className={t.searchBox}>
            <Search size={14} className={t.searchIcon} />
            <input
              className={t.searchInput}
              placeholder="Search by subject or ID…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <select
            className={t.filterSelect}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Status</option>
            {TICKET_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_CFG[s]?.label || s}
              </option>
            ))}
          </select>
          <select
            className={t.filterSelect}
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Types</option>
            {TICKET_TYPES.map((tp) => (
              <option key={tp.value} value={tp.value}>
                {tp.label}
              </option>
            ))}
          </select>
          <label className={t.ticketEscalatedCheck}>
            <input
              type="checkbox"
              checked={escalatedOnly}
              onChange={(e) => {
                setEscalatedOnly(e.target.checked);
                setPage(1);
              }}
            />
            Escalated only
          </label>
          <label className={t.ticketEscalatedCheck}>
            <input
              type="checkbox"
              checked={claimedByMe}
              onChange={(e) => {
                setClaimedByMe(e.target.checked);
                setPage(1);
              }}
            />
            Claimed by me
          </label>
        </div>
        <span className={t.pageInfo}>{total} tickets</span>
      </div>

      <div className={t.tableCard}>
        <div className={t.tableWrap}>
          <table className={t.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Subject</th>
                <th>Type</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Creator Role</th>
                <th>Assignee</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={9}>
                      <span className={`${t.skeleton} ${t.skeletonRow}`} />
                    </td>
                  </tr>
                ))
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className={t.emptyState}>
                      <div className={t.emptyIcon}>
                        <MessageSquare size={24} />
                      </div>
                      <h3 className={t.emptyTitle}>No tickets found</h3>
                      <p className={t.emptyText}>
                        No tickets match your current filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                tickets.map((tk, i) => (
                  <tr key={tk.id}>
                    <td>{(page - 1) * limit + i + 1}</td>
                    <td className={t.ticketSubjectCell}>{tk.subject}</td>
                    <td className={t.ticketTypeCell}>
                      {TICKET_TYPES.find((tp) => tp.value === tk.type)?.label ||
                        tk.type}
                    </td>
                    <td>
                      {tk.priority ? (
                        <PriorityBadge priority={tk.priority} />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <StatusBadge status={tk.status} />
                    </td>
                    <td className={t.ticketRoleCell}>
                      {tk.creatorRole
                        ?.toLowerCase()
                        .replace(/_/g, " ") || "—"}
                    </td>
                    <td className={t.ticketTypeCell}>
                      {tk.assigneeId ? (
                        String(tk.assigneeRole || "").toUpperCase() === "ADMIN" ? (
                          <span className={t.badge} style={{ background: "#fee2e2", color: "#dc2626" }}>
                            Admin claimed
                          </span>
                        ) : (
                          <span className={t.badge} style={{ background: "#dbeafe", color: "#1d4ed8" }}>
                            Support claimed
                          </span>
                        )
                      ) : tk.status === "ESCALATED" ? (
                        <span className={t.badge} style={{ background: "#fff1f2", color: "#dc2626" }}>
                          Escalated — unclaimed
                        </span>
                      ) : (
                        <span style={{ color: "#94a3b8", fontSize: 12 }}>Unassigned</span>
                      )}
                    </td>
                    <td className={t.ticketTypeCell}>{fmt(tk.createdAt)}</td>
                    <td>
                      <button
                        className={`${t.actionBtn} ${t.approve}`}
                        title="Open Ticket"
                        onClick={() => openTicket(tk)}
                      >
                        <ArrowUpRight size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className={t.pagination}>
            <span className={t.pageInfo}>
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)}{" "}
              of {total}
            </span>
            <div className={t.pageButtons}>
              <button
                className={t.pageBtn}
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
              >
                ←
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => (
                <button
                  key={i + 1}
                  className={`${t.pageBtn} ${page === i + 1 ? t.pageBtnActive : ""}`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className={t.pageBtn}
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>

      {active && (
        <TicketChatModal
          ticket={active}
          onClose={() => setActive(null)}
          onAction={handleAction}
        />
      )}
    </AdminLayout>
  );
}
