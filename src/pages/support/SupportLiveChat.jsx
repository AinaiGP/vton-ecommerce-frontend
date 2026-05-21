import { useEffect, useRef, useState, useCallback } from "react";
import {
  Send,
  Paperclip,
  X,
  Search,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";
import SupportLayout from "../../components/support/SupportLayout";
import { useAuth } from "../../context/AuthContext";
import apiClient, { multipartClient } from "../../utils/apiClient";
import p from "../../styles/SupportPage.module.css";

const STATUS_MAP = {
  PENDING: "bOpen",
  OPEN: "bOpen",
  IN_PROGRESS: "bProgress",
  AWAITING_RESPONSE: "bProgress",
  ESCALATED: "bProgress",
  RESOLVED: "bResolved",
  CLOSED: "bClosed",
  CANCELED: "bClosed",
};

const STATUS_LABEL = {
  PENDING: "Pending",
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  AWAITING_RESPONSE: "Awaiting Response",
  ESCALATED: "Escalated",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
  CANCELED: "Canceled",
};

const TICKET_TYPES = {
  GENERAL_SUPPORT: "General Support",
  SYSTEM_BUG: "System Bug",
  ORDER_DISPUTE: "Order Dispute",
  RETURN_REQUEST: "Return Request",
  VENDOR_VIOLATION: "Vendor Violation",
};

const TERMINAL_STATUSES = ["RESOLVED", "CLOSED", "CANCELED"];

const STATUS_FILTERS = [
  { label: "All Active", value: "" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Awaiting Response", value: "AWAITING_RESPONSE" },
  { label: "Pending", value: "PENDING" },
];

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

function getInitials(label) {
  if (!label) return "U";
  const parts = label.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
}

function mapTicket(raw) {
  const messages = (raw.messages || [])
    .filter((m) => !m.isSystemMessage)
    .map((m) => {
      const legacy = extractLegacyAttachment(m.content);
      const attachmentUrls = [...(m.attachments || []), ...legacy.urls].filter(
        Boolean,
      );
      const role = String(m.senderRole || "").toLowerCase();
      const sender = m.sender || null;
      const senderName = sender?.name || sender?.email || roleLabel(role);
      return {
        from:
          role === "technical_support" || role === "admin" ? "agent" : "user",
        text: legacy.text || m.content,
        time: new Date(m.createdAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        senderName,
        senderAvatar: sender?.avatarUrl || null,
        senderRole: role,
        attachments: attachmentUrls.map((url) => ({
          url,
          name: url.split("/").pop() || "Attachment",
          isImage: isImageUrl(url),
        })),
      };
    });

  return {
    id: raw.id,
    subject: raw.subject,
    status: raw.status,
    priority: raw.priority || "NORMAL",
    type: raw.type,
    assigneeId: raw.assigneeId,
    creatorId: raw.creatorId,
    creatorRole: raw.creatorRole,
    updatedAt: raw.updatedAt || raw.createdAt,
    createdAt: raw.createdAt,
    user: raw.creator?.name || raw.creator?.email || raw.creatorId || "Unknown",
    messages,
  };
}

export default function SupportLiveChat() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [reply, setReply] = useState("");
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fileRef = useRef(null);
  const bottomRef = useRef(null);

  const fetchTickets = useCallback(() => {
    setLoading(true);
    const params = { limit: 100 };
    if (statusFilter) params.status = statusFilter;
    apiClient
      .get("/tech-support/support/tickets", { params })
      .then((r) => {
        const data = r.data.data || r.data || [];
        const claimed = data.filter(
          (tk) =>
            tk.assigneeId === user?.id &&
            !TERMINAL_STATUSES.includes(tk.status),
        );
        setTickets(claimed);
      })
      .catch(() => setError("Failed to load tickets."))
      .finally(() => setLoading(false));
  }, [statusFilter, user?.id]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    const id = setInterval(fetchTickets, 30000);
    return () => clearInterval(id);
  }, [fetchTickets]);

  useEffect(() => {
    if (selected) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages]);

  const openTicket = async (tk) => {
    try {
      const res = await apiClient.get(`/tech-support/support/tickets/${tk.id}`);
      setSelected(mapTicket(res.data));
    } catch {
      setError("Failed to load ticket.");
    }
  };

  const refetchSelected = async (id) => {
    const res = await apiClient.get(`/tech-support/support/tickets/${id}`);
    setSelected(mapTicket(res.data));
    fetchTickets();
  };

  const sendReply = async () => {
    if (!selected || (!reply.trim() && !file)) return;
    setSending(true);
    try {
      let attachmentUrl = null;
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await multipartClient.post(
          `/tech-support/support/tickets/${selected.id}/messages/attachments`,
          fd,
        );
        attachmentUrl = res.data?.url || null;
      }
      await apiClient.post(
        `/tech-support/support/tickets/${selected.id}/messages`,
        {
          content: reply.trim() || "Attachment",
          attachments: attachmentUrl ? [attachmentUrl] : undefined,
        },
      );
      setReply("");
      setFile(null);
      await refetchSelected(selected.id);
    } catch {
      setError("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleEscalate = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await apiClient.patch(
        `/tech-support/support/tickets/${selected.id}/escalate`,
      );
      setSelected(null);
      fetchTickets();
    } catch {
      setError("Failed to escalate ticket.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await apiClient.patch(
        `/tech-support/support/tickets/${selected.id}/resolve`,
        {},
      );
      setSelected(null);
      fetchTickets();
    } catch {
      setError("Failed to resolve ticket.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClose = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await apiClient.patch(
        `/tech-support/support/tickets/${selected.id}/close`,
        {},
      );
      setSelected(null);
      fetchTickets();
    } catch {
      setError("Failed to close ticket.");
    } finally {
      setActionLoading(false);
    }
  };

  const isTerminal = selected
    ? TERMINAL_STATUSES.includes(selected.status)
    : false;

  const filtered = tickets.filter(
    (tk) =>
      !search ||
      tk.subject?.toLowerCase().includes(search.toLowerCase()) ||
      tk.id?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SupportLayout
      pageTitle="Live Chat"
      pageSubtitle="Active ticket threads you have claimed."
      breadcrumb="Live Chat"
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
            fontSize: 13,
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

      {/* Status filter tabs */}
      <div
        style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}
      >
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => {
              setStatusFilter(f.value);
              setSelected(null);
            }}
            className={`${p.btn} ${statusFilter === f.value ? p.btnPrimary : p.btnOutline} ${p.btnSm}`}
          >
            {f.label}
          </button>
        ))}
        <button
          onClick={fetchTickets}
          className={`${p.btn} ${p.btnGhost} ${p.btnSm}`}
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {selected ? (
        /* ── Ticket thread split view ── */
        <div className={p.splitLayout}>
          {/* Left: conversation */}
          <div className={p.splitMain}>
            <div className={p.panelHead}>
              <div>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--sup-text-muted)",
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontWeight: 700, color: "var(--sup-accent)" }}>
                    {selected.id.slice(0, 8)}…
                  </span>{" "}
                  · {TICKET_TYPES[selected.type] || selected.type}
                </p>
                <h2
                  style={{
                    font: "700 16px/1.3 Inter, sans-serif",
                    color: "var(--sup-text)",
                    margin: 0,
                  }}
                >
                  {selected.subject}
                </h2>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <span
                  className={`${p.badge} ${p[STATUS_MAP[selected.status]] || p.bOpen}`}
                >
                  {STATUS_LABEL[selected.status] || selected.status}
                </span>
                <button
                  className={`${p.btn} ${p.btnGhost} ${p.btnSm}`}
                  onClick={() => setSelected(null)}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className={p.ticketConv}>
              {selected.messages.length === 0 && (
                <p
                  style={{
                    textAlign: "center",
                    color: "var(--sup-text-muted)",
                    fontSize: 13,
                    padding: "20px 0",
                  }}
                >
                  No messages yet.
                </p>
              )}
              {selected.messages.map((m, i) => (
                <div
                  key={i}
                  className={`${p.msgRow} ${m.from === "agent" ? p.mine : ""}`}
                >
                  <div className={p.msgAvat}>
                    {m.senderAvatar ? (
                      <img
                        src={m.senderAvatar}
                        alt={m.senderName}
                        className={p.msgAvatarImg}
                      />
                    ) : (
                      getInitials(m.senderName)
                    )}
                  </div>
                  <div>
                    <span className={p.msgSender}>{m.senderName}</span>
                    <div className={p.msgBubble}>
                      {m.text}
                      {m.attachments?.map((att) =>
                        att.isImage ? (
                          <a
                            key={att.url}
                            href={att.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <img
                              src={att.url}
                              alt={att.name}
                              style={{
                                display: "block",
                                maxWidth: 160,
                                maxHeight: 120,
                                marginTop: 6,
                                borderRadius: 6,
                                objectFit: "cover",
                              }}
                            />
                          </a>
                        ) : (
                          <a
                            key={att.url}
                            href={att.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: "block",
                              fontSize: 11,
                              opacity: 0.8,
                              marginTop: 4,
                            }}
                          >
                            📎 {att.name}
                          </a>
                        ),
                      )}
                    </div>
                    <span className={p.msgTime}>{m.time}</span>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Reply box */}
            {!isTerminal && (
              <div className={p.ticketReply}>
                {file && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 12,
                      color: "var(--sup-text-muted)",
                      marginBottom: 6,
                    }}
                  >
                    <Paperclip size={12} />
                    <span>{file.name}</span>
                    <button
                      onClick={() => setFile(null)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--sup-text-muted)",
                        display: "flex",
                      }}
                    >
                      <X size={11} />
                    </button>
                  </div>
                )}
                <textarea
                  className={p.replyInput}
                  placeholder="Type your reply…"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendReply();
                    }
                  }}
                />
                <div className={p.replyActions}>
                  <button
                    className={`${p.btn} ${p.btnGhost} ${p.btnSm}`}
                    onClick={() => fileRef.current?.click()}
                  >
                    <Paperclip size={14} />{" "}
                    {file ? file.name.slice(0, 12) + "…" : "Attach"}
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    style={{ display: "none" }}
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => setFile(e.target.files[0] || null)}
                  />
                  {selected.status !== "ESCALATED" && (
                    <button
                      className={`${p.btn} ${p.btnOutline} ${p.btnSm}`}
                      style={{ color: "#dc2626", borderColor: "#fca5a5" }}
                      onClick={handleEscalate}
                      disabled={actionLoading}
                    >
                      <ShieldAlert size={14} /> Escalate to Admin
                    </button>
                  )}
                  <button
                    className={`${p.btn} ${p.btnOutline} ${p.btnSm}`}
                    onClick={handleResolve}
                    disabled={actionLoading}
                  >
                    <CheckCircle size={14} /> Resolve
                  </button>
                  <button
                    className={`${p.btn} ${p.btnOutline} ${p.btnSm}`}
                    onClick={handleClose}
                    disabled={actionLoading}
                  >
                    <AlertCircle size={14} /> Close
                  </button>
                  <button
                    className={`${p.btn} ${p.btnPrimary}`}
                    disabled={(!reply.trim() && !file) || sending}
                    onClick={sendReply}
                  >
                    <Send size={14} /> {sending ? "Sending…" : "Send Reply"}
                  </button>
                </div>
              </div>
            )}
            {isTerminal && (
              <div
                style={{
                  padding: "14px 20px",
                  textAlign: "center",
                  fontSize: 13,
                  color: "var(--sup-text-muted)",
                  borderTop: "1px solid var(--sup-border)",
                }}
              >
                This ticket is {STATUS_LABEL[selected.status]?.toLowerCase()}.
              </div>
            )}
          </div>

          {/* Right: meta */}
          <div className={p.splitLeft}>
            <div className={p.metaCard}>
              <div className={p.metaHead}>Ticket Details</div>
              <div className={p.metaBody}>
                {[
                  [
                    "Status",
                    <span
                      key="s"
                      className={`${p.badge} ${p[STATUS_MAP[selected.status]] || p.bOpen}`}
                    >
                      {STATUS_LABEL[selected.status] || selected.status}
                    </span>,
                  ],
                  [
                    "Type",
                    <span key="t" style={{ color: "var(--sup-text-muted)" }}>
                      {TICKET_TYPES[selected.type] || selected.type}
                    </span>,
                  ],
                  [
                    "Creator",
                    <span key="c" style={{ color: "var(--sup-text-muted)" }}>
                      {selected.creatorRole?.toLowerCase().replace(/_/g, " ") ||
                        "—"}
                    </span>,
                  ],
                  [
                    "Updated",
                    <span key="u" style={{ color: "var(--sup-text-muted)" }}>
                      {new Date(selected.updatedAt).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" },
                      )}
                    </span>,
                  ],
                ].map(([l, v]) => (
                  <div key={l} className={p.metaRow}>
                    <span className={p.metaLabel}>{l}</span>
                    {v}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Ticket list ── */
        <div className={p.chatLayout}>
          {/* Left sidebar */}
          <div className={p.chatSidebar}>
            <div className={p.chatSidebarHead}>
              <h3 className={p.chatSidebarTitle}>
                My Claimed Conversations{" "}
                <span style={{ color: "var(--sup-accent)", fontWeight: 800 }}>
                  {filtered.length}
                </span>
              </h3>
              <div className={p.searchWrap} style={{ marginTop: 8 }}>
                <Search size={13} className={p.searchIcon} />
                <input
                  className={p.searchInput}
                  placeholder="Search…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className={p.convList}>
              {loading ? (
                <div
                  style={{
                    padding: 24,
                    textAlign: "center",
                    color: "var(--sup-text-muted)",
                    fontSize: 13,
                  }}
                >
                  Loading…
                </div>
              ) : filtered.length === 0 ? (
                <div
                  style={{
                    padding: 24,
                    textAlign: "center",
                    color: "var(--sup-text-muted)",
                  }}
                >
                  <MessageCircle
                    size={28}
                    style={{ opacity: 0.4, marginBottom: 8 }}
                  />
                  <p style={{ fontSize: 13, margin: 0 }}>
                    No active claimed tickets
                  </p>
                  <p style={{ fontSize: 11, margin: "4px 0 0", opacity: 0.7 }}>
                    Claim tickets from the Tickets tab
                  </p>
                </div>
              ) : (
                filtered.map((tk) => (
                  <div
                    key={tk.id}
                    className={p.convItem}
                    onClick={() => openTicket(tk)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className={p.convAvatar}>
                      {(tk.subject || "T").slice(0, 2).toUpperCase()}
                    </div>
                    <div className={p.convInfo}>
                      <p
                        className={p.convName}
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          margin: "0 0 3px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: 160,
                        }}
                      >
                        {tk.subject}
                      </p>
                      <p className={p.convSnippet} style={{ margin: 0 }}>
                        <span
                          className={`${p.badge} ${p[STATUS_MAP[tk.status]] || p.bOpen}`}
                          style={{ fontSize: 10 }}
                        >
                          {STATUS_LABEL[tk.status] || tk.status}
                        </span>
                      </p>
                    </div>
                    <div className={p.convMeta}>
                      <span className={p.convTime}>
                        {new Date(tk.updatedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: empty state */}
          <div
            className={p.chatMain}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{ textAlign: "center", color: "var(--sup-text-muted)" }}
            >
              <MessageCircle
                size={40}
                style={{ opacity: 0.3, marginBottom: 12 }}
              />
              <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>
                Select a conversation
              </p>
              <p style={{ fontSize: 12, margin: 0 }}>
                Pick a ticket from the list to open the thread
              </p>
            </div>
          </div>
        </div>
      )}
    </SupportLayout>
  );
}
