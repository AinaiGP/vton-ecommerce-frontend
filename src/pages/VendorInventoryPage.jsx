import React, { useState, useEffect, Fragment } from "react";
import {
  Search,
  Archive,
  ArchiveRestore,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ImageIcon,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  X,
} from "lucide-react";
import VendorLayout from "../components/vendor/VendorLayout";
import ProductImageManager from "../components/vendor/ProductImageManager";
import p from "../styles/VendorPage.module.css";
import apiClient from "../utils/apiClient";
import { formatPrice } from "../utils/formatPrice";

/* ── Stock reason options keyed by direction ──────────────────────────── */
const REASONS = {
  ADD: [
    { label: "Restock / New Delivery", value: "MANUAL_RESTOCK" },
    { label: "Transfer Received", value: "TRANSFER_IN" },
    { label: "Correction (Found Extra Units)", value: "CORRECTION_GAIN" },
  ],
  SUBTRACT: [
    { label: "Damaged / Defective Removal", value: "DAMAGED_REMOVAL" },
    { label: "Lost / Stolen", value: "LOSS" },
    { label: "Transfer Sent Out", value: "TRANSFER_OUT" },
    { label: "Correction (Overcounted)", value: "CORRECTION_LOSS" },
  ],
  SET: [
    { label: "Physical Stocktake / Count", value: "PHYSICAL_COUNT" },
    { label: "Initial Setup / Override", value: "INITIAL_SETUP" },
  ],
};

const OP_LABELS = {
  ADD: "Add Stock",
  SUBTRACT: "Remove Stock",
  SET: "Set Exact Level",
};

function getStockStatus(qty, archived, threshold = 10) {
  if (archived) return { label: "Archived", cls: "badgeCancelled", icon: <Archive size={12} /> };
  if (qty === 0) return { label: "Out of Stock", cls: "badgeCancelled", icon: <XCircle size={12} /> };
  if (qty <= threshold) return { label: "Low Stock", cls: "badgePending", icon: <AlertTriangle size={12} /> };
  return { label: "In Stock", cls: "badgeDelivered", icon: <CheckCircle size={12} /> };
}

