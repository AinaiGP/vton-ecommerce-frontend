import { useState } from "react";
import { Search, Plus, Pencil, Trash2, Eye, EyeOff, X, Check, AlertTriangle, Package } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import t from "../../styles/AdminTable.module.css";

const INITIAL_PRODUCTS = [
  { id: 1, name: "Silk Evening Gown", vendor: "Silk & Satin", category: "Formal Wear", price: "EGP 89.99", stock: 45, visible: true, vton: true },
  { id: 2, name: "Urban Jogger Set", vendor: "Urban Threads", category: "Sportswear", price: "EGP 59.99", stock: 120, visible: true, vton: false },
  { id: 3, name: "Desert Kaftan", vendor: "Desert Rose", category: "Traditional", price: "EGP 49.99", stock: 22, visible: true, vton: true },
  { id: 4, name: "Pearl Hijab Collection", vendor: "Noor Fashion", category: "Accessories", price: "EGP 29.99", stock: 200, visible: false, vton: false },
  { id: 5, name: "Floral Summer Dress", vendor: "Blossom & Bloom", category: "Summer", price: "EGP 44.99", stock: 0, visible: true, vton: true },
  { id: 6, name: "Business Abaya", vendor: "Noor Fashion", category: "Formal Wear", price: "EGP 119.99", stock: 18, visible: true, vton: false },
  { id: 7, name: "Boho Maxi Skirt", vendor: "Blossom & Bloom", category: "Casual", price: "EGP 34.99", stock: 67, visible: true, vton: true },
];

const PAGE_SIZE = 5;
const CATEGORIES = ["All", "Formal Wear", "Sportswear", "Traditional", "Accessories", "Summer", "Casual"];

