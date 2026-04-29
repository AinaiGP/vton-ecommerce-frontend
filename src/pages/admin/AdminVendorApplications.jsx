import { useState, useEffect } from "react";
import {
  Store,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Info,
  Clock,
  X,
  Check,
  AlertTriangle,
  FileText,
  Globe,
  Phone,
  Mail,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import t from "../../styles/AdminTable.module.css";

const SEED = [];

const STATUS_CFG = {
  Pending: { bg: "#fef9c3", color: "#ca8a04", icon: Clock },
  Approved: { bg: "#dcfce7", color: "#16a34a", icon: CheckCircle },
  Rejected: { bg: "#fee2e2", color: "#dc2626", icon: XCircle },
  "Needs More Information": { bg: "#dbeafe", color: "#2563eb", icon: Info },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || {
    bg: "#f1f5f9",
    color: "#64748b",
    icon: Clock,
  };
  const Icon = cfg.icon;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 10px",
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 700,
        background: cfg.bg,
        color: cfg.color,
      }}
    >
      <Icon size={11} />
      {status}
    </span>
  );
}

function AppModal({ app, onClose, onAction }) {
  const [note, setNote] = useState(app.note || "");
  return (
    <div className={t.modalBackdrop} onClick={onClose}>
      <div
        className={`${t.modal} ${t.modalLg}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={t.modalHead}>
          <div>
            <h2 className={t.modalTitle}>{app.brand} — Application</h2>
            <p
              style={{
                margin: "2px 0 0",
                fontSize: 12,
                color: "var(--adm-text-muted)",
              }}
            >
              {app.applicant} · {app.submitted}
            </p>
          </div>
          <button className={t.modalClose} onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className={t.modalBody}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <img
              src={app.logo}
              alt="logo"
              style={{
                width: 72,
                height: 72,
                borderRadius: 12,
                objectFit: "cover",
                border: "1px solid var(--adm-border)",
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 10,
                }}
              >
                <StatusBadge status={app.status} />
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: 99,
                    fontSize: 11,
                    fontWeight: 600,
                    background: "var(--adm-bg)",
                    color: "var(--adm-text-muted)",
                  }}
                >
                  {app.category}
                </span>
              </div>
              <p
                style={{ margin: 0, fontSize: 13.5, color: "var(--adm-text)" }}
              >
                {app.description}
              </p>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              background: "var(--adm-bg)",
              padding: 16,
              borderRadius: 12,
            }}
          >
            {[
              ["Applicant", app.applicant],
              [
                <>
                  <Mail size={12} /> Email
                </>,
                app.email,
              ],
              [
                <>
                  <Phone size={12} /> Phone
                </>,
                app.phone,
              ],
              [
                <>
                  <Globe size={12} /> Social/Website
                </>,
                app.social || "—",
              ],
            ].map(([l, v], i) => (
              <div key={i}>
                <p
                  style={{
                    margin: "0 0 2px",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--adm-text-muted)",
                    textTransform: "uppercase",
                  }}
                >
                  {l}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: "var(--adm-text)",
                    fontWeight: 600,
                  }}
                >
                  {v}
                </p>
              </div>
            ))}
          </div>
          {app.docs.length > 0 && (
            <div>
              <p
                style={{
                  margin: "0 0 8px",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--adm-text-muted)",
                  textTransform: "uppercase",
                }}
              >
                Documents
              </p>
              {app.docs.map((d, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 12px",
                    background: "var(--adm-bg)",
                    borderRadius: 8,
                    marginBottom: 6,
                  }}
                >
                  <FileText
                    size={14}
                    style={{ color: "var(--adm-accent)", flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 13, color: "var(--adm-text)" }}>
                    {d}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div>
            <label
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: "var(--adm-text)",
                display: "block",
                marginBottom: 6,
              }}
            >
              Admin Note (shown to applicant)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid var(--adm-border)",
                borderRadius: 8,
                fontFamily: "inherit",
                fontSize: 13.5,
                color: "var(--adm-text)",
                background: "var(--adm-surface)",
                resize: "vertical",
              }}
              placeholder="Add a note for the applicant…"
            />
          </div>
        </div>
        <div className={t.modalFoot}>
          <button
            className={`${t.btn} ${t.btnOutline}`}
            onClick={() => onAction("Needs More Information", note)}
          >
            <Info size={14} /> Request Info
          </button>
          <button
            className={`${t.btn} ${t.btnDanger}`}
            onClick={() => onAction("Rejected", note)}
          >
            <XCircle size={14} /> Reject
          </button>
          <button
            className={`${t.btn} ${t.btnPrimary}`}
            style={{ background: "#16a34a" }}
            onClick={() => onAction("Approved", note)}
          >
            <CheckCircle size={14} /> Approve
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminVendorApplicationsPage() {
  const [apps, setApps] = useState(SEED);
  const [search, setSearch] = useState("");
  const [sf, setSf] = useState("All");
  const [active, setActive] = useState(null);

  useEffect(() => {
    // TODO: wire vendor applications to real API — Phase X
  }, []);

  const filtered = apps.filter(
    (a) =>
      (a.applicant.toLowerCase().includes(search.toLowerCase()) ||
        a.brand.toLowerCase().includes(search.toLowerCase())) &&
      (sf === "All" || a.status === sf),
  );

  const handleAction = (id, status, note) => {
    setApps((p) => p.map((a) => (a.id === id ? { ...a, status, note } : a)));
    setActive(null);
  };

  const stats = {
    total: apps.length,
    pending: apps.filter((a) => a.status === "Pending").length,
    approved: apps.filter((a) => a.status === "Approved").length,
    rejected: apps.filter((a) => a.status === "Rejected").length,
  };

  return (
    <AdminLayout
      pageTitle="Vendor Applications"
      pageSubtitle="Review and manage vendor applications submitted by customers."
      breadcrumb="Vendor Applications"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 14,
          marginBottom: 20,
        }}
      >
        {[
          { label: "Total", val: stats.total, color: "#3a302b", bg: "#f7f3ed" },
          {
            label: "Pending",
            val: stats.pending,
            color: "#ca8a04",
            bg: "#fef9c3",
          },
          {
            label: "Approved",
            val: stats.approved,
            color: "#16a34a",
            bg: "#dcfce7",
          },
          {
            label: "Rejected",
            val: stats.rejected,
            color: "#dc2626",
            bg: "#fee2e2",
          },
        ].map((s) => (
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
              placeholder="Search applicant or brand…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className={t.filterSelect}
            value={sf}
            onChange={(e) => setSf(e.target.value)}
          >
            <option>All</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
            <option>Needs More Information</option>
          </select>
        </div>
        <span className={t.pageInfo}>{filtered.length} applications</span>
      </div>
      <div className={t.tableCard}>
        <div className={t.tableWrap}>
          <table className={t.table}>
            <thead>
              <tr>
                <th>Brand</th>
                <th>Applicant</th>
                <th>Category</th>
                <th>Email</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className={t.emptyState}>
                      <div className={t.emptyIcon}>
                        <Store size={24} />
                      </div>
                      <h3 className={t.emptyTitle}>No applications found</h3>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div className={t.avatarCell}>
                        <img
                          src={a.logo}
                          alt="logo"
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            objectFit: "cover",
                            border: "1px solid var(--adm-border)",
                            flexShrink: 0,
                          }}
                        />
                        <div>
                          <span className={t.avatarName}>{a.brand}</span>
                          <span className={t.avatarSub}>
                            {a.docs.length} doc{a.docs.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{a.applicant}</td>
                    <td
                      style={{ fontSize: 12, color: "var(--adm-text-muted)" }}
                    >
                      {a.category}
                    </td>
                    <td
                      style={{ fontSize: 12, color: "var(--adm-text-muted)" }}
                    >
                      {a.email}
                    </td>
                    <td
                      style={{ fontSize: 12, color: "var(--adm-text-muted)" }}
                    >
                      {a.submitted}
                    </td>
                    <td>
                      <StatusBadge status={a.status} />
                    </td>
                    <td>
                      <button
                        className={`${t.actionBtn} ${t.approve}`}
                        title="Review"
                        onClick={() => setActive(a)}
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className={t.pagination}>
          <span className={t.pageInfo}>{filtered.length} applications</span>
        </div>
      </div>
      {active && (
        <AppModal
          app={active}
          onClose={() => setActive(null)}
          onAction={(status, note) => handleAction(active.id, status, note)}
        />
      )}
    </AdminLayout>
  );
}
