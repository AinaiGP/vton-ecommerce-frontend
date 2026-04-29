import { useState, useEffect, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  ShoppingCart,
  BarChart2,
  LifeBuoy,
  Settings,
  LogOut,
  ChevronLeft,
  Shield,
  Bell,
  Search,
  Sun,
  Moon,
  ChevronDown,
  Menu,
  X,
  User,
  Lock,
  Globe,
  Home,
  UserPlus,
  Mail,
  FileCheck,
  Inbox,
} from "lucide-react";
import styles from "../../styles/AdminLayout.module.css";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";

const NAV_SECTIONS = [
  {
    label: "Main",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", to: "/admin/dashboard" },
      { icon: Users, label: "Users", to: "/admin/users" },
      { icon: Store, label: "Vendors", to: "/admin/vendors" },
      { icon: Package, label: "Products", to: "/admin/products" },
      { icon: ShoppingCart, label: "Orders", to: "/admin/orders" },
    ],
  },
  {
    label: "Insights",
    items: [
      { icon: BarChart2, label: "Reports", to: "/admin/reports" },
      { icon: LifeBuoy, label: "Support", to: "/admin/tickets" },
    ],
  },
  {
    label: "System",
    items: [{ icon: Settings, label: "Settings", to: "/admin/settings" }],
  },
];

const NOTIFICATIONS = [];

