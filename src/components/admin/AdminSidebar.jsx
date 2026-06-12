import {
  LayoutDashboard,
  Users,
  Store,
  Folders,
  TicketCheck,
  MessageCircle,
  Settings,
  LogOut,
  ChevronLeft,
  ShieldAlert,
} from "lucide-react";
import { Link } from "react-router-dom";
import AinaiLogo from "../common/AinaiLogo";
import { useAuth } from "../../context/AuthContext";
// Reusing vendor sidebar styles for consistency
import styles from "../../styles/VendorSidebar.module.css";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/admin/dashboard" },
  { icon: Store, label: "Vendors", to: "/admin/vendors" },
  { icon: Users, label: "Users", to: "/admin/users" },
  { icon: Folders, label: "Categories", to: "/admin/categories" },
  { icon: TicketCheck, label: "Support Tickets", to: "/admin/tickets" },
  { icon: MessageCircle, label: "Live Chat", to: "/admin/messages" },
];

const bottomItems = [
  { icon: Settings, label: "Settings", to: "/admin/settings" },
  { icon: LogOut, label: "Logout", to: "/auth" },
];

export default function AdminSidebar({ collapsed, activeRoute }) {
  const { user } = useAuth();
  const fullName = user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "System";
  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      {/* Brand */}
      <div className={styles.brand}>
        <Link to="/" className={styles.brandLink}>
          {collapsed ? (
            <ShieldAlert size={24} className={styles.brandIconOnly} />
          ) : (
            <AinaiLogo
              size="sm"
              variant="dark"
              showArabic={false}
              showTagline={false}
            />
          )}
        </Link>
        <span className={styles.badge} style={{ background: 'var(--burgundy)', color: 'white' }}>Admin</span>
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

      {/* Admin info pill */}
      {!collapsed && (
        <div className={styles.storeInfo}>
          <div className={styles.storeAvatar} style={{ background: 'var(--burgundy)', color: 'white' }}>
            <ShieldAlert size={16} />
          </div>
          <div className={styles.storeDetails}>
            <span className={styles.storeName}>{fullName}</span>
            <span className={styles.storeStatus}>Administrator</span>
          </div>
        </div>
      )}
    </aside>
  );
}