/* ── Adjust Stock Modal ─────────────────────────────────────────────────── */
function AdjustModal({ variant, onClose, onSave, threshold }) {
  const [operation, setOperation] = useState("ADD");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState(REASONS.ADD[0].value);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Reset reason when operation changes
  const handleOpChange = (op) => {
    setOperation(op);
    setReason(REASONS[op][0].value);
    setError("");
  };

  const previewQty = () => {
    const q = parseInt(quantity) || 0;
    const cur = variant.availableQuantity;
    if (operation === "ADD") return cur + q;
    if (operation === "SUBTRACT") return Math.max(0, cur - q);
    return q;
  };

  const handleSubmit = async () => {
    const q = parseInt(quantity);
    if (isNaN(q) || q < 0) { setError("Enter a valid quantity (0 or more)."); return; }
    if (operation !== "SET" && q === 0) { setError("Quantity must be greater than 0 for ADD/SUBTRACT."); return; }
    setSaving(true);
    try {
      await apiClient.post(`/inventory/${variant.id}/adjust`, {
        operation,
        quantity: q,
        referenceId: reason,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to adjust stock.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onClose}
    >
      <div
        style={{ background: "white", borderRadius: 16, padding: 32, width: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: 17 }}>Adjust Stock</h3>
            <p style={{ margin: 0, fontSize: 13, color: "var(--vdr-text-muted)" }}>
              {variant.color?.name || "—"} / {variant.size?.name || "—"}
              {variant.sku ? ` · SKU: ${variant.sku}` : ""}
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--vdr-text-muted)", padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Current stock */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "var(--vdr-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Current Stock</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: variant.availableQuantity === 0 ? "#ef4444" : variant.availableQuantity <= threshold ? "#f59e0b" : "#16a34a" }}>
              {variant.availableQuantity}
            </div>
          </div>
          <div style={{ flex: 1, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "12px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#3b82f6", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>After Adjustment</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#1d4ed8" }}>{previewQty()}</div>
          </div>
        </div>

        {/* Operation */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>Adjustment Type</label>
          <div style={{ display: "flex", gap: 8 }}>
            {Object.entries(OP_LABELS).map(([op, label]) => (
              <button
                key={op}
                onClick={() => handleOpChange(op)}
                style={{
                  flex: 1, padding: "8px 4px", fontSize: 12, fontWeight: 700,
                  border: `2px solid ${operation === op ? "var(--vdr-accent)" : "#e2e8f0"}`,
                  borderRadius: 8, cursor: "pointer",
                  background: operation === op ? "var(--vdr-accent)" : "white",
                  color: operation === op ? "white" : "var(--vdr-text-muted)",
                  transition: "all 0.15s",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>
            Quantity {operation === "SET" && <span style={{ color: "#94a3b8", fontWeight: 400 }}>(new total)</span>}
          </label>
          <input
            type="number"
            min={0}
            value={quantity}
            onChange={(e) => { setQuantity(e.target.value); setError(""); }}
            style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", fontSize: 15, fontWeight: 700, border: "1.5px solid #e2e8f0", borderRadius: 8 }}
          />
        </div>

        {/* Stock Reason */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>Stock Movement Reason</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", fontSize: 13, border: "1.5px solid #e2e8f0", borderRadius: 8, background: "white", cursor: "pointer" }}
          >
            {REASONS[operation].map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>
            Notes <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Received from supplier #1234, 20 units…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", fontSize: 13, border: "1.5px solid #e2e8f0", borderRadius: 8, resize: "vertical", fontFamily: "inherit" }}
          />
        </div>

        {error && (
          <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#dc2626", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: "11px 0", background: "#f1f5f9", border: "none", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{ flex: 2, padding: "11px 0", background: "var(--vdr-accent)", color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Saving…" : `Apply ${OP_LABELS[operation]}`}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────────────────── */
export default function VendorInventoryPage() {
  const [groupedProducts, setGroupedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(new Set());
  const [toast, setToast] = useState(null);
  const [imgManager, setImgManager] = useState(null);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [adjustTarget, setAdjustTarget] = useState(null); // variant object

  useEffect(() => {
    apiClient.get("/vendors/profile").then((res) => {
      setLowStockThreshold(res.data?.lowStockThreshold ?? 10);
    }).catch(() => {});
  }, []);

  useEffect(() => { fetchInventory(); }, [filter, lowStockThreshold]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const params = {
        limit: 100,
        isLowStock: filter === "low" ? true : undefined,
        threshold: lowStockThreshold,
      };
      const res = await apiClient.get("/inventory", { params });
      const variants = res.data?.data || [];

      const grouped = variants.reduce((acc, v) => {
        const pid = v.product.id;
        if (!acc[pid]) acc[pid] = { ...v.product, variants: [], totalStock: 0 };
        acc[pid].variants.push(v);
        acc[pid].totalStock += v.availableQuantity;
        return acc;
      }, {});

      let list = Object.values(grouped);
      if (filter === "active") list = list.filter((pr) => pr.status !== "archived");
      if (filter === "archived") list = list.filter((pr) => pr.status === "archived");
      if (filter === "out") list = list.filter((pr) => pr.totalStock === 0);

      setGroupedProducts(list);
    } catch (err) {
      console.error("Failed to fetch inventory", err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2500);
  };

  const toggleExpand = (pid) => {
    const next = new Set(expanded);
    if (next.has(pid)) next.delete(pid);
    else next.add(pid);
    setExpanded(next);
  };

  const toggleVisibility = async (product) => {
    const isArchived = product.status === "archived";
    const endpoint = isArchived ? `/products/${product.id}/publish` : `/products/${product.id}/archive`;
    try {
      await apiClient.patch(endpoint);
      showToast(`Product ${isArchived ? "restored" : "archived"} successfully.`);
      fetchInventory();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update visibility", false);
    }
  };

  const stats = {
    total: groupedProducts.length,
    low: groupedProducts.filter((pr) => pr.variants.some((v) => v.availableQuantity <= lowStockThreshold && v.availableQuantity > 0)).length,
    out: groupedProducts.filter((pr) => pr.totalStock === 0).length,
    archived: groupedProducts.filter((pr) => pr.status === "archived").length,
  };

  const filtered = groupedProducts.filter((pr) =>
    pr.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <VendorLayout pageTitle="Inventory" pageSubtitle="Product-level stock management with variant details." breadcrumb="Inventory">
      {adjustTarget && (
        <AdjustModal
          variant={adjustTarget}
          threshold={lowStockThreshold}
          onClose={() => setAdjustTarget(null)}
          onSave={() => { fetchInventory(); showToast("Stock updated."); }}
        />
      )}

      {toast && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", background: toast.ok ? "#dcfce7" : "#fee2e2", border: `1px solid ${toast.ok ? "#bbf7d0" : "#fca5a5"}`, borderRadius: 12, color: toast.ok ? "#16a34a" : "#dc2626", fontWeight: 600, marginBottom: 20 }}>
          {toast.ok ? <CheckCircle size={16} /> : <XCircle size={16} />} {toast.msg}
        </div>
      )}

      <div className={p.statsGrid} style={{ marginBottom: 24 }}>
        {[
          { label: "Total Products", value: stats.total, color: "#16a34a", bg: "#dcfce7", icon: Package },
          { label: "Low Stock Items", value: stats.low, color: "#d97706", bg: "#fef3c7", icon: AlertTriangle },
          { label: "Out of Stock", value: stats.out, color: "#dc2626", bg: "#fee2e2", icon: XCircle },
          { label: "Archived", value: stats.archived, color: "#6b7280", bg: "#f3f4f6", icon: Archive },
        ].map((s) => (
          <div key={s.label} className={p.statCard} style={{ "--stat-color": s.color, "--stat-bg": s.bg }}>
            <div className={p.statTop}>
              <div><p className={p.statLabel}>{s.label}</p><p className={p.statValue}>{s.value}</p></div>
              <div className={p.statIcon}><s.icon size={20} /></div>
            </div>
          </div>
        ))}
      </div>

      <div className={p.toolbar} style={{ marginBottom: 16 }}>
        <div className={p.toolbarLeft}>
          <div className={p.searchBox}>
            <Search size={14} className={p.searchIcon} />
            <input className={p.searchInput} placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className={p.filterChips}>
            {[["all", "All"], ["active", "Active"], ["low", "Low Stock"], ["out", "Out of Stock"], ["archived", "Archived"]].map(([v, label]) => (
              <button key={v} className={`${p.filterTab} ${filter === v ? p.active : ""}`} onClick={() => setFilter(v)}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      <div className={p.tableCard}>
        <div className={p.tableWrap}>
          <table className={p.table}>
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th>Product</th>
                <th>Category</th>
                <th>Total Stock</th>
                <th>Status</th>
                <th style={{ width: 140 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className={p.skeleton} style={{ height: 100 }}></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6"><div className={p.emptyState}><Package size={22} /><h3 className={p.emptyTitle}>No products found</h3></div></td></tr>
              ) : (
                filtered.map((product) => (
                  <Fragment key={product.id}>
                    <tr style={{ background: expanded.has(product.id) ? "#f8fafc" : "transparent" }}>
                      <td>
                        <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--vdr-text-muted)" }} onClick={() => toggleExpand(product.id)}>
                          {expanded.has(product.id) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </td>
                      <td>
                        <div className={p.productCell}>
                          <div className={p.productThumb} onClick={() => setImgManager(product)} style={{ cursor: "pointer" }}>
                            {product.images?.[0] ? <img src={product.images[0].s3Url || product.images[0].url} alt="" /> : <ImageIcon size={16} />}
                          </div>
                          <span style={{ fontWeight: 700 }}>{product.name}</span>
                        </div>
                      </td>
                      <td>{product.category?.name || "Uncategorized"}</td>
                      <td style={{ fontWeight: 700 }}>{product.totalStock}</td>
                      <td>
                        <span className={`${p.badge} ${product.status === "active" ? p.badgeDelivered : p.badgeCancelled}`}>
                          <span className={p.badgeDot} />{product.status}
                        </span>
                      </td>
                      <td>
                        <button className={p.actionBtn} onClick={() => toggleVisibility(product)} title={product.status === "archived" ? "Restore" : "Archive"}>
                          {product.status === "archived" ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                        </button>
                      </td>
                    </tr>

                    {expanded.has(product.id) && (
                      <tr key={`${product.id}-variants`} style={{ background: "#f8fafc" }}>
                        <td colSpan="6" style={{ padding: "0 24px 24px 64px" }}>
                          <div style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
                            <table className={p.table} style={{ margin: 0, fontSize: 13 }}>
                              <thead style={{ background: "#f1f5f9" }}>
                                <tr>
                                  <th style={{ padding: "10px 16px" }}>Variant (Color / Size)</th>
                                  <th style={{ padding: "10px 16px" }}>SKU</th>
                                  <th style={{ padding: "10px 16px" }}>Available</th>
                                  <th style={{ padding: "10px 16px" }}>Stock Status</th>
                                  <th style={{ padding: "10px 16px", width: 120 }}>Adjust</th>
                                </tr>
                              </thead>
                              <tbody>
                                {product.variants.map((v) => {
                                  const st = getStockStatus(v.availableQuantity, v.status === "archived", lowStockThreshold);
                                  return (
                                    <tr key={v.id}>
                                      <td style={{ padding: "12px 16px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                          <span style={{ fontWeight: 600 }}>{v.color?.name || "—"}</span>
                                          <span style={{ color: "#94a3b8" }}>/</span>
                                          <span>{v.size?.name || "—"}</span>
                                        </div>
                                      </td>
                                      <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: "#64748b" }}>{v.sku || "—"}</td>
                                      <td style={{ padding: "12px 16px", fontWeight: 800, fontSize: 15 }}>{v.availableQuantity}</td>
                                      <td style={{ padding: "12px 16px" }}>
                                        <span className={`${p.badge} ${p[st.cls]}`} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                          {st.icon} {st.label}
                                        </span>
                                      </td>
                                      <td style={{ padding: "12px 16px" }}>
                                        <button
                                          onClick={() => setAdjustTarget(v)}
                                          style={{
                                            display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                                            background: "var(--vdr-accent)", color: "white", border: "none",
                                            borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
                                          }}
                                        >
                                          <SlidersHorizontal size={12} /> Adjust
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {imgManager && (
        <ProductImageManager
          product={imgManager}
          onClose={() => setImgManager(null)}
          onSave={fetchInventory}
        />
      )}
    </VendorLayout>
  );
}
