import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
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
  Copy,
  Check,
  ChevronLeft,
  AlertCircle,
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

const PRIORITY_CFG = {
  LOW: { color: "#16a34a", bg: "#dcfce7", label: "Low" },
  NORMAL: { color: "#ca8a04", bg: "#fef9c3", label: "Normal" },
  HIGH: { color: "#dc2626", bg: "#fee2e2", label: "High" },
  URGENT: { color: "#7c3aed", bg: "#f5f3ff", label: "Urgent" },
};

const TYPE_CFG = {
  GENERAL_SUPPORT: { color: "#0369a1", bg: "#e0f2fe", label: "General Support" },
  GENERAL_INQUIRY: { color: "#0369a1", bg: "#e0f2fe", label: "General Inquiry" },
  SYSTEM_BUG: { color: "#b91c1c", bg: "#fee2e2", label: "System Bug" },
  TECHNICAL_ISSUE: { color: "#b91c1c", bg: "#fee2e2", label: "Technical Issue" },
  ORDER_DISPUTE: { color: "#c2410c", bg: "#ffedd5", label: "Order Dispute" },
  RETURN_REQUEST: { color: "#4d7c0f", bg: "#ecfccb", label: "Return Request" },
  ACCOUNT_SUPPORT: { color: "#6d28d9", bg: "#ede9fe", label: "Account Support" },
  VENDOR_VIOLATION: { color: "#be123c", bg: "#ffe4e6", label: "Vendor Violation" },
};

const TERMINAL_STATUSES = ["RESOLVED", "CLOSED", "CANCELED"];

function roleLabel(role) {
  switch (String(role || "").toLowerCase()) {
    case "admin":
      return "Admin";
    case "technical_support":
      return "Support";
    case "vendor":
      return "Vendor";
    case "customer":
      return "Customer";
    default:
      return "User";
  }
}

function roleAvatarColor(role) {
  switch (String(role || "").toLowerCase()) {
    case "admin":
      return "var(--adm-accent)";
    case "technical_support":
      return "#0369a1";
    case "vendor":
      return "#d97706";
    case "customer":
      return "#7c3aed";
    default:
      return "#64748b";
  }
}

function profileKeyLabel(role) {
  switch (String(role || "").toLowerCase()) {
    case "admin":
      return "Admin ID";
    case "technical_support":
      return "Support ID";
    case "vendor":
      return "Vendor ID";
    case "customer":
      return "Customer ID";
    default:
      return "Profile ID";
  }
}

function shortId(value) {
  if (!value) return "—";
  return `${String(value).slice(0, 8)}…`;
}

