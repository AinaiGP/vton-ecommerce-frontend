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
  ChevronLeft,
  FileText,
  CheckCircle2,
  Package,
  Truck,
} from "lucide-react";
import VendorLayout from "../components/vendor/VendorLayout";
import p from "../styles/VendorPage.module.css";
import apiClient, { multipartClient } from "../utils/apiClient";
import { formatPrice } from "../utils/formatPrice";

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
  VENDOR_APPROVED: "Approved — Awaiting Item",
  VENDOR_REJECTED: "Rejected",
  ITEM_IN_TRANSIT: "In Transit",
  ITEM_RECEIVED: "Item Received",
  REFUND_PENDING: "Refund Processing",
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

const mapReturnTicket = (ticket) => ({
  id: ticket.id,
  orderItemId: ticket.orderItemIds?.[0],
  orderNumber: ticket.order?.orderNumber || "...",
  customer: ticket.order?.shippingName || "Customer",
  product: ticket.subject?.replace("Return request for ", "") || "Product",
  reason: ticket.returnReason || "No reason provided",
  status: ticket.returnStatus || "REQUESTED",
  date: ticket.createdAt,
  messages: ticket.messages || [],
  amount: ticket.refundAmount || 0,
  quantity: ticket.returnQuantity || 1,
  supportInvited: ticket.supportInvited,
});

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

/* ── Modals ─────────────────────────────────────────────────────────────── */

