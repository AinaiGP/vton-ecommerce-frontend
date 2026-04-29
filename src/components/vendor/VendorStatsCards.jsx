import {
  DollarSign,
  ShoppingCart,
  Eye,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import styles from "../../styles/VendorStatsCards.module.css";

export default function VendorStatsCards({ 
  totalSales = 0, 
  ordersToday = 0, 
  vtonUses = 0, 
  revenue = 0 
}) {
  const stats = [
    {
      id: "sales",
      label: "Total Sales",
      value: `EGP ${totalSales.toLocaleString()}`,
      change: "+0%",
      trend: "up",
      icon: DollarSign,
      accent: "sales",
    },
    {
      id: "orders",
      label: "Orders Today",
      value: ordersToday.toString(),
      change: "+0%",
      trend: "up",
      icon: ShoppingCart,
      accent: "orders",
    },
    {
      id: "vton",
      label: "VTON Uses",
      value: vtonUses.toLocaleString(),
      change: "+0%",
      trend: "up",
      icon: Eye,
      accent: "vton",
    },
    {
      id: "revenue",
      label: "Revenue",
      value: `EGP ${revenue.toLocaleString()}`,
      change: "+0%",
      trend: "up",
      icon: TrendingUp,
      accent: "revenue",
    },
  ];
  return (
    <div className={styles.grid}>
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <article
            key={stat.id}
            className={`${styles.card} ${styles[stat.accent]}`}
          >
            {/* Icon circle */}
            <div className={styles.iconWrap}>
              <Icon size={20} />
            </div>

            {/* Content */}
            <div className={styles.content}>
              <span className={styles.label}>{stat.label}</span>
              <span className={styles.value}>{stat.value}</span>
            </div>

            {/* Badge */}
            <div
              className={`${styles.badge} ${
                stat.trend === "up" ? styles.badgeUp : styles.badgeDown
              }`}
            >
              {stat.trend === "up" ? (
                <ArrowUpRight size={14} />
              ) : (
                <ArrowDownRight size={14} />
              )}
              <span>{stat.change}</span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
