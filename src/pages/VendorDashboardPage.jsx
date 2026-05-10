import { useEffect, useState } from "react";
import { Package, ArrowRight, ArrowUpRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import VendorLayout from "../components/vendor/VendorLayout";
import p from "../styles/VendorPage.module.css";

export default function VendorDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    // TODO: wire to real API endpoint — Phase X
    setStats([]);
    setRecentOrders([]);
    setLoading(false);
  }, []);

  const addBtn = (
    <Link to="/vendor/products" className={`${p.btn} ${p.btnPrimary}`}>
      <Package size={15} /> Add Product
    </Link>
  );

  return (
    <VendorLayout
      pageTitle="Dashboard"
      pageSubtitle="Welcome back! Here's your store overview."
      headerAction={addBtn}
    >
      {/* KPI Cards */}
      {loading ? (
        <div className={p.statsGrid}>
          {[1, 2, 3, 4].map((i) => (
            <span key={i} className={`${p.skeleton} ${p.skeletonStat}`} />
          ))}
        </div>
      ) : stats.length === 0 ? (
        <div className={p.emptyState}>
          <div className={p.emptyIcon}>
            <Package size={24} />
          </div>
          <h3 className={p.emptyTitle}>No data yet.</h3>
          <p className={p.emptyText}>
            Vendor stats will appear once store data is connected.
          </p>
        </div>
      ) : (
        <div className={p.statsGrid}>
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className={p.statCard}
                style={{ "--stat-color": s.color, "--stat-bg": s.bg }}
              >
                <div className={p.statTop}>
                  <div>
                    <p className={p.statLabel}>{s.label}</p>
                    <p className={p.statValue}>{s.value}</p>
                  </div>
                  <div className={p.statIcon}>
                    <Icon size={20} />
                  </div>
                </div>
                <div className={p.statFoot}>
                  <span className={`${p.statChange} ${s.up ? p.up : p.down}`}>
                    <ArrowUpRight size={12} />
                    {s.change}
                  </span>
                  <span className={p.statMeta}>vs last month</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Charts */}
      <div className={p.chartsGrid2}>
        <div className={p.chartCard}>
          <div className={p.chartHead}>
            <div>
              <h3 className={p.chartTitle}>Revenue Trend</h3>
              <p className={p.chartSub}>Last 7 months · EGP</p>
            </div>
          </div>
          <div className={p.emptyState}>
            <div className={p.emptyIcon}>
              <Package size={24} />
            </div>
            <h3 className={p.emptyTitle}>No data yet.</h3>
            <p className={p.emptyText}>
              Revenue trends will appear once store data is connected.
            </p>
          </div>
        </div>
        <div className={p.chartCard}>
          <div className={p.chartHead}>
            <h3 className={p.chartTitle}>Monthly Orders</h3>
          </div>
          <div className={p.emptyState}>
            <div className={p.emptyIcon}>
              <Package size={24} />
            </div>
            <h3 className={p.emptyTitle}>No data yet.</h3>
            <p className={p.emptyText}>
              Monthly orders will appear once store data is connected.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className={p.chartCard}>
        <div className={p.chartHead}>
          <h3 className={p.chartTitle}>Recent Orders</h3>
          <Link
            to="/vendor/orders"
            className={`${p.btn} ${p.btnOutline} ${p.btnSm}`}
          >
            View All <ArrowRight size={13} />
          </Link>
        </div>
        <div className={p.tableWrap}>
          <table className={p.table}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className={p.emptyState}>
                      <div className={p.emptyIcon}>
                        <Package size={24} />
                      </div>
                      <h3 className={p.emptyTitle}>No data yet.</h3>
                      <p className={p.emptyText}>
                        Recent orders will appear once store data is connected.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{o.customer}</td>
                    <td>{o.product}</td>
                    <td>{o.amount}</td>
                    <td>{o.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales Tip */}
      <div className={p.insightCallout}>
        <div className={p.insightCalloutIcon}>
          <Zap size={20} />
        </div>
        <div>
          <p className={p.insightCalloutTitle}>
            💡 Improve Your Sales Conversion
          </p>
          <p className={p.insightCalloutText}>
            High-quality product images and detailed descriptions can increase your conversion rate by up to 40%.
            Keep your inventory updated for the best results.
          </p>
        </div>
      </div>
    </VendorLayout>
  );
}
