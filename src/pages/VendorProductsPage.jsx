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
} from "lucide-react";
import VendorLayout from "../components/vendor/VendorLayout";
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
  variants: [
    { colorId: "", sizeId: "", physicalQuantity: 10, sku: "", priceOverride: "" }
  ],
  _new: true,
};

function ProductModal({ product, options, onClose, onSave }) {
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
      variants: [...form.variants, { colorId: "", sizeId: "", physicalQuantity: 10, sku: "", priceOverride: "" }]
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
      // Convert EGP strings to piasters
      const payload = {
        ...form,
        basePrice: Math.round(parseFloat(form.basePrice) * 100),
        variants: form.variants.map(v => ({
          ...v,
          physicalQuantity: parseInt(v.physicalQuantity) || 0,
          priceOverride: v.priceOverride ? Math.round(parseFloat(v.priceOverride) * 100) : null
        }))
      };
      delete payload._new;
      await onSave(payload);
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
                            {options.sizes.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                          </select>
                        </td>
                        <td>
                          <input className={p.input} type="number" min="0" value={v.physicalQuantity} onChange={e => updateVariant(idx, "physicalQuantity", e.target.value)} required />
                        </td>
                        <td>
                          <input className={p.input} type="number" step="0.01" placeholder="Optional" value={v.priceOverride} onChange={e => updateVariant(idx, "priceOverride", e.target.value)} />
                        </td>
                        <td>
                          <button type="button" style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }} onClick={() => removeVariant(idx)}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className={p.modalFoot}>
            <button type="button" className={`${p.btn} ${p.btnOutline}`} onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className={`${p.btn} ${p.btnPrimary}`} disabled={submitting}>
              {submitting ? "Saving..." : (form._new ? "Add Product" : "Save Changes")}
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
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchOptions();
    fetchProducts();
  }, [page, catFilter, statusFilter]);

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

  const saveProduct = async (form) => {
    try {
      if (form.id) {
        await apiClient.patch(`/products/${form.id}`, form);
        // Also update variants if needed, or backend handles it.
        // For simplicity assuming backend handles full update or separate calls if needed.
      } else {
        await apiClient.post("/products", form);
      }
      fetchProducts();
      setEditProduct(null);
    } catch (err) {
      console.error("Failed to save", err);
      alert("Failed to save product. Check console.");
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
              onChange={(e) => setSearch(e.target.value)}
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
                <th>Product</th>
                <th>Category</th>
                <th>Base Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className={p.skeleton} style={{ height: 100 }}></td></tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className={p.emptyState}>
                      <div className={p.emptyIcon}><Package size={22} /></div>
                      <h3 className={p.emptyTitle}>No products found</h3>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((pr) => (
                  <tr key={pr.id}>
                    <td>
                      <div className={p.productCell}>
                        <div className={p.productThumb}>
                          {pr.images?.[0] ? <img src={pr.images[0].s3Url || pr.images[0].url} alt="" /> : <ImageIcon size={16} />}
                        </div>
                        <span className={p.productName}>{pr.name}</span>
                      </div>
                    </td>
                    <td><span className={`${p.badge} ${p.badgeDraft}`}>{pr.category?.name}</span></td>
                    <td style={{ fontWeight: 700 }}>{formatPrice(pr.basePrice)}</td>
                    <td>{pr.variants?.reduce((s, v) => s + v.physicalQuantity, 0) || 0}</td>
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
                ))
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
    </VendorLayout>
  );
}
