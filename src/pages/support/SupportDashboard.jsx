import { useEffect, useState } from "react";
import {
  Inbox,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Ticket,
  Zap,
  Store,
  ExternalLink,
  ArrowLeft,
  Star,
  Package,
  MapPin,
  Phone,
  Clock,
  X,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import SupportLayout from "../../components/support/SupportLayout";
import p from "../../styles/SupportPage.module.css";

const STATUS_MAP = {
  Open: "bOpen",
  Progress: "bProgress",
  Resolved: "bResolved",
  Closed: "bClosed",
};
const PRIORITY_MAP = {
  Urgent: "pUrgent",
  High: "pHigh",
  Medium: "pMed",
  Low: "pLow",
};

export default function SupportDashboard() {
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [stores, setStores] = useState([]);

  useEffect(() => {
    // TODO: wire to real API endpoint — Phase X
    setRecentTickets([]);
    setStores([]);
    setLoading(false);
  }, []);

  return (
    <SupportLayout>
      <div className={p.dashboardContainer}>
        {/* ── Recent Tickets Section ── */}
        <div className={p.panel} style={{ marginBottom: "2rem" }}>
          <div className={p.panelHead}>
            <div>
              <h3 className={p.panelTitle}>Recent Tickets</h3>
              <p className={p.panelSubtitle}>
                Latest support requests from users
              </p>
            </div>
            <Ticket size={16} style={{ color: "#8b4852" }} />
          </div>
          <div className={p.tableWrap}>
            <table className={p.table}>
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>User</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>SLA</th>
                  <th>Waiting</th>
                  <th>Store</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j}>
                          <div
                            className={p.skel}
                            style={{ height: 14, borderRadius: 6 }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : recentTickets.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className={p.emptyState}>
                        <div className={p.emptyIcon}>
                          <Ticket size={22} />
                        </div>
                        <h3 className={p.emptyTitle}>No data yet.</h3>
                        <p className={p.emptyText}>
                          Recent tickets will appear once support data is
                          connected.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentTickets.map((ticket) => {
                    const linkedStore = ticket.storeId
                      ? stores.find((s) => s.id === ticket.storeId)
                      : null;
                    return (
                      <tr key={ticket.id} className={p.clickable}>
                        <td
                          style={{
                            fontWeight: 700,
                            color: "var(--sup-accent)",
                          }}
                        >
                          {ticket.id}
                        </td>
                        <td>
                          <div className={p.avatarCell}>
                            <div className={p.avatar}>
                              {ticket.user.slice(0, 2).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 600, fontSize: 13 }}>
                              {ticket.user}
                            </span>
                          </div>
                        </td>
                        <td
                          style={{
                            maxWidth: 220,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {ticket.subject}
                        </td>
                        <td>
                          <span
                            className={`${p.badge} ${p[STATUS_MAP[ticket.status]]}`}
                          >
                            {ticket.status}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`${p.badge} ${p[PRIORITY_MAP[ticket.priority]]}`}
                          >
                            {ticket.priority}
                          </span>
                        </td>
                        <td>
                          <span className={`${p.badge} ${p[ticket.sla]}`}>
                            {ticket.sla === "slaOk"
                              ? "On Track"
                              : ticket.sla === "slaWarn"
                                ? "Warning"
                                : "Breached"}
                          </span>
                        </td>
                        <td
                          style={{
                            color: "var(--sup-text-muted)",
                            fontSize: 12,
                          }}
                        >
                          {ticket.wait}
                        </td>
                        <td>
                          {linkedStore ? (
                            <button
                              onClick={() => setSelectedStore(linkedStore)}
                              className={`${p.badge} ${p.bProgress}`}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                cursor: "pointer",
                                border: "none",
                              }}
                            >
                              <Store size={11} /> View Store
                            </button>
                          ) : (
                            <span
                              style={{
                                color: "var(--sup-text-muted)",
                                fontSize: 12,
                              }}
                            >
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Vendor Stores Section ── */}
        <div style={{ position: "relative" }}>
          <div className={p.panel}>
            <div className={p.panelHead}>
              <div>
                <h3 className={p.panelTitle}>Vendor Stores</h3>
                <p className={p.panelSubtitle}>
                  Browse and inspect registered vendor stores
                </p>
              </div>
              <Store size={16} style={{ color: "#8b4852" }} />
            </div>
            <div className={p.tableWrap}>
              <table className={p.table}>
                <thead>
                  <tr>
                    <th>Store</th>
                    <th>Category</th>
                    <th>Products</th>
                    <th>Orders</th>
                    <th>Rating</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <div className={p.emptyState}>
                          <div className={p.emptyIcon}>
                            <Store size={22} />
                          </div>
                          <h3 className={p.emptyTitle}>No stores found.</h3>
                          <p className={p.emptyText}>
                            Store records will appear here.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    stores.map((store) => (
                      <tr
                        key={store.id}
                        className={p.clickable}
                        style={
                          selectedStore?.id === store.id
                            ? { background: "rgba(139,72,82,0.06)" }
                            : {}
                        }
                      >
                        <td>
                          <div className={p.avatarCell}>
                            <div
                              className={p.avatar}
                              style={{
                                background:
                                  "linear-gradient(135deg,#8b4852,#d4af7a)",
                              }}
                            >
                              {store.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span
                                style={{
                                  fontWeight: 600,
                                  fontSize: 13,
                                  display: "block",
                                }}
                              >
                                {store.name}
                              </span>
                              <span
                                style={{
                                  fontSize: 11,
                                  color: "var(--sup-text-muted)",
                                }}
                              >
                                {store.owner}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: 13 }}>{store.category}</td>
                        <td>
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: 13,
                            }}
                          >
                            <Package
                              size={12}
                              style={{ color: "var(--sup-text-muted)" }}
                            />{" "}
                            {store.products}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, fontSize: 13 }}>
                          {store.orders}
                        </td>
                        <td>
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#b45309",
                            }}
                          >
                            <Star size={12} fill="#d4af7a" color="#d4af7a" />{" "}
                            {store.rating}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: 12,
                              color: "var(--sup-text-muted)",
                            }}
                          >
                            <MapPin size={11} /> {store.location}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`${p.badge} ${store.status === "Active" ? p.bResolved : p.pUrgent}`}
                          >
                            {store.status}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => setSelectedStore(store)}
                            className={`${p.btn} ${p.btnOutline} ${p.btnSm}`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <Eye size={12} /> View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Store Detail Slide-in Panel ── */}
          {selectedStore && (
            <div
              className={p.storePanel}
              style={{ animation: "slideInRight 0.3s ease-out" }}
            >
              <div className={p.storePanelHead}>
                <button
                  onClick={() => setSelectedStore(null)}
                  className={`${p.btn} ${p.btnOutline} ${p.btnSm}`}
                  style={{ gap: 6 }}
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  onClick={() => setSelectedStore(null)}
                  className={p.btnGhost}
                  style={{ width: 32, height: 32, padding: 0 }}
                >
                  <X size={16} />
                </button>
              </div>

              <div className={p.storePanelContent}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 14,
                      background:
                        "linear-gradient(135deg, var(--sup-accent), var(--sup-text-muted))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: 20,
                      fontWeight: 700,
                    }}
                  >
                    {selectedStore.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                      {selectedStore.name}
                    </h2>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: 13,
                        color: "var(--sup-text-muted)",
                      }}
                    >
                      {selectedStore.category} · Joined {selectedStore.joined}
                    </p>
                  </div>
                </div>

                <div className={p.storeKpiGrid}>
                  {[
                    {
                      label: "Products",
                      value: selectedStore.products,
                      icon: Package,
                      color: "#a85a66",
                    },
                    {
                      label: "Orders",
                      value: selectedStore.orders,
                      icon: Store,
                      color: "#d4af7a",
                    },
                    {
                      label: "Rating",
                      value: `${selectedStore.rating}/5`,
                      icon: Star,
                      color: "#c9a065",
                    },
                    {
                      label: "Revenue",
                      value: selectedStore.revenue,
                      icon: TrendingUp,
                      color: "#16a34a",
                    },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className={p.storeKpiCard}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 11,
                          color: "var(--sup-text-muted)",
                          textTransform: "uppercase",
                        }}
                      >
                        {label}
                      </p>
                      <p
                        style={{
                          margin: "5px 0 0",
                          fontSize: 15,
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Icon size={14} color={color} /> {value}
                      </p>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    marginTop: 24,
                  }}
                >
                  <Link
                    to="/vendor"
                    className={`${p.btn} ${p.btnPrimary}`}
                    style={{ textAlign: "center" }}
                  >
                    <ExternalLink size={14} /> Open Vendor Portal
                  </Link>
                  <Link
                    to="/support/tickets"
                    className={`${p.btn} ${p.btnOutline}`}
                    style={{ textAlign: "center" }}
                  >
                    <Ticket size={14} /> View Related Tickets
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
      `}</style>
    </SupportLayout>
  );
}
