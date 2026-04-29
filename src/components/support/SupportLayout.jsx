import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard, Ticket, MessageCircle, Users, BarChart3,
  Settings, ChevronLeft, Bell, Search, Menu,
  ChevronDown, LogOut, User, Moon, Sun, Headphones, X, Globe, Home
} from "lucide-react";
import s from "../../styles/SupportLayout.module.css";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";

const NAV = [
  { label: "Dashboard",  to: "/support",         icon: LayoutDashboard },
  { label: "Tickets",    to: "/support/tickets",  icon: Ticket,          badge: 12 },
  { label: "Live Chat",  to: "/support/chat",     icon: MessageCircle,   badge: 3 },
  { label: "Users",      to: "/support/users",    icon: Users },
  { label: "Reports",    to: "/support/reports",  icon: BarChart3 },
  { label: "Settings",   to: "/support/settings", icon: Settings },
];

const NOTIFS = [];

export default function SupportLayout({ children, pageTitle, pageSubtitle, breadcrumb, headerAction }) {
  const [collapsed, setCollapsed]     = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [dark, setDark]               = useState(() => localStorage.getItem("sup-theme") === "dark");
  const [notifOpen, setNotifOpen]     = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [unread, setUnread]           = useState(0);
  const notifRef   = useRef(null);
  const profileRef = useRef(null);
  const navigate   = useNavigate();
  const { lang, toggleLanguage, t } = useLanguage();
  const { logout, user } = useAuth();

  // Persist theme to localStorage and HTML attribute
  useEffect(() => {
    localStorage.setItem("sup-theme", dark ? "dark" : "light");
    document.documentElement.setAttribute("data-sup-theme", dark ? "dark" : "light");
  }, [dark]);

  const NAV = [
    { label: t("support.dashboard"), to: "/support",         icon: LayoutDashboard },
    { label: t("support.tickets"),   to: "/support/tickets",  icon: Ticket },
    { label: t("support.chat"),      to: "/support/chat",     icon: MessageCircle },
    { label: t("support.users"),     to: "/support/users",    icon: Users },
    { label: t("support.reports"),   to: "/support/reports",  icon: BarChart3 },
    { label: lang === "ar" ? "ملفي الشخصي" : "My Profile", to: "/support/profile", icon: User },
    { label: t("support.settings"),  to: "/support/settings", icon: Settings },
  ];

  // Close panels on outside click
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
    <div className={s.shell} data-sup-theme={dark ? "dark" : undefined}>
      {/* Mobile overlay */}
      {mobileOpen && <div className={s.overlay} onClick={() => setMobileOpen(false)} />}

      {/* ── Sidebar ── */}
      <aside className={`${s.sidebar} ${collapsed ? s.collapsed : ""} ${mobileOpen ? s.mobileOpen : ""}`}>
        {/* Brand */}
        <div className={s.brand}>
          <div className={s.brandLogo}><Headphones size={18} /></div>
          {!collapsed && (
            <div className={s.brandText}>
              <span className={s.brandName}>{t("support.title")}</span>
              <span className={s.brandSub}>{t("support.tagline")}</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className={s.nav}>
          {NAV.map(({ label, to, icon: Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/support"}
              className={({ isActive }) => `${s.navItem} ${isActive ? s.active : ""}`}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? label : undefined}
            >
              <span className={s.navIcon}><Icon size={17} /></span>
              {!collapsed && <span className={s.navLabel}>{label}</span>}
              {badge && !collapsed && <span className={s.navBadge}>{badge}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Agent pill */}
        <div className={s.sidebarBottom}>
          {/* View Store — direct nav link */}
          <Link
            to="/"
            className={s.navItem}
            style={{ margin: "0 10px 4px", display: "flex" }}
            title={collapsed ? t("profile.view_store") : undefined}
            onClick={() => setMobileOpen(false)}
          >
            <span className={s.navIcon}><Home size={17} /></span>
            {!collapsed && <span className={s.navLabel}>{t("profile.view_store")}</span>}
          </Link>

          {/* Logout */}
          <button
            className={s.navItem}
            style={{ width: "calc(100% - 20px)", margin: "0 10px 4px", border: "none", background: "none", fontFamily: "inherit", cursor: "pointer", textAlign: lang === "ar" ? "right" : "left" }}
            title={collapsed ? t("profile.logout") : undefined}
            onClick={handleLogout}
          >
            <span className={s.navIcon}><LogOut size={17} /></span>
            {!collapsed && <span className={s.navLabel}>{t("profile.logout")}</span>}
          </button>

          {/* Collapse/expand toggle — fixed to always work */}
          <button
            className={s.collapseBtn}
            onClick={() => setCollapsed(c => !c)}
            aria-label={collapsed ? t("admin.collapse") : t("admin.collapse")}
          >
            <ChevronLeft
              size={16}
              style={{
                flexShrink: 0,
                transition: "transform 0.25s",
                transform: collapsed ? (lang === "ar" ? "rotate(0deg)" : "rotate(180deg)") : (lang === "ar" ? "rotate(180deg)" : "rotate(0deg)"),
              }}
            />
            {!collapsed && <span>{t("admin.collapse")}</span>}
          </button>
        </div>

        <div className={s.vendorPill}>
          <div className={s.vendorAvatar}>{(user?.firstName?.[0] || user?.email?.[0] || "S").toUpperCase()}</div>
          {!collapsed && (
            <div className={s.brandText}>
              <span className={s.vendorName}>{user?.firstName} {user?.lastName?.charAt(0)}.</span>
              <span className={s.vendorHandle}>● Online</span>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <div className={`${s.main} ${collapsed ? s.collapsed : ""}`}>
        {/* Header */}
        <header className={s.header}>
          <div className={s.headerLeft}>
            <button
              className={s.menuBtn}
              onClick={() => {
                if (window.innerWidth <= 1024) setMobileOpen(o => !o);
                else setCollapsed(c => !c);
              }}
              aria-label="Toggle sidebar"
              style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {searchOpen ? (
              <div className={s.searchWrap}>
                <Search size={14} className={s.searchIcon} />
                <input
                  className={s.searchInput}
                  placeholder={t("support.search_placeholder")}
                  autoFocus
                  onBlur={() => setSearchOpen(false)}
                />
              </div>
            ) : (
              <button className={s.menuBtn} onClick={() => setSearchOpen(true)}>
                <Search size={17} />
              </button>
            )}
          </div>

          <div className={s.headerRight}>
            {/* Language */}
            <button
              className={s.iconBtn}
              onClick={toggleLanguage}
              aria-label="Switch language"
              style={{ fontSize: 12, fontWeight: 700, width: "auto", padding: "0 8px", gap: 4, display: "flex", alignItems: "center" }}
            >
              <Globe size={15} />
              {lang === "en" ? "AR" : "EN"}
            </button>

            {/* Dark mode */}
            <button className={s.iconBtn} onClick={() => setDark(d => !d)} title="Toggle theme">
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Notifications */}
            <div style={{ position: "relative" }} ref={notifRef}>
              <button className={s.iconBtn} onClick={() => { setNotifOpen(o => !o); setUnread(0); }}>
                <Bell size={17} />
                {unread > 0 && <span className={s.notifDot} />}
              </button>
              {notifOpen && (
                <div className={s.notifPanel}>
                  <div className={s.notifHead}>
                    <p className={s.notifTitle}>{t("profile.notifications")}</p>
                    <button className={s.notifMarkAll}>{t("profile.mark_all_read")}</button>
                  </div>
                  <ul className={s.notifList}>
                    {NOTIFS.map(n => (
                      <li key={n.id} className={`${s.notifItem} ${n.unread ? s.unread : ""}`}>
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
            <div style={{ position: "relative" }} ref={profileRef}>
              <button className={s.profileBtn} onClick={() => setProfileOpen(o => !o)}>
                <div className={s.profileAvat}>{(user?.firstName?.[0] || user?.email?.[0] || "S").toUpperCase()}</div>
                <span className={s.profileName}>{user?.firstName} {user?.lastName?.charAt(0)}.</span>
                <ChevronDown size={13} className={`${s.profileChevron} ${profileOpen ? s.open : ""}`} />
              </button>
              {profileOpen && (
                <div className={s.profileMenu}>
                  <div className={s.profileInfo}>
                    <span className={s.profileInfoName}>{user?.firstName} {user?.lastName}</span>
                    <span className={s.profileInfoSub}>{user?.email}</span>
                  </div>
                  <ul className={s.profileMenuList}>
                    <li>
                      <Link to="/support/settings" className={s.profileMenuItem} onClick={() => setProfileOpen(false)}>
                        <User size={14} /> {t("profile.my_profile")}
                      </Link>
                    </li>
                    <li>
                      <Link to="/" className={s.profileMenuItem} onClick={() => setProfileOpen(false)}>
                        <Home size={14} /> {t("profile.view_store")}
                      </Link>
                    </li>
                    <li>
                      <button
                        className={`${s.profileMenuItem} ${s.danger}`}
                        onClick={handleLogout}
                      >
                        <LogOut size={14} /> {t("profile.logout")}
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className={s.content}>
          {(pageTitle || breadcrumb) && (
            <div className={s.pageHead}>
              <div>
                {breadcrumb && <p className={s.pageBreadcrumb}>{t("support.title")} › {breadcrumb}</p>}
                {pageTitle   && <h1 className={s.pageTitle}>{pageTitle}</h1>}
                {pageSubtitle && <p className={s.pageSubtitle}>{pageSubtitle}</p>}
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
