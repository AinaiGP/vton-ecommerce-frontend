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
  REQUESTED: p.badgePending,
  VENDOR_APPROVED: p.badgeShipped,
  VENDOR_REJECTED: p.badgeCancelled,
  ITEM_IN_TRANSIT: p.badgePending,
  ITEM_RECEIVED: p.badgeDelivered,
  REFUND_PENDING: p.badgeDelivered,
  COMPLETED: p.badgeDelivered,
};

const STATUS_LABELS = {
  REQUESTED: "Return Requested",
  VENDOR_APPROVED: "Approved",
  VENDOR_REJECTED: "Rejected",
  ITEM_IN_TRANSIT: "In Transit",
  ITEM_RECEIVED: "Received",
  REFUND_PENDING: "Refund Pending",
  COMPLETED: "Completed",
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
  return {
    id: ticket.id,
    orderNumber: ticket.order?.orderNumber || "—",
    customer: ticket.order?.user?.fullName || "Verified Customer",
    product: ticket.product?.name || "Product",
    variant: ticket.variant?.sku || "",
    reason: ticket.reason || "No reason provided",
    description: ticket.description || "",
    status: ticket.returnStatus,
    date: new Date(ticket.createdAt).toLocaleDateString(),
    amount: formatPrice(ticket.refundAmount || 0),
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
      const res = await apiClient.get("/vendors/orders/return-requests", {
        params: { limit: 100 },
      });
      setRefunds((res.data?.data || []).map(mapReturnTicket));
    } catch (err) {
      console.error("Failed to fetch return requests", err);
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

  const handleAction = async (id, action, note) => {
    try {
      setSending(true);
      if (action === "approve") {
        await apiClient.patch(`/vendors/orders/returns/${id}/approve`);
      } else if (action === "reject") {
        await apiClient.patch(`/vendors/orders/returns/${id}/reject`, { reason: note });
      } else if (action === "received") {
        await apiClient.patch(`/vendors/orders/returns/${id}/item-received`, { condition: note }); // note is 'RESTORABLE' or 'DEFECTIVE'
      }
      
      showToast(`Return request ${action}ed.`);
      fetchRefunds();
      setView("list");
      setSelected(null);
    } catch (err) {
      console.error("Failed to update return", err);
      showToast("Failed to update return status.", false);
    } finally {
      setSending(false);
    }
  };

  const filtered = refunds.filter((r) => {
    const q =
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.customer.toLowerCase().includes(search.toLowerCase()) ||
      r.orderNumber.toLowerCase().includes(search.toLowerCase());
    
    if (tab === "All") return q;
    if (tab === "Pending") return q && (r.status === "REQUESTED" || r.status === "ITEM_IN_TRANSIT");
    if (tab === "Approved") return q && (r.status === "VENDOR_APPROVED" || r.status === "ITEM_RECEIVED" || r.status === "REFUND_PENDING" || r.status === "COMPLETED");
    if (tab === "Rejected") return q && r.status === "VENDOR_REJECTED";
    return q;
  });

  const counts = {
    Pending: refunds.filter((r) => r.status === "REQUESTED" || r.status === "ITEM_IN_TRANSIT").length,
    Approved: refunds.filter((r) => r.status === "VENDOR_APPROVED" || r.status === "ITEM_RECEIVED" || r.status === "REFUND_PENDING" || r.status === "COMPLETED").length,
    Rejected: refunds.filter((r) => r.status === "VENDOR_REJECTED").length,
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
              <button key={t} className={`${p.filterTab} ${tab === t ? p.active : ""}`} onClick={() => setTab(t)}>
                {t} {t !== "All" && <span style={{ opacity: 0.6 }}>({counts[t] ?? 0})</span>}
              </button>
            ))}
          </div>

          <div className={p.toolbar}>
            <div className={p.searchBox}>
              <Search size={14} className={p.searchIcon} />
              <input className={p.searchInput} placeholder="Search ID, order, customer…" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                    <th>Order #</th>
                    <th>Product</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th style={{ width: 80 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} style={{ textAlign: "center", padding: 40 }}><div className={p.spin} /></td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={7}><div className={p.emptyState}><MessageSquare size={22} /><h3 className={p.emptyTitle}>No requests</h3></div></td></tr>
                  ) : (
                    filtered.map((r) => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 700, color: "var(--vdr-accent)" }}>#{r.id.slice(0, 8)}</td>
                        <td>
                          <div className={p.productCell}>
                            <div className={p.avatar}>{getInitials(r.customer)}</div>
                            <span style={{ fontWeight: 600 }}>{r.customer}</span>
                          </div>
                        </td>
                        <td style={{ color: "var(--vdr-text-muted)" }}>{r.orderNumber}</td>
                        <td style={{ fontWeight: 500 }}>{r.product}</td>
                        <td style={{ color: "var(--vdr-text-muted)" }}>{r.date}</td>
                        <td>
                          <span className={`${p.badge} ${STATUS_BADGE[r.status] || p.badgePending}`}>
                            <span className={p.badgeDot} /> {STATUS_LABELS[r.status] || r.status}
                          </span>
                        </td>
                        <td>
                          <button className={p.actionBtn} onClick={() => { setSelected(r); setView("detail"); }}><Eye size={14} /></button>
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
        <div className={p.settingsPanel} style={{ padding: 0, minHeight: 400 }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--vdr-border)", display: "flex", alignItems: "center", gap: 16, background: "white" }}>
            <button onClick={() => setView("list")} style={{ background: "#f1f5f9", border: "none", cursor: "pointer", padding: 8, borderRadius: 10 }}><ChevronLeft size={18} /></button>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h4 style={{ margin: 0, fontSize: 16 }}>{selected.product}</h4>
                <span className={`${p.badge} ${STATUS_BADGE[selected.status]}`}> {STATUS_LABELS[selected.status]} </span>
              </div>
              <span style={{ fontSize: 12, color: "var(--vdr-text-muted)" }}>Return ID: {selected.id} · Order: {selected.orderNumber}</span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {selected.status === "REQUESTED" && (
                <>
                  <button className={`${p.btn} ${p.btnPrimary}`} style={{ background: "#16a34a" }} onClick={() => handleAction(selected.id, "approve")}>Approve</button>
                  <button className={`${p.btn} ${p.btnOutline}`} style={{ color: "#dc2626" }} onClick={() => handleAction(selected.id, "reject", "Rejected by store policy")}>Reject</button>
                </>
              )}
              {selected.status === "ITEM_IN_TRANSIT" && (
                <>
                  <button className={`${p.btn} ${p.btnPrimary}`} onClick={() => handleAction(selected.id, "received", "RESTORABLE")}>Received (Good Condition)</button>
                  <button className={`${p.btn} ${p.btnOutline}`} onClick={() => handleAction(selected.id, "received", "DEFECTIVE")}>Received (Defective)</button>
                </>
              )}
            </div>
          </div>

          <div style={{ padding: 32, background: "white" }}>
            <div className={p.formGrid}>
              <div><label className={p.label}>Return Reason</label><p style={{ fontSize: 15, fontWeight: 600 }}>{selected.reason}</p></div>
              <div><label className={p.label}>Refund Amount</label><p style={{ fontSize: 15, fontWeight: 600, color: "#16a34a" }}>{selected.amount}</p></div>
              <div style={{ gridColumn: "1 / -1" }}><label className={p.label}>Customer Explanation</label><p style={{ fontSize: 14, color: "var(--vdr-text-muted)", background: "#f8fafc", padding: 16, borderRadius: 12 }}>{selected.description || "No description provided."}</p></div>
            </div>
            
            {selected._raw?.attachments?.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <label className={p.label}>Attachments</label>
                <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                  {selected._raw.attachments.map(url => (
                    <img key={url} src={url} style={{ width: 120, height: 120, borderRadius: 12, objectFit: "cover", cursor: "pointer" }} onClick={() => setFullscreenImage(url)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </VendorLayout>
  );
}
