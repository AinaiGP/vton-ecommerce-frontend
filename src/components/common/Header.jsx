import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  LogIn,
  LogOut,
  Heart,
  Search,
  ChevronDown,
  X,
  Menu,
  User,
  LayoutDashboard,
  Headphones,
  ShieldCheck,
  Globe,
  Moon,
  Sun,
  Package,
  RotateCcw,
  MessageSquare,
  Shirt,
  Zap,
  LayoutGrid,
  Ticket,
  ChevronRight,
} from "lucide-react";
import AinaiLogo from "./AinaiLogo";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useLanguage } from "../../context/LanguageContext";
import styles from "../../styles/Header.module.css";

export default function Header() {
  const { isAuthenticated, user, userRole, logout } = useAuth();
  const { cartCount } = useCart();
  const { t, lang, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false); // customer avatar dropdown
  const [activeDropdown, setActiveDropdown] = useState(null); // 'shop', 'account', 'platform'
  const hoverTimeoutRef = useRef(null);
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined")
      return localStorage.getItem("ainai_dark") === "1";
    return false;
  });

  const searchRef = useRef(null);
  const profileRef = useRef(null); // ref for click-outside
  const fileInputRef = useRef(null); // unused here but kept for consistency

  // Read profile photo reactively from context
  const profilePhoto = userRole === "vendor" 
    ? user?.logoUrl 
    : (user?.primaryPhotoUrl || user?.photoUrl || null);

  // Dark mode
  useEffect(() => {
    document.documentElement.setAttribute("data-dark", dark ? "1" : "0");
    localStorage.setItem("ainai_dark", dark ? "1" : "0");
  }, [dark]);

  // Close customer dropdown on outside click
  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") setProfileOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Focus search
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  // Hover delay logic for smooth dropdowns
  const handleMouseEnter = (menu) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 120);
  };

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);


  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchOpen(false);
      setSearchQ("");
    }
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    setMobileOpen(false);
    await logout();
  };

  const getInitials = () => {
    if (!user) return "?";
    if (userRole === "vendor" && user.brandName) return user.brandName[0].toUpperCase();
    if (user.firstName?.trim()) return user.firstName[0].toUpperCase();
    if (user.email?.trim()) return user.email[0].toUpperCase();
    return "?";
  };

  const getFullName = () => {
    if (!user) return "";
    if (isVendor && user.brandName) return user.brandName;
    const f = user.firstName?.trim() || "";
    const l = user.lastName?.trim() || "";
    return (f + " " + l).trim() || user.email || "";
  };

  const isCustomer = userRole === "customer";
  const isVendor = userRole === "vendor";
  const isAdmin = userRole === "admin";
  const isTechSupport = userRole === "technical_support";
  const isGuest = !isAuthenticated;

  const getProfilePath = () => {
    if (isVendor) return "/vendor";
    if (isAdmin) return "/admin/dashboard";
    if (isTechSupport) return "/support";
    return "/profile";
  };

  // Customer quick-links for the dropdown
  const CUSTOMER_MENU = [
    {
      icon: User,
      label: lang === "ar" ? "ملفي الشخصي" : "Profile",
      to: "/profile",
    },
    {
      icon: Package,
      label: lang === "ar" ? "طلباتي" : "Orders",
      to: "/orders",
    },
    {
      icon: Shirt,
      label: lang === "ar" ? "خزانتي" : "My Wardrobe",
      to: "/wardrobe",
    },
    {
      icon: Ticket,
      label: lang === "ar" ? "تذاكر الدعم" : "Tickets",
      to: "/tickets",
    },
  ];

  const handleImgError = () => {
    setProfilePhoto(null);
    if (typeof window !== "undefined")
      localStorage.removeItem("ainai_profile_photo");
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          {/* ── Logo ── */}
          <Link to="/" className={styles.logo}>
            <AinaiLogo
              size="md"
              variant={dark ? "dark" : "light"}
              showArabic={lang === "ar"}
            />
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className={styles.nav}>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
            >
              {t("common.home")}
            </NavLink>

            <NavLink
              to="/browse"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
            >
              {t("common.shop")}
            </NavLink>

            {/* My Account Dropdown - Customer Only */}
            {isCustomer && (
              <div
                className={`${styles.dropdownWrap} ${activeDropdown === "account" ? styles.active : ""}`}
                onMouseEnter={() => handleMouseEnter("account")}
                onMouseLeave={handleMouseLeave}
              >
                <span className={styles.navLink}>
                  {lang === "ar" ? "حسابي" : "My Account"}{" "}
                  <ChevronDown size={13} className={styles.chevron} />
                </span>
                <div className={styles.dropdownMenu}>
                  <Link
                    to="/my-account"
                    className={styles.dropdownItem}
                    onClick={() => setActiveDropdown(null)}
                  >
                    <LayoutGrid size={14} />{" "}
                    {lang === "ar" ? "لوحة الحساب" : "Account Hub"}
                  </Link>
                  <Link
                    to="/profile"
                    className={styles.dropdownItem}
                    onClick={() => setActiveDropdown(null)}
                  >
                    <User size={14} />{" "}
                    {lang === "ar" ? "ملفي الشخصي" : "My Profile"}
                  </Link>
                  <Link
                    to="/orders"
                    className={styles.dropdownItem}
                    onClick={() => setActiveDropdown(null)}
                  >
                    <Package size={14} />{" "}
                    {lang === "ar" ? "طلباتي" : "My Orders"}
                  </Link>
                  <Link
                    to="/wishlist"
                    className={styles.dropdownItem}
                    onClick={() => setActiveDropdown(null)}
                  >
                    <Heart size={14} /> {lang === "ar" ? "المفضلة" : "Wishlist"}
                  </Link>
                  <Link
                    to="/wardrobe"
                    className={styles.dropdownItem}
                    onClick={() => setActiveDropdown(null)}
                  >
                    <Shirt size={14} />{" "}
                    {lang === "ar" ? "خزانتي" : "My Wardrobe"}
                  </Link>
                  <Link
                    to="/tickets"
                    className={styles.dropdownItem}
                    onClick={() => setActiveDropdown(null)}
                  >
                    <MessageSquare size={14} />{" "}
                    {lang === "ar" ? "تذاكر الدعم" : "Support Tickets"}
                  </Link>
                  <Link
                    to="/returns"
                    className={styles.dropdownItem}
                    onClick={() => setActiveDropdown(null)}
                  >
                    <RotateCcw size={14} />{" "}
                    {lang === "ar" ? "الإرجاع والاسترداد" : "Returns & Refunds"}
                  </Link>
                </div>
              </div>
            )}

            {/* Platform Dropdown - Role Specific */}
            {(isVendor || isTechSupport || isAdmin) && (
              <div
                className={`${styles.dropdownWrap} ${activeDropdown === "platform" ? styles.active : ""}`}
                onMouseEnter={() => handleMouseEnter("platform")}
                onMouseLeave={handleMouseLeave}
              >
                <span className={styles.navLink}>
                  {t("common.platform")}{" "}
                  <ChevronDown size={13} className={styles.chevron} />
                </span>
                <div className={styles.dropdownMenu}>
                  {isVendor && (
                    <Link
                      to="/vendor"
                      className={styles.dropdownItem}
                      onClick={() => setActiveDropdown(null)}
                    >
                      <LayoutDashboard size={14} /> {t("common.vendor")}
                    </Link>
                  )}
                  {isTechSupport && (
                    <Link
                      to="/support"
                      className={styles.dropdownItem}
                      onClick={() => setActiveDropdown(null)}
                    >
                      <Headphones size={14} /> {t("common.support")}
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className={styles.dropdownItem}
                      onClick={() => setActiveDropdown(null)}
                    >
                      <ShieldCheck size={14} /> {t("common.admin")}
                    </Link>
                  )}
                </div>
              </div>
            )}
          </nav>

          {/* ── Right actions ── */}
          <div className={styles.actions}>
            {/* Language */}
            <button
              className={styles.iconBtn}
              style={{
                fontSize: 13,
                fontWeight: 700,
                padding: "0 8px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
              onClick={toggleLanguage}
            >
              <Globe size={16} />
              {lang === "en" ? "AR" : "EN"}
            </button>

            {/* Dark mode */}
            <button
              className={styles.iconBtn}
              onClick={() => setDark((d) => !d)}
              title={dark ? "Light mode" : "Dark mode"}
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Search */}
            {searchOpen ? (
              <form className={styles.searchForm} onSubmit={handleSearch}>
                <input
                  ref={searchRef}
                  className={styles.searchInput}
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder={t("common.search")}
                />
                <button
                  type="button"
                  className={styles.iconBtn}
                  onClick={() => setSearchOpen(false)}
                >
                  <X size={18} />
                </button>
              </form>
            ) : (
              <button
                className={styles.iconBtn}
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
              >
                <Search size={20} />
              </button>
            )}

            {/* Wishlist */}
            {(isGuest || isCustomer) && (
              <Link
                to="/wishlist"
                className={styles.iconBtn}
                aria-label="Wishlist"
              >
                <Heart size={20} />
              </Link>
            )}

            {/* Cart */}
            {(isGuest || isCustomer) && (
              <Link to="/cart" className={styles.iconBtn} aria-label="Cart" style={{ position: 'relative' }}>
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className={styles.cartBadge}>{cartCount > 99 ? '99+' : cartCount}</span>
                )}
              </Link>
            )}

            {/* ── Auth section ── */}
            {isAuthenticated ? (
              <div className={styles.avatarWrap} ref={profileRef}>
                <button
                  className={styles.avatarBtn}
                  onClick={() => setProfileOpen((v) => !v)}
                  aria-label="Account menu"
                  aria-expanded={profileOpen}
                >
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt="Profile"
                      className={styles.avatarImg}
                      onError={handleImgError}
                    />
                  ) : (
                    <div className={styles.avatarInitialFallback}>{getInitials()}</div>
                  )}
                  {/* Online indicator dot */}
                  <span className={styles.avatarOnline} />
                </button>

                {/* Dropdown */}
                {profileOpen && (
                  <div className={styles.avatarDropdown}>
                    {/* User identity header */}
                    <div className={styles.avatarDropHead}>
                      <div className={styles.avatarDropAvatar}>
                        {profilePhoto ? (
                          <img
                            src={profilePhoto}
                            alt="Profile"
                            className={styles.avatarDropAvatarImg}
                            onError={handleImgError}
                          />
                        ) : (
                          <div className={styles.avatarDropInitialFallback}>{getInitials()}</div>
                        )}
                      </div>
                      <div className={styles.avatarDropInfo}>
                        <p className={styles.avatarDropName}>
                          {getFullName() ||
                            (lang === "ar" ? "المستخدم" : "User")}
                        </p>
                        <p className={styles.avatarDropEmail}>
                          {user?.email || ""}
                        </p>
                      </div>
                    </div>

                    <div className={styles.avatarDropDivider} />

                    {/* Quick-links */}
                    {isCustomer ? (
                      CUSTOMER_MENU.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.to}
                            to={item.to}
                            className={styles.avatarDropItem}
                            onClick={() => setProfileOpen(false)}
                          >
                            <span className={styles.avatarDropItemIcon}>
                              <Icon size={15} />
                            </span>
                            <span>{item.label}</span>
                            <ChevronRight
                              size={13}
                              className={styles.avatarDropChevron}
                            />
                          </Link>
                        );
                      })
                    ) : (
                      /* Vendor/Admin/Support links */
                      <Link
                        to={getProfilePath()}
                        className={styles.avatarDropItem}
                        onClick={() => setProfileOpen(false)}
                      >
                        <span className={styles.avatarDropItemIcon}>
                          <LayoutGrid size={15} />
                        </span>
                        <span>
                          {isAdmin
                            ? lang === "ar"
                              ? "لوحة الإدارة"
                              : "Admin Panel"
                            : isTechSupport
                              ? lang === "ar"
                                ? "لوحة الدعم"
                                : "Support Desk"
                              : lang === "ar"
                                ? "لوحة البائع"
                                : "Vendor Portal"}
                        </span>
                        <ChevronRight
                          size={13}
                          className={styles.avatarDropChevron}
                        />
                      </Link>
                    )}

                    <div className={styles.avatarDropDivider} />

                    {/* Logout */}
                    <button
                      className={`${styles.avatarDropItem} ${styles.avatarDropLogout}`}
                      onClick={handleLogout}
                    >
                      <span className={styles.avatarDropItemIcon}>
                        <LogOut size={15} />
                      </span>
                      <span>{lang === "ar" ? "تسجيل الخروج" : "Logout"}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/auth" className={styles.loginBtn}>
                <LogIn size={16} /> {t("common.login")}
              </Link>
            )}

            {/* Mobile toggle */}
            <button
              className={`${styles.iconBtn} ${styles.mobileOnly}`}
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      {mobileOpen && (
        <div className={styles.drawer}>
          <div className={styles.drawerHead}>
            <AinaiLogo
              size="sm"
              variant={dark ? "dark" : "light"}
              showArabic={lang === "ar"}
            />
            <button
              className={styles.iconBtn}
              onClick={() => setMobileOpen(false)}
            >
              <X size={22} />
            </button>
          </div>

          {/* Mobile user identity card */}
          {isCustomer && (
            <div className={styles.drawerUserCard}>
              <div className={styles.drawerUserAvatar}>
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    className={styles.drawerUserAvatarImg}
                    onError={handleImgError}
                  />
                ) : (
                  <User size={24} className={styles.avatarDropIconFallback} />
                )}
              </div>
              <div className={styles.drawerUserInfo}>
                <p className={styles.drawerUserName}>
                  {getFullName() || (lang === "ar" ? "المستخدم" : "Customer")}
                </p>
                <p className={styles.drawerUserEmail}>{user?.email || ""}</p>
              </div>
            </div>
          )}

          <nav className={styles.drawerNav}>
            <Link
              to="/"
              className={styles.drawerLink}
              onClick={() => setMobileOpen(false)}
            >
              {t("common.home")}
            </Link>
            <Link
              to="/browse"
              className={styles.drawerLink}
              onClick={() => setMobileOpen(false)}
            >
              {lang === "ar" ? "تصفح الكل" : "Shop All"}
            </Link>

            <hr className={styles.drawerDivider} />

            {/* Customer pages */}
            {(isGuest || isCustomer) && (
              <>
                <Link
                  to="/my-account"
                  className={styles.drawerLink}
                  onClick={() => setMobileOpen(false)}
                >
                  📋 {lang === "ar" ? "لوحة حسابي" : "Account Hub"}
                </Link>
                <Link
                  to="/wishlist"
                  className={styles.drawerLink}
                  onClick={() => setMobileOpen(false)}
                >
                  {t("common.wishlist")} ♡
                </Link>
                <Link
                  to="/cart"
                  className={styles.drawerLink}
                  onClick={() => setMobileOpen(false)}
                >
                  {t("common.cart")} 🛍
                </Link>
                <Link
                  to="/orders"
                  className={styles.drawerLink}
                  onClick={() => setMobileOpen(false)}
                >
                  {t("common.orders")}
                </Link>
                <Link
                  to="/wardrobe"
                  className={styles.drawerLink}
                  onClick={() => setMobileOpen(false)}
                >
                  👗 {lang === "ar" ? "خزانتي" : "My Wardrobe"}
                </Link>
                <Link
                  to="/tickets"
                  className={styles.drawerLink}
                  onClick={() => setMobileOpen(false)}
                >
                  🎫 {lang === "ar" ? "تذاكر الدعم" : "Support Tickets"}
                </Link>
                <Link
                  to="/returns"
                  className={styles.drawerLink}
                  onClick={() => setMobileOpen(false)}
                >
                  ↩{" "}
                  {lang === "ar" ? "الإرجاع والاسترداد" : "Returns & Refunds"}
                </Link>
              </>
            )}

            {/* Platform pages */}
            {!isGuest && !isCustomer && (
              <>
                {isVendor && (
                  <Link
                    to="/vendor"
                    className={styles.drawerLink}
                    onClick={() => setMobileOpen(false)}
                  >
                    🏬 {lang === "ar" ? "لوحة البائع" : "Vendor Portal"}
                  </Link>
                )}
                {isTechSupport && (
                  <Link
                    to="/support"
                    className={styles.drawerLink}
                    onClick={() => setMobileOpen(false)}
                  >
                    🎧 {lang === "ar" ? "لوحة الدعم" : "Support Desk"}
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className={styles.drawerLink}
                    onClick={() => setMobileOpen(false)}
                  >
                    🛡️ {lang === "ar" ? "لوحة الإدارة" : "Admin Panel"}
                  </Link>
                )}
              </>
            )}

            <hr className={styles.drawerDivider} />

            {isAuthenticated ? (
              <button
                className={styles.drawerLink}
                onClick={handleLogout}
                style={{ color: "#dc2626" }}
              >
                🚪 {lang === "ar" ? "تسجيل الخروج" : "Sign Out"}
              </button>
            ) : (
              <Link
                to="/auth"
                className={styles.drawerLink}
                onClick={() => setMobileOpen(false)}
              >
                {t("common.login")} / {lang === "ar" ? "تسجيل" : "Register"}
              </Link>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
