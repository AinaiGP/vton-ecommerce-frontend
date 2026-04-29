import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Clock,
  Package,
  TrendingUp,
  Activity,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import t from "../../styles/AdminTable.module.css";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    // TODO: wire to real API endpoint — Phase X
    setStats(null);
    setActivity([]);
    setTopProducts([]);
    setLoading(false);
  }, []);

  return (
    <AdminLayout
      pageTitle="Administrative Overview"
      pageSubtitle="Monitor global platform performance and recent system events."
      breadcrumb="Dashboard"
    >
      {/* KPI Cards */}
      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 20,
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <span key={i} className={`${t.skeleton} ${t.skeletonStat}`} />
          ))}
        </div>
      ) : (
        <div className={t.emptyState}>
          <div className={t.emptyIcon}>
            <Activity size={24} />
          </div>
          <h3 className={t.emptyTitle}>No data yet.</h3>
          <p className={t.emptyText}>
            Admin KPIs will appear once platform data is connected.
          </p>
        </div>
      )}

      {/* Charts row */}
      <div className={t.chartGrid2}>
        <div className={t.chartCard}>
          <div className={t.chartHead}>
            <div>
              <h3 className={t.chartTitle}>Revenue Over Time</h3>
              <p className={t.chartSubtitle}>Last 7 months · EGP</p>
            </div>
          </div>
          <div className={t.emptyState}>
            <div className={t.emptyIcon}>
              <TrendingUp size={24} />
            </div>
            <h3 className={t.emptyTitle}>No data yet.</h3>
            <p className={t.emptyText}>
              Charts will appear once platform data is connected.
            </p>
          </div>
        </div>

        <div className={t.chartCard}>
          <div className={t.chartHead}>
            <div>
              <h3 className={t.chartTitle}>Orders Distribution</h3>
              <p className={t.chartSubtitle}>
                By status · All time · 3,284 total
              </p>
            </div>
          </div>
          <div className={t.emptyState}>
            <div className={t.emptyIcon}>
              <Package size={24} />
            </div>
            <h3 className={t.emptyTitle}>No data yet.</h3>
            <p className={t.emptyText}>
              Order distribution will appear once platform data is connected.
            </p>
          </div>
        </div>
      </div>

      {/* Orders Bar */}
      <div className={t.chartCard}>
        <div className={t.chartHead}>
          <div>
            <h3 className={t.chartTitle}>Monthly Orders Volume</h3>
            <p className={t.chartSubtitle}>Last 7 months</p>
          </div>
        </div>
        <div className={t.emptyState}>
          <div className={t.emptyIcon}>
            <ShoppingCart size={24} />
          </div>
          <h3 className={t.emptyTitle}>No data yet.</h3>
          <p className={t.emptyText}>
            Monthly order volume will appear once platform data is connected.
          </p>
        </div>
      </div>

      {/* Bottom row: Activity + Top Products */}
      <div className={t.chartGrid2}>
        {/* Activity feed */}
        <div className={t.chartCard}>
          <div className={t.chartHead}>
            <h3 className={t.chartTitle}>Recent Activity</h3>
          </div>
          <div className={t.emptyState}>
            <div className={t.emptyIcon}>
              <Clock size={24} />
            </div>
            <h3 className={t.emptyTitle}>No data yet.</h3>
            <p className={t.emptyText}>
              Recent activity will appear once platform data is connected.
            </p>
          </div>
        </div>

        {/* Top products */}
        <div className={t.chartCard}>
          <div className={t.chartHead}>
            <h3 className={t.chartTitle}>Top Products</h3>
          </div>
          <div className={t.tableWrap}>
            <table className={t.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Sales</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={3}>
                      <div className={t.emptyState}>
                        <div className={t.emptyIcon}>
                          <Package size={24} />
                        </div>
                        <h3 className={t.emptyTitle}>No data yet.</h3>
                        <p className={t.emptyText}>
                          Top products will appear once platform data is
                          connected.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  topProducts.map((p, i) => (
                    <tr key={i}>
                      <td>
                        <span
                          style={{
                            fontWeight: 600,
                            color: "var(--adm-text)",
                            display: "block",
                            fontSize: "13px",
                          }}
                        >
                          {p.name}
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            color: "var(--adm-text-subtle)",
                          }}
                        >
                          {p.vendor}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{p.sales}</td>
                      <td style={{ fontWeight: 700, color: "#16a34a" }}>
                        {p.revenue}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
