import { useState, useEffect, useRef } from "react";
import {
  Search,
  Eye,
  Check,
  X,
  MessageSquare,
  AlertTriangle,
  Paperclip,
  Send,
  Clock,
  User,
  ChevronLeft,
  FileText,
  CheckCircle2,
} from "lucide-react";
import VendorLayout from "../components/vendor/VendorLayout";
import p from "../styles/VendorPage.module.css";
import apiClient, { multipartClient } from "../utils/apiClient";

const STATUS_BADGE = {
  PENDING: p.badgePending,
  OPEN: p.badgePending,
  IN_PROGRESS: p.badgeDelivered,
  RESOLVED: p.badgeDelivered,
  CLOSED: p.badgeDelivered,
  CANCELED: p.badgeCancelled,
};

const STATUS_LABELS = {
  PENDING: "Pending",
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Approved",
  CLOSED: "Closed",
  CANCELED: "Rejected",
};

function getInitials(name) {
  if (!name) return "??";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
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

function mapReturnTicket(ticket) {
  const messages = (ticket.messages || []).map((m) => {
    const legacy = extractLegacyAttachment(m.content);
    const attachmentUrls = [...(m.attachments || []), ...legacy.urls].filter(Boolean);

    return {
      from: m.senderRole === "VENDOR" ? "me" : "customer",
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
    };
  });

  return {
    id: ticket.id,
    orderId: ticket.orderId || "—",
    customer: ticket.creatorRole === "CUSTOMER" ? "Customer" : "Unknown", // Ideally we get the name from a relation
    product: ticket.subject || "Return Request",
    reason: ticket.returnReason || "—",
    status: ticket.status,
    date: new Date(ticket.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    amount: ticket.refundAmount ? `${(ticket.refundAmount / 100).toFixed(2)} EGP` : "—",
    messages,
    _raw: ticket,
  };
}

function AttachmentList({ attachments, onImageClick }) {
  if (!attachments?.length) return null;
  return (
    <div className={p.ticketAttachmentList}>
      {attachments.map((att) =>
        att.isImage ? (
          <div
            key={att.url}
            className={p.ticketAttachmentImageLink}
            onClick={() => onImageClick(att.url)}
            style={{ cursor: "zoom-in" }}
          >
            <img
              src={att.url}
              alt={att.name}
              className={p.ticketAttachmentImage}
              style={{ width: 120, height: 120, borderRadius: 8, objectFit: "cover" }}
            />
          </div>
        ) : (
          <a
            key={att.url}
            href={att.url}
            target="_blank"
            rel="noreferrer"
            className={p.ticketAttachmentFile}
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--vdr-accent)" }}
          >
            <FileText size={13} />
            <span>{att.name}</span>
          </a>
        ),
      )}
    </div>
  );
}

export default function VendorRefundsPage() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState("list");
  const [replyText, setReplyText] = useState("");
  const [replyFile, setReplyFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [toast, setToast] = useState(null);

  const fileRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    fetchRefunds();
  }, []);

  useEffect(() => {
    if (view === "detail") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selected?.messages, view]);

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/vendors/support/tickets", {
        params: { type: "RETURN_REQUEST", limit: 100 },
      });
      setRefunds((res.data?.data || res.data || []).map(mapReturnTicket));
    } catch (err) {
      console.error("Failed to fetch refund requests", err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2800);
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() && !replyFile) return;

    setSending(true);
    try {
      let attachmentUrl = null;
      if (replyFile) {
        const formData = new FormData();
        formData.append("file", replyFile);
        const uploadRes = await multipartClient.post(
          `/vendors/support/tickets/${selected.id}/messages/attachments`,
          formData,
        );
        attachmentUrl = uploadRes.data?.url;
      }

      await apiClient.post(`/vendors/support/tickets/${selected.id}/messages`, {
        content: replyText?.trim() || "Attachment",
        attachments: attachmentUrl ? [attachmentUrl] : undefined,
      });

      setReplyText("");
      setReplyFile(null);
      const updatedRes = await apiClient.get(`/vendors/support/tickets/${selected.id}`);
      setSelected(mapReturnTicket(updatedRes.data));
    } catch (err) {
      console.error("Failed to reply", err);
      showToast("Failed to send message.", false);
    } finally {
      setSending(false);
    }
  };

  const handleAction = async (id, status, note) => {
    try {
      setSending(true);
      if (status === "RESOLVED") {
        await apiClient.patch(`/vendors/support/tickets/${id}/resolve`, { resolutionNote: note });
      } else if (status === "CANCELED") {
        // Vendors can't "cancel" customer tickets usually, but they can Resolve with rejection
        await apiClient.patch(`/vendors/support/tickets/${id}/resolve`, { resolutionNote: `Rejected: ${note}` });
      }
      
      const updatedRes = await apiClient.get(`/vendors/support/tickets/${id}`);
      const updated = mapReturnTicket(updatedRes.data);
      setSelected(updated);
      setRefunds(prev => prev.map(r => r.id === id ? updated : r));
      showToast(status === "RESOLVED" ? "Return request approved." : "Return request rejected.");
    } catch (err) {
      console.error("Failed to update status", err);
      showToast("Failed to update status.", false);
    } finally {
      setSending(false);
    }
  };

  const filtered = refunds.filter((r) => {
    const q =
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.customer.toLowerCase().includes(search.toLowerCase()) ||
      r.orderId.toLowerCase().includes(search.toLowerCase());
    
    if (tab === "All") return q;
    if (tab === "Pending") return q && (r.status === "PENDING" || r.status === "OPEN" || r.status === "IN_PROGRESS");
    if (tab === "Approved") return q && r.status === "RESOLVED";
    if (tab === "Rejected") return q && r.status === "CANCELED";
    return q;
  });

  const counts = {
    Pending: refunds.filter((r) => r.status === "PENDING" || r.status === "OPEN" || r.status === "IN_PROGRESS").length,
    Approved: refunds.filter((r) => r.status === "RESOLVED").length,
    Rejected: refunds.filter((r) => r.status === "CANCELED").length,
  };

  return (
    <VendorLayout
      pageTitle="Refund Requests"
      pageSubtitle="Review and manage customer refund requests."
      breadcrumb="Refunds"
    >
      {toast && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "11px 18px",
            background: toast.ok ? "#dcfce7" : "#fee2e2",
            border: `1px solid ${toast.ok ? "#bbf7d0" : "#fca5a5"}`,
            borderRadius: 10,
            color: toast.ok ? "#16a34a" : "#dc2626",
            fontWeight: 600,
            fontSize: 13.5,
            marginBottom: 16,
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          {toast.ok ? <Check size={15} /> : <AlertTriangle size={15} />}{" "}
          {toast.msg}
        </div>
      )}

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
          }}
          onClick={() => setFullscreenImage(null)}
        >
          <img
            src={fullscreenImage}
            alt="Fullscreen Preview"
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 8 }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {view === "list" ? (
        <>
          <div className={p.filterTabs}>
            {["All", "Pending", "Approved", "Rejected"].map((t) => (
              <button
                key={t}
                className={`${p.filterTab} ${tab === t ? p.active : ""}`}
                onClick={() => setTab(t)}
              >
                {t}{" "}
                {t !== "All" && (
                  <span style={{ opacity: 0.6 }}>({counts[t] ?? 0})</span>
                )}
              </button>
            ))}
          </div>

          <div className={p.toolbar}>
            <div className={p.searchBox}>
              <Search size={14} className={p.searchIcon} />
              <input
                className={p.searchInput}
                placeholder="Search by refund ID, order or customer…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <span className={p.pageInfo}>{filtered.length} requests</span>
          </div>

          <div className={p.tableCard}>
            <div className={p.tableWrap}>
              <table className={p.table}>
                <thead>
                  <tr>
                    <th>Refund ID</th>
                    <th>Customer</th>
                    <th>Order</th>
                    <th>Product</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th style={{ width: 80 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: 40 }}>
                        <div className={p.spin} style={{ width: 24, height: 24, border: "2px solid #ddd", borderTopColor: "var(--vdr-accent)", borderRadius: "50%", margin: "0 auto" }} />
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div className={p.emptyState}>
                          <div className={p.emptyIcon}>
                            <MessageSquare size={22} />
                          </div>
                          <h3 className={p.emptyTitle}>No refund requests</h3>
                          <p className={p.emptyText}>No requests match your current filter.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 700, color: "var(--vdr-accent)" }}>
                          #{r.id.slice(0, 8)}
                        </td>
                        <td>
                          <div className={p.productCell}>
                            <div className={p.avatar}>{getInitials(r.customer)}</div>
                            <span style={{ fontWeight: 600 }}>{r.customer}</span>
                          </div>
                        </td>
                        <td style={{ color: "var(--vdr-text-muted)", fontSize: 13 }}>{r.orderId.slice(0, 8)}…</td>
                        <td style={{ fontWeight: 500 }}>{r.product}</td>
                        <td style={{ color: "var(--vdr-text-muted)" }}>{r.date}</td>
                        <td>
                          <span className={`${p.badge} ${STATUS_BADGE[r.status] || p.badgePending}`}>
                            <span className={p.badgeDot} />
                            {STATUS_LABELS[r.status] || r.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className={p.actionBtn}
                            onClick={async () => {
                              try {
                                setLoading(true);
                                const res = await apiClient.get(`/vendors/support/tickets/${r.id}`);
                                setSelected(mapReturnTicket(res.data));
                                setView("detail");
                              } catch (err) {
                                console.error("Failed to fetch detail", err);
                              } finally {
                                setLoading(false);
                              }
                            }}
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className={p.settingsPanel} style={{ padding: 0, overflow: "hidden", minHeight: 600, display: "flex", flexDirection: "column" }}>
          {/* Detail Header */}
          <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--vdr-border)", display: "flex", alignItems: "center", gap: 16, background: "white" }}>
            <button onClick={() => setView("list")} style={{ background: "#f1f5f9", border: "none", cursor: "pointer", padding: 8, borderRadius: 10, display: "flex" }}>
              <ChevronLeft size={18} />
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h4 style={{ margin: 0, fontSize: 16 }}>{selected.product}</h4>
                <span className={`${p.badge} ${STATUS_BADGE[selected.status] || p.badgePending}`}>
                  <span className={p.badgeDot} />
                  {STATUS_LABELS[selected.status] || selected.status}
                </span>
              </div>
              <span style={{ fontSize: 12, color: "var(--vdr-text-muted)" }}>Refund ID: {selected.id} · Order: {selected.orderId}</span>
            </div>
            {selected.status !== "RESOLVED" && selected.status !== "CANCELED" && (
               <div style={{ display: "flex", gap: 10 }}>
                 <button className={`${p.btn} ${p.btnPrimary}`} style={{ background: "#16a34a", boxShadow: "none" }} onClick={() => handleAction(selected.id, "RESOLVED", "Approved by vendor")}>
                   <Check size={14} /> Approve
                 </button>
                 <button className={`${p.btn} ${p.btnOutline}`} style={{ color: "#dc2626", borderColor: "#fca5a5" }} onClick={() => handleAction(selected.id, "CANCELED", "Rejected by vendor")}>
                   <X size={14} /> Reject
                 </button>
               </div>
            )}
          </div>

          {/* Chat Area */}
          <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 20, background: "var(--vdr-bg-alt)" }}>
            <div style={{ textAlign: "center", margin: "10px 0" }}>
              <span style={{ fontSize: 11, color: "var(--vdr-text-muted)", background: "white", padding: "4px 12px", borderRadius: 20, border: "1px solid var(--vdr-border)" }}>
                Return request submitted · {selected.date}
              </span>
            </div>

            {selected.messages.map((msg, i) => {
              const isMe = msg.from === "me";
              return (
                <div key={i} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", gap: 12, alignItems: "flex-end" }}>
                  {!isMe && (
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--vdr-accent)", color: "white", display: "flex", alignItems: "center", justifyCenter: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                      <span style={{ margin: "auto" }}>{getInitials(selected.customer)}</span>
                    </div>
                  )}
                  <div style={{ maxWidth: "70%", display: "flex", flexDirection: "column", gap: 4, alignItems: isMe ? "flex-end" : "flex-start" }}>
                    <div style={{ padding: "12px 16px", borderRadius: 16, background: isMe ? "var(--vdr-accent)" : "white", color: isMe ? "white" : "var(--vdr-text)", boxShadow: isMe ? "0 4px 12px rgba(139, 72, 82, 0.15)" : "0 2px 8px rgba(0,0,0,0.05)", border: isMe ? "none" : "1px solid var(--vdr-border)", borderBottomRightRadius: isMe ? 4 : 16, borderBottomLeftRadius: isMe ? 16 : 4 }}>
                      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{msg.text}</p>
                      <AttachmentList attachments={msg.attachments} onImageClick={setFullscreenImage} />
                    </div>
                    <span style={{ fontSize: 10, color: "var(--vdr-text-muted)" }}>{msg.time}</span>
                  </div>
                  {isMe && (
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: "#f1f5f9", color: "var(--vdr-text)", display: "flex", alignItems: "center", justifyCenter: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, border: "1px solid var(--vdr-border)" }}>
                      <span style={{ margin: "auto" }}>Me</span>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Reply Box */}
          {selected.status !== "RESOLVED" && selected.status !== "CANCELED" && (
            <div style={{ padding: "16px 24px", background: "white", borderTop: "1px solid var(--vdr-border)" }}>
              {replyFile && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "#f1f5f9", borderRadius: 8, width: "fit-content", marginBottom: 10, fontSize: 12 }}>
                  <Paperclip size={12} />
                  <span>{replyFile.name}</span>
                  <button onClick={() => setReplyFile(null)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", color: "#64748b" }}>
                    <X size={14} />
                  </button>
                </div>
              )}
              <form onSubmit={handleReply} style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
                <button type="button" onClick={() => fileRef.current?.click()} style={{ background: "#f1f5f9", border: "none", width: 42, height: 42, borderRadius: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                  <Paperclip size={20} />
                </button>
                <input type="file" ref={fileRef} style={{ display: "none" }} accept="image/*" onChange={(e) => setReplyFile(e.target.files[0])} />
                <textarea className={p.textarea} style={{ flex: 1, minHeight: 42, borderRadius: 12, padding: "10px 16px" }} rows={1} placeholder="Reply to customer..." value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => { if(e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(e); } }} />
                <button type="submit" disabled={sending || (!replyText.trim() && !replyFile)} className={p.btn} style={{ background: "var(--vdr-accent)", color: "white", width: 42, height: 42, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", border: "none" }}>
                  <Send size={18} />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </VendorLayout>
  );
}
