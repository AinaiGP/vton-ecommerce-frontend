import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  X,
  Check,
  AlertTriangle,
  ImageIcon,
  Package,
  PlusCircle,
  MinusCircle,
  ImagePlus,
  Info,
  ChevronRight,
} from "lucide-react";
import VendorLayout from "../components/vendor/VendorLayout";
import ProductImageManager from "../components/vendor/ProductImageManager";
import p from "../styles/VendorPage.module.css";
import apiClient, { multipartClient } from "../utils/apiClient";
import { formatPrice } from "../utils/formatPrice";

const PAGE_SIZE = 10;

const STATUS_BADGE = {
  active: p.badgeActive,
  oos: p.badgeOOS,
  draft: p.badgeDraft,
  archived: p.badgeCancelled,
};

const BLANK = {
  name: "",
  description: "",
  basePrice: "",
  categoryId: "",
  gender: "UNISEX",
  status: "draft",
  mainImage: null,
  variants: [
    { colorId: "", sizeId: "", physicalQuantity: 10, sku: "", priceOverride: "", image: null }
  ],
  _new: true,
};

function ProductModal({ product, options, onClose, onSave, onManageImages, onPublish, onArchive }) {
  const [form, setForm] = useState({ ...product });
  const [submitting, setSubmitting] = useState(false);

  const updateVariant = (idx, field, val) => {
    const next = [...form.variants];
    next[idx] = { ...next[idx], [field]: val };
    setForm({ ...form, variants: next });
  };

  const addVariant = () => {
    setForm({
      ...form,
      variants: [...form.variants, { colorId: "", sizeId: "", physicalQuantity: 10, sku: "", priceOverride: "", image: null }]
    });
  };

  const removeVariant = (idx) => {
    if (form.variants.length === 1) return;
    setForm({ ...form, variants: form.variants.filter((_, i) => i !== idx) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (form._new) {
        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("description", form.description || "");
        formData.append("basePrice", Math.round(parseFloat(form.basePrice || "0") * 100));
        if (form.categoryId) formData.append("categoryId", form.categoryId);
        if (form.gender) formData.append("gender", form.gender);

        const variants = form.variants.map(v => ({
          colorId: v.colorId || undefined,
          sizeId: v.sizeId || undefined,
          physicalQuantity: parseInt(v.physicalQuantity) || 0,
          priceOverride: v.priceOverride ? Math.round(parseFloat(v.priceOverride) * 100) : null,
          status: v.status || "active"
        }));
        formData.append("variants", JSON.stringify(variants));

        // Images handling
        const images = [];
        const variantImageMappings = {};

        if (form.mainImage) {
          images.push(form.mainImage);
          formData.append("primaryImageIndex", "0");
        }

        form.variants.forEach((v, idx) => {
          if (v.image) {
            const imgIdx = images.length;
            images.push(v.image);
            variantImageMappings[idx] = imgIdx;
          }
        });

        images.forEach(img => formData.append("images", img));
        formData.append("variantImageMappings", JSON.stringify(variantImageMappings));

        await onSave(formData);
      } else {
        // Edit flow (JSON) — include id so saveProduct routes to PATCH
        // Note: status is NOT sent here — use Archive/Publish buttons for status changes
        const payload = {
          id: form.id,
          name: form.name,
          basePrice: Math.round(parseFloat(form.basePrice || "0") * 100),
          categoryId: form.categoryId || undefined,
          gender: form.gender || undefined,
          variants: form.variants.map(v => ({
            id: v.id || undefined,
            colorId: v.colorId || undefined,
            sizeId: v.sizeId || undefined,
            physicalQuantity: parseInt(v.physicalQuantity) || 0,
            priceOverride: v.priceOverride ? Math.round(parseFloat(v.priceOverride) * 100) : null,
            status: v.status || "active"
          }))
        };
        if (form.description && form.description.trim().length >= 10) {
          payload.description = form.description.trim();
        }
        await onSave(payload);
      }
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={p.modalBackdrop} onClick={onClose}>
      <div className={`${p.modal} ${p.modalLg}`} onClick={(e) => e.stopPropagation()}>
        <div className={p.modalHead}>
          <h2 className={p.modalTitle}>{form._new ? "Add New Product" : "Edit Product"}</h2>
          <button className={p.modalClose} onClick={onClose}><X size={17} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={p.modalBody}>
            <div className={p.formRow}>
              <div className={p.formGroup} style={{ gridColumn: "1 / -1" }}>
                <label className={p.label}>Product Name *</label>
                <input
                  className={p.input}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className={p.formGroup} style={{ gridColumn: "1 / -1" }}>
                <label className={p.label}>Description</label>
                <textarea
                  className={p.textarea}
                  value={form.description || ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className={p.formGroup}>
                <label className={p.label}>Base Price (EGP) *</label>
                <input
                  className={p.input}
                  type="number"
                  step="0.01"
                  value={form.basePrice}
                  onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                  required
                />
              </div>
              <div className={p.formGroup}>
                <label className={p.label}>Category</label>
                <select
                  className={p.select}
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  required
                >
                  <option value="">Select Category</option>
                  {options.categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className={p.formGroup}>
                <label className={p.label}>Gender</label>
                <select
                  className={p.select}
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  <option value="MEN">Men</option>
                  <option value="WOMEN">Women</option>
                  <option value="UNISEX">Unisex</option>
                </select>
              </div>
              <div className={p.formGroup}>
                <label className={p.label}>Status</label>
                <select
                  className={p.select}
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Images */}
            <div className={p.formGroup} style={{ marginTop: 20 }}>
              <label className={p.label}>Product Images</label>
              <div style={{ padding: "12px", background: "#f8fafc", borderRadius: 10, border: "1px dashed #cbd5e1" }}>
                {!form._new ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Media Manager</p>
                      <p style={{ margin: 0, fontSize: 12, color: "var(--vdr-text-muted)" }}>Manage product gallery and color-specific images.</p>
                    </div>
                    <button type="button" className={p.btn} onClick={() => onManageImages(form)}>
                      <ImagePlus size={14} /> Manage Images
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Main Product Image *</p>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => setForm({ ...form, mainImage: e.target.files[0] })}
                    />
                    <p style={{ margin: 0, fontSize: 12, color: "var(--vdr-text-muted)" }}>This will be the primary image for the product listing.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Variants */}
            <div className={p.formGroup} style={{ marginTop: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <label className={p.label} style={{ margin: 0 }}>Product Variants *</label>
                <button type="button" className={p.btn} style={{ fontSize: 12, padding: "4px 8px" }} onClick={addVariant}>
                  <Plus size={14} /> Add Variant
                </button>
              </div>
              <div className={p.tableWrap} style={{ background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                <table className={p.table} style={{ fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th>Color</th>
                      <th>Size</th>
                      <th>Stock</th>
                      <th>Price Override</th>
                      {form._new && <th>Image</th>}
                      {!form._new && <th>Sold</th>}
                      <th>Status</th>
                      <th style={{ width: 40 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.variants.map((v, idx) => (
                      <tr key={idx}>
                        <td>
                          <select className={p.select} value={v.colorId} onChange={e => updateVariant(idx, "colorId", e.target.value)} required>
                            <option value="">Color</option>
                            {options.colors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </td>
                        <td>
                          <select className={p.select} value={v.sizeId} onChange={e => updateVariant(idx, "sizeId", e.target.value)} required>
                            <option value="">Size</option>
                            {options.sizes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                        </td>
                        <td>
                          <input className={p.input} type="number" min="0" value={v.physicalQuantity} onChange={e => updateVariant(idx, "physicalQuantity", e.target.value)} required />
                        </td>
                        <td>
                          <input className={p.input} type="number" step="0.01" placeholder="Optional" value={v.priceOverride} onChange={e => updateVariant(idx, "priceOverride", e.target.value)} />
                        </td>
                        {form._new && (
                          <td>
                            <input 
                              type="file" 
                              accept="image/*" 
                              style={{ width: 120, fontSize: 11 }}
                              onChange={(e) => updateVariant(idx, "image", e.target.files[0])}
                            />
                          </td>
                        )}
                        {!form._new && <td style={{ textAlign: "center", fontWeight: 700 }}>{v.totalSold || 0}</td>}
                        <td>
                          <select className={p.select} value={v.status || "active"} onChange={e => updateVariant(idx, "status", e.target.value)}>
                            <option value="active">Active</option>
                            <option value="draft">Draft</option>
                            <option value="archived">Archived</option>
                          </select>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button type="button" style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }} onClick={() => removeVariant(idx)}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className={p.modalFoot}>
            <button type="button" className={p.btn} onClick={onClose} disabled={submitting}>Cancel</button>
            
            {!form._new && (
              <>
                {form.status !== "archived" && (
                  <button 
                    type="button" 
                    className={`${p.btn} ${p.btnDanger}`} 
                    onClick={() => onArchive(form.id)}
                    disabled={submitting}
                  >
                    Archive Product
                  </button>
                )}
                {form.status !== "active" && (
                  <button 
                    type="button" 
                    className={`${p.btn} ${p.btnPrimary}`} 
                    onClick={() => onPublish(form.id)}
                    disabled={submitting}
                  >
                    Publish to Store
                  </button>
                )}
              </>
            )}

            <button type="submit" className={`${p.btn} ${p.btnPrimary}`} disabled={submitting}>
              {submitting ? "Saving..." : (form._new ? "Create Product" : "Save Changes")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VendorProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState({ categories: [], colors: [], sizes: [] });
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [editProduct, setEditProduct] = useState(null);
  const [imgManager, setImgManager] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [page, catFilter, statusFilter, search]);

  const fetchOptions = async () => {
    try {
      const [cats, cols, sizs] = await Promise.all([
        apiClient.get("/categories"),
        apiClient.get("/colors"),
        apiClient.get("/sizes")
      ]);
      setOptions({
        categories: cats.data || [],
        colors: cols.data || [],
        sizes: sizs.data || []
      });
    } catch (err) {
      console.error("Failed to fetch options", err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        status: statusFilter === "All" ? undefined : statusFilter
      };
      if (catFilter !== "All") params.categoryIds = [catFilter];

      const res = await apiClient.get("/products/my/products", { params });
      setProducts(res.data?.data || []);
      setTotal(res.data?.total || 0);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  const saveProduct = async (data) => {
    try {
      if (data instanceof FormData) {
        await multipartClient.post("/products", data);
      } else if (data.id) {
        // ID is usually stripped from payload in handleSubmit, but data here might still have it if passed directly
        const { id, ...payload } = data;
        await apiClient.patch(`/products/${data.id}`, payload);
      } else {
        await apiClient.post("/products", data);
      }
      fetchProducts();
      setEditProduct(null);
    } catch (err) {
      console.error("Failed to save", err);
      alert("Failed to save product. Check console.");
    }
  };

  const publishProduct = async (id) => {
    try {
      await apiClient.patch(`/products/${id}/publish`);
      fetchProducts();
      setEditProduct(null);
    } catch (err) {
      console.error("Failed to publish", err);
      alert(err.response?.data?.message || "Failed to publish product.");
    }
  };

  const archiveProduct = async (id) => {
    if (!window.confirm("Are you sure you want to archive this product? It will be hidden from the catalog.")) return;
    try {
      await apiClient.patch(`/products/${id}/archive`);
      fetchProducts();
      setEditProduct(null);
    } catch (err) {
      console.error("Failed to archive", err);
      alert("Failed to archive product.");
    }
  };

  const saveProductImages = async (updatedImages, productId, originalImages, variants) => {
    try {
      setImgManager(null);
      setLoading(true);

      const originalIds = (originalImages || []).map(img => img.id);
      const updatedIds = updatedImages.filter(img => !img.file).map(img => img.id);
      const deletedIds = originalIds.filter(id => !updatedIds.includes(id));

      for (const imageId of deletedIds) {
        await apiClient.delete(`/products/${productId}/images/${imageId}`);
      }

      const newImages = updatedImages.filter(img => img.file);
      for (const img of newImages) {
        const formData = new FormData();
        formData.append("images", img.file);
        
        if (img.colorId) {
          const variant = variants.find(v => (v.colorId || v.color?.id) === img.colorId);
          if (variant) {
            await multipartClient.post(`/products/${productId}/variants/${variant.id}/images`, formData);
          }
        } else {
          await multipartClient.post(`/products/${productId}/images`, formData);
        }
      }

      const newPrimary = updatedImages.find(img => img.isPrimary);
      const oldPrimary = (originalImages || []).find(img => img.isPrimary);
      
      if (newPrimary && newPrimary.id !== oldPrimary?.id && !newPrimary.file) {
        await apiClient.patch(`/products/${productId}/images/${newPrimary.id}/primary`);
      }

      fetchProducts();
    } catch (err) {
      console.error("Failed to sync images", err);
      alert(err.response?.data?.message || "Failed to update images.");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    try {
      await apiClient.delete(`/products/${id}`);
      fetchProducts();
      setConfirmDelete(null);
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const addBtn = (
    <button
      className={`${p.btn} ${p.btnPrimary}`}
      onClick={() => setEditProduct({ ...BLANK })}
    >
      <Plus size={15} /> Add Product
    </button>
  );

  return (
    <VendorLayout
      pageTitle="My Products"
      pageSubtitle={`${total} products in your store`}
      breadcrumb="Products"
      headerAction={addBtn}
    >
      <div className={p.toolbar}>
        <div className={p.toolbarLeft}>
          <div className={p.searchBox}>
            <Search size={14} className={p.searchIcon} />
            <input
              className={p.searchInput}
              placeholder="Search products..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              onKeyDown={(e) => e.key === "Enter" && fetchProducts()}
            />
          </div>
          <select
            className={p.filterSelect}
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            {options.categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            className={p.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className={p.tableCard}>
        <div className={p.tableWrap}>
          <table className={p.table}>
            <thead>
              <tr>
                <th style={{ width: 28 }}></th>
                <th>Product</th>
                <th>Category</th>
                <th>Base Price</th>
                <th>Stock</th>
                <th>Sold</th>
                <th>Views</th>
                <th>Status</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" className={p.skeleton} style={{ height: 100 }}></td></tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="9">
                    <div className={p.emptyState}>
                      <div className={p.emptyIcon}><Package size={22} /></div>
                      <h3 className={p.emptyTitle}>No products found</h3>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((pr) => {
                  const isExpanded = expandedId === pr.id;
                  const primaryImg = pr.images?.find(i => i.isPrimary) || pr.images?.[0];
                  return (
                    <>
                      <tr key={pr.id}>
                        <td>
                          <button
                            className={p.expandBtn}
                            title={isExpanded ? "Collapse variants" : "Expand variants"}
                            onClick={() => setExpandedId(isExpanded ? null : pr.id)}
                          >
                            <span className={`${p.chevron} ${isExpanded ? p.chevronOpen : ""}`}>
                              <ChevronRight size={15} />
                            </span>
                          </button>
                        </td>
                        <td>
                          <div className={p.productCell}>
                            <div className={p.productThumb}>
                              {primaryImg ? <img src={primaryImg.s3Url || primaryImg.url} alt="" /> : <ImageIcon size={16} />}
                            </div>
                            <span className={p.productName}>{pr.name}</span>
                          </div>
                        </td>
                        <td><span className={`${p.badge} ${p.badgeDraft}`}>{pr.category?.name}</span></td>
                        <td style={{ fontWeight: 700 }}>{formatPrice(pr.basePrice)}</td>
                        <td>{pr.variants?.reduce((s, v) => s + v.physicalQuantity, 0) || 0}</td>
                        <td style={{ fontWeight: 600, color: "var(--vdr-accent)" }}>{pr.purchases || 0}</td>
                        <td>{pr.views || 0}</td>
                        <td>
                          <span className={`${p.badge} ${STATUS_BADGE[pr.status] || p.badgeDraft}`}>
                            <span className={p.badgeDot} />
                            {pr.status}
                          </span>
                        </td>
                        <td>
                          <div className={p.actions}>
                            <button className={`${p.actionBtn} ${p.edit}`} onClick={() => setEditProduct({ ...pr, basePrice: (pr.basePrice / 100).toFixed(2), variants: pr.variants?.map(v => ({ ...v, priceOverride: v.priceOverride ? (v.priceOverride / 100).toFixed(2) : "" })) || [] })}>
                              <Pencil size={14} />
                            </button>
                            <button className={`${p.actionBtn} ${p.delete}`} onClick={() => setConfirmDelete(pr)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${pr.id}-variants`} className={p.variantExpandRow}>
                          <td colSpan="9">
                            <div className={p.variantExpandInner}>
                              {!pr.variants?.length ? (
                                <p style={{ padding: "12px 16px", margin: 0, fontSize: 13, color: "var(--vdr-text-muted)" }}>No variants found.</p>
                              ) : (
                                <table className={p.variantSubTable}>
                                  <thead>
                                    <tr>
                                      <th>Image</th>
                                      <th>Color</th>
                                      <th>Size</th>
                                      <th>SKU</th>
                                      <th>Physical Qty</th>
                                      <th>Reserved</th>
                                      <th>Available</th>
                                      <th>Price</th>
                                      <th>Status</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {pr.variants.map((v) => {
                                      const variantImg = v.variantImageLinks?.[0]?.image?.s3Url || primaryImg?.s3Url || primaryImg?.url;
                                      const available = (v.physicalQuantity || 0) - (v.reservedQuantity || 0);
                                      const effectivePrice = v.priceOverride ?? pr.basePrice;
                                      return (
                                        <tr key={v.id}>
                                          <td>
                                            {variantImg ? (
                                              <img src={variantImg} alt="" className={p.variantThumb} />
                                            ) : (
                                              <div className={p.variantThumbPlaceholder}><ImageIcon size={14} /></div>
                                            )}
                                          </td>
                                          <td>
                                            {v.color ? (
                                              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                {v.color.hexCode && (
                                                  <span className={p.variantColorDot} style={{ background: v.color.hexCode }} />
                                                )}
                                                {v.color.name}
                                              </span>
                                            ) : "—"}
                                          </td>
                                          <td>{v.size?.name || "—"}</td>
                                          <td style={{ fontFamily: "monospace", fontSize: 11 }}>{v.sku || "—"}</td>
                                          <td>{v.physicalQuantity ?? 0}</td>
                                          <td>{v.reservedQuantity ?? 0}</td>
                                          <td className={available <= 0 ? p.variantQtyLow : (available <= 5 ? p.variantQtyLow : p.variantQtyOk)}>{available}</td>
                                          <td style={{ fontWeight: 600 }}>{formatPrice(effectivePrice)}</td>
                                          <td>
                                            <span className={`${p.badge} ${STATUS_BADGE[v.status] || p.badgeDraft}`} style={{ fontSize: 10 }}>
                                              {v.status}
                                            </span>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              )}
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

        {total > PAGE_SIZE && (
          <div className={p.pagination}>
            <span className={p.pageInfo}>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
            </span>
            <div className={p.pageButtons}>
              <button className={p.pageBtn} onClick={() => setPage(v => v - 1)} disabled={page === 1}>←</button>
              <button className={p.pageBtn} onClick={() => setPage(v => v + 1)} disabled={page * PAGE_SIZE >= total}>→</button>
            </div>
          </div>
        )}
      </div>

      {editProduct && (
        <ProductModal
          product={editProduct}
          options={options}
          onClose={() => setEditProduct(null)}
          onSave={saveProduct}
          onManageImages={(p) => setImgManager(p)}
          onPublish={publishProduct}
          onArchive={archiveProduct}
        />
      )}

      {confirmDelete && (
        <div className={p.modalBackdrop} onClick={() => setConfirmDelete(null)}>
          <div className={`${p.modal} ${p.modalSm}`} onClick={(e) => e.stopPropagation()}>
            <div className={p.modalBody} style={{ alignItems: "center", textAlign: "center", padding: "28px" }}>
              <div className={p.confirmIcon}><AlertTriangle size={22} /></div>
              <h3 className={p.modalTitle} style={{ marginTop: 8 }}>Delete Product?</h3>
              <p className={p.confirmText}>This will permanently remove <strong>{confirmDelete.name}</strong>.</p>
            </div>
            <div className={p.modalFoot} style={{ justifyContent: "center" }}>
              <button className={`${p.btn} ${p.btnOutline}`} onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className={`${p.btn} ${p.btnDanger}`} onClick={() => deleteProduct(confirmDelete.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {imgManager && (
        <ProductImageManager
          product={imgManager}
          onClose={() => setImgManager(null)}
          onSave={(updatedImages) => saveProductImages(updatedImages, imgManager.id, imgManager.images, imgManager.variants)}
        />
      )}
    </VendorLayout>
  );
}
