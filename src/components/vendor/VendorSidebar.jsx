import {
  LayoutDashboard,
  Package,
  ClipboardList,
  BarChart3,
  TicketCheck,
  Inbox,
  Settings,
  LogOut,
  ChevronLeft,
  Store,
} from "lucide-react";
import { Link } from "react-router-dom";
import AinaiLogo from "../common/AinaiLogo";
import styles from "../../styles/VendorSidebar.module.css";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/vendor" },
  { icon: Package, label: "My Products", to: "/vendor/products" },
  { icon: ClipboardList, label: "Orders", to: "/vendor/orders" },
  { icon: BarChart3, label: "Analytics", to: "/vendor/analytics" },
  { icon: TicketCheck, label: "Tickets", to: "/vendor/tickets" },
  { icon: Inbox, label: "Messages", to: "/vendor/messages" },
];

const bottomItems = [
  { icon: Settings, label: "Settings", to: "/vendor/settings" },
  { icon: LogOut, label: "Logout", to: "/auth" },
];

export default function VendorSidebar({ collapsed, activeRoute }) {
  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      {/* Brand */}
      <div className={styles.brand}>
        <Link to="/" className={styles.brandLink}>
          {collapsed ? (
            <Store size={24} className={styles.brandIconOnly} />
          ) : (
            <AinaiLogo
              size="sm"
              variant="dark"
              showArabic={false}
              showTagline={false}
            />
          )}
        </Link>
        <span className={styles.badge}>Vendor</span>
      </div>

      {/* Collapse toggle */}
      <button className={styles.collapseBtn} aria-label="Toggle sidebar">
        <ChevronLeft size={18} className={collapsed ? styles.rotated : ""} />
      </button>

      {/* Divider */}
      <div className={styles.divider} />

      {/* Main nav */}
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {navItems.map(({ icon: Icon, label, to }) => (
            <li key={to}>
              <Link
                to={to}
                className={`${styles.navItem} ${activeRoute === to ? styles.active : ""}`}
                title={collapsed ? label : undefined}
              >
                <span className={styles.navIcon}>
                  <Icon size={20} />
                </span>
                {!collapsed && <span className={styles.navLabel}>{label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Spacer */}
      <div className={styles.spacer} />

      {/* Bottom nav */}
      <div className={styles.divider} />
      <nav className={styles.bottomNav}>
        <ul className={styles.navList}>
          {bottomItems.map(({ icon: Icon, label, to }) => (
            <li key={to}>
              <Link
                to={to}
                className={`${styles.navItem} ${label === "Logout" ? styles.logout : ""}`}
                title={collapsed ? label : undefined}
              >
                <span className={styles.navIcon}>
                  <Icon size={20} />
                </span>
                {!collapsed && <span className={styles.navLabel}>{label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Store info pill */}
      {!collapsed && (
        <div className={styles.storeInfo}>
          <div className={styles.storeAvatar}>
            <Store size={16} />
          </div>
          <div className={styles.storeDetails}>
            <span className={styles.storeName}>My Store</span>
            <span className={styles.storeStatus}>Active</span>
          </div>
        </div>
      )}
    </aside>
  );
}
