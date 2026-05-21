import { useEffect, useRef, useState, useCallback } from "react";
import {
  Search,
  Filter,
  X,
  Paperclip,
  Send,
  ShieldAlert,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
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

const PRIORITY_MAP = {
  LOW: "pLow",
  NORMAL: "pMed",
  HIGH: "pHigh",
  URGENT: "pUrgent",
};

const PRIORITY_LABEL = {
  LOW: "Low",
  NORMAL: "Normal",
  HIGH: "High",
  URGENT: "Urgent",
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

function assigneeLabel(raw, userId) {
  if (!raw.assigneeId) return { text: "Unassigned", style: "unassigned" };
  if (String(raw.assigneeRole || "").toUpperCase() === "ADMIN")
    return { text: "Admin handling", style: "admin" };
  if (raw.assigneeId === userId)
    return { text: "Claimed by you", style: "mine" };
  return { text: "Claimed by agent", style: "other" };
}

function mapTicket(raw, userId) {
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
    user: raw.creator?.name || raw.creator?.email || raw.creatorId || "Unknown",
    role:
      (raw.creatorRole || "").toLowerCase() === "vendor"
        ? "Vendor"
        : "Customer",
    status: raw.status,
    priority: raw.priority || "NORMAL",
    updated: new Date(raw.updatedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    agentLabel: assigneeLabel(raw, userId),
    messages,
    _raw: raw,
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

const AGENT_LABEL_STYLES = {
  mine: { color: "#7c3aed", background: "#f5f3ff" },
  other: { color: "#0369a1", background: "#e0f2fe" },
  admin: { color: "#dc2626", background: "#fee2e2" },
  unassigned: { color: "#64748b", background: "#f1f5f9" },
};

export default function SupportTickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState("");
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fileRef = useRef(null);
  const bottomRef = useRef(null);

  const fetchTickets = useCallback(() => {
    setLoading(true);
    const params = { page, limit };
    if (statusFilter) params.status = statusFilter;
    apiClient
      .get("/tech-support/support/tickets", { params })
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
        setTickets(data.map((tk) => mapTicket(tk, user?.id)));
        setTotal(r.data.total ?? data.length);
      })
      .catch(() => setError("Failed to load tickets."))
      .finally(() => setLoading(false));
  }, [page, limit, statusFilter, search]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    const id = setInterval(fetchTickets, 30000);
    return () => clearInterval(id);
  }, [fetchTickets]);

  useEffect(() => {
    if (selected) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selected?.messages]);

  const openTicket = async (tk) => {
    try {
      const res = await apiClient.get(`/tech-support/support/tickets/${tk.id}`);
      setSelected(mapTicket(res.data, user?.id));
    } catch {
      setError("Failed to load ticket.");
    }
  };

  const refetchSelected = async (id) => {
    const res = await apiClient.get(`/tech-support/support/tickets/${id}`);
    const updated = mapTicket(res.data, user?.id);
    setSelected(updated);
    fetchTickets();
  };

  const sendReply = async () => {
    if (!selected || (!reply.trim() && !file)) return;
    setSending(true);
    try {
      let attachmentUrl = null;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await multipartClient.post(
          `/tech-support/support/tickets/${selected.id}/messages/attachments`,
          formData,
        );
        attachmentUrl = res.data?.url || null;
      }
      const content = reply.trim() || "Attachment";
      await apiClient.post(
        `/tech-support/support/tickets/${selected.id}/messages`,
        {
          content,
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

  const handleClaim = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await apiClient.patch(
        `/tech-support/support/tickets/${selected.id}/claim`,
      );
      await refetchSelected(selected.id);
    } catch {
      setError("Failed to claim ticket.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEscalate = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await apiClient.patch(
        `/tech-support/support/tickets/${selected.id}/escalate`,
      );
      await refetchSelected(selected.id);
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
      await refetchSelected(selected.id);
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
      await refetchSelected(selected.id);
    } catch {
      setError("Failed to close ticket.");
    } finally {
      setActionLoading(false);
    }
  };

  const isTerminal = selected
    ? TERMINAL_STATUSES.includes(selected.status)
    : false;
  const totalPages = Math.ceil(total / limit);

  return (
    <SupportLayout
      pageTitle="Tickets"
      pageSubtitle="Manage and resolve all customer and vendor tickets."
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

      {selected ? (
        /* ── Ticket Detail Split View ── */
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
                  · {selected.user}
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

          {/* Right: meta panels */}
          <div className={p.splitLeft}>
            <div className={p.metaCard}>
              <div className={p.metaHead}>Ticket Details</div>
              <div className={p.metaBody}>
                {[
                  [
                    "Status",
                    <span
                      key="status"
                      className={`${p.badge} ${p[STATUS_MAP[selected.status]] || p.bOpen}`}
                    >
                      {STATUS_LABEL[selected.status] || selected.status}
                    </span>,
                  ],
                  [
                    "Priority",
                    <span
                      key="priority"
                      className={`${p.badge} ${p[PRIORITY_MAP[selected.priority]] || p.pMed}`}
                    >
                      {PRIORITY_LABEL[selected.priority] || selected.priority}
                    </span>,
                  ],
                  [
                    "Updated",
                    <span
                      key="updated"
                      style={{ color: "var(--sup-text-muted)" }}
                    >
                      {selected.updated}
                    </span>,
                  ],
                  [
                    "Assigned",
                    <span
                      key="assigned"
                      className={p.badge}
                      style={{
                        ...AGENT_LABEL_STYLES[
                          selected.agentLabel?.style || "unassigned"
                        ],
                      }}
                    >
                      {selected.agentLabel?.text || "Unassigned"}
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

            <div className={p.metaCard}>
              <div className={p.metaHead}>Requester</div>
              <div className={p.metaBody}>
                <div className={p.avatarCell}>
                  <div
                    className={p.avatar}
                    style={{ width: 40, height: 40, fontSize: 14 }}
                  >
                    {selected.user.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>
                      {selected.user}
                    </p>
                    <span
                      className={`${p.badge} ${selected.role === "Vendor" ? p.rVendor : p.rCustomer}`}
                      style={{ marginTop: 4 }}
                    >
                      {selected.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {!isTerminal && (
              <div className={p.metaCard}>
                <div className={p.metaHead}>Quick Actions</div>
                <div className={p.metaBody}>
                  {!selected._raw?.assigneeId &&
                    selected._raw?.status !== "ESCALATED" && (
                      <button
                        className={`${p.btn} ${p.btnOutline}`}
                        style={{ width: "100%" }}
                        onClick={handleClaim}
                        disabled={actionLoading}
                      >
                        <ArrowUpRight size={14} /> Claim Ticket
                      </button>
                    )}
                  <button
                    className={`${p.btn} ${p.btnPrimary}`}
                    style={{ width: "100%" }}
                    onClick={handleResolve}
                    disabled={actionLoading}
                  >
                    <CheckCircle size={14} /> Mark as Resolved
                  </button>
                  <button
                    className={`${p.btn} ${p.btnDanger}`}
                    style={{ width: "100%" }}
                    onClick={handleClose}
                    disabled={actionLoading}
                  >
                    <AlertCircle size={14} /> Close Ticket
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── Tickets Table ── */
        <div className={p.panel}>
          <div className={p.filterBar}>
            <div className={p.searchWrap}>
              <Search size={14} className={p.searchIcon} />
              <input
                className={p.searchInput}
                placeholder="Search tickets…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <select
              className={p.filterSelect}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Status</option>
              {Object.entries(STATUS_LABEL).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
            <span
              style={{
                marginLeft: "auto",
                fontSize: 12,
                color: "var(--sup-text-muted)",
              }}
            >
              {total} ticket{total !== 1 ? "s" : ""}
            </span>
          </div>

          <div className={p.tableWrap}>
            <table className={p.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Assigned</th>
                  <th>Updated</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        textAlign: "center",
                        padding: 32,
                        color: "var(--sup-text-muted)",
                      }}
                    >
                      Loading…
                    </td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className={p.emptyState}>
                        <div className={p.emptyIcon}>
                          <Filter size={40} />
                        </div>
                        <p className={p.emptyTitle}>No tickets found</p>
                        <p style={{ margin: 0, fontSize: 13 }}>
                          Try adjusting your filters
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tickets.map((tk) => (
                    <tr
                      key={tk.id}
                      className={p.clickable}
                      onClick={() => openTicket(tk)}
                    >
                      <td
                        style={{
                          fontWeight: 700,
                          color: "var(--sup-accent)",
                          fontSize: 12,
                          fontFamily: "monospace",
                        }}
                      >
                        {tk.id.slice(0, 8)}…
                      </td>
                      <td>
                        <div className={p.avatarCell}>
                          <div className={p.avatar}>
                            {tk.user.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span
                              style={{
                                fontWeight: 600,
                                fontSize: 13,
                                display: "block",
                              }}
                            >
                              {tk.user}
                            </span>
                            <span
                              className={`${p.badge} ${tk.role === "Vendor" ? p.rVendor : p.rCustomer}`}
                              style={{ fontSize: 10 }}
                            >
                              {tk.role}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td
                        style={{
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontWeight: 600,
                        }}
                      >
                        {tk.subject}
                      </td>
                      <td>
                        <span
                          className={`${p.badge} ${p[STATUS_MAP[tk.status]] || p.bOpen}`}
                        >
                          {STATUS_LABEL[tk.status] || tk.status}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`${p.badge} ${p[PRIORITY_MAP[tk.priority]] || p.pMed}`}
                        >
                          {PRIORITY_LABEL[tk.priority] || tk.priority}
                        </span>
                      </td>
                      <td>
                        <span
                          className={p.badge}
                          style={{
                            ...AGENT_LABEL_STYLES[tk.agentLabel.style],
                            fontSize: 11,
                          }}
                        >
                          {tk.agentLabel.text}
                        </span>
                      </td>
                      <td
                        style={{
                          fontSize: 12,
                          color: "var(--sup-text-subtle)",
                        }}
                      >
                        {tk.updated}
                      </td>
                      <td>
                        <button
                          className={`${p.btn} ${p.btnGhost} ${p.btnSm}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            openTicket(tk);
                          }}
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={p.pagination}>
              <span className={p.pageInfo}>
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)}{" "}
                of {total}
              </span>
              <div className={p.pageButtons}>
                <button
                  className={p.pageBtn}
                  onClick={() => setPage((v) => Math.max(1, v - 1))}
                  disabled={page === 1}
                >
                  ‹
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => (
                  <button
                    key={i + 1}
                    className={`${p.pageBtn} ${page === i + 1 ? p.active : ""}`}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className={p.pageBtn}
                  onClick={() => setPage((v) => Math.min(totalPages, v + 1))}
                  disabled={page === totalPages}
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </SupportLayout>
  );
}
