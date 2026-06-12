import { useEffect, useState } from "react";
import { Download, FileText, FileSpreadsheet, TrendingUp } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import t from "../../styles/AdminTable.module.css";

export default function AdminReports() {
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    // TODO: wire to real API endpoint — Phase X
    setHasData(false);
  }, []);

  return (
    <AdminLayout
      pageTitle="Reports & Analytics"
      pageSubtitle="Platform-wide revenue, order trends, and performance insights."
      breadcrumb="Reports"
    >
      {/* Summary KPIs */}
      {!hasData && (
        <div className={t.emptyState}>
          <div className={t.emptyIcon}>
            <TrendingUp size={24} />
          </div>
          <h3 className={t.emptyTitle}>No data yet.</h3>
          <p className={t.emptyText}>
            Report metrics will appear once platform data is connected.
          </p>
        </div>
      )}

      {/* Revenue chart */}
      <div className={t.chartCard}>
        <div className={t.chartHead}>
          <div>
            <h3 className={t.chartTitle}>Revenue vs. Expenses</h3>
            <p className={t.chartSubtitle}>Last 7 months · EGP</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className={`${t.btn} ${t.btnOutline} ${t.btnSm}`}>
              <FileSpreadsheet size={14} /> CSV
            </button>
            <button className={`${t.btn} ${t.btnOutline} ${t.btnSm}`}>
              <FileText size={14} /> PDF
            </button>
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

      {/* Orders bar chart */}
      <div className={t.chartCard}>
        <div className={t.chartHead}>
          <div>
            <h3 className={t.chartTitle}>Monthly Orders Volume</h3>
            <p className={t.chartSubtitle}>Last 7 months</p>
          </div>
          <button className={`${t.btn} ${t.btnOutline} ${t.btnSm}`}>
            <Download size={14} /> Export
          </button>
        </div>
        <div className={t.emptyState}>
          <div className={t.emptyIcon}>
            <TrendingUp size={24} />
          </div>
          <h3 className={t.emptyTitle}>No data yet.</h3>
          <p className={t.emptyText}>
            Monthly orders will appear once platform data is connected.
          </p>
        </div>
      </div>

      {/* Two tables */}
      <div className={t.chartGrid2}>
        {/* Best-selling products */}
        <div className={t.chartCard}>
          <div className={t.chartHead}>
            <h3 className={t.chartTitle}>Best-Selling Products</h3>
            <button className={`${t.btn} ${t.btnOutline} ${t.btnSm}`}>
              <Download size={13} /> Export
            </button>
          </div>
          <div className={t.tableWrap}>
            <table className={t.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Sales</th>
                  <th>Revenue</th>
                  <th>Growth</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5}>
                    <div className={t.emptyState}>
                      <div className={t.emptyIcon}>
                        <TrendingUp size={24} />
                      </div>
                      <h3 className={t.emptyTitle}>No data yet.</h3>
                      <p className={t.emptyText}>
                        Top products will appear once platform data is
                        connected.
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Top vendors */}
        <div className={t.chartCard}>
          <div className={t.chartHead}>
            <h3 className={t.chartTitle}>Top Vendors</h3>
            <button className={`${t.btn} ${t.btnOutline} ${t.btnSm}`}>
              <Download size={13} /> Export
            </button>
          </div>
          <div className={t.tableWrap}>
            <table className={t.table}>
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Orders</th>
                  <th>Revenue</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4}>
                    <div className={t.emptyState}>
                      <div className={t.emptyIcon}>
                        <TrendingUp size={24} />
                      </div>
                      <h3 className={t.emptyTitle}>No data yet.</h3>
                      <p className={t.emptyText}>
                        Top vendors will appear once platform data is connected.
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
