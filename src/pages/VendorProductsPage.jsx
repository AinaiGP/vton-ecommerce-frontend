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
} from "lucide-react";
import VendorLayout from "../components/vendor/VendorLayout";
import p from "../styles/VendorPage.module.css";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const COLORS = [
  { name: "Black", hex: "#1a1a1a" },
  { name: "White", hex: "#f8f6f0" },
  { name: "Red", hex: "#dc2626" },
  { name: "Blue", hex: "#2563eb" },
  { name: "Green", hex: "#16a34a" },
  { name: "Pink", hex: "#ec4899" },
  { name: "Gold", hex: "#d97706" },
  { name: "Purple", hex: "#7c3aed" },
];
const CATEGORIES = [
  "Dresses",
  "Traditional",
  "Casual",
  "Accessories",
  "Outerwear",
  "Sportswear",
  "Formal",
];
const PAGE_SIZE = 5;

const STATUS_BADGE = {
  Active: p.badgeActive,
  "Out of Stock": p.badgeOOS,
  Draft: p.badgeDraft,
};
const BLANK = {
  name: "",
  category: "Dresses",
  price: "",
  stock: 0,
  status: "Active",
  image: null,
  description: "",
  sizes: [],
  colors: [],
  _new: true,
};

function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState({ ...product });
  const [preview, setPreview] = useState(product.image || null);
  const fileRef = useRef(null);

  const toggleSize = (s) =>
    setForm((f) => ({
      ...f,
      sizes: f.sizes?.includes(s)
        ? f.sizes.filter((x) => x !== s)
        : [...(f.sizes || []), s],
    }));
  const toggleColor = (c) =>
    setForm((f) => ({
      ...f,
      colors: f.colors?.includes(c)
        ? f.colors.filter((x) => x !== c)
        : [...(f.colors || []), c],
    }));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setForm((f) => ({ ...f, image: url }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className={p.modalBackdrop} onClick={onClose}>
      <div
        className={`${p.modal} ${p.modalLg}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={p.modalHead}>
          <h2 className={p.modalTitle}>
            {form._new ? "Add New Product" : "Edit Product"}
          </h2>
          <button className={p.modalClose} onClick={onClose}>
            <X size={17} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={p.modalBody}>
            {/* Image upload */}
            <div className={p.formGroup}>
              <label className={p.label}>Product Images</label>
              <label
                className={p.uploadZone}
                onClick={() => fileRef.current?.click()}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className={p.uploadPreview}
                  />
                ) : (
                  <>
                    <div className={p.uploadIcon}>
                      <ImageIcon size={32} />
                    </div>
                    <p className={p.uploadTitle}>
                      Click to upload or drag & drop
                    </p>
                    <p className={p.uploadSub}>
                      PNG, JPG, WEBP · Max 5MB · High-quality flat lay
                      recommended
                    </p>
                  </>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={handleFile}
                />
              </label>
            </div>

            <div className={p.formRow}>
              <div className={p.formGroup} style={{ gridColumn: "1 / -1" }}>
                <label className={p.label}>Product Name *</label>
                <input
                  className={p.input}
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                  placeholder="e.g. Silk Evening Gown"
                />
              </div>
              <div className={p.formGroup} style={{ gridColumn: "1 / -1" }}>
                <label className={p.label}>Description</label>
                <textarea
                  className={p.textarea}
                  value={form.description || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Describe your product..."
                  rows={3}
                />
              </div>
              <div className={p.formGroup}>
                <label className={p.label}>Price *</label>
                <input
                  className={p.input}
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                  required
                  placeholder="EGP 0.00"
                />
              </div>
              <div className={p.formGroup}>
                <label className={p.label}>Stock Quantity</label>
                <input
                  className={p.input}
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      stock: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className={p.formGroup}>
                <label className={p.label}>Category</label>
                <select
                  className={p.select}
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className={p.formGroup}>
                <label className={p.label}>Status</label>
                <select
                  className={p.select}
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value }))
                  }
                >
                  <option>Active</option>
                  <option>Draft</option>
                  <option>Out of Stock</option>
                </select>
              </div>
            </div>

            {/* Sizes */}
            <div className={p.formGroup}>
              <label className={p.label}>Available Sizes</label>
              <div className={p.chipGroup}>
                {SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`${p.chip} ${form.sizes?.includes(s) ? p.selected : ""}`}
                    onClick={() => toggleSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className={p.formGroup}>
              <label className={p.label}>Available Colors</label>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                {COLORS.map((c) => (
                  <div key={c.name} title={c.name}>
                    <div
                      className={`${p.colorChip} ${form.colors?.includes(c.name) ? p.selected : ""}`}
                      style={{ background: c.hex }}
                      onClick={() => toggleColor(c.name)}
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className={p.modalFoot}>
            <button
              type="button"
              className={`${p.btn} ${p.btnOutline}`}
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className={`${p.btn} ${p.btnPrimary}`}>
              <Check size={14} />
              {form._new ? "Add Product" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VendorProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [editProduct, setEditProduct] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    // TODO: wire to real API endpoint — Phase X
    setProducts([]);
  }, []);

  const filtered = products.filter((pr) => {
    const ms = pr.name.toLowerCase().includes(search.toLowerCase());
    const mc = catFilter === "All" || pr.category === catFilter;
    const mst = statusFilter === "All" || pr.status === statusFilter;
    return ms && mc && mst;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const deleteProduct = (id) => {
    setProducts(products.filter((pr) => pr.id !== id));
    setConfirmDelete(null);
  };
  const saveProduct = (form) => {
    if (form._new) setProducts([...products, { ...form, id: Date.now() }]);
    else setProducts(products.map((pr) => (pr.id === form.id ? form : pr)));
    setEditProduct(null);
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
      pageSubtitle={`${products.length} products in your store`}
      breadcrumb="Products"
      headerAction={addBtn}
    >
      {/* Toolbar */}
      <div className={p.toolbar}>
        <div className={p.toolbarLeft}>
          <div className={p.searchBox}>
            <Search size={14} className={p.searchIcon} />
            <input
              className={p.searchInput}
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <select
            className={p.filterSelect}
            value={catFilter}
            onChange={(e) => {
              setCatFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            className={p.filterSelect}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">All Status</option>
            <option>Active</option>
            <option>Draft</option>
            <option>Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={p.tableCard}>
        <div className={p.tableWrap}>
          <table className={p.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className={p.emptyState}>
                      <div className={p.emptyIcon}>
                        <Package size={22} />
                      </div>
                      <h3 className={p.emptyTitle}>No products found</h3>
                      <p className={p.emptyText}>
                        Try a different search or add your first product.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paged.map((pr) => (
                  <tr key={pr.id}>
                    <td>
                      <div className={p.productCell}>
                        <div className={p.productThumb}>
                          {pr.image ? (
                            <img src={pr.image} alt={pr.name} />
                          ) : (
                            <ImageIcon size={16} />
                          )}
                        </div>
                        <div>
                          <span className={p.productName}>{pr.name}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`${p.badge} ${p.badgeDraft}`}>
                        {pr.category}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{pr.price}</td>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          color: pr.stock === 0 ? "#dc2626" : "inherit",
                        }}
                      >
                        {pr.stock === 0 ? "Out" : pr.stock}
                      </span>
                    </td>
                    <td>
                      <span className={`${p.badge} ${STATUS_BADGE[pr.status]}`}>
                        <span className={p.badgeDot} />
                        {pr.status}
                      </span>
                    </td>
                    <td>
                      <div className={p.actions}>
                        <button
                          className={`${p.actionBtn} ${p.edit}`}
                          title="Edit"
                          onClick={() => setEditProduct({ ...pr })}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className={`${p.actionBtn} ${p.delete}`}
                          title="Delete"
                          onClick={() => setConfirmDelete(pr)}
                        >
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

        {totalPages > 1 && (
          <div className={p.pagination}>
            <span className={p.pageInfo}>
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className={p.pageButtons}>
              <button
                className={p.pageBtn}
                onClick={() => setPage((v) => v - 1)}
                disabled={page === 1}
              >
                ←
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`${p.pageBtn} ${page === i + 1 ? p.pageBtnActive : ""}`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className={p.pageBtn}
                onClick={() => setPage((v) => v + 1)}
                disabled={page === totalPages}
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>

      {editProduct && (
        <ProductModal
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onSave={saveProduct}
        />
      )}

      {confirmDelete && (
        <div className={p.modalBackdrop} onClick={() => setConfirmDelete(null)}>
          <div
            className={`${p.modal} ${p.modalSm}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={p.modalBody}
              style={{
                alignItems: "center",
                textAlign: "center",
                paddingTop: 28,
                paddingBottom: 28,
              }}
            >
              <div className={p.confirmIcon}>
                <AlertTriangle size={22} />
              </div>
              <h3 className={p.modalTitle} style={{ marginTop: 8 }}>
                Delete Product?
              </h3>
              <p className={p.confirmText}>
                This will permanently remove{" "}
                <strong>{confirmDelete.name}</strong> from your store.
              </p>
            </div>
            <div className={p.modalFoot} style={{ justifyContent: "center" }}>
              <button
                className={`${p.btn} ${p.btnOutline}`}
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                className={`${p.btn} ${p.btnDanger}`}
                onClick={() => deleteProduct(confirmDelete.id)}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </VendorLayout>
  );
}
