import { useState, useEffect, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, DollarSign,
  Star, Eye, Settings, LogOut, ChevronLeft, Store,
  Bell, Search, Sun, Moon, ChevronDown, Menu,
  User, Lock, Globe, Headphones, Home,
  Warehouse, RotateCcw, ExternalLink
} from "lucide-react";
import s from "../../styles/VendorLayout.module.css";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";

const NOTIFS = [
  { id: 1, text: "New order received: #ORD-9902", time: "2m ago", unread: true },
  { id: 2, text: "Customer Sarah left a 5-star review", time: "1h ago", unread: true },
  { id: 3, text: "Low stock alert: 'Linen Shirt' (2 left)", time: "3h ago", unread: false },
];

/* ─── Sidebar ──────────────────────────────────────── */
function Sidebar({ collapsed, onToggle, mobileOpen, onClose }) {
  const { pathname } = useLocation();
  const { lang, toggleLanguage, t } = useLanguage();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await logout(); } catch (_) {}
    navigate("/auth");
  };

  const NAV = [
    {
      label: t("admin.main"),
      items: [
        { icon: LayoutDashboard, label: t("vendor.dashboard"), to: "/vendor" },
        { icon: Package,         label: t("vendor.products"),  to: "/vendor/products" },
        { icon: Warehouse,       label: "Inventory",           to: "/vendor/inventory" },
        { icon: ShoppingCart,    label: t("vendor.orders"),    to: "/vendor/orders",   badge: "4" },
        { icon: DollarSign,      label: t("vendor.earnings"),  to: "/vendor/earnings" },
      ],
    },
    {
      label: t("admin.insights"),
      items: [
        { icon: Star,         label: t("vendor.reviews"),  to: "/vendor/reviews",   badge: "2" },
        { icon: Eye,          label: t("vendor.analytics"),to: "/vendor/analytics" },
        { icon: RotateCcw,    label: "Refund Requests",    to: "/vendor/refunds",   badge: "3" },
      ],
    },
    {
      label: t("admin.system"),
      items: [
        { icon: ExternalLink, label: "My Storefront",      to: "/vendors/storefront/urban-threads" },
        { icon: Headphones,   label: t("vendor.support"),  to: "/vendor/tickets",  badge: "2" },
        { icon: Settings,     label: t("vendor.settings"), to: "/vendor/settings" },
      ],
    },
  ];

  return (
    <>
      {mobileOpen && <div className={s.overlay} onClick={onClose} />}
      <aside className={[s.sidebar, collapsed ? s.collapsed : "", mobileOpen ? s.mobileOpen : ""].join(" ")}>
        {/* Brand */}
        <div className={s.brand}>
          <div className={s.brandLogo}><Store size={18} /></div>
          {!collapsed && (
            <div className={s.brandText}>
              <span className={s.brandName}>{t("vendor.title")}</span>
              <span className={s.brandSub}>{t("vendor.tagline")}</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className={s.nav}>
          {NAV.map((group) => (
            <div key={group.label} className={s.navGroup}>
              <span className={s.navGroupLabel}>{group.label}</span>
              {group.items.map(({ icon: Icon, label, to, badge }) => (
                <Link
                  key={to}
                  to={to}
                  className={[s.navItem, pathname === to ? s.active : ""].join(" ")}
                  title={collapsed ? label : undefined}
                  onClick={onClose}
                >
                  <span className={s.navIcon}><Icon size={17} /></span>
                  {!collapsed && <span className={s.navLabel}>{label}</span>}
                  {!collapsed && badge && <span className={s.navBadge}>{badge}</span>}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className={s.sidebarBottom}>
          <button
            className={s.navItem}
            style={{ width: "calc(100% - 16px)", margin: "0 8px", border: "none", background: "none", fontFamily: "inherit", cursor: "pointer", textAlign: lang === "ar" ? "right" : "left" }}
            title={collapsed ? t("profile.logout") : undefined}
            onClick={handleLogout}
          >
            <span className={s.navIcon}><LogOut size={17} /></span>
            {!collapsed && <span className={s.navLabel}>{t("profile.logout")}</span>}
          </button>
          <button className={s.collapseBtn} onClick={onToggle}>
            <ChevronLeft size={15} className={[s.collapseIcon, collapsed ? s.flipped : ""].join(" ")} style={{ transform: collapsed ? (lang === "ar" ? "rotate(0deg)" : "rotate(180deg)") : (lang === "ar" ? "rotate(180deg)" : "rotate(0deg)") }} />
            {!collapsed && <span>{t("admin.collapse")}</span>}
          </button>
        </div>

        {/* Vendor pill */}
        <div className={s.vendorPill}>
          <div className={s.vendorAvatar}>V</div>
          {!collapsed && (
            <div>
              <span className={s.vendorName}>Urban Threads</span>
              <span className={s.vendorHandle}>@urbanthreads</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

/* ─── Header ───────────────────────────────────────── */
function Header({ onMenuToggle, dark, onDarkToggle }) {
  const [notifOpen, setNotifOpen]     = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifs, setNotifs]           = useState(NOTIFS);
  const notifRef   = useRef(null);
  const profileRef = useRef(null);
  const navigate   = useNavigate();
  const { lang, toggleLanguage, t } = useLanguage();
  const { logout } = useAuth();

  const unread = notifs.filter((n) => n.unread).length;

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setProfileOpen(false);
    try { await logout(); } catch (_) {}
    navigate("/auth");
  };

  return (
    <header className={s.header}>
      <div className={s.headerLeft}>
        <button className={s.menuBtn} onClick={onMenuToggle}><Menu size={20} /></button>
        <div className={s.searchWrap}>
          <Search size={15} className={s.searchIcon} />
          <input className={s.searchInput} placeholder={t("vendor.search_placeholder")} />
        </div>
      </div>

      <div className={s.headerRight}>
        {/* Language */}
        <button
          className={s.iconBtn}
          onClick={toggleLanguage}
          aria-label="Switch language"
          style={{ fontSize: 12, fontWeight: 700, width: "auto", padding: "0 10px", gap: 4, display: "flex", alignItems: "center" }}
        >
          <Globe size={15} />
          {lang === "en" ? "AR" : "EN"}
        </button>

        {/* Dark mode */}
        <button className={s.iconBtn} onClick={onDarkToggle} aria-label="Toggle dark mode">
          {dark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <button className={s.iconBtn} onClick={() => { setNotifOpen(v => !v); setProfileOpen(false); }}>
            <Bell size={17} />
            {unread > 0 && <span className={s.notifDot} />}
          </button>
          {notifOpen && (
            <div className={s.notifPanel}>
              <div className={s.notifHead}>
                <h3 className={s.notifTitle}>{t("profile.notifications")} {unread > 0 && `(${unread})`}</h3>
                <button className={s.notifMarkAll} onClick={() => setNotifs(notifs.map(n => ({ ...n, unread: false })))}>{t("profile.mark_all_read")}</button>
              </div>
              <ul className={s.notifList}>
                {notifs.map((n) => (
                  <li key={n.id} className={[s.notifItem, n.unread ? s.unread : ""].join(" ")}>
                    {n.unread && <span className={s.notifDotInline} />}
                    <div>
                      <p className={s.notifText}>{n.text}</p>
                      <span className={s.notifTime}>{n.time}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Profile */}
        <div ref={profileRef} className={s.profileWrap}>
          <button className={s.profileBtn} onClick={() => { setProfileOpen(v => !v); setNotifOpen(false); }}>
            <div className={s.profileAvat}>V</div>
            <span className={s.profileName}>Urban Threads</span>
            <ChevronDown size={13} className={[s.profileChevron, profileOpen ? s.open : ""].join(" ")} />
          </button>
          {profileOpen && (
            <div className={s.profileMenu}>
              <div className={s.profileInfo}>
                <span className={s.profileInfoName}>Urban Threads</span>
                <span className={s.profileInfoSub}>vendor@store.com</span>
              </div>
              <ul className={s.profileMenuList}>
                <li><Link to="/vendor/settings" className={s.profileMenuItem} onClick={() => setProfileOpen(false)}><User size={14} /> {t("profile.my_profile")}</Link></li>
                <li><Link to="/" className={s.profileMenuItem} onClick={() => setProfileOpen(false)}><Home size={14} /> {t("profile.view_store")}</Link></li>
                <li><Link to="/vendor/settings" className={s.profileMenuItem} onClick={() => setProfileOpen(false)}><Lock size={14} /> {t("profile.password")}</Link></li>
                <li><button className={`${s.profileMenuItem} ${s.danger}`} onClick={handleLogout}><LogOut size={14} /> {t("profile.logout")}</button></li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ─── Layout shell ──────────────────────────────────── */
export default function VendorLayout({ children, pageTitle, pageSubtitle, breadcrumb, headerAction }) {
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark]             = useState(false);
  const { t } = useLanguage();

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-vdr-theme", next ? "dark" : "light");
  };

  const toggleSidebar = () => {
    if (window.innerWidth <= 1024) setMobileOpen(v => !v);
    else                           setCollapsed(v => !v);
  };

  return (
    <div className={s.shell}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className={[s.main, collapsed ? s.collapsed : ""].join(" ")}>
        <Header onMenuToggle={toggleSidebar} dark={dark} onDarkToggle={toggleDark} />
        <main className={s.content}>
          {(pageTitle || breadcrumb) && (
            <div className={s.pageHead}>
              <div className={s.pageTitleGroup}>
                {breadcrumb && (
                  <div className={s.pageBreadcrumb}>
                    <Link to="/vendor">{t("vendor.title")}</Link>
                    <ChevronLeft size={11} style={{ transform: "rotate(180deg)" }} />
                    <span>{breadcrumb}</span>
                  </div>
                )}
                {pageTitle    && <h1 className={s.pageTitle}>{pageTitle}</h1>}
                {pageSubtitle && <p  className={s.pageSubtitle}>{pageSubtitle}</p>}
              </div>
              {headerAction && <div>{headerAction}</div>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