/* ─── Sidebar ────────────────────────────── */
function AdminSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const location = useLocation();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (_) {}
    navigate("/auth");
  };

  const NAV_SECTIONS = [
    {
      label: t("admin.main"),
      items: [
        {
          icon: LayoutDashboard,
          label: t("admin.dashboard"),
          to: "/admin/dashboard",
        },
        { icon: Users, label: t("admin.users"), to: "/admin/users" },
        { icon: Store, label: t("admin.vendors"), to: "/admin/vendors" },
        { icon: Package, label: t("admin.products"), to: "/admin/products" },
        {
          icon: ShoppingCart,
          label: t("admin.orders"),
          to: "/admin/orders",
        },
      ],
    },
    {
      label: lang === "ar" ? "إدارة الفريق" : "Team & Access",
      items: [
        {
          icon: UserPlus,
          label: lang === "ar" ? "إدارة الموظفين" : "Staff",
          to: "/admin/staff",
        },
        {
          icon: FileCheck,
          label: lang === "ar" ? "طلبات البائعين" : "Vendor Applications",
          to: "/admin/vendor-applications",
        },
        {
          icon: Mail,
          label: lang === "ar" ? "الدعوات" : "Invitations",
          to: "/admin/invitations",
        },
      ],
    },
    {
      label: t("admin.insights"),
      items: [
        { icon: BarChart2, label: t("admin.reports"), to: "/admin/reports" },
        {
          icon: LifeBuoy,
          label: t("admin.support"),
          to: "/admin/tickets",
        },
        {
          icon: Inbox,
          label: lang === "ar" ? "الرسائل" : "Messages",
          to: "/admin/messages",
        },
      ],
    },
    {
      label: t("admin.system"),
      items: [
        {
          icon: User,
          label: lang === "ar" ? "ملف شخصي" : "My Profile",
          to: "/admin/profile",
        },
        { icon: Settings, label: t("vendor.settings"), to: "/admin/settings" },
      ],
    },
  ];

  return (
    <>
      {mobileOpen && <div className={styles.overlay} onClick={onMobileClose} />}
      <aside
        className={[
          styles.sidebar,
          collapsed ? styles.collapsed : "",
          mobileOpen ? styles.mobileOpen : "",
        ].join(" ")}
      >
        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.brandLogo}>
            <Shield size={20} />
          </div>
          {!collapsed && (
            <div className={styles.brandText}>
              <span className={styles.brandName}>{t("admin.title")}</span>
              <span className={styles.brandTagline}>{t("admin.tagline")}</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className={styles.nav}>
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className={styles.navSection}>
              <span className={styles.navSectionLabel}>{section.label}</span>
              {section.items.map(({ icon: Icon, label, to, badge }) => (
                <Link
                  key={to}
                  to={to}
                  className={[
                    styles.navItem,
                    location.pathname === to ? styles.active : "",
                  ].join(" ")}
                  title={collapsed ? label : undefined}
                  onClick={onMobileClose}
                >
                  <span className={styles.navIcon}>
                    <Icon size={18} />
                  </span>
                  {!collapsed && (
                    <span className={styles.navLabel}>{label}</span>
                  )}
                  {!collapsed && badge && (
                    <span className={styles.navBadge}>{badge}</span>
                  )}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className={styles.collapseBar}>
          {/* View Store — direct button, NOT in dropdown */}
          <Link
            to="/"
            className={styles.navItem}
            style={{ display: "flex", margin: "0 8px 2px" }}
            title={collapsed ? t("profile.view_store") : undefined}
            onClick={onMobileClose}
          >
            <span className={styles.navIcon}>
              <Home size={18} />
            </span>
            {!collapsed && (
              <span className={styles.navLabel}>{t("profile.view_store")}</span>
            )}
          </Link>

          {/* Logout */}
          <button
            className={styles.navItem}
            style={{
              width: "calc(100% - 16px)",
              margin: "0 8px 6px",
              border: "none",
              background: "none",
              fontFamily: "inherit",
              cursor: "pointer",
              textAlign: lang === "ar" ? "right" : "left",
            }}
            title={collapsed ? t("profile.logout") : undefined}
            onClick={handleLogout}
          >
            <span className={styles.navIcon}>
              <LogOut size={18} />
            </span>
            {!collapsed && (
              <span className={styles.navLabel}>{t("profile.logout")}</span>
            )}
          </button>

          <button
            className={styles.collapseBtn}
            onClick={onToggle}
            aria-label={t("admin.collapse")}
          >
            <ChevronLeft
              size={16}
              className={[
                styles.collapseIcon,
                collapsed ? styles.flipped : "",
              ].join(" ")}
              style={{
                transform: collapsed
                  ? lang === "ar"
                    ? "rotate(0deg)"
                    : "rotate(180deg)"
                  : lang === "ar"
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
              }}
            />
            {!collapsed && <span>{t("admin.collapse")}</span>}
          </button>
        </div>

        {/* User pill */}
        <div className={styles.userPill}>
          <div className={styles.userAvatar}>{(user?.firstName?.[0] || user?.email?.[0] || "A").toUpperCase()}</div>
          {!collapsed && (
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.firstName} {user?.lastName}</span>
              <span className={styles.userRole}>{user?.email}</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

/* ─── Header ─────────────────────────────── */
function AdminHeader({ onMenuToggle, dark, onDarkToggle }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifs, setNotifs] = useState(NOTIFICATIONS);
  const unreadCount = notifs.filter((n) => n.unread).length;
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const { lang, toggleLanguage, t } = useLanguage();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const NAV_SECTIONS = [
    {
      label: t("admin.main"),
      items: [
        {
          icon: LayoutDashboard,
          label: t("admin.title"),
          to: "/admin/dashboard",
        },
        { icon: Users, label: t("admin.users"), to: "/admin/users" },
        { icon: Store, label: t("admin.vendors"), to: "/admin/vendors" },
        { icon: Package, label: t("admin.products"), to: "/admin/products" },
        {
          icon: ShoppingCart,
          label: t("admin.orders"),
          to: "/admin/orders",
        },
      ],
    },
    {
      label: t("admin.insights"),
      items: [
        { icon: BarChart2, label: t("admin.reports"), to: "/admin/reports" },
        {
          label: t("admin.support"),
          to: "/admin/tickets",
        },
      ],
    },
    {
      label: t("admin.system"),
      items: [
        { icon: Settings, label: t("vendor.settings"), to: "/admin/settings" },
      ],
    },
  ];

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))
        setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = () =>
    setNotifs(notifs.map((n) => ({ ...n, unread: false })));

  const handleLogout = async () => {
    setProfileOpen(false);
    try {
      await logout();
    } catch (_) {}
    navigate("/auth");
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button
          className={styles.menuBtn}
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            placeholder={t("admin.search_placeholder")}
            className={styles.searchInput}
          />
          <kbd className={styles.kbd}>/</kbd>
        </div>
      </div>

      <div className={styles.headerRight}>
        {/* Language switcher */}
        <button
          className={styles.iconBtn}
          onClick={toggleLanguage}
          aria-label="Switch language"
          title={lang === "en" ? "Switch to Arabic" : "Switch to English"}
          style={{
            fontSize: 12,
            fontWeight: 700,
            width: "auto",
            padding: "0 10px",
            gap: 4,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Globe size={15} />
          {lang === "en" ? "AR" : "EN"}
        </button>

        {/* Dark mode toggle */}
        <button
          className={styles.iconBtn}
          onClick={onDarkToggle}
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <button
            className={styles.iconBtn}
            onClick={() => {
              setNotifOpen((v) => !v);
              setProfileOpen(false);
            }}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className={styles.notifDot} />}
          </button>

          {notifOpen && (
            <div className={styles.notifPanel}>
              <div className={styles.notifHeader}>
                <h3 className={styles.notifTitle}>
                  {t("profile.notifications")}{" "}
                  {unreadCount > 0 && `(${unreadCount})`}
                </h3>
                <button className={styles.notifMarkAll} onClick={markAllRead}>
                  {t("profile.mark_all_read")}
                </button>
              </div>
              <ul className={styles.notifList}>
                {notifs.map((n) => (
                  <li
                    key={n.id}
                    className={[
                      styles.notifItem,
                      n.unread ? styles.unread : "",
                    ].join(" ")}
                  >
                    {n.unread && <span className={styles.notifDotInline} />}
                    <div className={styles.notifBody}>
                      <p className={styles.notifText}>{n.text}</p>
                      <span className={styles.notifTime}>{n.time}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div ref={profileRef} className={styles.profileWrap}>
          <button
            className={styles.profileBtn}
            onClick={() => {
              setProfileOpen((v) => !v);
              setNotifOpen(false);
            }}
          >
            <div className={styles.profileAvat}>{(user?.firstName?.[0] || user?.email?.[0] || "A").toUpperCase()}</div>
            <span className={styles.profileName}>{user?.firstName} {user?.lastName}</span>
            <ChevronDown
              size={14}
              className={[
                styles.profileChevron,
                profileOpen ? styles.open : "",
              ].join(" ")}
            />
          </button>

          {profileOpen && (
            <div className={styles.profileMenu}>
              <div className={styles.profileMenuInfo}>
                <span className={styles.profileMenuName}>{user?.firstName} {user?.lastName}</span>
                <span className={styles.profileMenuRole}>{user?.email}</span>
              </div>
              <ul className={styles.profileMenuList}>
                <li>
                  <Link
                    to="/admin/settings"
                    className={styles.profileMenuItem}
                    onClick={() => setProfileOpen(false)}
                  >
                    <User size={15} /> {t("profile.settings")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
                    className={styles.profileMenuItem}
                    onClick={() => setProfileOpen(false)}
                  >
                    <Home size={15} /> {t("profile.view_store")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/settings"
                    className={styles.profileMenuItem}
                    onClick={() => setProfileOpen(false)}
                  >
                    <Lock size={15} /> {t("profile.password")}
                  </Link>
                </li>
                <li>
                  <button
                    className={`${styles.profileMenuItem} ${styles.danger}`}
                    onClick={handleLogout}
                  >
                    <LogOut size={15} /> {t("profile.logout")}
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ─── Layout shell ────────────────────────── */
export default function AdminLayout({
  children,
  pageTitle,
  pageSubtitle,
  breadcrumb,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(
    () => localStorage.getItem("adm-theme") === "dark",
  );

  useEffect(() => {
    localStorage.setItem("adm-theme", dark ? "dark" : "light");
    document.documentElement.setAttribute(
      "data-adm-theme",
      dark ? "dark" : "light",
    );
  }, [dark]);

  const toggleDark = () => {
    setDark(!dark);
  };

  const toggleSidebar = () => {
    if (window.innerWidth <= 1024) setMobileOpen((v) => !v);
    else setCollapsed((v) => !v);
  };

  return (
    <div className={styles.shell}>
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div
        className={[styles.main, collapsed ? styles.collapsed : ""].join(" ")}
      >
        <AdminHeader
          onMenuToggle={toggleSidebar}
          dark={dark}
          onDarkToggle={toggleDark}
        />

        <main className={styles.content}>
          {(pageTitle || breadcrumb) && (
            <div className={styles.pageHead}>
              <div className={styles.pageTitleGroup}>
                {breadcrumb && (
                  <div className={styles.pageBreadcrumb}>
                    <Link to="/admin/dashboard">Admin</Link>
                    <ChevronLeft
                      size={12}
                      style={{ transform: "rotate(180deg)" }}
                    />
                    <span>{breadcrumb}</span>
                  </div>
                )}
                {pageTitle && <h1 className={styles.pageTitle}>{pageTitle}</h1>}
                {pageSubtitle && (
                  <p className={styles.pageSubtitle}>{pageSubtitle}</p>
                )}
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
