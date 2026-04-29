import { useEffect, useState } from "react";
import { Download, TrendingUp, Star } from "lucide-react";
import SupportLayout from "../../components/support/SupportLayout";
import p from "../../styles/SupportPage.module.css";
export default function SupportReports() {
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    // TODO: wire to real API endpoint — Phase X
    setHasData(false);
  }, []);

  return (
    <SupportLayout
      pageTitle="Reports & Analytics"
      pageSubtitle="Team performance, ticket trends, and SLA tracking."
      breadcrumb="Reports"
      headerAction={
        <button className={`${p.btn} ${p.btnOutline} ${p.btnSm}`}>
          <Download size={13} /> Export PDF
        </button>
      }
    >
      {!hasData && (
        <div className={p.emptyState}>
          <div className={p.emptyIcon}>
            <TrendingUp size={22} />
          </div>
          <h3 className={p.emptyTitle}>No data yet.</h3>
          <p className={p.emptyText}>
            Report metrics will appear once support data is connected.
          </p>
        </div>
      )}

      {!hasData && (
        <div className={p.panel}>
          <div className={p.panelHead}>
            <div>
              <h3 className={p.panelTitle}>
                Ticket Volume — Created vs Resolved
              </h3>
              <p className={p.panelSubtitle}>Last 7 months</p>
            </div>
            <button className={`${p.btn} ${p.btnOutline} ${p.btnSm}`}>
              <Download size={13} /> CSV
            </button>
          </div>
          <div className={p.emptyState}>
            <div className={p.emptyIcon}>
              <TrendingUp size={22} />
            </div>
            <h3 className={p.emptyTitle}>No data yet.</h3>
            <p className={p.emptyText}>
              Charts will appear once support data is connected.
            </p>
          </div>
        </div>
      )}

      {!hasData && (
        <div className={p.panel}>
          <div className={p.panelHead}>
            <h3 className={p.panelTitle}>Top Agents — Leaderboard</h3>
          </div>
          <div className={p.emptyState}>
            <div className={p.emptyIcon}>
              <Star size={22} />
            </div>
            <h3 className={p.emptyTitle}>No data yet.</h3>
            <p className={p.emptyText}>
              Agent performance will appear once support data is connected.
            </p>
          </div>
        </div>
      )}
    </SupportLayout>
  );
}
