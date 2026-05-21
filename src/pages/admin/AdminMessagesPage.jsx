import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search, MessageSquare, Send, Paperclip, X,
  CheckCircle, XCircle, Shield, User, RefreshCw, Filter,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import apiClient, { multipartClient } from "../../utils/apiClient";
import m from "../../styles/MessagingThread.module.css";
import t from "../../styles/AdminTable.module.css";

const STATUS_CFG = {
  PENDING:            { dot: "#64748b", bg: "#f1f5f9", color: "#475569", label: "Pending" },
  OPEN:               { dot: "#ef4444", bg: "#fee2e2", color: "#dc2626", label: "Open" },
  IN_PROGRESS:        { dot: "#f59e0b", bg: "#fef3c7", color: "#ca8a04", label: "In Progress" },
  AWAITING_RESPONSE:  { dot: "#8b5cf6", bg: "#f5f3ff", color: "#7c3aed", label: "Awaiting Response" },
  ESCALATED:          { dot: "#dc2626", bg: "#fff1f2", color: "#dc2626", label: "Escalated" },
  RESOLVED:           { dot: "#16a34a", bg: "#dcfce7", color: "#15803d", label: "Resolved" },
  CLOSED:             { dot: "#94a3b8", bg: "#f1f5f9", color: "#64748b", label: "Closed" },
  CANCELED:           { dot: "#94a3b8", bg: "#f1f5f9", color: "#64748b", label: "Canceled" },
};

const TICKET_TYPES = {
  GENERAL_SUPPORT: "General Support",
  SYSTEM_BUG:      "System Bug",
  ORDER_DISPUTE:   "Order Dispute",
  RETURN_REQUEST:  "Return Request",
  VENDOR_VIOLATION:"Vendor Violation",
};

const TERMINAL_STATUSES = ["RESOLVED", "CLOSED", "CANCELED"];

