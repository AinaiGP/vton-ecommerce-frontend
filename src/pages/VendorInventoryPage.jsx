import React, { useState, useEffect, Fragment } from "react";
import {
  Search,
  Plus,
  Minus,
  Archive,
  ArchiveRestore,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ImageIcon,
  Images,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import VendorLayout from "../components/vendor/VendorLayout";
import ProductImageManager from "../components/vendor/ProductImageManager";
import p from "../styles/VendorPage.module.css";
import apiClient from "../utils/apiClient";
import { formatPrice } from "../utils/formatPrice";

const LOW_STOCK_THRESHOLD = 10;

function getStockStatus(qty, archived) {
  if (archived)
    return {
      label: "Archived",
      cls: "badgeCancelled",
      icon: <Archive size={12} />,
    };
  if (qty === 0)
    return {
      label: "Out of Stock",
      cls: "badgeCancelled",
      icon: <XCircle size={12} />,
    };
  if (qty <= LOW_STOCK_THRESHOLD)
    return {
      label: "Low Stock",
      cls: "badgePending",
      icon: <AlertTriangle size={12} />,
    };
  return {
    label: "In Stock",
    cls: "badgeDelivered",
    icon: <CheckCircle size={12} />,
  };
}

/* ─── Main page ── */
export default function VendorInventoryPage() {
  const [groupedProducts, setGroupedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(new Set());
  const [toast, setToast] = useState(null);
  const [imgManager, setImgManager] = useState(null);

  useEffect(() => {
    fetchInventory();
  }, [filter]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const params = {
        limit: 100,
        isLowStock: filter === "low" ? true : undefined
      };
      const res = await apiClient.get("/inventory", { params });
      const variants = res.data?.data || [];
      
      // Group by product
      const grouped = variants.reduce((acc, v) => {
        const pid = v.product.id;
        if (!acc[pid]) {
          acc[pid] = {
            ...v.product,
            variants: [],
            totalStock: 0,
          };
        }
        acc[pid].variants.push(v);
        acc[pid].totalStock += v.availableQuantity;
        return acc;
      }, {});

      let list = Object.values(grouped);
      
      // Client side filtering for active/archived
      if (filter === "active") list = list.filter(p => p.status !== "archived");
      if (filter === "archived") list = list.filter(p => p.status === "archived");
      if (filter === "out") list = list.filter(p => p.totalStock === 0);

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

  const adjustStock = async (variantId, operation, quantity = 1) => {
    try {
      await apiClient.post(`/inventory/${variantId}/adjust`, { operation, quantity });
      showToast("Stock updated.");
      fetchInventory();
    } catch (err) {
      console.error("Adjustment failed", err);
      showToast("Failed to update stock", false);
    }
  };

  const setManualStock = async (variantId, newQty) => {
    const n = parseInt(newQty);
    if (isNaN(n) || n < 0) return;
    try {
      await apiClient.post(`/inventory/${variantId}/adjust`, { operation: "SET", quantity: n });
      showToast("Stock set.");
      fetchInventory();
    } catch (err) {
      showToast("Failed to set stock", false);
    }
  };

  const toggleVisibility = async (product) => {
    const isCurrentlyArchived = product.status === "archived";
    const endpoint = isCurrentlyArchived ? `/products/${product.id}/publish` : `/products/${product.id}/archive`;
    
    try {
      await apiClient.patch(endpoint);
      showToast(`Product ${isCurrentlyArchived ? "restored" : "archived"} successfully.`);
      fetchInventory();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update visibility";
      showToast(msg, false);
    }
  };

  const stats = {
    total: groupedProducts.length,
    low: groupedProducts.filter(p => p.variants.some(v => v.availableQuantity <= LOW_STOCK_THRESHOLD)).length,
    out: groupedProducts.filter(p => p.totalStock === 0).length,
    archived: groupedProducts.filter(p => p.status === "archived").length,
  };

  const filtered = groupedProducts.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <VendorLayout pageTitle="Inventory" pageSubtitle="Product-level stock management with variant details." breadcrumb="Inventory">
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
                          <span className={p.badgeDot} />
                          {product.status}
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
                          <div style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
                            <table className={p.table} style={{ margin: 0, fontSize: 13 }}>
                              <thead style={{ background: "#f1f5f9" }}>
                                <tr>
                                  <th style={{ padding: "10px 16px" }}>Variant (Color / Size)</th>
                                  <th style={{ padding: "10px 16px" }}>SKU</th>
                                  <th style={{ width: 180, padding: "10px 16px" }}>Adjust Quantity</th>
                                  <th style={{ padding: "10px 16px" }}>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {product.variants.map(v => (
                                  <tr key={v.id}>
                                    <td style={{ padding: "12px 16px" }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        {v.color?.hex && (
                                          <div style={{ width: 12, height: 12, borderRadius: "50%", background: v.color.hex, border: "1px solid #e2e8f0" }} />
                                        )}
                                        <span style={{ fontWeight: 600 }}>{v.color?.name || "N/A"}</span>
                                        <span style={{ color: "#94a3b8" }}>/</span>
                                        <span>{v.size?.label || v.size?.name || "N/A"}</span>
                                      </div>
                                    </td>
                                    <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: "#64748b" }}>{v.sku || "—"}</td>
                                    <td style={{ padding: "12px 16px" }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <button className={p.actionBtn} onClick={() => adjustStock(v.id, "SUBTRACT")} disabled={v.availableQuantity === 0} style={{ width: 28, height: 28 }}>
                                          <Minus size={12} />
                                        </button>
                                        <input
                                          type="number"
                                          style={{ width: 60, textAlign: "center", border: "1px solid #e2e8f0", borderRadius: 6, padding: "4px 8px", fontWeight: 700 }}
                                          defaultValue={v.availableQuantity}
                                          onBlur={(e) => setManualStock(v.id, e.target.value)}
                                        />
                                        <button className={`${p.actionBtn} ${p.edit}`} onClick={() => adjustStock(v.id, "ADD")} style={{ width: 28, height: 28 }}>
                                          <Plus size={12} />
                                        </button>
                                      </div>
                                    </td>
                                    <td style={{ padding: "12px 16px" }}>
                                      {v.availableQuantity <= LOW_STOCK_THRESHOLD ? (
                                        <span style={{ color: v.availableQuantity === 0 ? "#ef4444" : "#f59e0b", display: "flex", alignItems: "center", gap: 4, fontWeight: 700 }}>
                                          <AlertTriangle size={14} /> {v.availableQuantity === 0 ? "Out of Stock" : "Low Stock"}
                                        </span>
                                      ) : (
                                        <span style={{ color: "#10b981", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                                          <CheckCircle size={14} /> Healthy
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
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
