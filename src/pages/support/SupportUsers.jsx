import { useState } from "react";
import { Search, Eye, X, Ticket } from "lucide-react";
import SupportLayout from "../../components/support/SupportLayout";
import p from "../../styles/SupportPage.module.css";

const USERS = [
  { id: 1, name: "Sara Al-Rashid", role: "Customer", email: "sara@example.com",      tickets: 7,  open: 2, joined: "Jan 12, 2026" },
  { id: 2, name: "Urban Threads",  role: "Vendor",   email: "team@urbanthreads.ae",   tickets: 12, open: 1, joined: "Mar 3, 2025" },
  { id: 3, name: "Omar Ali",       role: "Customer", email: "omar.ali@gmail.com",     tickets: 3,  open: 1, joined: "Feb 28, 2026" },
  { id: 4, name: "Noor Fashion",   role: "Vendor",   email: "hello@noorfashion.com",  tickets: 5,  open: 0, joined: "Nov 15, 2025" },
  { id: 5, name: "Layla Hassan",   role: "Customer", email: "layla.h@gmail.com",      tickets: 9,  open: 1, joined: "Dec 1, 2025" },
  { id: 6, name: "Desert Rose",    role: "Vendor",   email: "contact@desertrose.ae",  tickets: 4,  open: 1, joined: "Feb 10, 2026" },
  { id: 7, name: "Dina Mansour",   role: "Customer", email: "dina.m88@yahoo.com",     tickets: 2,  open: 0, joined: "Apr 5, 2026" },
  { id: 8, name: "Ali Hamdan",     role: "Customer", email: "a.hamdan@outlook.com",   tickets: 1,  open: 0, joined: "Apr 14, 2026" },
];

const USER_TICKETS = {
  1: [
    { id: "TKT-1089", subject: "Payment failed at checkout",   status: "Open",     priority: "High",   updated: "2m ago" },
    { id: "TKT-1045", subject: "Wrong product delivered",       status: "Resolved", priority: "Medium", updated: "2d ago" },
  ],
  2: [
    { id: "TKT-1088", subject: "VTON quota exceeded",          status: "Progress", priority: "Medium", updated: "15m ago" },
    { id: "TKT-1060", subject: "Commission not showing",       status: "Resolved", priority: "Low",    updated: "1w ago"  },
  ],
};

const STATUS_MAP   = { Open: "bOpen", Progress: "bProgress", Resolved: "bResolved", Closed: "bClosed" };
const PRIORITY_MAP = { Urgent: "pUrgent", High: "pHigh", Medium: "pMed", Low: "pLow" };
const ROLE_MAP     = { Customer: "rCustomer", Vendor: "rVendor" };