function ModalOverlay({ children, onClose }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 2000,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function ConditionModal({ onConfirm, onClose, loading }) {
  const [condition, setCondition] = useState("RESTORABLE");
  const [defectNote, setDefectNote] = useState("");

  return (
    <ModalOverlay onClose={onClose}>
      <div style={{ background: "white", borderRadius: 16, padding: 32, width: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <h3 style={{ margin: "0 0 6px", fontSize: 18 }}>Confirm Item Received</h3>
        <p style={{ margin: "0 0 24px", fontSize: 13, color: "var(--vdr-text-muted)" }}>
          Select the condition of the returned item. This determines whether it is restocked.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          {[
            {
              value: "RESTORABLE",
              icon: "✅",
              title: "Good Condition (Restorable)",
              desc: "Item passes inspection and will be returned to inventory stock.",
            },
            {
              value: "DEFECTIVE",
              icon: "⚠️",
              title: "Defective / Damaged",
              desc: "Item is damaged or cannot be resold. Will NOT be restocked.",
            },
          ].map((opt) => (
            <label
              key={opt.value}
              style={{
                display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px",
                border: `2px solid ${condition === opt.value ? "var(--vdr-accent)" : "#e2e8f0"}`,
                borderRadius: 12, cursor: "pointer",
                background: condition === opt.value ? "rgba(var(--vdr-accent-rgb, 79,70,229),0.05)" : "white",
              }}
            >
              <input
                type="radio"
                name="condition"
                value={opt.value}
                checked={condition === opt.value}
                onChange={() => setCondition(opt.value)}
                style={{ marginTop: 3, accentColor: "var(--vdr-accent)" }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{opt.icon} {opt.title}</div>
                <div style={{ fontSize: 12, color: "var(--vdr-text-muted)", marginTop: 2 }}>{opt.desc}</div>
              </div>
            </label>
          ))}
        </div>

        {condition === "DEFECTIVE" && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>
              Defect Description <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Zipper broken, visible stains, packaging torn…"
              value={defectNote}
              onChange={(e) => setDefectNote(e.target.value)}
              style={{
                width: "100%", boxSizing: "border-box", padding: "10px 12px", fontSize: 13,
                border: "1.5px solid #e2e8f0", borderRadius: 8, resize: "vertical", fontFamily: "inherit",
              }}
            />
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: "10px 0", background: "#f1f5f9", border: "none", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(condition, defectNote)}
            disabled={loading}
            style={{
              flex: 2, padding: "10px 0", background: "var(--vdr-accent)", color: "white",
              border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Processing…" : "Confirm & Initiate Refund"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

function RejectModal({ onConfirm, onClose, loading }) {
  const [reason, setReason] = useState("");

  return (
    <ModalOverlay onClose={onClose}>
      <div style={{ background: "white", borderRadius: 16, padding: 32, width: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <h3 style={{ margin: "0 0 6px", fontSize: 18 }}>Reject Return Request</h3>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--vdr-text-muted)" }}>
          Provide a reason for rejection. This will be visible to the customer.
        </p>
        <textarea
          rows={4}
          placeholder="e.g. Return window has expired. / Item shows signs of use beyond normal wear."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={{
            width: "100%", boxSizing: "border-box", padding: "10px 12px", fontSize: 13,
            border: "1.5px solid #e2e8f0", borderRadius: 8, resize: "vertical", fontFamily: "inherit", marginBottom: 20,
          }}
        />
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: "10px 0", background: "#f1f5f9", border: "none", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason || "Rejected by store policy")}
            disabled={loading}
            style={{
              flex: 2, padding: "10px 0", background: "#dc2626", color: "white",
              border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Rejecting…" : "Reject Return"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

/* ── Main page ─────────────────────────────────────────────────────────── */

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
  const [conditionModal, setConditionModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);

  const fileRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => { fetchRefunds(); }, []);

  useEffect(() => {
    if (view === "detail") bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages, view]);

  useEffect(() => {
    if (view === "detail" && selected?.id) {
      apiClient
        .get(`/vendors/support/tickets/${selected.id}`)
        .then((res) => setSelected((prev) => ({ ...prev, messages: res.data?.messages || [] })))
        .catch(() => {});
    }
  }, [view, selected?.id]);

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/vendors/support/tickets", {
        params: { type: "RETURN_REQUEST", limit: 100 },
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
      setSelected((prev) => ({ ...prev, messages: updatedRes.data?.messages || [] }));
    } catch (err) {
      showToast("Failed to send message.", false);
    } finally {
      setSending(false);
    }
  };

  const handleApprove = async () => {
    setSending(true);
    try {
      await apiClient.patch(`/vendors/orders/returns/${selected.id}/approve`);
      showToast("Return approved. Customer notified to ship item back.");
      await fetchRefunds();
      // Refresh selected with updated status
      const updatedRes = await apiClient.get(`/vendors/support/tickets/${selected.id}`);
      setSelected(mapReturnTicket(updatedRes.data));
    } catch (err) {
      showToast("Failed to approve return.", false);
    } finally {
      setSending(false);
    }
  };

  const handleReject = async (reason) => {
    setSending(true);
    try {
      await apiClient.patch(`/vendors/orders/returns/${selected.id}/reject`, { reason });
      showToast("Return rejected.");
      setRejectModal(false);
      await fetchRefunds();
      setView("list");
      setSelected(null);
    } catch (err) {
      showToast("Failed to reject return.", false);
    } finally {
      setSending(false);
    }
  };

  const handleInviteSupport = async () => {
    setSending(true);
    try {
      await apiClient.patch(`/vendors/support/tickets/${selected.id}/invite`);
      showToast("Support invited to join the ticket.");
      const updatedRes = await apiClient.get(`/vendors/support/tickets/${selected.id}`);
      setSelected(mapReturnTicket(updatedRes.data));
      await fetchRefunds();
    } catch (err) {
      showToast("Failed to invite support.", false);
    } finally {
      setSending(false);
    }
  };

  const handleConfirmReceived = async (condition, defectNote) => {
    setSending(true);
    try {
      await apiClient.patch(`/vendors/orders/returns/${selected.id}/item-received`, {
        condition,
        ...(defectNote ? { defectNote } : {}),
      });
      showToast("Item confirmed received. Refund is being processed.");
      setConditionModal(false);
      await fetchRefunds();
      setView("list");
      setSelected(null);
    } catch (err) {
      showToast("Failed to confirm receipt.", false);
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
    if (tab === "Approved") return q && ["VENDOR_APPROVED", "ITEM_RECEIVED", "REFUND_PENDING", "COMPLETED"].includes(r.status);
    if (tab === "Rejected") return q && r.status === "VENDOR_REJECTED";
    return q;
  });

  const counts = {
    Pending: refunds.filter((r) => r.status === "REQUESTED" || r.status === "ITEM_IN_TRANSIT").length,
    Approved: refunds.filter((r) => ["VENDOR_APPROVED", "ITEM_RECEIVED", "REFUND_PENDING", "COMPLETED"].includes(r.status)).length,
    Rejected: refunds.filter((r) => r.status === "VENDOR_REJECTED").length,
  };

  return (
    <VendorLayout
      pageTitle="Refund Requests"
      pageSubtitle="Review and manage customer refund requests."
      breadcrumb="Refunds"
    >
      {conditionModal && (
        <ConditionModal
          onConfirm={handleConfirmReceived}
          onClose={() => setConditionModal(false)}
          loading={sending}
        />
      )}
      {rejectModal && (
        <RejectModal
          onConfirm={handleReject}
          onClose={() => setRejectModal(false)}
          loading={sending}
        />
      )}

      {toast && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8, padding: "11px 18px",
          background: toast.ok ? "#dcfce7" : "#fee2e2",
          border: `1px solid ${toast.ok ? "#bbf7d0" : "#fca5a5"}`,
          borderRadius: 10, color: toast.ok ? "#16a34a" : "#dc2626",
          fontWeight: 600, fontSize: 13.5, marginBottom: 16, position: "sticky", top: 0, zIndex: 10,
        }}>
          {toast.ok ? <Check size={15} /> : <AlertTriangle size={15} />} {toast.msg}
        </div>
      )}

      {fullscreenImage && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out", padding: 40 }}
          onClick={() => setFullscreenImage(null)}
        >
          <img src={fullscreenImage} alt="Fullscreen Preview" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 8 }} onClick={(e) => e.stopPropagation()} />
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
                        <td style={{ color: "var(--vdr-text-muted)" }}>{r.date ? new Date(r.date).toLocaleDateString() : "—"}</td>
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
          {/* Header */}
          <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--vdr-border)", display: "flex", alignItems: "center", gap: 16, background: "white" }}>
            <button onClick={() => setView("list")} style={{ background: "#f1f5f9", border: "none", cursor: "pointer", padding: 8, borderRadius: 10 }}>
              <ChevronLeft size={18} />
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h4 style={{ margin: 0, fontSize: 16 }}>{selected.product}</h4>
                <span className={`${p.badge} ${STATUS_BADGE[selected.status] || p.badgePending}`}>
                  <span className={p.badgeDot} /> {STATUS_LABELS[selected.status] || selected.status}
                </span>
              </div>
              <span style={{ fontSize: 12, color: "var(--vdr-text-muted)" }}>
                Return ID: {selected.id} · Order: {selected.orderNumber}
              </span>
            </div>

            {/* Action buttons */}
            {selected.status === "REQUESTED" && (
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  className={`${p.btn} ${p.btnPrimary}`}
                  style={{ background: "#16a34a" }}
                  onClick={handleApprove}
                  disabled={sending}
                >
                  <Check size={14} /> Approve
                </button>
                <button
                  className={`${p.btn} ${p.btnOutline}`}
                  style={{ color: "#dc2626", borderColor: "#fca5a5" }}
                  onClick={() => setRejectModal(true)}
                  disabled={sending}
                >
                  <X size={14} /> Reject
                </button>
              </div>
            )}
            {(selected.status === "VENDOR_APPROVED" || selected.status === "ITEM_IN_TRANSIT") && (
              <button
                className={`${p.btn} ${p.btnPrimary}`}
                onClick={() => setConditionModal(true)}
                disabled={sending}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <Package size={14} /> Confirm Item Received
              </button>
            )}
            {selected.status !== "COMPLETED" && selected.status !== "CANCELED" && !selected.supportInvited && (
              <button
                className={`${p.btn} ${p.btnPrimary}`}
                onClick={handleInviteSupport}
                disabled={sending}
                style={{ background: "var(--burgundy, #7c3aed)", borderColor: "var(--burgundy, #7c3aed)", color: "white", marginLeft: 10, display: "flex", alignItems: "center", gap: 6 }}
              >
                Invite Support
              </button>
            )}
          </div>

          <div style={{ padding: 32, background: "white" }}>
            {/* Courier info banner for approved state */}
            {(selected.status === "VENDOR_APPROVED" || selected.status === "ITEM_IN_TRANSIT") && (
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 20px",
                background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: 12, marginBottom: 24,
              }}>
                <Truck size={20} style={{ color: "#3b82f6", flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#1d4ed8", marginBottom: 4 }}>
                    {selected.status === "ITEM_IN_TRANSIT" ? "Item is in Transit" : "Waiting for Customer to Ship Item"}
                  </div>
                  <div style={{ fontSize: 13, color: "#3b82f6", lineHeight: 1.5 }}>
                    {selected.status === "ITEM_IN_TRANSIT"
                      ? "The customer has shipped the item back. Once your courier or warehouse receives it, click \"Confirm Item Received\" above."
                      : "The customer has been notified to ship the item back within 7 days. Once you receive it at your warehouse, click \"Confirm Item Received\" above to select the item's condition and initiate the refund."}
                  </div>
                </div>
              </div>
            )}

            {/* Refund processed banner */}
            {(selected.status === "REFUND_PENDING" || selected.status === "COMPLETED") && (
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 20px",
                background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 12, marginBottom: 24,
              }}>
                <CheckCircle2 size={20} style={{ color: "#16a34a", flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#15803d", marginBottom: 4 }}>
                    Refund is Being Processed
                  </div>
                  <div style={{ fontSize: 13, color: "#16a34a" }}>
                    Item received and verified. The refund of {formatPrice(selected.amount)} will be credited to the customer.
                  </div>
                </div>
              </div>
            )}

            {/* Details grid */}
            <div className={p.formGrid}>
              <div>
                <label className={p.label}>Return Reason</label>
                <p style={{ fontSize: 15, fontWeight: 600 }}>{selected.reason}</p>
              </div>
              <div>
                <label className={p.label}>Refund Amount</label>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#16a34a" }}>{formatPrice(selected.amount)}</p>
              </div>
              <div>
                <label className={p.label}>Quantity</label>
                <p style={{ fontSize: 15, fontWeight: 600 }}>{selected.quantity} unit(s)</p>
              </div>
              <div>
                <label className={p.label}>Customer</label>
                <p style={{ fontSize: 15, fontWeight: 600 }}>{selected.customer}</p>
              </div>
            </div>

            {/* Message Thread */}
            <div style={{ marginTop: 32 }}>
              <label className={p.label} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
                <MessageSquare size={14} /> Message Thread
              </label>

              <div style={{ background: "#f8fafc", border: "1px solid var(--vdr-border)", borderRadius: 12, padding: 20, maxHeight: 400, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
                {!selected.messages?.length ? (
                  <p style={{ fontSize: 13, color: "var(--vdr-text-muted)", textAlign: "center", margin: 0 }}>No messages yet.</p>
                ) : (
                  selected.messages.map((msg) => {
                    const isVendor = msg.senderRole === "VENDOR" || msg.senderRole === "vendor";
                    const isSystem = msg.isSystemMessage;
                    const { text, urls } = extractLegacyAttachment(msg.content);

                    if (isSystem) {
                      return (
                        <div key={msg.id} style={{ textAlign: "center" }}>
                          <span style={{ fontSize: 12, color: "#64748b", background: "#e2e8f0", padding: "4px 12px", borderRadius: 20, display: "inline-block" }}>
                            {text}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: isVendor ? "flex-end" : "flex-start" }}>
                        <div style={{
                          maxWidth: "75%", background: isVendor ? "var(--vdr-accent)" : "white",
                          color: isVendor ? "white" : "inherit", padding: "10px 14px",
                          borderRadius: isVendor ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                          border: isVendor ? "none" : "1px solid var(--vdr-border)", fontSize: 13, lineHeight: 1.5,
                        }}>
                          {text}
                          {urls.map(u => isImageUrl(u) ? (
                            <img key={u} src={u} alt="" style={{ marginTop: 8, maxWidth: 160, borderRadius: 8, cursor: "pointer" }} onClick={() => setFullscreenImage(u)} />
                          ) : (
                            <a key={u} href={u} target="_blank" rel="noreferrer" style={{ display: "block", marginTop: 6, fontSize: 12, color: isVendor ? "rgba(255,255,255,0.85)" : "var(--vdr-accent)" }}>{u}</a>
                          ))}
                          {msg.attachments?.map((att) => {
                            const url = att.url || att;
                            return isImageUrl(url) ? (
                              <img key={url} src={url} alt="" style={{ marginTop: 8, maxWidth: 160, borderRadius: 8, cursor: "pointer" }} onClick={() => setFullscreenImage(url)} />
                            ) : (
                              <a key={url} href={url} target="_blank" rel="noreferrer" style={{ display: "block", marginTop: 6, fontSize: 12 }}>{att.name || url}</a>
                            );
                          })}
                        </div>
                        <span style={{ fontSize: 11, color: "var(--vdr-text-muted)", marginTop: 4 }}>
                          {isVendor ? "You" : "Customer"} · {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Reply Input */}
              <form onSubmit={handleReply} style={{ marginTop: 14, display: "flex", gap: 10 }}>
                <div className={p.searchBox} style={{ flex: 1, height: 44, border: "1.5px solid var(--vdr-border)" }}>
                  <input
                    className={p.searchInput}
                    style={{ fontSize: 13 }}
                    placeholder="Write a message…"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <button type="button" onClick={() => fileRef.current?.click()} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--vdr-text-muted)", display: "flex", alignItems: "center" }}>
                    <Paperclip size={15} />
                  </button>
                  <input ref={fileRef} type="file" style={{ display: "none" }} onChange={(e) => setReplyFile(e.target.files?.[0] || null)} />
                </div>
                <button type="submit" className={`${p.btn} ${p.btnPrimary}`} style={{ height: 44, padding: "0 20px" }} disabled={sending || (!replyText.trim() && !replyFile)}>
                  <Send size={14} /> {sending ? "Sending…" : "Send"}
                </button>
              </form>
              {replyFile && (
                <div style={{ marginTop: 8, fontSize: 12, color: "var(--vdr-text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                  <Paperclip size={12} /> {replyFile.name}
                  <button onClick={() => setReplyFile(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", display: "flex" }}><X size={12} /></button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </VendorLayout>
  );
}
