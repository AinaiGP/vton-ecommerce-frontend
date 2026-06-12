import { useEffect, useState, useCallback } from "react";
import { Search, Package, X, Eye, ChevronRight } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import apiClient from "../../utils/apiClient";
import { formatPrice } from "../../utils/formatPrice";
import t from "../../styles/AdminTable.module.css";

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

const STATUS_CLASS = {
  active: t.badgeActive,
  draft: t.badgeDraft,
  archived: t.badgeClosed,
};

function StatusBadge({ status }) {
  return (
    <span className={`${t.badge} ${STATUS_CLASS[status] || t.badgeDraft}`}>
      {status}
    </span>
  );
}

function ProductImage({ url, name }) {
  if (url) {
    return (
      <div className={t.productThumb}>
        <img src={url} alt={name} />
      </div>
    );
  }
  return (
    <div className={t.productThumb}>
      <Package size={16} />
    </div>
  );
}

function fmt(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [viewProduct, setViewProduct] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = { page, limit };
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    apiClient
      .get("/admin/products", { params })
      .then((r) => {
        setProducts(r.data.data);
        setTotal(r.data.total);
      })
      .catch(() => setError("Failed to load products."))
      .finally(() => setLoading(false));
  }, [page, limit, search, statusFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const totalPages = Math.ceil(total / limit);

  return (
    <AdminLayout
      pageTitle="Product Management"
      pageSubtitle="Browse and monitor all store products."
      breadcrumb="Products"
    >
      {error && (
        <div style={{ marginBottom: 12, padding: "10px 16px", borderRadius: 8, background: "#fee2e2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {error}
          <button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626" }}><X size={14} /></button>
        </div>
      )}

      {/* Toolbar */}
      <div className={t.toolbar}>
        <div className={t.toolbarLeft}>
          <div className={t.searchBox}>
            <Search size={15} className={t.searchIcon} />
            <input
              className={t.searchInput}
              placeholder="Search by product name..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className={t.filterSelect}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={t.tableCard}>
        <div className={t.tableWrap}>
          <table className={t.table}>
            <thead>
              <tr>
                <th style={{ width: 32 }}></th>
                <th>#</th>
                <th>Product</th>
                <th>Brand</th>
                <th>Price</th>
                <th>Sold</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={9}><span className={`${t.skeleton} ${t.skeletonRow}`} /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className={t.emptyState}>
                      <div className={t.emptyIcon}><Package size={24} /></div>
                      <h3 className={t.emptyTitle}>No products found</h3>
                      <p className={t.emptyText}>Try adjusting your filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((p, i) => {
                  const isExpanded = expandedId === p.id;
                  const primaryImg = p.images?.find((img) => img.isPrimary) || p.images?.[0];
                  return (
                    <>
                      <tr key={p.id}>
                        <td>
                          {p.variants?.length > 0 && (
                            <button
                              className={t.expandBtn}
                              onClick={() => setExpandedId(isExpanded ? null : p.id)}
                              title={isExpanded ? "Collapse variants" : "Expand variants"}
                            >
                              <ChevronRight
                                size={15}
                                className={`${t.chevron} ${isExpanded ? t.chevronOpen : ""}`}
                              />
                            </button>
                          )}
                        </td>
                        <td>{(page - 1) * limit + i + 1}</td>
                        <td>
                          <div className={t.avatarCell}>
                            <ProductImage url={primaryImg?.url || primaryImg?.s3Url} name={p.name} />
                            <span className={t.avatarName}>{p.name}</span>
                          </div>
                        </td>
                        <td>{p.vendor?.brandName || "—"}</td>
                        <td>{formatPrice(p.basePrice)}</td>
                        <td>{p.totalSold}</td>
                        <td><StatusBadge status={p.status} /></td>
                        <td>{fmt(p.createdAt)}</td>
                        <td>
                          <div className={t.actions}>
                            <button className={t.actionBtn} title="View" onClick={() => setViewProduct(p)}>
                              <Eye size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${p.id}-variants`} className={t.variantExpandRow}>
                          <td colSpan={9}>
                            <div className={t.variantExpandInner}>
                              <table className={t.variantSubTable}>
                                <thead>
                                  <tr>
                                    <th>Image</th>
                                    <th>Color</th>
                                    <th>Size</th>
                                    <th>SKU</th>
                                    <th>Physical</th>
                                    <th>Reserved</th>
                                    <th>Available</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {p.variants.map((v) => {
                                    const variantImg =
                                      v.variantImageLinks?.[0]?.image?.s3Url ||
                                      primaryImg?.s3Url ||
                                      primaryImg?.url;
                                    const effectivePrice = v.priceOverride ?? p.basePrice;
                                    const available =
                                      v.availableQuantity ??
                                      (v.physicalQuantity ?? 0) - (v.reservedQuantity ?? 0);
                                    return (
                                      <tr key={v.id}>
                                        <td>
                                          {variantImg ? (
                                            <img
                                              src={variantImg}
                                              alt={v.sku || "variant"}
                                              className={t.variantThumb}
                                            />
                                          ) : (
                                            <div className={t.variantThumbPlaceholder}>
                                              <Package size={12} />
                                            </div>
                                          )}
                                        </td>
                                        <td>
                                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            {v.color?.hexCode && (
                                              <span
                                                className={t.variantColorDot}
                                                style={{ background: v.color.hexCode }}
                                              />
                                            )}
                                            {v.color?.name || "—"}
                                          </div>
                                        </td>
                                        <td>{v.size?.name || "—"}</td>
                                        <td>{v.sku || "—"}</td>
                                        <td>
                                          <span className={v.physicalQuantity > 0 ? t.variantQtyOk : t.variantQtyLow}>
                                            {v.physicalQuantity ?? 0}
                                          </span>
                                        </td>
                                        <td>{v.reservedQuantity ?? 0}</td>
                                        <td>
                                          <span className={available > 0 ? t.variantQtyOk : t.variantQtyLow}>
                                            {available}
                                          </span>
                                        </td>
                                        <td>{formatPrice(effectivePrice)}</td>
                                        <td>
                                          <span className={`${t.badge} ${STATUS_CLASS[v.status] || t.badgeDraft}`}>
                                            {v.status || "—"}
                                          </span>
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
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className={t.pagination}>
            <span className={t.pageInfo}>
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} products
            </span>
            <div className={t.pageButtons}>
              <button className={t.pageBtn} onClick={() => setPage((p) => p - 1)} disabled={page === 1}>←</button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => (
                <button
                  key={i + 1}
                  className={`${t.pageBtn} ${page === i + 1 ? t.pageBtnActive : ""}`}
                  onClick={() => setPage(i + 1)}
                >{i + 1}</button>
              ))}
              <button className={t.pageBtn} onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>→</button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewProduct && (
        <div className={t.modalBackdrop} onClick={() => setViewProduct(null)}>
          <div className={t.modal} onClick={(e) => e.stopPropagation()}>
            <div className={t.modalHead}>
              <h2 className={t.modalTitle}>Product Details</h2>
              <button className={t.modalClose} onClick={() => setViewProduct(null)}><X size={18} /></button>
            </div>
            <div className={t.modalBody}>
              <div className={t.avatarCell}>
                <ProductImage url={viewProduct.images?.[0]?.url} name={viewProduct.name} />
                <div>
                  <span className={t.avatarName}>{viewProduct.name}</span>
                  <span className={t.avatarSub}>{viewProduct.vendor?.brandName}</span>
                </div>
                <div style={{ marginLeft: "auto" }}><StatusBadge status={viewProduct.status} /></div>
              </div>
              <div className={t.formRow}>
                <div className={t.formGroup}>
                  <label className={t.label}>Base Price</label>
                  <p style={{ margin: 0, fontWeight: 700 }}>{formatPrice(viewProduct.basePrice)}</p>
                </div>
                <div className={t.formGroup}>
                  <label className={t.label}>Total Sold</label>
                  <p style={{ margin: 0, fontWeight: 700 }}>{viewProduct.totalSold}</p>
                </div>
                <div className={t.formGroup}>
                  <label className={t.label}>Created</label>
                  <p style={{ margin: 0 }}>{fmt(viewProduct.createdAt)}</p>
                </div>
              </div>
            </div>
            <div className={t.modalFoot}>
              <button className={`${t.btn} ${t.btnOutline}`} onClick={() => setViewProduct(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
