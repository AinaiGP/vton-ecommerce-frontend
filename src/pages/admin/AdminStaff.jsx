import { useState, useEffect } from "react";
import {
  Users,
  UserX,
  Shield,
  Headphones,
  Search,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  Check,
  AlertTriangle,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import t from "../../styles/AdminTable.module.css";

const SEED = [];
const S_COLORS = {
  Active: { bg: "#dcfce7", color: "#16a34a" },
  Inactive: { bg: "#f1f5f9", color: "#64748b" },
  Banned: { bg: "#fee2e2", color: "#dc2626" },
};

function AddModal({ onSave, onClose }) {
  const [f, setF] = useState({
    name: "",
    email: "",
    role: "Technical Support",
  });
  return (
    <div className={t.modalBackdrop} onClick={onClose}>
      <div className={t.modal} onClick={(e) => e.stopPropagation()}>
        <div className={t.modalHead}>
          <h2 className={t.modalTitle}>Add Staff Member</h2>
          <button className={t.modalClose} onClick={onClose}>
            <X size={17} />
          </button>
        </div>
        <div className={t.modalBody}>
          {[
            ["Full Name *", "text", "name", "e.g. Ahmed Mostafa"],
            ["Email *", "email", "email", "staff@ainai.com"],
          ].map(([l, tp, k, ph]) => (
            <div
              key={k}
              style={{ display: "flex", flexDirection: "column", gap: 6 }}
            >
              <label
                style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: "var(--adm-text)",
                }}
              >
                {l}
              </label>
              <input
                className={t.searchInput}
                type={tp}
                style={{ width: "100%", borderRadius: 8, paddingLeft: 12 }}
                value={f[k]}
                onChange={(e) => setF({ ...f, [k]: e.target.value })}
                placeholder={ph}
              />
            </div>
          ))}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: "var(--adm-text)",
              }}
            >
              Role *
            </label>
            <select
              className={t.filterSelect}
              style={{ width: "100%", borderRadius: 8 }}
              value={f.role}
              onChange={(e) => setF({ ...f, role: e.target.value })}
            >
              <option>Admin</option>
              <option>Technical Support</option>
            </select>
          </div>
        </div>
        <div className={t.modalFoot}>
          <button className={`${t.btn} ${t.btnOutline}`} onClick={onClose}>
            Cancel
          </button>
          <button
            className={`${t.btn} ${t.btnPrimary}`}
            disabled={!f.name.trim() || !f.email.trim()}
            onClick={() =>
              onSave({
                ...f,
                id: Date.now(),
                status: "Active",
                joined: "Today",
                avatar: f.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase(),
              })
            }
          >
            <Check size={14} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ title, danger, onConfirm, onClose }) {
  return (
    <div className={t.modalBackdrop} onClick={onClose}>
      <div
        className={`${t.modal} ${t.modalSm}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ textAlign: "center", padding: "28px 24px" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: danger ? "#fee2e2" : "#fef9c3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
            }}
          >
            <AlertTriangle
              size={24}
              style={{ color: danger ? "#dc2626" : "#ca8a04" }}
            />
          </div>
          <h3
            style={{
              fontWeight: 700,
              color: "var(--adm-text)",
              margin: "0 0 8px",
              fontSize: 16,
            }}
          >
            {title}
          </h3>
          <p
            style={{
              fontSize: 13,
              color: "var(--adm-text-muted)",
              marginBottom: 20,
            }}
          >
            This action can be reversed later.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button className={`${t.btn} ${t.btnOutline}`} onClick={onClose}>
              Cancel
            </button>
            <button
              className={`${t.btn} ${danger ? t.btnDanger : t.btnPrimary}`}
              onClick={onConfirm}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminStaffPage() {
  const [staff, setStaff] = useState(SEED);
  const [search, setSearch] = useState("");
  const [rf, setRf] = useState("All");
  const [sf, setSf] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    // TODO: wire admin staff to real API — Phase X
  }, []);

  const filtered = staff.filter(
    (s) =>
      (s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())) &&
      (rf === "All" || s.role === rf) &&
      (sf === "All" || s.status === sf),
  );

  const addStaff = (d) => {
    setStaff((p) => [...p, d]);
    setShowAdd(false);
  };
  const doAction = (type, id) => {
    setStaff((p) =>
      type === "delete"
        ? p.filter((s) => s.id !== id)
        : p.map((s) =>
            s.id !== id
              ? s
              : {
                  ...s,
                  status:
                    type === "deactivate"
                      ? "Inactive"
                      : type === "activate"
                        ? "Active"
                        : type === "ban"
                          ? "Banned"
                          : s.status,
                  role:
                    type === "toggleRole"
                      ? s.role === "Admin"
                        ? "Technical Support"
                        : "Admin"
                      : s.role,
                },
          ),
    );
    setConfirm(null);
  };

  const stats = [
    { label: "Total", val: staff.length, color: "#3a302b", bg: "#f7f3ed" },
    {
      label: "Admins",
      val: staff.filter((s) => s.role === "Admin").length,
      color: "#8b4852",
      bg: "#fbf5f6",
    },
    {
      label: "Support",
      val: staff.filter((s) => s.role === "Technical Support").length,
      color: "#2563eb",
      bg: "#dbeafe",
    },
    {
      label: "Active",
      val: staff.filter((s) => s.status === "Active").length,
      color: "#16a34a",
      bg: "#dcfce7",
    },
  ];

  return (
    <AdminLayout
      pageTitle="Staff Management"
      pageSubtitle="Add and manage platform staff."
      breadcrumb="Staff"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 14,
          marginBottom: 20,
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              background: s.bg,
              border: `1.5px solid ${s.color}22`,
              borderRadius: 12,
              padding: "14px 16px",
            }}
          >
            <p
              style={{
                margin: "0 0 4px",
                fontSize: 22,
                fontWeight: 800,
                color: s.color,
                lineHeight: 1,
              }}
            >
              {s.val}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 11.5,
                fontWeight: 600,
                color: s.color,
                opacity: 0.75,
              }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>
      <div className={t.toolbar}>
        <div className={t.toolbarLeft}>
          <div className={t.searchBox}>
            <Search size={14} className={t.searchIcon} />
            <input
              className={t.searchInput}
              placeholder="Search staff…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className={t.filterSelect}
            value={rf}
            onChange={(e) => setRf(e.target.value)}
          >
            <option>All</option>
            <option>Admin</option>
            <option>Technical Support</option>
          </select>
          <select
            className={t.filterSelect}
            value={sf}
            onChange={(e) => setSf(e.target.value)}
          >
            <option>All</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>Banned</option>
          </select>
        </div>
        <button
          className={`${t.btn} ${t.btnPrimary}`}
          onClick={() => setShowAdd(true)}
        >
          <Plus size={15} /> Add Staff
        </button>
      </div>
      <div className={t.tableCard}>
        <div className={t.tableWrap}>
          <table className={t.table}>
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className={t.emptyState}>
                      <div className={t.emptyIcon}>
                        <Users size={24} />
                      </div>
                      <h3 className={t.emptyTitle}>No staff found</h3>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className={t.avatarCell}>
                        <div
                          className={t.avatar}
                          style={{
                            background:
                              s.role === "Admin" ? "#fbf5f6" : "#dbeafe",
                            color: s.role === "Admin" ? "#8b4852" : "#2563eb",
                          }}
                        >
                          {s.avatar}
                        </div>
                        <div>
                          <span className={t.avatarName}>{s.name}</span>
                          <span className={t.avatarSub}>{s.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: s.role === "Admin" ? "#8b4852" : "#2563eb",
                        }}
                      >
                        {s.role === "Admin" ? (
                          <Shield size={13} />
                        ) : (
                          <Headphones size={13} />
                        )}
                        {s.role}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: 99,
                          fontSize: 11,
                          fontWeight: 700,
                          background: (S_COLORS[s.status] || { bg: "#f1f5f9" })
                            .bg,
                          color: (S_COLORS[s.status] || { color: "#64748b" })
                            .color,
                        }}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td
                      style={{ fontSize: 12, color: "var(--adm-text-muted)" }}
                    >
                      {s.joined}
                    </td>
                    <td>
                      <div className={t.actions}>
                        <button
                          className={`${t.actionBtn} ${t.edit}`}
                          title="Toggle role"
                          onClick={() =>
                            setConfirm({
                              type: "toggleRole",
                              id: s.id,
                              label: `Change to ${s.role === "Admin" ? "Technical Support" : "Admin"}?`,
                              danger: false,
                            })
                          }
                        >
                          <Shield size={14} />
                        </button>
                        {s.status === "Active" ? (
                          <button
                            className={t.actionBtn}
                            title="Deactivate"
                            onClick={() =>
                              setConfirm({
                                type: "deactivate",
                                id: s.id,
                                label: "Deactivate this member?",
                                danger: false,
                              })
                            }
                          >
                            <ToggleRight size={14} />
                          </button>
                        ) : (
                          <button
                            className={`${t.actionBtn} ${t.approve}`}
                            title="Reactivate"
                            onClick={() =>
                              setConfirm({
                                type: "activate",
                                id: s.id,
                                label: "Reactivate this member?",
                                danger: false,
                              })
                            }
                          >
                            <ToggleLeft size={14} />
                          </button>
                        )}
                        {s.status !== "Banned" && (
                          <button
                            className={`${t.actionBtn} ${t.reject}`}
                            title="Ban"
                            onClick={() =>
                              setConfirm({
                                type: "ban",
                                id: s.id,
                                label: "Ban this staff member?",
                                danger: true,
                              })
                            }
                          >
                            <UserX size={14} />
                          </button>
                        )}
                        <button
                          className={`${t.actionBtn} ${t.delete}`}
                          title="Delete"
                          onClick={() =>
                            setConfirm({
                              type: "delete",
                              id: s.id,
                              label: "Permanently delete this account?",
                              danger: true,
                            })
                          }
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
        <div className={t.pagination}>
          <span className={t.pageInfo}>
            {filtered.length} staff member{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
      {showAdd && (
        <AddModal onSave={addStaff} onClose={() => setShowAdd(false)} />
      )}
      {confirm && (
        <ConfirmModal
          title={confirm.label}
          danger={confirm.danger}
          onConfirm={() => doAction(confirm.type, confirm.id)}
          onClose={() => setConfirm(null)}
        />
      )}
    </AdminLayout>
  );
}