function getInitials(label) {
  if (!label) return "U";
  const parts = label.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
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

function mapTicket(ticket) {
  const messages = (ticket.messages || [])
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
      const senderRole = String(m.senderRole || "").toLowerCase();
      const sender = m.sender || null;
      const senderName = sender?.name || sender?.email || roleLabel(senderRole);
      const senderId = sender?.entityId || sender?.userId || m.senderId || null;
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
        senderName,
        senderId,
        senderRole,
        senderAvatar: sender?.avatarUrl || null,
        isSystemMessage: m.isSystemMessage,
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
    creatorId: ticket.creatorId,
    counterpartyId: ticket.counterpartyId,
    counterpartyRole: ticket.counterpartyRole,
    creator: ticket.creator,
    counterparty: ticket.counterparty,
    assignee: ticket.assignee,
    createdAt: new Date(ticket.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    messages,
    assigneeId: ticket.assigneeId,
    assigneeRole: ticket.assigneeRole,
    _raw: ticket,
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
  const c = STATUS_CFG[status] || {
    color: "#94a3b8",
    bg: "#f1f5f9",
    label: status,
  };
  return (
    <span className={t.badge} style={{ background: c.bg, color: c.color }}>
      <span className={t.badgeDot} style={{ background: c.color }} />
      {c.label}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const c = PRIORITY_CFG[priority] || {
    color: "#64748b",
    bg: "#f1f5f9",
    label: priority,
  };
  return (
    <span className={t.badge} style={{ background: c.bg, color: c.color, border: `1px solid ${c.color}30` }}>
      {c.label}
    </span>
  );
}

function TypeBadge({ type, typeLabel }) {
  const c = TYPE_CFG[type] || {
    color: "#475569",
    bg: "#f8fafc",
    label: typeLabel || type,
  };
  return (
    <span className={t.badge} style={{ background: c.bg, color: c.color, border: `1px solid ${c.color}30` }}>
      {c.label}
    </span>
  );
}

function RoleBadge({ role }) {
  if (!role) return "—";
  const norm = role.toLowerCase().replace(/_/g, " ");
  const isVendor = norm.includes("vendor");
  const bg = isVendor ? "#fef3c7" : "#e0e7ff";
  const color = isVendor ? "#d97706" : "#4338ca";
  return (
    <span className={t.badge} style={{ background: bg, color, border: `1px solid ${color}30`, textTransform: "capitalize" }}>
      {norm}
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

function TicketChatModal({ ticket, onClose, onAction, user }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [resolveNote, setResolveNote] = useState("");
  const [showResolve, setShowResolve] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [showUninvitedModal, setShowUninvitedModal] = useState(false);
  const fileRef = useRef(null);
  const bottomRef = useRef(null);

  const copyToClipboard = (value, key) => {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopiedId(key);
      setTimeout(() => setCopiedId(null), 1500);
    });
  };

  const isUninvited = () => {
    if (ticket && (ticket._raw?.type === "RETURN_REQUEST" || ticket._raw?.type === "ORDER_DISPUTE") && !ticket._raw?.supportInvited) {
      setShowUninvitedModal(true);
      return true;
    }
    return false;
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket.messages]);

  const isTerminal = TERMINAL_STATUSES.includes(ticket.status);
  const isClaimedByMe = ticket.assigneeId === user?.id;
  const hasAssignee = ticket.assigneeId != null;
  const canClaim = ticket.status === "ESCALATED";
  const canResolve = !isTerminal && ticket.status !== "PENDING";
  const canClose = !isTerminal;

  const handleSend = async (e) => {
    e.preventDefault();
    if (isUninvited()) return;
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
    if (isUninvited()) return;
    setActionLoading(true);
    try {
      await apiClient.patch(`/admin/support/tickets/${ticket.id}/claim`);
      await onAction("refetch", ticket.id);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async () => {
    if (isUninvited()) return;
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
    if (isUninvited()) return;
    setActionLoading(true);
    try {
      await apiClient.patch(`/admin/support/tickets/${ticket.id}/close`);
      await onAction("refetch", ticket.id);
    } finally {
      setActionLoading(false);
    }
  };

  const participants = [
    ticket.creatorId
      ? {
          label: "Creator",
          role: roleLabel(ticket.creatorRole),
          rawRole: ticket.creatorRole,
          userId: ticket.creatorId,
          entityId: ticket.creator?.entityId,
        }
      : null,
    ticket.counterpartyId
      ? {
          label: "Counterparty",
          role: roleLabel(ticket.counterpartyRole),
          rawRole: ticket.counterpartyRole,
          userId: ticket.counterpartyId,
          entityId: ticket.counterparty?.entityId,
        }
      : null,
    ticket.assigneeId
      ? {
          label: "Assignee",
          role: roleLabel(ticket.assigneeRole),
          rawRole: ticket.assigneeRole,
          userId: ticket.assigneeId,
          entityId: ticket.assignee?.entityId,
        }
      : null,
  ].filter(Boolean);

  return (
    <>
      {showUninvitedModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowUninvitedModal(false)}>
          <div style={{ background: "white", padding: 24, borderRadius: 12, maxWidth: 400, width: "100%" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ background: "#fee2e2", color: "#dc2626", padding: 8, borderRadius: "50%" }}>
                <AlertCircle size={24} />
              </div>
              <h3 style={{ margin: 0, fontSize: 18 }}>Action Not Allowed</h3>
            </div>
            <p style={{ color: "var(--adm-text-muted)", fontSize: 14, lineHeight: 1.5, marginBottom: 24 }}>
              You haven't been invited to this ticket yet. Customers and vendors must explicitly request support before you can interfere in their return or dispute.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className={`${t.btn} ${t.btnPrimary}`} onClick={() => setShowUninvitedModal(false)}>Understood</button>
            </div>
          </div>
        </div>
      )}

      <div className={t.ticketSplitLayout}>
        {/* Left: Conversation */}
        <div className={t.ticketSplitMain}>
          {/* Header */}
          <div className={t.modalHead}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className={t.backBtn} onClick={onClose} style={{ marginTop: 2 }}>
              <ChevronLeft size={18} /> Back
            </button>
            <div className={t.ticketChatHeadInfo}>
              <h2 className={t.modalTitle}>{ticket.subject}</h2>
              <div className={t.ticketChatMeta}>
                <StatusBadge status={ticket.status} />
                <TypeBadge type={ticket._raw?.type || ticket.type} typeLabel={ticket.typeLabel || ticket.type} />
                <span className={t.pageInfo} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontFamily: "monospace", color: "var(--adm-text)" }}>#{ticket.id}</span>
                  <button onClick={() => copyToClipboard(ticket.id, "ticketId")} className={t.actionBtn} style={{ padding: 2, height: "auto", width: "auto" }} title="Copy ID">
                    {copiedId === "ticketId" ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                  </button>
                  · {ticket.createdAt}
                </span>
              </div>
            </div>
          </div>
        </div>

          <div className={t.ticketChatArea}>
            <div className={t.ticketSysEvent}>
              <span>Ticket opened · {ticket.createdAt}</span>
            </div>
            {ticket.messages.map((msg, i) => {
              if (msg.isSystemMessage) {
                return (
                  <div key={i} className={t.ticketSysEvent}>
                    <span>{msg.text}</span>
                  </div>
                );
              }
              const isAdminMsg = msg.from === "admin";
              const avatarBg = roleAvatarColor(msg.senderRole);
              return (
                <div
                  key={i}
                  className={`${t.ticketMsgRow} ${isAdminMsg ? t.ticketMsgRight : t.ticketMsgLeft}`}
                >
                  {!isAdminMsg && (
                    <div
                      className={t.ticketMsgAvatar}
                      style={{ background: avatarBg }}
                    >
                      {msg.senderAvatar ? (
                        <img
                          src={msg.senderAvatar}
                          alt={msg.senderName}
                          className={t.ticketAvatarImg}
                        />
                      ) : (
                        getInitials(msg.senderName)
                      )}
                    </div>
                  )}
                  <div
                    className={`${t.ticketBubble} ${isAdminMsg ? t.ticketBubbleAdmin : t.ticketBubbleUser}`}
                  >
                    <div className={t.ticketSenderLabel}>
                      {msg.senderName}
                      <span
                        className={t.ticketSenderRole}
                        data-role={msg.senderRole}
                      >
                        {roleLabel(msg.senderRole)}
                      </span>
                    </div>
                    <p className={t.ticketBubbleText}>{msg.text}</p>
                    <AttachmentList attachments={msg.attachments} />
                    <span className={t.ticketBubbleTime}>{msg.time}</span>
                  </div>
                  {isAdminMsg && (
                    <div
                      className={t.ticketMsgAvatar}
                      style={{ background: avatarBg }}
                    >
                      {msg.senderAvatar ? (
                        <img
                          src={msg.senderAvatar}
                          alt={msg.senderName}
                          className={t.ticketAvatarImg}
                        />
                      ) : (
                        getInitials(msg.senderName)
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {!isTerminal && isClaimedByMe && (
            <form className={t.ticketReplyBox} onSubmit={handleSend}>
              {file && (
                <div className={t.ticketFileChip}>
                  <Paperclip size={12} />
                  <span>{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className={t.ticketFileChipClose}
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                <label className={t.ticketAttachBtn}>
                  <Paperclip size={16} />
                  <input
                    type="file"
                    style={{ display: "none" }}
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => setFile(e.target.files[0] || null)}
                  />
                </label>
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
          )}
          {!isTerminal && !isClaimedByMe && (
            <div className={t.ticketClosedBanner} style={{ background: "#f8fafc", color: "var(--adm-text-muted)", borderTop: "1px solid var(--adm-border)" }}>
              {hasAssignee
                ? "This ticket is claimed by another admin or support agent."
                : "You need to claim this ticket before you can reply."}
            </div>
          )}
          {isTerminal && (
            <div className={t.ticketClosedBanner}>
              <CheckCircle size={14} />
              This ticket is{" "}
              {STATUS_CFG[ticket.status]?.label?.toLowerCase() || "closed"}.
            </div>
          )}
          </div>

          {/* Right: Metadata sidebar */}
          <div className={t.ticketSplitSide}>
            {/* Ticket Details */}
            <div className={t.ticketMetaCard}>
              <div className={t.ticketMetaHead}>Ticket Details</div>
              <div className={t.ticketMetaBody}>
                {[
                  ["Status", <StatusBadge key="s" status={ticket.status} />],
                  [
                    "Priority",
                    ticket.priority ? (
                      <PriorityBadge key="p" priority={ticket.priority} />
                    ) : (
                      <span key="p" style={{ color: "#94a3b8", fontSize: 12 }}>
                        —
                      </span>
                    ),
                  ],
                  [
                    "Type",
                    <span
                      key="tp"
                      style={{ fontSize: 12, color: "var(--adm-text-muted)" }}
                    >
                      {ticket.typeLabel}
                    </span>,
                  ],
                  [
                    "Created",
                    <span
                      key="cr"
                      style={{ fontSize: 12, color: "var(--adm-text-muted)" }}
                    >
                      {ticket.createdAt}
                    </span>,
                  ],
                ].map(([label, val]) => (
                  <div key={label} className={t.ticketMetaRow}>
                    <span className={t.ticketMetaLabel}>{label}</span>
                    {val}
                  </div>
                ))}
              </div>
            </div>

            {/* Participants with full IDs */}
            {participants.length > 0 && (
              <div className={t.ticketMetaCard}>
                <div className={t.ticketMetaHead}>Participants</div>
                <div className={`${t.ticketMetaBody} ${t.ticketParticipantsScroll}`}>
                  {participants.map((p) => {
                    const userKey = `${p.label}-user`;
                    const profileKey = `${p.label}-profile`;
                    return (
                      <div key={p.label} className={t.ticketParticipantEntry}>
                        <span className={t.ticketParticipantTitle}>
                          {p.label}{" "}
                          <span className={t.ticketParticipantRole}>
                            {p.role}
                          </span>
                        </span>

                        {/* User ID copy button */}
                        <button
                          className={`${t.ticketCopyIdBtn} ${copiedId === userKey ? t.ticketCopyIdBtnCopied : ""}`}
                          onClick={() => copyToClipboard(p.userId, userKey)}
                          title="Click to copy User ID"
                        >
                          <div className={t.ticketCopyIdHeader}>
                            <span className={t.ticketCopyIdKey}>User ID</span>
                            {copiedId === userKey ? (
                              <Check size={13} />
                            ) : (
                              <Copy size={13} />
                            )}
                          </div>
                          <span className={t.ticketCopyIdVal}>
                            {p.userId || "—"}
                          </span>
                        </button>

                        {/* Profile / role-specific ID copy button */}
                        {p.entityId && (
                          <button
                            className={`${t.ticketCopyIdBtn} ${copiedId === profileKey ? t.ticketCopyIdBtnCopied : ""}`}
                            onClick={() =>
                              copyToClipboard(p.entityId, profileKey)
                            }
                            title={`Click to copy ${profileKeyLabel(p.rawRole)}`}
                          >
                            <div className={t.ticketCopyIdHeader}>
                              <span className={t.ticketCopyIdKey}>
                                {profileKeyLabel(p.rawRole)}
                              </span>
                              {copiedId === profileKey ? (
                                <Check size={13} />
                              ) : (
                                <Copy size={13} />
                              )}
                            </div>
                            <span className={t.ticketCopyIdVal}>
                              {p.entityId}
                            </span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            {!isTerminal && (
              <div className={t.ticketMetaCard}>
                <div className={t.ticketMetaHead}>Quick Actions</div>
                <div className={t.ticketMetaBody}>
                  {canClaim && (
                    <button
                      className={`${t.btn} ${t.btnOutline}`}
                      style={{ width: "100%" }}
                      onClick={handleClaim}
                      disabled={actionLoading}
                    >
                      <Shield size={14} />
                      {actionLoading ? "Claiming…" : "Claim Ticket"}
                    </button>
                  )}
                  {!showResolve && canResolve && (
                    <button
                      className={`${t.btn} ${t.btnOutline}`}
                      style={{ width: "100%" }}
                      onClick={() => setShowResolve(true)}
                    >
                      <CheckCircle size={14} /> Resolve
                    </button>
                  )}
                  {showResolve && (
                    <>
                      <input
                        className={t.input}
                        placeholder="Resolution note (optional)…"
                        value={resolveNote}
                        onChange={(e) => setResolveNote(e.target.value)}
                      />
                      <button
                        className={`${t.btn} ${t.btnPrimary}`}
                        style={{ width: "100%" }}
                        onClick={handleResolve}
                        disabled={actionLoading}
                      >
                        <CheckCircle size={14} />
                        {actionLoading ? "Resolving…" : "Confirm Resolve"}
                      </button>
                      <button
                        className={`${t.btn} ${t.btnOutline}`}
                        style={{ width: "100%" }}
                        onClick={() => setShowResolve(false)}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {canClose && !showResolve && (
                    <button
                      className={`${t.btn} ${t.btnDanger}`}
                      style={{ width: "100%" }}
                      onClick={handleClose}
                      disabled={actionLoading}
                    >
                      <XCircle size={14} />
                      {actionLoading ? "Closing…" : "Force Close"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
}

export default function AdminTickets() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
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
  }, [
    page,
    limit,
    statusFilter,
    typeFilter,
    escalatedOnly,
    claimedByMe,
    search,
  ]);

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

  useEffect(() => {
    if (location.state?.openTicketId) {
      openTicket({ id: location.state.openTicketId });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.openTicketId]);

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

      {active ? (
        <TicketChatModal
          ticket={active}
          onClose={() => setActive(null)}
          onAction={handleAction}
          user={user}
        />
      ) : (
        <>
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
          <label 
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              background: escalatedOnly ? "var(--adm-accent-light)" : "#f1f5f9",
              color: escalatedOnly ? "var(--adm-accent)" : "#64748b",
              borderRadius: 20,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              border: `1px solid ${escalatedOnly ? "var(--adm-accent)" : "#cbd5e1"}`,
              transition: "all 0.2s",
              userSelect: "none"
            }}
          >
            <input
              type="checkbox"
              checked={escalatedOnly}
              onChange={(e) => {
                setEscalatedOnly(e.target.checked);
                setPage(1);
              }}
              style={{ display: "none" }}
            />
            {escalatedOnly && <Check size={14} />}
            Escalated Only
          </label>
          <label 
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              background: claimedByMe ? "var(--adm-accent-light)" : "#f1f5f9",
              color: claimedByMe ? "var(--adm-accent)" : "#64748b",
              borderRadius: 20,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              border: `1px solid ${claimedByMe ? "var(--adm-accent)" : "#cbd5e1"}`,
              transition: "all 0.2s",
              userSelect: "none"
            }}
          >
            <input
              type="checkbox"
              checked={claimedByMe}
              onChange={(e) => {
                setClaimedByMe(e.target.checked);
                setPage(1);
              }}
              style={{ display: "none" }}
            />
            {claimedByMe && <Check size={14} />}
            Claimed by Me
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
                      <TypeBadge 
                        type={tk.type} 
                        typeLabel={TICKET_TYPES.find((tp) => tp.value === tk.type)?.label} 
                      />
                    </td>
                    <td>
                      {(tk._raw?.type === "RETURN_REQUEST" || tk._raw?.type === "ORDER_DISPUTE") && !tk._raw?.supportInvited ? (
                        <span className={t.badge} style={{ background: "#f1f5f9", color: "#64748b", border: "1px solid #cbd5e1" }}>
                          Customer & Vendor
                        </span>
                      ) : (
                        <StatusBadge status={tk.status} />
                      )}
                    </td>
                    <td className={t.ticketRoleCell}>
                      <RoleBadge role={tk.creatorRole} />
                    </td>
                    <td className={t.ticketTypeCell}>
                      {tk.assigneeId ? (
                        String(tk.assigneeRole || "").toUpperCase() ===
                        "ADMIN" ? (
                          <span
                            className={t.badge}
                            style={{ background: "#fee2e2", color: "#dc2626" }}
                          >
                            Admin claimed
                          </span>
                        ) : (
                          <span
                            className={t.badge}
                            style={{ background: "#dbeafe", color: "#1d4ed8" }}
                          >
                            Support claimed
                          </span>
                        )
                      ) : tk.status === "ESCALATED" ? (
                        <span
                          className={t.badge}
                          style={{ background: "#fff1f2", color: "#dc2626" }}
                        >
                          Escalated — unclaimed
                        </span>
                      ) : (
                        <span style={{ color: "#94a3b8", fontSize: 12 }}>
                          Unassigned
                        </span>
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
      </>
      )}
    </AdminLayout>
  );
}
