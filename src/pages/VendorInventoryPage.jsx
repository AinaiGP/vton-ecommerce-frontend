import { useState } from "react";
import {
  Search, Plus, Minus, Archive, ArchiveRestore,
  Package, AlertTriangle, CheckCircle, XCircle,
  ImageIcon, Star, Images,
} from "lucide-react";
import VendorLayout from "../components/vendor/VendorLayout";
import ProductImageManager from "../components/vendor/ProductImageManager";
import p from "../styles/VendorPage.module.css";

/* ─── Colour / size helpers for demo variants ── */
const mkColor = (id, name, hex) => ({ id, name, hexCode: hex });
const mkSize  = (id, label) => ({ id, label });

const COLORS = {
  black:    mkColor("c1", "Black",      "#1a1210"),
  white:    mkColor("c2", "White",      "#f8f6f3"),
  navy:     mkColor("c3", "Navy Blue",  "#1e3a5f"),
  burgundy: mkColor("c4", "Burgundy",   "#8B4852"),
  gold:     mkColor("c5", "Gold",       "#D4AF7A"),
  rose:     mkColor("c6", "Dusty Rose", "#c9848a"),
  emerald:  mkColor("c7", "Emerald",    "#065f46"),
  cream:    mkColor("c8", "Cream",      "#f5f0e8"),
  camel:    mkColor("c9", "Camel",      "#c19a6b"),
};

const SIZES = {
  xs:  mkSize("s1", "XS"),
  s:   mkSize("s2", "S"),
  m:   mkSize("s3", "M"),
  l:   mkSize("s4", "L"),
  xl:  mkSize("s5", "XL"),
  xxl: mkSize("s6", "XXL"),
};

const mkVariants = (colorList, sizeList, basePrice) => {
  let vid = 1;
  const result = [];
  for (const color of colorList) {
    for (const size of sizeList) {
      const adj = size.label === "XL" || size.label === "XXL" ? 50 : 0;
      result.push({
        id: `v-${vid++}`,
        color, size,
        price: basePrice + adj,
        availableQuantity: Math.floor(Math.random() * 20) + 1,
      });
    }
  }
  return result;
};

