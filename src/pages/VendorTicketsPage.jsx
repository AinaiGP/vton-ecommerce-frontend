import { useState, useEffect, useRef } from "react";
import {
  Plus,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Paperclip,
  Send,
  X,
  AlertTriangle,
  FileText,
  ImageIcon,
  Tag,
  Store,
  Clock,
  User,
  Search,
  CheckCircle2,
} from "lucide-react";
import VendorLayout from "../components/vendor/VendorLayout";
import p from "../styles/VendorPage.module.css";
import apiClient, { multipartClient } from "../utils/apiClient";

/* ─── Mapping ─── */
const TICKET_TYPES = [
  { value: "GENERAL_SUPPORT", label: "General Support" },
  { value: "SYSTEM_BUG", label: "System Bug" },
  { value: "ORDER_DISPUTE", label: "Order Dispute" },
];

const STATUS_CFG = {
  PENDING: { color: "#64748b", bg: "#f1f5f9", label: "Pending" },
  OPEN: { color: "#dc2626", bg: "#fee2e2", label: "Open" },
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

function senderRoleLabel(role) {
  switch (String(role || "").toLowerCase()) {
    case "admin": return "Admin";
    case "technical_support": return "Support";
    case "vendor": return "Vendor";
    case "customer": return "Customer";
    default: return "Support";
  }
}

function getInitials(name) {
  if (!name) return "S";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "S";
}

function supportAvatarColor(role) {
  switch (String(role || "").toLowerCase()) {
    case "admin": return "var(--vdr-accent)";
    case "technical_support": return "#0369a1";
    default: return "#4f46e5";
  }
}

function mapTicket(ticket) {
  const messages = (ticket.messages || []).map((m) => {
    const legacy = extractLegacyAttachment(m.content);
    const attachmentUrls = [...(m.attachments || []), ...legacy.urls].filter(
      Boolean,
    );
    const senderRole = String(m.senderRole || "").toLowerCase();
    const sender = m.sender || null;
    const senderName = sender?.name || sender?.email || senderRoleLabel(senderRole);
    const senderAvatar = sender?.avatarUrl || null;

    return {
      from: senderRole === "vendor" ? "me" : "support",
      text: legacy.text || m.content,
      time: new Date(m.createdAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      attachments: attachmentUrls.map((url) => ({
        url,
        name: url.split("/").pop() || "Attachment",
        isImage: isImageUrl(url),
      })),
      senderName,
      senderRole,
      senderAvatar,
    };
  });

  return {
    id: ticket.id,
    subject: ticket.subject,
    category: getCategoryLabel(ticket.type),
    type: ticket.type,
    status: ticket.status,
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

/* ─── Confirm Cancel Modal ─── */
function ConfirmCancelModal({ onConfirm, onClose, loading }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(2px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          width: "100%",
          maxWidth: 400,
          padding: 28,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: "0 0 12px", fontSize: 17 }}>Cancel Ticket</h3>
        <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--vdr-text-muted)" }}>
          Are you sure you want to cancel this ticket? This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              border: "1px solid var(--vdr-border)",
              background: "transparent",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Keep Ticket
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              border: "none",
              background: "#dc2626",
              color: "white",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {loading ? "Canceling…" : "Yes, Cancel It"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VendorTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyFile, setReplyFile] = useState(null);
  const [createFile, setCreateFile] = useState(null);
  const [createPreviewUrl, setCreatePreviewUrl] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [cancelingId, setCancelingId] = useState(null); // id of ticket to confirm cancel
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

  const fileRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (view === "detail") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selected?.messages, view]);

  useEffect(() => {
    if (!createFile) {
      setCreatePreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(createFile);
    setCreatePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [createFile]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/vendors/support/tickets");
      setTickets((res.data?.data || res.data || []).map(mapTicket));
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    } finally {
      setLoading(false);
    }
  };

  const closeCreateModal = () => {
    setShowCreate(false);
    setCreateFile(null);
    setCreatePreviewUrl(null);
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    const subject = e.target.subject.value;
    const type = e.target.type.value;
    const description = e.target.description.value;
    const file = createFile;

    setSending(true);
    setError(null);
    try {
      const res = await apiClient.post("/vendors/support/tickets", {
        subject,
        type,
        description,
      });

      if (file) {
        try {
          const formData = new FormData();
          formData.append("file", file);
          const uploadRes = await multipartClient.post(
            `/vendors/support/tickets/${res.data.id}/messages/attachments`,
            formData,
          );
          const url = uploadRes.data?.url;
          if (url) {
            await apiClient.post(
              `/vendors/support/tickets/${res.data.id}/messages`,
              {
                content: "Attachment",
                attachments: [url],
              },
            );
          }
        } catch (err) {
          setError("Ticket created, but attachment failed (must be image < 5MB).");
          setShowCreate(false);
          setCreateFile(null);
          setCreatePreviewUrl(null);
          await fetchTickets();
          const newTkRes = await apiClient.get(
            `/vendors/support/tickets/${res.data.id}`,
          );
          setSelected(mapTicket(newTkRes.data));
          setView("detail");
          setSending(false);
          return;
        }
      }

      setShowCreate(false);
      setCreateFile(null);
      setCreatePreviewUrl(null);
      await fetchTickets();
      // Open the new ticket
      const newTkRes = await apiClient.get(
        `/vendors/support/tickets/${res.data.id}`,
      );
      setSelected(mapTicket(newTkRes.data));
      setView("detail");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create ticket.");
    } finally {
      setSending(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() && !replyFile) return;

    setSending(true);
    try {
      let content = replyText;
      if (replyFile) {
        try {
          const formData = new FormData();
          formData.append("file", replyFile);
          const uploadRes = await multipartClient.post(
            `/vendors/support/tickets/${selected.id}/messages/attachments`,
            formData,
          );
          const url = uploadRes.data?.url;
          if (url) {
            content = content || "Attachment";
            await apiClient.post(
              `/vendors/support/tickets/${selected.id}/messages`,
              {
                content,
                attachments: [url],
              },
            );
            content = null;
          }
        } catch (err) {
          alert("Failed to upload attachment. It must be an image under 5MB.");
          throw err;
        }
      }

      if (content !== null) {
        await apiClient.post(
          `/vendors/support/tickets/${selected.id}/messages`,
          {
            content: content || "Message sent",
          },
        );
      }

      setReplyText("");
      setReplyFile(null);
      const updatedRes = await apiClient.get(
        `/vendors/support/tickets/${selected.id}`,
      );
      setSelected(mapTicket(updatedRes.data));
    } catch (err) {
      console.error("Failed to reply", err);
    } finally {
      setSending(false);
    }
  };

  const handleCancelTicket = async (id) => {
    setCancelingId(id);
  };

  const confirmCancel = async () => {
    const id = cancelingId;
    try {
      await apiClient.patch(`/vendors/support/tickets/${id}/cancel`);
      const updatedRes = await apiClient.get(`/vendors/support/tickets/${id}`);
      const updatedTk = mapTicket(updatedRes.data);
      setSelected(updatedTk);
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? updatedTk : t)),
      );
      addToast("Ticket canceled successfully.");
    } catch (err) {
      console.error("Failed to cancel ticket", err);
      addToast("Failed to cancel ticket.", "error");
    } finally {
      setCancelingId(null);
    }
  };

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

  const filteredTickets = tickets.filter((t) => {
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
  });

  return (
    <VendorLayout
      pageTitle="Support Center"
      pageSubtitle="Get help from our technical and business support teams."
      breadcrumb="Support"
    >
      {/* Toasts */}
      <div
        style={{
          position: "fixed",
          top: 30,
          right: 30,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              background: toast.type === "error" ? "#fee2e2" : "#dcfce7",
              border: `1px solid ${toast.type === "error" ? "#fca5a5" : "#86efac"}`,
              color: toast.type === "error" ? "#dc2626" : "#15803d",
              padding: "14px 20px",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 10,
              boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
              animation: "vdr-toast-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {toast.type === "error" ? (
              <AlertTriangle size={18} />
            ) : (
              <CheckCircle2 size={18} />
            )}{" "}
            {toast.text}
          </div>
        ))}
      </div>

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
            animation: "vdr-fade-in 0.2s ease",
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
              animation: "vdr-zoom-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <style>{`
        @keyframes vdr-toast-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes vdr-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes vdr-zoom-in { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>

      <div
        className={p.settingsPanel}
        style={{ padding: 0, overflow: "hidden", minHeight: 600 }}
      >
        {view === "list" ? (
          <div style={{ padding: 24 }}>
            {/* Stats Summary */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 12,
                marginBottom: 24,
              }}
            >
              {[
                { label: "Pending", color: "#64748b", bg: "#f1f5f9" },
                { label: "In Progress", color: "#f59e0b", bg: "#fef3c7" },
                { label: "Resolved", color: "#16a34a", bg: "#dcfce7" },
                { label: "Closed", color: "#94a3b8", bg: "#f1f5f9" },
                { label: "Canceled", color: "#94a3b8", bg: "#f1f5f9" },
              ].map(({ label, color, bg }) => (
                <div
                  key={label}
                  onClick={() =>
                    setStatusFilter((p) => (p === label ? "All" : label))
                  }
                  style={{
                    background: statusFilter === label ? bg : "white",
                    border: `2px solid ${statusFilter === label ? color : "var(--vdr-border)"}`,
                    borderRadius: 16,
                    padding: "16px 20px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      fontSize: 24,
                      fontWeight: 800,
                      color: color,
                      lineHeight: 1,
                      marginBottom: 4,
                    }}
                  >
                    {counts[label] || 0}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--vdr-text-muted)",
                    }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 18 }}>Support Tickets</h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: "var(--vdr-text-muted)",
                  }}
                >
                  You have {tickets.length} total tickets.
                </p>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ position: "relative" }}>
                  <Search
                    size={14}
                    style={{
                      position: "absolute",
                      left: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--vdr-text-muted)",
                    }}
                  />
                  <input
                    className={p.input}
                    style={{ paddingLeft: 32, width: 200, height: 38 }}
                    placeholder="Search tickets..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <select
                  className={p.select}
                  style={{ height: 38, padding: "0 12px", borderRadius: 10 }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Status</option>
                  {[
                    "Pending",
                    "Open",
                    "In Progress",
                    "Waiting for Support",
                    "Escalated",
                    "Resolved",
                    "Closed",
                    "Canceled",
                  ].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  className={`${p.btn} ${p.btnPrimary}`}
                  onClick={() => setShowCreate(true)}
                >
                  <Plus size={14} /> New Ticket
                </button>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: "80px 0", textAlign: "center" }}>
                <div
                  className={p.spin}
                  style={{
                    border: "2px solid #ddd",
                    borderTopColor: "var(--vdr-accent)",
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    margin: "0 auto",
                  }}
                />
              </div>
            ) : filteredTickets.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 20px" }}>
                <MessageSquare
                  size={48}
                  style={{ color: "var(--vdr-border)", marginBottom: 16 }}
                />
                <h4 style={{ margin: "0 0 8px" }}>No tickets found</h4>
                <p
                  style={{
                    color: "var(--vdr-text-muted)",
                    margin: 0,
                    fontSize: 14,
                  }}
                >
                  {search
                    ? "Try a different search term."
                    : "Need help? Create a ticket and our team will assist you."}
                </p>
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {filteredTickets.map((tk) => (
                  <div
                    key={tk.id}
                    className={p.ticketCard}
                    style={{
                      padding: 18,
                      border: "1px solid var(--vdr-border)",
                      borderRadius: 14,
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "all 0.2s",
                      background: "white",
                    }}
                    onClick={() => {
                      setSelected(tk);
                      setView("detail");
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor = "var(--vdr-accent)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor = "var(--vdr-border)")
                    }
                  >
                    <div
                      style={{ display: "flex", gap: 16, alignItems: "center" }}
                    >
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 12,
                          background: STATUS_CFG[tk.status]?.bg,
                          color: STATUS_CFG[tk.status]?.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <MessageSquare size={20} />
                      </div>
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            marginBottom: 4,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 12,
                              color: "var(--vdr-text-muted)",
                              fontWeight: 600,
                            }}
                          >
                            #{tk.id.slice(0, 8)}
                          </span>
                          <span
                            style={{
                              fontSize: 10,
                              padding: "2px 8px",
                              borderRadius: 20,
                              background: STATUS_CFG[tk.status]?.bg,
                              color: STATUS_CFG[tk.status]?.color,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            {getStatusLabel(tk.status)}
                          </span>
                        </div>
                        <h4
                          style={{
                            margin: "0 0 4px",
                            fontSize: 15,
                            fontWeight: 600,
                          }}
                        >
                          {tk.subject}
                        </h4>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            fontSize: 12,
                            color: "var(--vdr-text-muted)",
                          }}
                        >
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Tag size={12} /> {tk.category}
                          </span>
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Clock size={12} /> {tk.updated}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      size={18}
                      style={{ color: "var(--vdr-text-muted)" }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Ticket Detail View */
          <div
            style={{ height: 700, display: "flex", flexDirection: "column" }}
          >
            <div
              style={{
                padding: "16px 24px",
                borderBottom: "1px solid var(--vdr-border)",
                display: "flex",
                alignItems: "center",
                gap: 16,
                background: "white",
              }}
            >
              <button
                onClick={() => setView("list")}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  cursor: "pointer",
                  padding: 8,
                  borderRadius: 10,
                  display: "flex",
                }}
              >
                <ChevronLeft size={18} />
              </button>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h4 style={{ margin: 0, fontSize: 16 }}>
                    {selected.subject}
                  </h4>
                  <span
                    style={{
                      fontSize: 10,
                      padding: "2px 8px",
                      borderRadius: 20,
                      background: STATUS_CFG[selected.status]?.bg,
                      color: STATUS_CFG[selected.status]?.color,
                      fontWeight: 700,
                    }}
                  >
                    {getStatusLabel(selected.status)}
                  </span>
                </div>
                <span style={{ fontSize: 12, color: "var(--vdr-text-muted)" }}>
                  Ticket ID: {selected.id}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {["PENDING", "OPEN", "AWAITING_RESPONSE"].includes(
                  selected.status,
                ) && (
                  <button
                    className={`${p.btn} ${p.btnOutline} ${p.btnSm}`}
                    onClick={() => handleCancelTicket(selected.id)}
                  >
                    Cancel Ticket
                  </button>
                )}
            </div>
          </div>
          {cancelingId && (
            <ConfirmCancelModal
              loading={false}
              onClose={() => setCancelingId(null)}
              onConfirm={confirmCancel}
            />
          )}

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 20,
                background: "#f8fafc",
              }}
            >
              <div style={{ textAlign: "center", margin: "10px 0" }}>
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--vdr-text-muted)",
                    background: "white",
                    padding: "4px 12px",
                    borderRadius: 20,
                    border: "1px solid var(--vdr-border)",
                  }}
                >
                  Ticket created on {selected.created}
                </span>
              </div>

              {selected.messages?.map((msg, idx) => {
                const isMe = msg.from === "me";
                const avatarBg = isMe
                  ? "var(--vdr-accent)"
                  : supportAvatarColor(msg.senderRole);
                return (
                  <div
                    key={idx}
                    style={{
                      alignSelf: isMe ? "flex-end" : "flex-start",
                      maxWidth: "75%",
                      display: "flex",
                      flexDirection: isMe ? "row-reverse" : "row",
                      alignItems: "flex-end",
                      gap: 8,
                    }}
                  >
                    {/* Avatar */}
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        background: avatarBg,
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 700,
                        flexShrink: 0,
                        overflow: "hidden",
                      }}
                    >
                      {msg.senderAvatar ? (
                        <img
                          src={msg.senderAvatar}
                          alt={msg.senderName}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        getInitials(isMe ? "Me" : msg.senderName)
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isMe ? "flex-end" : "flex-start",
                      }}
                    >
                      {/* Sender name */}
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--vdr-text-muted)",
                          marginBottom: 3,
                        }}
                      >
                        {isMe ? "You" : msg.senderName}
                        {!isMe && (
                          <span
                            style={{
                              marginLeft: 5,
                              fontSize: 9.5,
                              fontWeight: 600,
                              padding: "1px 5px",
                              borderRadius: 4,
                              background: "#dbeafe",
                              color: "#1d4ed8",
                              textTransform: "uppercase",
                              letterSpacing: "0.03em",
                            }}
                          >
                            {senderRoleLabel(msg.senderRole)}
                          </span>
                        )}
                      </span>

                      {/* Bubble */}
                      <div
                        style={{
                          padding: "12px 16px",
                          borderRadius: isMe
                            ? "18px 18px 2px 18px"
                            : "18px 18px 18px 2px",
                          background: isMe ? "var(--vdr-accent)" : "white",
                          color: isMe ? "white" : "var(--vdr-text)",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                          border: isMe ? "none" : "1px solid var(--vdr-border)",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: 14,
                            lineHeight: 1.5,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {msg.text}
                        </p>
                        {msg.attachments?.length > 0 && (
                          <div className={p.ticketAttachmentList}>
                            {msg.attachments.map((att) =>
                              att.isImage ? (
                                <div
                                  key={att.url}
                                  className={p.ticketAttachmentImageLink}
                                  onClick={() => setFullscreenImage(att.url)}
                                  style={{ cursor: "zoom-in" }}
                                >
                                  <img
                                    src={att.url}
                                    alt={att.name}
                                    className={p.ticketAttachmentImage}
                                  />
                                </div>
                              ) : (
                                <a
                                  key={att.url}
                                  href={att.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={p.ticketAttachmentFile}
                                >
                                  <FileText size={14} />
                                  <span className={p.ticketAttachmentName}>
                                    {att.name}
                                  </span>
                                </a>
                              ),
                            )}
                          </div>
                        )}
                      </div>

                      {/* Timestamp */}
                      <span
                        style={{
                          fontSize: 10,
                          color: "var(--vdr-text-muted)",
                          marginTop: 4,
                        }}
                      >
                        {msg.time}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {selected.status !== "CLOSED" && selected.status !== "CANCELED" && (
              <div
                style={{
                  padding: 20,
                  borderTop: "1px solid var(--vdr-border)",
                  background: "white",
                }}
              >
                {replyFile && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 12px",
                      background: "#f1f5f9",
                      borderRadius: 8,
                      width: "fit-content",
                      marginBottom: 10,
                      fontSize: 12,
                    }}
                  >
                    <Paperclip size={12} />
                    <span>{replyFile.name}</span>
                    <button
                      onClick={() => setReplyFile(null)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
                <div
                  style={{ display: "flex", gap: 12, alignItems: "flex-end" }}
                >
                  <div style={{ flex: 1, position: "relative" }}>
                    <textarea
                      className={p.textarea}
                      style={{
                        minHeight: 48,
                        maxHeight: 120,
                        paddingRight: 40,
                        paddingTop: 12,
                      }}
                      placeholder="Write your response..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleReply(e);
                        }
                      }}
                    />
                    <button
                      onClick={() => fileRef.current?.click()}
                      style={{
                        position: "absolute",
                        right: 12,
                        top: 12,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--vdr-text-muted)",
                      }}
                    >
                      <Paperclip size={18} />
                    </button>
                    <input
                      type="file"
                      ref={fileRef}
                      style={{ display: "none" }}
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(e) => setReplyFile(e.target.files[0])}
                    />
                  </div>
                  <button
                    className={`${p.btn} ${p.btnPrimary}`}
                    style={{
                      height: 48,
                      width: 48,
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onClick={handleReply}
                    disabled={(!replyText.trim() && !replyFile) || sending}
                  >
                    {sending ? (
                      <div
                        className={p.spin}
                        style={{ width: 16, height: 16 }}
                      />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </div>
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: 11,
                    color: "var(--vdr-text-muted)",
                  }}
                >
                  Press Enter to send, Shift+Enter for new line.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {showCreate && (
        <div className={p.modalBackdrop} onClick={closeCreateModal}>
          <div
            className={p.modal}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 540 }}
          >
            <div className={p.modalHead}>
              <h2 className={p.modalTitle}>New Support Ticket</h2>
              <button className={p.modalClose} onClick={closeCreateModal}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateTicket}>
              <div className={p.modalBody}>
                {error && (
                  <div
                    style={{
                      padding: 12,
                      background: "#fee2e2",
                      color: "#dc2626",
                      borderRadius: 8,
                      fontSize: 13,
                      marginBottom: 16,
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    <AlertTriangle size={16} /> {error}
                  </div>
                )}
                <div className={p.formGroup}>
                  <label className={p.label}>Subject</label>
                  <input
                    name="subject"
                    className={p.input}
                    placeholder="Briefly summarize the issue"
                    required
                  />
                </div>
                <div className={p.formRow}>
                  <div className={p.formGroup}>
                    <label className={p.label}>Category</label>
                    <select name="type" className={p.select}>
                      {TICKET_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className={p.formGroup}>
                  <label className={p.label}>Description</label>
                  <textarea
                    name="description"
                    className={p.textarea}
                    rows={4}
                    placeholder="Provide details about your problem..."
                    required
                  />
                </div>
                <div className={p.formGroup}>
                  <label className={p.label}>Attachment (Optional)</label>
                  <div
                    onClick={() =>
                      document.getElementById("new-tkt-file").click()
                    }
                    style={{
                      border: "2px dashed var(--vdr-border)",
                      borderRadius: 12,
                      padding: 20,
                      textAlign: "center",
                      cursor: "pointer",
                      background: "#f8fafc",
                    }}
                  >
                    <Paperclip
                      size={24}
                      style={{ color: "var(--vdr-accent)", marginBottom: 8 }}
                    />
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
                      Click to upload a file
                    </p>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: 12,
                        color: "var(--vdr-text-muted)",
                      }}
                    >
                      JPG, PNG or WEBP up to 5MB
                    </p>
                    <input
                      id="new-tkt-file"
                      name="file"
                      type="file"
                      style={{ display: "none" }}
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(e) => setCreateFile(e.target.files[0] || null)}
                    />
                  </div>
                  {createFile && (
                    <div className={p.ticketAttachmentPreview}>
                      {createFile.type?.startsWith("image/") &&
                        createPreviewUrl && (
                          <img
                            src={createPreviewUrl}
                            alt={createFile.name}
                            className={p.ticketAttachmentPreviewImage}
                          />
                        )}
                      <div className={p.ticketAttachmentPreviewInfo}>
                        <span className={p.ticketAttachmentPreviewName}>
                          {createFile.name}
                        </span>
                        <span className={p.ticketAttachmentPreviewMeta}>
                          {(createFile.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <button
                        type="button"
                        className={p.ticketAttachmentPreviewRemove}
                        onClick={() => setCreateFile(null)}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className={p.modalFoot}>
                <button
                  type="button"
                  className={`${p.btn} ${p.btnOutline}`}
                  onClick={closeCreateModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`${p.btn} ${p.btnPrimary}`}
                  disabled={sending}
                >
                  {sending ? "Creating..." : "Create Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </VendorLayout>
  );
}
