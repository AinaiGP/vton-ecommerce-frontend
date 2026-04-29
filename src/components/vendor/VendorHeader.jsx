import { useEffect, useState } from "react";
import { Bell, Search, Menu, ChevronDown, Sun, Moon } from "lucide-react";
import styles from "../../styles/VendorHeader.module.css";

export default function VendorHeader({ onMenuToggle }) {
  const [notificationCount] = useState(0);

  useEffect(() => {
    // TODO: wire vendor notifications to real API
  }, []);

  return (
    <header className={styles.header}>
      {/* Left: hamburger + page title area */}
      <div className={styles.left}>
        <button
          className={styles.menuBtn}
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb / search */}
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search products, orders..."
            className={styles.searchInput}
          />
          <kbd className={styles.kbd}>/</kbd>
        </div>
      </div>

      {/* Right: actions */}
      <div className={styles.right}>
        {/* Theme toggle placeholder */}
        <button className={styles.iconBtn} aria-label="Toggle theme">
          <Sun size={18} />
        </button>

        {/* Notifications */}
        <button className={styles.iconBtn} aria-label="Notifications">
          <Bell size={18} />
          {notificationCount > 0 && <span className={styles.notifDot} />}
        </button>

        {/* Profile pill */}
        <button className={styles.profilePill}>
          <div className={styles.avatar}>V</div>
          <div className={styles.profileText}>
            <span className={styles.profileName}>Vendor</span>
            <span className={styles.profileRole}>Store Owner</span>
          </div>
          <ChevronDown size={14} className={styles.chevron} />
        </button>
      </div>
    </header>
  );
}
