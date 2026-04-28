import { DollarSign, Store, Users, Eye, ArrowUpRight } from "lucide-react";
import styles from "../styles/VendorDashboardPage.module.css";
import statStyles from "../styles/VendorStatsCards.module.css";

const stats = [
  {
    id: "sales",
    label: "Total Sales",
    value: "EGP 428,500",
    change: "+15.2%",
    icon: DollarSign,
    accent: "sales",
  },
  {
    id: "vendors",
    label: "Total Vendors",
    value: "142",
    change: "+4.1%",
    icon: Store,
    accent: "vton",
  },
  {
    id: "users",
    label: "Total Users",
    value: "12,840",
    change: "+22.5%",
    icon: Users,
    accent: "orders",
  },
  {
    id: "tryons",
    label: "Active Try-Ons",
    value: "3,410",
    change: "+54.2%",
    icon: Eye,
    accent: "revenue",
  },
];

export default function AdminDashboard() {
  return (
    <div style={{ padding: '2rem' }}>

        <div className={styles.content}>
          <div className={styles.pageHead}>
            <div>
              <h1 className={styles.pageTitle}>System Analytics</h1>
              <p className={styles.pageSubtitle}>
                Overview of platform performance and growth.
              </p>
            </div>
          </div>

          <div className={statStyles.grid}>
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <article
                  key={stat.id}
                  className={`${statStyles.card} ${statStyles[stat.accent]}`}
                >
                  <div className={statStyles.iconWrap}>
                    <Icon size={20} />
                  </div>
                  <div className={statStyles.content}>
                    <span className={statStyles.label}>{stat.label}</span>
                    <span className={statStyles.value}>{stat.value}</span>
                  </div>
                  <div className={`${statStyles.badge} ${statStyles.badgeUp}`}>
                    <ArrowUpRight size={14} />
                    <span>{stat.change}</span>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Placeholder for future charts */}
          <div className={styles.panel} style={{ marginTop: '2rem', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: 'var(--charcoal-muted)' }}>Revenue vs Try-On Engagement Chart (Pending Data Integration)</p>
          </div>
        </div>
    </div>
  );
}
