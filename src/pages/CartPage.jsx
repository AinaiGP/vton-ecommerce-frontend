import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, Trash2, Plus, Minus, Sparkles, Tag, ArrowRight } from "lucide-react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import styles from "../styles/CartPage.module.css";

// Rich mock data simulating VTON history
export default function CartPage() {
  const { t, dir } = useLanguage();
  const [cartItems, setCartItems] = useState([]);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount]   = useState(0);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // TODO: wire to real API endpoint — Phase X
  }, []);

  const updateQuantity = (id, delta) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const applyPromo = (e) => {
    e.preventDefault();
    if (promoCode.toUpperCase() === "AINAI20") {
      setDiscount(0.20);
    } else {
      alert("Invalid promo code");
      setDiscount(0);
    }
  };

  const subtotal = cartItems.reduce((s, i) => s + (i.price * i.quantity), 0);
  const shipping = subtotal > 0 ? (subtotal >= 500 ? 0 : 25) : 0;
  const discountAmount = subtotal * discount;
  const total = subtotal - discountAmount + shipping;

  return (
    <div className={styles.pageWrapper}>
      <Header />

      <main className={`${styles.mainContent} animate-fade-in`}>
        <nav className={styles.breadcrumb}>
          <Link to="/">{t("common.home")}</Link>
          <span className={styles.sep}>/</span>
          <span className={styles.current}>{t("cart.title")}</span>
        </nav>

        <h1 className={styles.pageTitle}>
          {t("cart.title")}
          {cartItems.length > 0 && (
            <span className={styles.itemCount}>
              ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)
            </span>
          )}
        </h1>

        {cartItems.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <ShoppingBag size={80} strokeWidth={1} />
            </div>
            <h2 className={styles.emptyTitle}>{t("cart.empty")}</h2>
            <p className={styles.emptyMessage}>
              {t("cart.emptySub")}
            </p>
            <Link to="/browse" className={styles.browseCta}>
              {t("cart.startShopping")} <ArrowRight size={18} style={{ transform: dir === 'rtl' ? 'rotate(180deg)' : 'none' }} />
            </Link>
          </div>
        ) : (
          <div className={styles.cartLayout}>
            {/* Items List */}
            <section className={`${styles.itemsSection} stagger-reveal active`}>
              {cartItems.map((item) => (
                <div key={item.id} className={styles.cartItem}>
                  <Link to={`/product/${item.id}`} className={styles.itemImageLink}>
                    <img src={item.image} alt={item.name} className={styles.itemImage} />
                  </Link>

                  <div className={styles.itemDetails}>
                    <div className={styles.itemHeader}>
                      <Link to={`/product/${item.id}`} className={styles.itemName}>
                        {item.name}
                      </Link>
                      {item.vtonTried && (
                        <div className={styles.vtonBadge} title="You tried this on virtually">
                          <Sparkles size={12} /> {t("cart.triedBefore")}
                        </div>
                      )}
                    </div>

                    <p className={styles.itemMeta}>{t("cart.size")}: {item.size} | {t("cart.color")}: {item.color}</p>
                    <p className={styles.itemPrice}>EGP {item.price.toFixed(2)}</p>

                    <div className={styles.itemActions}>
                      <div className={styles.quantityControl}>
                        <button className={`${styles.qtyBtn} click-bounce`} onClick={() => updateQuantity(item.id, -1)} aria-label="Decrease">
                          <Minus size={14} />
                        </button>
                        <span className={styles.qtyVal}>{item.quantity}</span>
                        <button className={`${styles.qtyBtn} click-bounce`} onClick={() => updateQuantity(item.id, 1)} aria-label="Increase">
                          <Plus size={14} />
                        </button>
                      </div>
                      <button className={`${styles.removeBtn} click-bounce`} onClick={() => removeItem(item.id)}>
                        <Trash2 size={15} /> {t("cart.remove")}
                      </button>
                    </div>
                  </div>

                  <div className={styles.itemTotal}>
                    <span className={styles.totalLabel}>{t("cart.total")}</span>
                    <span className={styles.totalAmount}>EGP {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </section>

            {/* Order Summary & Promo */}
            <aside className={styles.summarySidebar}>
              <div className={styles.summaryCard}>
                <h3 className={styles.summaryTitle}>{t("cart.summary")}</h3>

                <form className={styles.promoForm} onSubmit={applyPromo}>
                  <div className={styles.promoInputGroup}>
                    <Tag size={16} className={styles.promoIcon} style={{ right: dir === 'rtl' ? '14px' : 'auto', left: dir === 'rtl' ? 'auto' : '14px' }} />
                    <input 
                      type="text" 
                      placeholder={t("cart.promoPlaceholder")} 
                      value={promoCode} 
                      onChange={e => setPromoCode(e.target.value)} 
                      className={styles.promoInput}
                      style={{ padding: dir === 'rtl' ? '0 40px 0 14px' : '0 14px 0 40px' }}
                    />
                  </div>
                  <button type="submit" className={`${styles.promoBtn} click-bounce`}>{t("cart.apply")}</button>
                </form>

                <div className={styles.summaryRows}>
                  <div className={styles.summaryRow}>
                    <span>{t("cart.subtotal")}</span>
                    <span>EGP {subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                      <span>{t("cart.discount")} (20%)</span>
                      <span>- EGP {discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className={styles.summaryRow}>
                    <span>{t("cart.shipping")}</span>
                    <span>{shipping === 0 ? t("cart.free") : `EGP ${shipping.toFixed(2)}`}</span>
                  </div>
                </div>

                <div className={styles.summaryDivider} />

                <div className={styles.totalRow}>
                  <span>{t("cart.total")}</span>
                  <span>EGP {total.toFixed(2)}</span>
                </div>

                {subtotal > 0 && subtotal < 500 && (
                  <div className={styles.shippingNotice}>
                    Spend EGP {(500 - subtotal).toFixed(2)} more to unlock Free Shipping
                  </div>
                )}

                <button 
                  className={`${styles.checkoutBtn} click-bounce`} 
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate("/auth", { state: { from: location } });
                      return;
                    }
                    navigate("/checkout");
                  }}
                >
                  {t("cart.proceed")} <ArrowRight size={18} style={{ transform: dir === 'rtl' ? 'rotate(180deg)' : 'none' }} />
                </button>
                <Link to="/browse" className={styles.continueLink}>
                  {t("cart.continue")}
                </Link>
              </div>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