/* ─── Seed products (with images & variants) ── */
const SEED = [
  {
    id: 1,
    name: "Silk Evening Gown",
    sku: "SEG-001",
    category: "Dresses",
    qty: 24,
    archived: false,
    images: [
      { id: "img-s1-1", s3Url: "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=400&h=530&fit=crop", isPrimary: true,  colorId: null },
      { id: "img-s1-2", s3Url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=530&fit=crop", isPrimary: false, colorId: "c1", colorName: "Black",    colorHex: "#1a1210" },
      { id: "img-s1-3", s3Url: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=400&h=530&fit=crop", isPrimary: false, colorId: "c4", colorName: "Burgundy", colorHex: "#8B4852" },
    ],
    variants: mkVariants([COLORS.black, COLORS.burgundy, COLORS.navy], [SIZES.xs, SIZES.s, SIZES.m, SIZES.l, SIZES.xl], 2450),
  },
  {
    id: 2,
    name: "Cashmere Wrap Dress",
    sku: "CWD-002",
    category: "Dresses",
    qty: 3,
    archived: false,
    images: [
      { id: "img-s2-1", s3Url: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=530&fit=crop", isPrimary: true,  colorId: null },
    ],
    variants: mkVariants([COLORS.camel, COLORS.cream], [SIZES.s, SIZES.m, SIZES.l], 1320),
  },
  {
    id: 3,
    name: "Embroidered Kaftan",
    sku: "EK-003",
    category: "Traditional",
    qty: 0,
    archived: false,
    images: [
      { id: "img-s3-1", s3Url: "https://images.unsplash.com/photo-1611042553484-d61f84d22784?w=400&h=530&fit=crop", isPrimary: true,  colorId: null },
      { id: "img-s3-2", s3Url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=530&fit=crop", isPrimary: false, colorId: "c5", colorName: "Gold",    colorHex: "#D4AF7A" },
      { id: "img-s3-3", s3Url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&h=530&fit=crop", isPrimary: false, colorId: "c7", colorName: "Emerald", colorHex: "#065f46" },
    ],
    variants: mkVariants([COLORS.gold, COLORS.emerald, COLORS.burgundy], [SIZES.s, SIZES.m, SIZES.l, SIZES.xl], 1680),
  },
  {
    id: 4,
    name: "Linen Palazzo Set",
    sku: "LPS-004",
    category: "Sets",
    qty: 15,
    archived: false,
    images: [
      { id: "img-s4-1", s3Url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=530&fit=crop", isPrimary: true, colorId: null },
    ],
    variants: mkVariants([COLORS.white, COLORS.cream, COLORS.camel], [SIZES.xs, SIZES.s, SIZES.m, SIZES.l], 980),
  },
  {
    id: 5,
    name: "Velvet Abaya",
    sku: "VA-005",
    category: "Traditional",
    qty: 2,
    archived: true,
    images: [
      { id: "img-s5-1", s3Url: "https://images.unsplash.com/photo-1606503153255-59d5e417c1ef?w=400&h=530&fit=crop", isPrimary: true, colorId: null },
      { id: "img-s5-2", s3Url: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=530&fit=crop", isPrimary: false, colorId: "c1", colorName: "Black", colorHex: "#1a1210" },
    ],
    variants: mkVariants([COLORS.black, COLORS.navy], [SIZES.s, SIZES.m, SIZES.l, SIZES.xl, SIZES.xxl], 1890),
  },
  {
    id: 6,
    name: "Beaded Clutch Bag",
    sku: "BCB-006",
    category: "Accessories",
    qty: 40,
    archived: false,
    images: [
      { id: "img-s6-1", s3Url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=530&fit=crop", isPrimary: true, colorId: null },
    ],
    variants: [],
  },
  {
    id: 7,
    name: "Satin Blazer",
    sku: "SB-007",
    category: "Tops",
    qty: 0,
    archived: true,
    images: [
      { id: "img-s7-1", s3Url: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400&h=530&fit=crop", isPrimary: true, colorId: null },
    ],
    variants: mkVariants([COLORS.black, COLORS.rose], [SIZES.xs, SIZES.s, SIZES.m, SIZES.l], 1250),
  },
  {
    id: 8,
    name: "Pearl Drop Earrings",
    sku: "PDE-008",
    category: "Accessories",
    qty: 58,
    archived: false,
    images: [
      { id: "img-s8-1", s3Url: "https://images.unsplash.com/photo-1630350276620-d30b91a09fa8?w=400&h=530&fit=crop", isPrimary: true, colorId: null },
    ],
    variants: [],
  },
];

const LOW_STOCK_THRESHOLD = 5;

function getStockStatus(qty, archived) {
  if (archived)                                return { label: "Archived",     cls: "badgeCancelled", icon: <Archive size={12} /> };
  if (qty === 0)                               return { label: "Out of Stock", cls: "badgeCancelled", icon: <XCircle size={12} /> };
  if (qty <= LOW_STOCK_THRESHOLD)              return { label: "Low Stock",    cls: "badgePending",   icon: <AlertTriangle size={12} /> };
  return                                              { label: "In Stock",     cls: "badgeDelivered", icon: <CheckCircle size={12} /> };
}

/* ─── Main page ── */
export default function VendorInventoryPage() {
  const [items, setItems]         = useState(SEED);
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState("all");
  const [editing, setEditing]     = useState({});  // id → draft qty string
  const [toast, setToast]         = useState(null);
  const [imgManager, setImgManager] = useState(null); // product | null

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2500);
  };

  /* ── Qty adjust ── */
  const adjust = (id, delta) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i));

  const setQty = (id, val) => {
    const n = parseInt(val, 10);
    if (isNaN(n) || n < 0) return;
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty: n } : i));
    setEditing(prev => { const c = { ...prev }; delete c[id]; return c; });
    showToast("Stock updated.");
  };

  /* ── Archive toggle ── */
  const toggleArchive = (id) => {
    const item = items.find(i => i.id === id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, archived: !i.archived } : i));
    showToast(item?.archived ? "Product unarchived — now visible in store." : "Product archived — hidden from store.");
  };

  /* ── Save images from manager ── */
  const handleSaveImages = (updatedImages) => {
    if (!imgManager) return;
    setItems(prev => prev.map(i =>
      i.id === imgManager.id ? { ...i, images: updatedImages } : i
    ));
    setImgManager(null);
    showToast("Product images saved.");
  };

  /* ── Filtering ── */
  const filtered = items.filter(i => {
    const q = i.name.toLowerCase().includes(search.toLowerCase()) ||
              i.sku.toLowerCase().includes(search.toLowerCase());
    if (!q) return false;
    if (filter === "active")   return !i.archived;
    if (filter === "archived") return i.archived;
    if (filter === "low")      return !i.archived && i.qty > 0 && i.qty <= LOW_STOCK_THRESHOLD;
    if (filter === "out")      return !i.archived && i.qty === 0;
    return true;
  });

  const stats = {
    total:    items.filter(i => !i.archived).length,
    inStock:  items.filter(i => !i.archived && i.qty > LOW_STOCK_THRESHOLD).length,
    low:      items.filter(i => !i.archived && i.qty > 0 && i.qty <= LOW_STOCK_THRESHOLD).length,
    out:      items.filter(i => !i.archived && i.qty === 0).length,
    archived: items.filter(i => i.archived).length,
  };

  /* ── Primary image helper ── */
  const getPrimaryImage = (item) => {
    const img = item.images?.find(i => i.isPrimary) || item.images?.[0];
    return img?.s3Url || img?.url || null;
  };

  const getImgCount = (item) => item.images?.length || 0;
  const hasVariantImages = (item) => item.images?.some(i => i.colorId);

  return (
    <VendorLayout pageTitle="Inventory" pageSubtitle="Manage product stock, images, and visibility." breadcrumb="Inventory">

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8, padding: "11px 18px",
          background: toast.ok ? "#dcfce7" : "#fee2e2",
          border: `1px solid ${toast.ok ? "#bbf7d0" : "#fca5a5"}`,
          borderRadius: 10, color: toast.ok ? "#16a34a" : "#dc2626",
          fontWeight: 600, fontSize: 13.5, marginBottom: 16,
        }}>
          {toast.ok ? <CheckCircle size={15} /> : <XCircle size={15} />} {toast.msg}
        </div>
      )}

      {/* ── Stats row ── */}
      <div className={p.statsGrid} style={{ marginBottom: 24 }}>
        {[
          { label: "Active Products", value: stats.total,    color: "#16a34a", bg: "#dcfce7", icon: Package },
          { label: "In Stock",        value: stats.inStock,  color: "#0891b2", bg: "#ecfeff", icon: CheckCircle },
          { label: "Low Stock",       value: stats.low,      color: "#d97706", bg: "#fef3c7", icon: AlertTriangle },
          { label: "Out of Stock",    value: stats.out,      color: "#dc2626", bg: "#fee2e2", icon: XCircle },
          { label: "Archived",        value: stats.archived, color: "#6b7280", bg: "#f3f4f6", icon: Archive },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={p.statCard} style={{ "--stat-color": s.color, "--stat-bg": s.bg }}>
              <div className={p.statTop}>
                <div><p className={p.statLabel}>{s.label}</p><p className={p.statValue}>{s.value}</p></div>
                <div className={p.statIcon}><Icon size={20} /></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Toolbar ── */}
      <div className={p.toolbar} style={{ marginBottom: 16 }}>
        <div className={p.toolbarLeft}>
          <div className={p.searchBox}>
            <Search size={14} className={p.searchIcon} />
            <input
              className={p.searchInput}
              placeholder="Search by name or SKU…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className={p.filterChips}>
            {[["all","All"], ["active","Active"], ["low","Low Stock"], ["out","Out of Stock"], ["archived","Archived"]].map(([v, label]) => (
              <button key={v} className={`${p.filterTab} ${filter === v ? p.active : ""}`} onClick={() => setFilter(v)}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <span className={p.pageInfo}>{filtered.length} products</span>
      </div>

      {/* ── Table ── */}
      <div className={p.tableCard}>
        <div className={p.tableWrap}>
          <table className={p.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th style={{ width: 60 }}>Images</th>
                <th style={{ width: 180 }}>Quantity</th>
                <th>Status</th>
                <th style={{ width: 120 }}>Visibility</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className={p.emptyState}>
                    <div className={p.emptyIcon}><Package size={22} /></div>
                    <h3 className={p.emptyTitle}>No products found</h3>
                    <p className={p.emptyText}>Try changing the filter or search term.</p>
                  </div>
                </td></tr>
              ) : filtered.map(item => {
                const status = getStockStatus(item.qty, item.archived);
                const draftQty = editing[item.id] ?? String(item.qty);
                const primaryImg = getPrimaryImage(item);
                const imgCount = getImgCount(item);
                const hasVariant = hasVariantImages(item);

                return (
                  <tr key={item.id} style={{ opacity: item.archived ? 0.62 : 1 }}>

                    {/* ── Product cell ── */}
                    <td>
                      <div className={p.productCell}>
                        {/* Thumbnail — click to open image manager */}
                        <div
                          onClick={() => setImgManager(item)}
                          title="Manage Images"
                          style={{
                            width: 44, height: 44, borderRadius: 10,
                            overflow: "hidden", flexShrink: 0, cursor: "pointer",
                            border: "2px solid var(--vdr-border)",
                            position: "relative",
                            transition: "border-color 0.15s, box-shadow 0.15s",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--vdr-accent)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--vdr-accent-muted)"; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--vdr-border)"; e.currentTarget.style.boxShadow = "none"; }}
                        >
                          {primaryImg
                            ? <img src={primaryImg} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--vdr-bg)", color: "var(--vdr-text-subtle)" }}><ImageIcon size={16} /></div>
                          }
                        </div>
                        <div>
                          <span style={{ fontWeight: 700, display: "block" }}>{item.name}</span>
                          {/* Colour variant image indicator */}
                          {hasVariant && (
                            <span style={{ fontSize: 11, color: "var(--vdr-accent)", display: "inline-flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                              <Images size={10} /> variant images
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td style={{ color: "var(--vdr-text-muted)", fontSize: 12, fontFamily: "monospace" }}>{item.sku}</td>
                    <td style={{ color: "var(--vdr-text-muted)" }}>{item.category}</td>

                    {/* ── Images column ── */}
                    <td>
                      <button
                        title="Manage Images"
                        onClick={() => setImgManager(item)}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          padding: "5px 10px", borderRadius: 8,
                          border: "1.5px solid var(--vdr-border)",
                          background: imgCount > 0 ? "var(--vdr-accent-light)" : "var(--vdr-bg)",
                          color: imgCount > 0 ? "var(--vdr-accent)" : "var(--vdr-text-muted)",
                          fontFamily: "inherit", fontSize: 12.5, fontWeight: 700,
                          cursor: "pointer", transition: "all 0.14s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--vdr-accent)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--vdr-border)"; }}
                      >
                        <ImageIcon size={13} /> {imgCount}
                      </button>
                    </td>

                    {/* ── Qty cell ── */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <button
                          className={p.actionBtn}
                          onClick={() => adjust(item.id, -1)}
                          disabled={item.qty === 0 || item.archived}
                          title="Decrease"
                        >
                          <Minus size={13} />
                        </button>
                        <input
                          style={{ width: 54, textAlign: "center", border: "1px solid var(--vdr-border)", borderRadius: 6, padding: "4px 6px", fontWeight: 700, fontSize: 14, background: "var(--vdr-bg)" }}
                          value={draftQty}
                          onChange={e => setEditing({ ...editing, [item.id]: e.target.value })}
                          onBlur={() => setQty(item.id, draftQty)}
                          onKeyDown={e => e.key === "Enter" && setQty(item.id, draftQty)}
                          disabled={item.archived}
                        />
                        <button
                          className={`${p.actionBtn} ${p.edit}`}
                          onClick={() => adjust(item.id, 1)}
                          disabled={item.archived}
                          title="Increase"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </td>

                    {/* ── Status cell ── */}
                    <td>
                      <span className={`${p.badge} ${p[status.cls]}`}>
                        <span className={p.badgeDot} />{status.label}
                      </span>
                    </td>

                    {/* ── Archive cell ── */}
                    <td>
                      <button
                        className={`${p.actionBtn} ${item.archived ? p.edit : ""}`}
                        title={item.archived ? "Unarchive" : "Archive"}
                        onClick={() => toggleArchive(item.id)}
                      >
                        {item.archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                        <span style={{ marginLeft: 4, fontSize: 11 }}>{item.archived ? "Restore" : "Archive"}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Image Manager Drawer ── */}
      {imgManager && (
        <ProductImageManager
          product={imgManager}
          onClose={() => setImgManager(null)}
          onSave={handleSaveImages}
        />
      )}
    </VendorLayout>
  );
}
