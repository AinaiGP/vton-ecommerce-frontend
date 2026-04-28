import {
  DollarSign,
  ShoppingCart,
  Eye,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import styles from "../../styles/VendorStatsCards.module.css";

const stats = [
  {
    id: "sales",
    label: "Total Sales",
    value: "EGP 24,780",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    accent: "sales",
  },
  {
    id: "orders",
    label: "Orders Today",
    value: "38",
    change: "+8.2%",
    trend: "up",
    icon: ShoppingCart,
    accent: "orders",
  },
  {
    id: "vton",
    label: "VTON Uses",
    value: "1,205",
    change: "+23.1%",
    trend: "up",
    icon: Eye,
    accent: "vton",
  },
  {
    id: "revenue",
    label: "Revenue",
    value: "EGP 8,420",
    change: "-3.4%",
    trend: "down",
    icon: TrendingUp,
    accent: "revenue",
  },
];

export default function VendorStatsCards() {
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