function getInitials(name) {
  return name.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

export default function AdminProducts() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [editProduct, setEditProduct] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.vendor.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "All" || p.category === catFilter;
    return matchSearch && matchCat;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleVisible = (id) => setProducts(products.map((p) => p.id === id ? { ...p, visible: !p.visible } : p));
  const deleteProduct = (id) => { setProducts(products.filter((p) => p.id !== id)); setConfirmDelete(null); };

  const saveProduct = (e) => {
    e.preventDefault();
    if (editProduct._new) {
      setProducts([...products, { ...editProduct, id: Date.now(), visible: true }]);
    } else {
      setProducts(products.map((p) => p.id === editProduct.id ? editProduct : p));
    }
    setEditProduct(null);
  };

  const BLANK = { name: "", vendor: "", category: "Formal Wear", price: "", stock: 0, visible: true, vton: false, _new: true };

  return (
    <AdminLayout pageTitle="Product Management" pageSubtitle="Browse, add, and moderate all store products." breadcrumb="Products">

      {/* Toolbar */}
      <div className={t.toolbar}>
        <div className={t.toolbarLeft}>
          <div className={t.searchBox}>
            <Search size={15} className={t.searchIcon} />
            <input className={t.searchInput} placeholder="Search by name or vendor..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className={t.filterSelect} value={catFilter} onChange={(e) => { setCatFilter(e.target.value); setPage(1); }}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className={t.toolbarRight}>
          <button className={`${t.btn} ${t.btnPrimary}`} onClick={() => setEditProduct({ ...BLANK })}>
            <Plus size={15} /> Add Product
          </button>
        </div>
      </div>

      {/* Table */}
      <div className={t.tableCard}>
        <div className={t.tableWrap}>
          <table className={t.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Vendor</th>
                <th>Stock</th>
                <th>VTON</th>
                <th>Visible</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className={t.emptyState}>
                    <div className={t.emptyIcon}><Package size={24} /></div>
                    <h3 className={t.emptyTitle}>No products found</h3>
                    <p className={t.emptyText}>Try adjusting your search or category filter.</p>
                  </div>
                </td></tr>
              ) : paged.map((p) => (
                <tr key={p.id} style={{ opacity: p.visible ? 1 : 0.55 }}>
                  <td>
                    <div className={t.avatarCell}>
                      <div className={t.productThumb}><Package size={16} /></div>
                      <span style={{ fontWeight: 600 }}>{p.name}</span>
                    </div>
                  </td>
                  <td><span className={`${t.badge} ${t.badgeDraft}`}>{p.category}</span></td>
                  <td style={{ fontWeight: 700 }}>{p.price}</td>
                  <td style={{ color: "var(--adm-text-muted)" }}>{p.vendor}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: p.stock === 0 ? "#dc2626" : "inherit" }}>
                      {p.stock === 0 ? "Out of stock" : p.stock}
                    </span>
                  </td>
                  <td>
                    {p.vton
                      ? <span className={`${t.badge} ${t.badgeProcessing}`}>Enabled</span>
                      : <span className={`${t.badge} ${t.badgeDraft}`}>Off</span>
                    }
                  </td>
                  <td>
                    <button
                      className={t.actionBtn}
                      title={p.visible ? "Hide" : "Show"}
                      onClick={() => toggleVisible(p.id)}
                      style={{ color: p.visible ? "#16a34a" : "#dc2626" }}
                    >
                      {p.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                  </td>
                  <td>
                    <div className={t.actions}>
                      <button className={`${t.actionBtn} ${t.edit}`} title="Edit" onClick={() => setEditProduct({ ...p })}><Pencil size={15} /></button>
                      <button className={`${t.actionBtn} ${t.delete}`} title="Delete" onClick={() => setConfirmDelete(p)}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className={t.pagination}>
            <span className={t.pageInfo}>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} products</span>
            <div className={t.pageButtons}>
              <button className={t.pageBtn} onClick={() => setPage(p => p - 1)} disabled={page === 1}>←</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i + 1} className={`${t.pageBtn} ${page === i + 1 ? t.pageBtnActive : ""}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
              ))}
              <button className={t.pageBtn} onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>→</button>
            </div>
          </div>
        )}
      </div>

      {/* Edit/Add Modal */}
      {editProduct && (
        <div className={t.modalBackdrop} onClick={() => setEditProduct(null)}>
          <div className={t.modal} onClick={(e) => e.stopPropagation()}>
            <div className={t.modalHead}>
              <h2 className={t.modalTitle}>{editProduct._new ? "Add New Product" : "Edit Product"}</h2>
              <button className={t.modalClose} onClick={() => setEditProduct(null)}><X size={18} /></button>
            </div>
            <form onSubmit={saveProduct}>
              <div className={t.modalBody}>
                <div className={t.formRow}>
                  <div className={t.formGroup} style={{ gridColumn: "1 / -1" }}>
                    <label className={t.label}>Product Name</label>
                    <input className={t.input} value={editProduct.name} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })} required placeholder="e.g. Silk Evening Gown" />
                  </div>
                  <div className={t.formGroup}>
                    <label className={t.label}>Vendor</label>
                    <input className={t.input} value={editProduct.vendor} onChange={(e) => setEditProduct({ ...editProduct, vendor: e.target.value })} required placeholder="Vendor name" />
                  </div>
                  <div className={t.formGroup}>
                    <label className={t.label}>Category</label>
                    <select className={t.select} value={editProduct.category} onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}>
                      {CATEGORIES.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className={t.formGroup}>
                    <label className={t.label}>Price</label>
                    <input className={t.input} value={editProduct.price} onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })} required placeholder="EGP 0.00" />
                  </div>
                  <div className={t.formGroup}>
                    <label className={t.label}>Stock</label>
                    <input className={t.input} type="number" min={0} value={editProduct.stock} onChange={(e) => setEditProduct({ ...editProduct, stock: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13.5 }}>
                    <label className={t.toggle}>
                      <input type="checkbox" className={t.toggleInput} checked={editProduct.vton} onChange={(e) => setEditProduct({ ...editProduct, vton: e.target.checked })} />
                      <span className={t.toggleSlider} />
                    </label>
                    VTON Enabled
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13.5 }}>
                    <label className={t.toggle}>
                      <input type="checkbox" className={t.toggleInput} checked={editProduct.visible} onChange={(e) => setEditProduct({ ...editProduct, visible: e.target.checked })} />
                      <span className={t.toggleSlider} />
                    </label>
                    Visible in Store
                  </label>
                </div>
              </div>
              <div className={t.modalFoot}>
                <button type="button" className={`${t.btn} ${t.btnOutline}`} onClick={() => setEditProduct(null)}>Cancel</button>
                <button type="submit" className={`${t.btn} ${t.btnPrimary}`}><Check size={14} /> {editProduct._new ? "Add Product" : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {confirmDelete && (
        <div className={t.modalBackdrop} onClick={() => setConfirmDelete(null)}>
          <div className={`${t.modal} ${t.modalSm}`} onClick={(e) => e.stopPropagation()}>
            <div className={t.modalBody} style={{ alignItems: "center", textAlign: "center", paddingTop: 28, paddingBottom: 28 }}>
              <div className={t.confirmIcon}><AlertTriangle size={24} /></div>
              <h3 className={t.modalTitle}>Delete Product?</h3>
              <p className={t.confirmText}>This will permanently remove <strong>{confirmDelete.name}</strong> from the catalog.</p>
            </div>
            <div className={t.modalFoot} style={{ justifyContent: "center" }}>
              <button className={`${t.btn} ${t.btnOutline}`} onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className={`${t.btn} ${t.btnDanger}`} onClick={() => deleteProduct(confirmDelete.id)}><Trash2 size={14} /> Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
