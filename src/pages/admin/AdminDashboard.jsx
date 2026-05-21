import { useEffect, useState } from "react";
import {
  Users,
  ShoppingCart,
  Package,
  TrendingUp,
  Activity,
  TicketCheck,
  Store,
  UserCheck,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import apiClient from "../../utils/apiClient";
import { formatPrice } from "../../utils/formatPrice";
import t from "../../styles/AdminTable.module.css";

const ORDER_STATUS_CLASS = {
  pending_payment: t.badgePending,
  confirmed: t.badgeProcessing,
  processing: t.badgeProcessing,
  shipped: t.badgeShipped,
  completed: t.badgeActive,
  canceled: t.badgeCancelled,
  refunded: t.badgeSuspended,
  return_requested: t.badgePending,
  returned: t.badgeSuspended,
};

function StatusBadge({ status }) {
  const cls = ORDER_STATUS_CLASS[status] || t.badgePending;
  return (
    <span className={`${t.badge} ${cls}`}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}

function fmt(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const KPI_CARDS = (s) => [
  { label: "Total Users", value: s.totalUsers?.toLocaleString(), icon: Users },
  { label: "Customers", value: s.totalCustomers?.toLocaleString(), icon: UserCheck },
  { label: "Vendors", value: s.totalVendors?.toLocaleString(), icon: Store },
  { label: "Total Orders", value: s.totalOrders?.toLocaleString(), icon: ShoppingCart },
  { label: "Total Revenue", value: formatPrice(s.totalRevenue ?? 0), icon: TrendingUp },
  { label: "Active Products", value: s.activeProducts?.toLocaleString(), icon: Package },
  { label: "Open Tickets", value: s.openTickets?.toLocaleString(), icon: TicketCheck },
];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient
      .get("/admin/stats")
      .then((r) => setStats(r.data))
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  const kpiCards = stats ? KPI_CARDS(stats) : [];
  const recentOrders = stats?.recentOrders ?? [];
  const topProducts = stats?.topProducts ?? [];

  return (
    <AdminLayout
      pageTitle="Administrative Overview"
      pageSubtitle="Monitor global platform performance and recent system events."
      breadcrumb="Dashboard"
    >
      {/* KPI Cards */}
      {loading ? (
        <div className={t.statsGrid}>
          {Array.from({ length: 7 }).map((_, i) => (
            <span key={i} className={`${t.skeleton} ${t.skeletonStat}`} />
          ))}
        </div>
      ) : error ? (
        <div className={t.emptyState}>
          <div className={t.emptyIcon}><Activity size={24} /></div>
          <h3 className={t.emptyTitle}>Could not load stats</h3>
          <p className={t.emptyText}>{error}</p>
        </div>
      ) : (
        <div className={t.statsGrid}>
          {kpiCards.map(({ label, value, icon: Icon }) => (
            <div key={label} className={t.statCard}>
              <div className={t.statTop}>
                <p className={t.statLabel}>{label}</p>
                <div className={t.statIcon}>
                  <Icon size={20} />
                </div>
              </div>
              <div className={t.statValue}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom row: Recent Orders + Top Products */}
      <div className={t.chartGrid2}>
        {/* Recent Orders */}
        <div className={t.chartCard}>
          <div className={t.chartHead}>
            <div>
              <h3 className={t.chartTitle}>Recent Orders</h3>
              <p className={t.chartSubtitle}>Last 5 platform orders</p>
            </div>
          </div>
          {loading ? (
            <div>
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`${t.skeleton} ${t.skeletonRow}`} />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className={t.emptyState}>
              <div className={t.emptyIcon}><ShoppingCart size={24} /></div>
              <h3 className={t.emptyTitle}>No orders yet</h3>
            </div>
          ) : (
            <div className={t.tableWrap}>
              <table className={t.table}>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td>{o.orderNumber}</td>
                      <td>{o.customerEmail}</td>
                      <td>{formatPrice(o.total)}</td>
                      <td><StatusBadge status={o.status} /></td>
                      <td>{fmt(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className={t.chartCard}>
          <div className={t.chartHead}>
            <div>
              <h3 className={t.chartTitle}>Top Products</h3>
              <p className={t.chartSubtitle}>By units sold</p>
            </div>
          </div>
          {loading ? (
            <div>
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`${t.skeleton} ${t.skeletonRow}`} />
              ))}
            </div>
          ) : topProducts.length === 0 ? (
            <div className={t.emptyState}>
              <div className={t.emptyIcon}><Package size={24} /></div>
              <h3 className={t.emptyTitle}>No products yet</h3>
            </div>
          ) : (
            <div className={t.tableWrap}>
              <table className={t.table}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Sold</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <span className={t.avatarName}>{p.name}</span>
                        <span className={t.avatarSub}>{p.vendorName}</span>
                      </td>
                      <td>{p.totalSold}</td>
                      <td>{formatPrice(p.basePrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