const STATUS_FILTERS = [
  { label: "All Active", value: "" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Awaiting Response", value: "AWAITING_RESPONSE" },
  { label: "Escalated", value: "ESCALATED" },
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

function mapMessages(raw) {
  return (raw.messages || [])
    .filter((m) => !m.isSystemMessage)
    .map((m) => {
      const legacy = extractLegacyAttachment(m.content);
      const attachmentUrls = [...(m.attachments || []), ...legacy.urls].filter(Boolean);
      const role = String(m.senderRole || "").toLowerCase();
      return {
        from: role === "admin" ? "admin" : "user",
        text: legacy.text || m.content,
        time: new Date(m.createdAt).toLocaleString("en-US", {
          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
        }),
        attachments: attachmentUrls.map((url) => ({
          url,
          name: url.split("/").pop() || "Attachment",
          isImage: isImageUrl(url),
        })),
      };
    });
}

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.CLOSED;
  return (
    <span className={m.badge} style={{ background: cfg.bg, color: cfg.color, fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
      {cfg.label}
    </span>
  );
}

export default function AdminMessagesPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [reply, setReply] = useState("");
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [resolveNote, setResolveNote] = useState("");
  const [showResolve, setShowResolve] = useState(false);
  const [error, setError] = useState(null);

  const fileRef = useRef(null);
  const bottomRef = useRef(null);

  const fetchTickets = useCallback(() => {
    setLoading(true);
    const params = { claimedByMe: true, limit: 50 };
    if (statusFilter) params.status = statusFilter;
    apiClient
      .get("/admin/support/tickets", { params })
      .then((r) => {
        const data = r.data.data || r.data || [];
        setTickets(data.filter((tk) => !TERMINAL_STATUSES.includes(tk.status)));
      })
      .catch(() => setError("Failed to load claimed tickets."))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  useEffect(() => {
    if (active) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages]);

  const openTicket = async (tk) => {
    try {
      const res = await apiClient.get(`/admin/support/tickets/${tk.id}`);
      setActive({ ...res.data, messages: mapMessages(res.data) });
      setShowResolve(false);
      setResolveNote("");
    } catch {
      setError("Failed to load ticket.");
    }
  };

  const refetchActive = async (id) => {
    const res = await apiClient.get(`/admin/support/tickets/${id}`);
    setActive({ ...res.data, messages: mapMessages(res.data) });
    fetchTickets();
  };

  const sendReply = async () => {
    if (!active || (!reply.trim() && !file)) return;
    setSending(true);
    try {
      let attachmentUrl = null;
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await multipartClient.post(
          `/admin/support/tickets/${active.id}/messages/attachments`, fd,
        );
        attachmentUrl = res.data?.url || null;
      }
      await apiClient.post(`/admin/support/tickets/${active.id}/messages`, {
        content: reply.trim() || "Attachment",
        attachments: attachmentUrl ? [attachmentUrl] : undefined,
      });
      setReply(""); setFile(null);
      await refetchActive(active.id);
    } catch {
      setError("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleResolve = async () => {
    if (!active) return;
    setActionLoading(true);
    try {
      await apiClient.patch(`/admin/support/tickets/${active.id}/resolve`, {
        resolutionNote: resolveNote || undefined,
      });
      setShowResolve(false);
      await refetchActive(active.id);
    } catch {
      setError("Failed to resolve ticket.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClose = async () => {
    if (!active) return;
    setActionLoading(true);
    try {
      await apiClient.patch(`/admin/support/tickets/${active.id}/close`);
      setActive(null);
      fetchTickets();
    } catch {
      setError("Failed to close ticket.");
    } finally {
      setActionLoading(false);
    }
  };

  const isTerminal = active ? TERMINAL_STATUSES.includes(active.status) : false;

  const filtered = tickets.filter((tk) =>
    !search ||
    tk.subject?.toLowerCase().includes(search.toLowerCase()) ||
    tk.id?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AdminLayout
      pageTitle="Live Chat"
      pageSubtitle="Active ticket threads claimed by you."
      breadcrumb="Live Chat"
    >
      {error && (
        <div style={{ marginBottom: 12, padding: "10px 16px", borderRadius: 8, background: "#fee2e2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
          {error}
          <button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626" }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Status filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setStatusFilter(f.value); setActive(null); }}
            style={{
              padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${statusFilter === f.value ? "var(--adm-accent, #8B4852)" : "var(--adm-border, #e8e0d5)"}`,
              background: statusFilter === f.value ? "var(--adm-accent, #8B4852)" : "var(--adm-surface, #fff)",
              color: statusFilter === f.value ? "white" : "var(--adm-text, #1a1210)",
              fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {f.label}
          </button>
        ))}
        <button
          onClick={fetchTickets}
          style={{ marginLeft: "auto", padding: "6px 12px", borderRadius: 20, border: "1.5px solid var(--adm-border, #e8e0d5)", background: "var(--adm-surface, #fff)", color: "var(--adm-text-muted, #7a6a60)", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontFamily: "inherit" }}
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <div className={m.msgShell} style={{ "--vdr-accent": "var(--adm-accent, #8B4852)", height: "calc(100vh - 260px)" }}>
        {/* Thread sidebar */}
        <div className={m.threadSidebar}>
          <div className={m.threadSidebarHead}>
            <p className={m.threadSidebarTitle}>
              My Claimed Tickets{" "}
              <span style={{ background: "var(--adm-accent, #8B4852)", color: "white", borderRadius: 20, fontSize: 10, fontWeight: 800, padding: "2px 7px", marginLeft: 6 }}>
                {filtered.length}
              </span>
            </p>
            <div style={{ position: "relative", marginTop: 8 }}>
              <Search size={13} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "var(--adm-text-muted, #7a6a60)" }} />
              <input
                style={{ width: "100%", padding: "6px 8px 6px 28px", border: "1.5px solid var(--adm-border, #e8e0d5)", borderRadius: 8, fontSize: 12, fontFamily: "inherit", background: "var(--adm-surface, #fff)", color: "var(--adm-text, #1a1210)", boxSizing: "border-box" }}
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className={m.threadList}>
            {loading ? (
              <div style={{ padding: 24, textAlign: "center", color: "var(--adm-text-muted, #7a6a60)", fontSize: 13 }}>
                Loading…
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "var(--adm-text-muted, #7a6a60)" }}>
                <MessageSquare size={28} style={{ opacity: 0.4, marginBottom: 8 }} />
                <p style={{ fontSize: 13, margin: 0 }}>No active claimed tickets</p>
                <p style={{ fontSize: 11, margin: "4px 0 0", opacity: 0.7 }}>Claim escalated tickets from the Tickets tab</p>
              </div>
            ) : (
              filtered.map((tk) => {
                const cfg = STATUS_CFG[tk.status] || STATUS_CFG.OPEN;
                const isSelected = active?.id === tk.id;
                return (
                  <button
                    key={tk.id}
                    className={`${m.threadItem} ${isSelected ? m.threadActive : ""}`}
                    onClick={() => openTicket(tk)}
                    style={{ width: "100%", border: "none", background: "none", textAlign: "left", cursor: "pointer" }}
                  >
                    <div className={m.threadAvatar} style={{ background: "var(--adm-accent, #8B4852)", color: "white", fontSize: 12, fontWeight: 700 }}>
                      {(tk.subject || "T").slice(0, 2).toUpperCase()}
                    </div>
                    <div className={m.threadItemBody}>
                      <div className={m.threadItemTop}>
                        <span className={m.threadItemName} style={{ fontSize: 12, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                          {tk.subject}
                        </span>
                        <span className={m.threadItemTime}>
                          {new Date(tk.updatedAt || tk.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap", alignItems: "center" }}>
                        <span style={{ background: cfg.bg, color: cfg.color, fontSize: 10, padding: "1px 6px", borderRadius: 20, fontWeight: 600 }}>
                          {cfg.label}
                        </span>
                        <span style={{ fontSize: 10, color: "var(--adm-text-muted, #7a6a60)" }}>
                          {TICKET_TYPES[tk.type] || tk.type}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Detail panel */}
        {active ? (
          <div className={m.convPanel}>
            {/* Header */}
            <div className={m.convHeader} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div>
                <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "var(--adm-text, #1a1210)" }}>
                  {active.subject}
                </h3>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <StatusBadge status={active.status} />
                  <span style={{ fontSize: 11, color: "var(--adm-text-muted, #7a6a60)" }}>
                    {TICKET_TYPES[active.type] || active.type}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--adm-text-muted, #7a6a60)" }}>
                    Creator: {active.creatorRole?.toLowerCase().replace(/_/g, " ") || "—"}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "center" }}>
                {!isTerminal && (
                  <>
                    {showResolve ? (
                      <>
                        <button
                          onClick={() => setShowResolve(false)}
                          style={{ padding: "6px 12px", borderRadius: 8, border: "1.5px solid var(--adm-border, #e8e0d5)", background: "none", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleResolve}
                          disabled={actionLoading}
                          style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "#16a34a", color: "white", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5 }}
                        >
                          <CheckCircle size={13} /> {actionLoading ? "Resolving…" : "Confirm Resolve"}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setShowResolve(true)}
                        style={{ padding: "6px 12px", borderRadius: 8, border: "1.5px solid #86efac", background: "#dcfce7", color: "#15803d", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5 }}
                      >
                        <CheckCircle size={13} /> Resolve
                      </button>
                    )}
                    <button
                      onClick={handleClose}
                      disabled={actionLoading}
                      style={{ padding: "6px 12px", borderRadius: 8, border: "1.5px solid #fca5a5", background: "#fee2e2", color: "#dc2626", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5 }}
                    >
                      <XCircle size={13} /> {actionLoading ? "Closing…" : "Force Close"}
                    </button>
                  </>
                )}
              </div>
            </div>

            {showResolve && (
              <div style={{ padding: "8px 20px", borderBottom: "1px solid var(--adm-border, #e8e0d5)" }}>
                <input
                  style={{ width: "100%", padding: "7px 11px", border: "1.5px solid var(--adm-border, #e8e0d5)", borderRadius: 8, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" }}
                  placeholder="Resolution note (optional)…"
                  value={resolveNote}
                  onChange={(e) => setResolveNote(e.target.value)}
                />
              </div>
            )}

            {/* Messages */}
            <div className={m.messagesArea}>
              <div className={m.sysEvent}>
                <span className={m.sysEventLabel}>
                  Thread opened · {new Date(active.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>

              {active.messages.length === 0 && (
                <p style={{ textAlign: "center", color: "var(--adm-text-muted, #7a6a60)", fontSize: 13, padding: "20px 0" }}>
                  No messages yet.
                </p>
              )}

              {active.messages.map((msg, i) => {
                const isAdmin = msg.from === "admin";
                return (
                  <div key={i} className={`${m.msgRow} ${isAdmin ? m.msgRight : m.msgLeft}`}>
                    {!isAdmin && (
                      <div className={m.msgAvatar} style={{ background: "#4f46e5" }}>
                        <User size={13} />
                      </div>
                    )}
                    <div className={m.msgContent}>
                      <div className={`${m.bubble} ${isAdmin ? m.bubbleAdmin : m.bubbleCustomer}`}>
                        <p className={m.bubbleText}>{msg.text}</p>
                        {msg.attachments?.map((att) =>
                          att.isImage ? (
                            <a key={att.url} href={att.url} target="_blank" rel="noreferrer">
                              <img src={att.url} alt={att.name} style={{ display: "block", maxWidth: 180, maxHeight: 130, marginTop: 6, borderRadius: 6, objectFit: "cover" }} />
                            </a>
                          ) : (
                            <a key={att.url} href={att.url} target="_blank" rel="noreferrer" style={{ display: "block", fontSize: 11, opacity: 0.8, marginTop: 4 }}>
                              📎 {att.name}
                            </a>
                          ),
                        )}
                        <span className={m.bubbleTime}>{msg.time}</span>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className={m.msgAvatar} style={{ background: "#8B4852" }}>
                        <Shield size={13} />
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Reply box */}
            {!isTerminal ? (
              <form
                className={m.replyBox}
                onSubmit={(e) => { e.preventDefault(); sendReply(); }}
              >
                {file && (
                  <div className={m.fileChip}>
                    <Paperclip size={12} />
                    <span>{file.name}</span>
                    <button type="button" onClick={() => setFile(null)}><X size={11} /></button>
                  </div>
                )}
                <div className={m.replyInputRow}>
                  <button type="button" className={m.attachBtn} onClick={() => fileRef.current?.click()}>
                    <Paperclip size={17} />
                  </button>
                  <input type="file" ref={fileRef} style={{ display: "none" }} accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => setFile(e.target.files[0] || null)} />
                  <textarea
                    className={m.replyTextarea}
                    rows={2}
                    placeholder="Reply as Admin…"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                  />
                  <button type="submit" className={m.sendBtn} style={{ background: "var(--adm-accent, #8B4852)" }} disabled={(!reply.trim() && !file) || sending}>
                    <Send size={16} />
                  </button>
                </div>
              </form>
            ) : (
              <div className={m.closedBanner}>
                <CheckCircle size={15} />
                This ticket is {STATUS_CFG[active.status]?.label?.toLowerCase() || "closed"}.
              </div>
            )}
          </div>
        ) : (
          <div className={m.emptyConv}>
            <div className={m.emptyConvIcon}><MessageSquare size={30} /></div>
            <h3 className={m.emptyConvTitle}>Select a ticket</h3>
            <p className={m.emptyConvText}>
              Pick a claimed ticket on the left to view and continue the thread.
              Claim escalated tickets from the Tickets tab.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
