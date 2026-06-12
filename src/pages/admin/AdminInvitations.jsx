import { useState } from "react";
import { Mail, Send, Clock, CheckCircle, XCircle, Search, X } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import apiClient from "../../utils/apiClient";
import t from "../../styles/AdminTable.module.css";

function fmt(date) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function InviteModal({ onSave, onClose }) {
  const [role, setRole] = useState("vendor");
  const [email, setEmail] = useState("");
  const [brandName, setBrandName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (role === "admin") {
        await apiClient.post("/admin/invite", { email });
        onSave({ email, role: "Admin", status: "Sent", sentAt: new Date().toISOString() });
      } else if (role === "vendor") {
        await apiClient.post("/admin/vendors/invite", { email, brandName });
        onSave({ email, role: "Vendor", status: "Sent", sentAt: new Date().toISOString() });
      } else {
        await apiClient.post("/admin/staff", {
          email,
          firstName,
          lastName,
          password,
          role: "technical_support",
        });
        onSave({ email, role: "Tech Support", status: "Created", sentAt: new Date().toISOString() });
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send invitation.");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    email.trim() &&
    (role !== "vendor" || brandName.trim()) &&
    (role !== "technical_support" || (firstName.trim() && lastName.trim() && password.trim()));

  return (
    <div className={t.modalBackdrop} onClick={onClose}>
      <div className={t.modal} onClick={(e) => e.stopPropagation()}>
        <div className={t.modalHead}>
          <h2 className={t.modalTitle}>Send Invitation</h2>
          <button className={t.modalClose} onClick={onClose}><X size={17} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={t.modalBody}>
            {error && (
              <p style={{ color: "#dc2626", margin: 0, fontSize: 13 }}>{error}</p>
            )}
            <div className={t.formGroup}>
              <label className={t.label}>Invite As *</label>
              <select
                className={t.select}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="admin">Admin</option>
                <option value="vendor">Vendor</option>
                <option value="technical_support">Technical Support</option>
              </select>
            </div>
            <div className={t.formGroup}>
              <label className={t.label}>Email Address *</label>
              <input
                className={t.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
              />
            </div>

            {role === "vendor" && (
              <div className={t.formGroup}>
                <label className={t.label}>Brand Name *</label>
                <input
                  className={t.input}
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Nova Threads"
                  required
                />
              </div>
            )}

            {role === "technical_support" && (
              <>
                <div className={t.formRow}>
                  <div className={t.formGroup}>
                    <label className={t.label}>First Name *</label>
                    <input className={t.input} value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" required />
                  </div>
                  <div className={t.formGroup}>
                    <label className={t.label}>Last Name *</label>
                    <input className={t.input} value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" required />
                  </div>
                </div>
                <div className={t.formGroup}>
                  <label className={t.label}>Temporary Password *</label>
                  <input className={t.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Set initial password" required />
                </div>
              </>
            )}

            {role !== "technical_support" && (
              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 14px" }}>
                <p style={{ margin: 0, fontSize: 12.5, color: "#1d4ed8", fontWeight: 600 }}>
                  An invitation email with a setup link will be sent to the address above.
                </p>
              </div>
            )}
          </div>
          <div className={t.modalFoot}>
            <button type="button" className={`${t.btn} ${t.btnOutline}`} onClick={onClose}>Cancel</button>
            <button type="submit" className={`${t.btn} ${t.btnPrimary}`} disabled={loading || !canSubmit}>
              <Send size={14} /> {loading ? "Sending…" : role === "technical_support" ? "Create Account" : "Send Invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminInvitationsPage() {
  const [invites, setInvites] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showInvite, setShowInvite] = useState(false);

  const filtered = invites.filter(
    (i) =>
      i.email.toLowerCase().includes(search.toLowerCase()) &&
      (roleFilter === "All" || i.role === roleFilter),
  );

  const addInvite = (d) => {
    setInvites((prev) => [d, ...prev]);
    setShowInvite(false);
  };

  const STATUS_ICON = { Sent: Clock, Created: CheckCircle };
  const STATUS_CLS = { Sent: t.badgePending, Created: t.badgeActive };

  return (
    <AdminLayout
      pageTitle="Email Invitations"
      pageSubtitle="Invite admins, vendors, and technical support staff to join AINAI."
      breadcrumb="Invitations"
    >
      {/* Toolbar */}
      <div className={t.toolbar}>
        <div className={t.toolbarLeft}>
          <div className={t.searchBox}>
            <Search size={14} className={t.searchIcon} />
            <input
              className={t.searchInput}
              placeholder="Search by email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className={t.filterSelect}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Vendor">Vendor</option>
            <option value="Tech Support">Tech Support</option>
          </select>
        </div>
        <button className={`${t.btn} ${t.btnPrimary}`} onClick={() => setShowInvite(true)}>
          <Send size={14} /> Send Invitation
        </button>
      </div>

      {/* Table */}
      <div className={t.tableCard}>
        <div className={t.tableWrap}>
          <table className={t.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Email</th>
                <th>Invited As</th>
                <th>Status</th>
                <th>Sent At</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className={t.emptyState}>
                      <div className={t.emptyIcon}><Mail size={24} /></div>
                      <h3 className={t.emptyTitle}>No invitations sent yet</h3>
                      <p className={t.emptyText}>Use the button above to invite admins, vendors, or support staff.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((inv, i) => {
                  const Icon = STATUS_ICON[inv.status] || Clock;
                  const cls = STATUS_CLS[inv.status] || t.badgeDraft;
                  return (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td><span className={t.avatarName}>{inv.email}</span></td>
                      <td><span className={`${t.badge} ${t.badgeProcessing}`}>{inv.role}</span></td>
                      <td>
                        <span className={`${t.badge} ${cls}`}>
                          <Icon size={11} /> {inv.status}
                        </span>
                      </td>
                      <td>{fmt(inv.sentAt)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className={t.pagination}>
          <span className={t.pageInfo}>{filtered.length} invitation{filtered.length !== 1 ? "s" : ""} this session</span>
        </div>
      </div>

      {showInvite && <InviteModal onSave={addInvite} onClose={() => setShowInvite(false)} />}
    </AdminLayout>
  );
}