export default function SupportUsers() {
  const [search, setSearch] = useState("");
  const [role,   setRole]   = useState("All");
  const [detail, setDetail] = useState(null);

  const filtered = USERS.filter(u =>
    (role === "All" || u.role === role) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const user = USERS.find(u => u.id === detail);

  return (
    <SupportLayout
      pageTitle="Users"
      pageSubtitle="Browse and manage customers and vendor accounts."
      breadcrumb="Users"
    >
      <div className={p.panel}>
        {/* Filter bar */}
        <div className={p.filterBar}>
          <div className={p.searchWrap}>
            <Search size={14} className={p.searchIcon} />
            <input className={p.searchInput} placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className={p.filterSelect} value={role} onChange={e => setRole(e.target.value)}>
            <option value="All">All Roles</option>
            <option>Customer</option>
            <option>Vendor</option>
          </select>
          <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--sup-text-muted)" }}>{filtered.length} user{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        <div className={p.tableWrap}>
          <table className={p.table}>
            <thead>
              <tr>
                <th>User</th><th>Email</th><th>Role</th><th>Total Tickets</th><th>Open</th><th>Member Since</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}><div className={p.emptyState}><p className={p.emptyTitle}>No users found</p></div></td></tr>
              ) : filtered.map(u => (
                <tr key={u.id} className={p.clickable} onClick={() => setDetail(u.id)}>
                  <td>
                    <div className={p.avatarCell}>
                      <div className={p.avatar}>{u.name.slice(0, 2).toUpperCase()}</div>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ color: "var(--sup-text-muted)", fontSize: 13 }}>{u.email}</td>
                  <td><span className={`${p.badge} ${p[ROLE_MAP[u.role]]}`}>{u.role}</span></td>
                  <td style={{ fontWeight: 700, textAlign: "center" }}>{u.tickets}</td>
                  <td style={{ textAlign: "center" }}>
                    {u.open > 0
                      ? <span className={`${p.badge} ${p.bOpen}`}>{u.open}</span>
                      : <span style={{ color: "var(--sup-text-subtle)", fontSize: 12 }}>—</span>}
                  </td>
                  <td style={{ color: "var(--sup-text-muted)", fontSize: 12 }}>{u.joined}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <button className={`${p.btn} ${p.btnGhost} ${p.btnXs}`} onClick={() => setDetail(u.id)}><Eye size={13} /> View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User detail modal */}
      {detail && user && (
        <div className={p.modalBackdrop} onClick={e => e.target === e.currentTarget && setDetail(null)}>
          <div className={p.modal} style={{ maxWidth: 600 }}>
            <div className={p.modalHead}>
              <div className={p.avatarCell}>
                <div className={p.avatar} style={{ width: 44, height: 44, fontSize: 16 }}>{user.name.slice(0, 2).toUpperCase()}</div>
                <div>
                  <h3 className={p.modalTitle} style={{ marginBottom: 4 }}>{user.name}</h3>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className={`${p.badge} ${p[ROLE_MAP[user.role]]}`}>{user.role}</span>
                    <span style={{ fontSize: 12, color: "var(--sup-text-muted)" }}>{user.email}</span>
                  </div>
                </div>
              </div>
              <button className={`${p.btn} ${p.btnGhost} ${p.btnIcon}`} onClick={() => setDetail(null)}><X size={16} /></button>
            </div>
            <div className={p.modalBody}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 8 }}>
                {[
                  ["Total Tickets", user.tickets],
                  ["Open",          user.open],
                  ["Member Since",  user.joined],
                ].map(([l, v]) => (
                  <div key={l} style={{ background: "var(--sup-bg)", borderRadius: 10, padding: "12px 14px" }}>
                    <p style={{ margin: "0 0 4px", fontSize: 11, color: "var(--sup-text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</p>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: 18, color: "var(--sup-text)" }}>{v}</p>
                  </div>
                ))}
              </div>
              <h4 style={{ margin: "8px 0", fontSize: 13, fontWeight: 700, color: "var(--sup-text)" }}><Ticket size={13} style={{ verticalAlign: "middle" }} /> Recent Tickets</h4>
              <div className={p.tableWrap} style={{ borderRadius: 10, border: "1px solid var(--sup-border)", overflow: "hidden" }}>
                <table className={p.table} style={{ fontSize: 12 }}>
                  <thead><tr><th>ID</th><th>Subject</th><th>Status</th><th>Priority</th><th>Updated</th></tr></thead>
                  <tbody>
                    {(USER_TICKETS[user.id] || []).map(t => (
                      <tr key={t.id}>
                        <td style={{ fontWeight: 700, color: "var(--sup-accent)" }}>{t.id}</td>
                        <td>{t.subject}</td>
                        <td><span className={`${p.badge} ${p[STATUS_MAP[t.status]]}`}>{t.status}</span></td>
                        <td><span className={`${p.badge} ${p[PRIORITY_MAP[t.priority]]}`}>{t.priority}</span></td>
                        <td style={{ color: "var(--sup-text-subtle)" }}>{t.updated}</td>
                      </tr>
                    ))}
                    {!(USER_TICKETS[user.id]?.length) && (
                      <tr><td colSpan={5} style={{ textAlign: "center", padding: 20, color: "var(--sup-text-muted)" }}>No tickets found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className={p.modalFoot}>
              <button className={`${p.btn} ${p.btnOutline}`} onClick={() => setDetail(null)}>Close</button>
              <button className={`${p.btn} ${p.btnPrimary}`}>Create Ticket for User</button>
            </div>
          </div>
        </div>
      )}
    </SupportLayout>
  );
}
