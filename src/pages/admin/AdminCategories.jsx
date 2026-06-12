import { useState, useEffect } from "react";
import { Trash2, Plus, Pencil, Check, X, Search, Folders } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import t from "../../styles/AdminTable.module.css";

const INITIAL_CATEGORIES = [];

function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function AdminCategories() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [editCat, setEditCat] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    // TODO: wire admin categories to real API — Phase X
  }, []);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCategories([
      ...categories,
      {
        id: Date.now(),
        name: newName.trim(),
        slug: toSlug(newName),
        productCount: 0,
        visible: true,
      },
    ]);
    setNewName("");
  };

  const saveEdit = (e) => {
    e.preventDefault();
    setCategories(
      categories.map((c) =>
        c.id === editCat.id ? { ...editCat, slug: toSlug(editCat.name) } : c,
      ),
    );
    setEditCat(null);
  };

  const handleDelete = (id) => {
    setCategories(categories.filter((c) => c.id !== id));
    setConfirmDelete(null);
  };

  return (
    <AdminLayout
      pageTitle="Category Management"
      pageSubtitle="Define and organise the global product taxonomy."
      breadcrumb="Categories"
    >
      {/* Add Category */}
      <div className={t.chartCard} style={{ padding: 20 }}>
        <h3
          style={{
            margin: "0 0 14px",
            fontSize: 15,
            fontWeight: 700,
            color: "var(--adm-text)",
          }}
        >
          Add New Category
        </h3>
        <form onSubmit={handleAdd} style={{ display: "flex", gap: 10 }}>
          <input
            className={t.input}
            style={{ flex: 1 }}
            placeholder="Category name (e.g. Winter Collection)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button type="submit" className={`${t.btn} ${t.btnPrimary}`}>
            <Plus size={15} /> Add Category
          </button>
        </form>
      </div>

      {/* Search */}
      <div className={t.toolbar}>
        <div className={t.toolbarLeft}>
          <div className={t.searchBox}>
            <Search size={15} className={t.searchIcon} />
            <input
              className={t.searchInput}
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <span className={t.pageInfo}>{categories.length} categories</span>
      </div>

      {/* Table */}
      <div className={t.tableCard}>
        <div className={t.tableWrap}>
          <table className={t.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Category Name</th>
                <th>Slug</th>
                <th>Products</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className={t.emptyState}>
                      <div className={t.emptyIcon}>
                        <Folders size={24} />
                      </div>
                      <h3 className={t.emptyTitle}>No categories found</h3>
                      <p className={t.emptyText}>
                        Add a new category using the form above.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((cat, i) => (
                  <tr key={cat.id}>
                    <td
                      style={{
                        color: "var(--adm-text-subtle)",
                        fontWeight: 600,
                      }}
                    >
                      {i + 1}
                    </td>
                    <td style={{ fontWeight: 600 }}>{cat.name}</td>
                    <td>
                      <code
                        style={{
                          fontSize: 12,
                          background: "var(--adm-bg)",
                          padding: "2px 8px",
                          borderRadius: 4,
                          color: "var(--adm-text-muted)",
                        }}
                      >
                        {cat.slug}
                      </code>
                    </td>
                    <td>
                      <span className={`${t.badge} ${t.badgeDraft}`}>
                        {cat.productCount} products
                      </span>
                    </td>
                    <td>
                      <div className={t.actions}>
                        <button
                          className={`${t.actionBtn} ${t.edit}`}
                          title="Edit"
                          onClick={() => setEditCat({ ...cat })}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className={`${t.actionBtn} ${t.delete}`}
                          title="Delete"
                          onClick={() => setConfirmDelete(cat)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editCat && (
        <div className={t.modalBackdrop} onClick={() => setEditCat(null)}>
          <div
            className={`${t.modal} ${t.modalSm}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={t.modalHead}>
              <h2 className={t.modalTitle}>Edit Category</h2>
              <button className={t.modalClose} onClick={() => setEditCat(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={saveEdit}>
              <div className={t.modalBody}>
                <div className={t.formGroup}>
                  <label className={t.label}>Category Name</label>
                  <input
                    className={t.input}
                    value={editCat.name}
                    onChange={(e) =>
                      setEditCat({ ...editCat, name: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className={t.modalFoot}>
                <button
                  type="button"
                  className={`${t.btn} ${t.btnOutline}`}
                  onClick={() => setEditCat(null)}
                >
                  Cancel
                </button>
                <button type="submit" className={`${t.btn} ${t.btnPrimary}`}>
                  <Check size={14} /> Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className={t.modalBackdrop} onClick={() => setConfirmDelete(null)}>
          <div
            className={`${t.modal} ${t.modalSm}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={t.modalBody}
              style={{
                alignItems: "center",
                textAlign: "center",
                paddingTop: 28,
                paddingBottom: 28,
              }}
            >
              <div className={t.confirmIcon}>
                <Trash2 size={24} />
              </div>
              <h3 className={t.modalTitle}>Delete Category?</h3>
              <p className={t.confirmText}>
                Are you sure you want to remove{" "}
                <strong>{confirmDelete.name}</strong>? This may affect{" "}
                {confirmDelete.productCount} product(s).
              </p>
            </div>
            <div className={t.modalFoot} style={{ justifyContent: "center" }}>
              <button
                className={`${t.btn} ${t.btnOutline}`}
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                className={`${t.btn} ${t.btnDanger}`}
                onClick={() => handleDelete(confirmDelete.id)}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
