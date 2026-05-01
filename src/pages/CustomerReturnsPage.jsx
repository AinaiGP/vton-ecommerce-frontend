import { useEffect, useState } from "react";
import {
  Search,
  Package,
  ChevronRight,
  RotateCcw,
  Plus,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import apiClient from "../utils/apiClient";
import styles from "../styles/CustomerTickets.module.css";

const STATUS_CFG = {
  OPEN: { color: "#ef4444", bg: "#fee2e2", label: "Pending" },
  IN_PROGRESS: { color: "#3b82f6", bg: "#eff6ff", label: "Under Review" },
  WAITING_FOR_CUSTOMER: { color: "#8b5cf6", bg: "#f5f3ff", label: "Awaiting Input" },
  SOLVED: { color: "#16a34a", bg: "#dcfce7", label: "Approved" },
  CLOSED: { color: "#94a3b8", bg: "#f1f5f9", label: "Closed" },
  ESCALATED_TO_ADMIN: { color: "#7c3aed", bg: "#f5f3ff", label: "Escalated" },
};

function StatusBadge({ status }) {
  const s = status?.toUpperCase();
  const c = STATUS_CFG[s] || { color: "#94a3b8", bg: "#f1f5f9", label: status };
  return (
    <span className={styles.badge} style={{ background: c.bg, color: c.color }}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: c.color,
          display: "inline-block",
        }}
      />
      {c.label}
    </span>
  );
}

export default function CustomerReturnsPage() {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/customers/support/tickets");
      // Filter for Return/Refund category
      const filtered = res.data.items?.filter(t => t.category === "Return / Refund") || [];
      setReturns(filtered);
    } catch (err) {
      console.error("Failed to fetch returns", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = returns.filter((r) =>
    r.subject.toLowerCase().includes(search.toLowerCase()) ||
    r.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--ivory)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />
      <div className={styles.pageContent} style={{ flex: 1, padding: '40px 5%' }}>
        <div className={styles.pageHead} style={{ marginBottom: 32 }}>
          <div>
            <h1 className={styles.pageTitle}>Returns & Refunds</h1>
            <p className={styles.pageSubtitle}>
              Track your return requests and message vendors about refunds.
            </p>
          </div>
          <Link
            to="/customers/orders"
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            <Plus size={15} /> New Return Request
          </Link>
        </div>

        <div className={styles.toolbar} style={{ marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center' }}>
          <div className={styles.searchBox} style={{ flex: 1, maxWidth: 400 }}>
            <Search size={14} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Search by ID or product…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className={styles.pageInfo}>{filtered.length} requests</span>
        </div>

        {loading ? (
          <div style={{ padding: 80, textAlign: 'center' }}>
            <Loader2 size={32} className={styles.spin} style={{ margin: '0 auto', color: 'var(--charcoal-muted)' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <Package size={36} style={{ color: "var(--charcoal-muted)" }} />
            <h3>No return requests</h3>
            <p>You haven't submitted any return requests yet.</p>
            <Link
              to="/customers/orders"
              className={`${styles.btn} ${styles.btnPrimary}`}
              style={{ marginTop: 16 }}
            >
              Start a Return
            </Link>
          </div>
        ) : (
          <div className={styles.ticketList}>
            {filtered.map((ret) => (
              <article
                key={ret.id}
                className={styles.ticketCard}
                onClick={() => navigate(`/customers/support`, { state: { selectedId: ret.id } })}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.cardMain}>
                  <div className={styles.cardLeft}>
                    <div className={styles.cardTopRow}>
                      <span className={styles.ticketId}>#{ret.id.slice(0, 8)}</span>
                      <span className={styles.catTag}>{ret.category}</span>
                    </div>
                    <h3 className={styles.ticketSubject}>{ret.subject}</h3>
                    <div className={styles.ticketMeta}>
                      <span>
                        <RotateCcw size={11} /> Created {new Date(ret.createdAt).toLocaleDateString()}
                      </span>
                      <span>Priority: {ret.priority}</span>
                    </div>
                  </div>
                  <div className={styles.cardRight}>
                    <StatusBadge status={ret.status} />
                    <button className={styles.viewBtn}>
                      View Details <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
