import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, Trash2, Plus, Minus, Sparkles, Tag, ArrowRight, Loader2 } from "lucide-react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import LoadingSpinner from "../components/common/LoadingSpinner";
import apiClient from "../utils/apiClient";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import { formatPrice } from "../utils/formatPrice";
import styles from "../styles/CartPage.module.css";

export default function CartPage() {
  const { t, dir } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { refreshCartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyItems, setBusyItems] = useState(new Set());

  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const fetchCart = useCallback(async () => {
    try {
      const res = await apiClient.get("/cart");
      setCart(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      setError("Failed to load cart. Please try again.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const updateQuantity = async (variantId, newQty) => {
    if (busyItems.has(variantId)) return;
    
    setBusyItems(prev => new Set(prev).add(variantId));
    try {
      if (newQty <= 0) {
        await apiClient.delete(`/cart/items/${variantId}`);
      } else {
        await apiClient.patch(`/cart/items/${variantId}`, { quantity: newQty });
      }
      await fetchCart();
      await refreshCartCount();
    } catch (err) {
      console.error("Update quantity failed:", err);
    } finally {
      setBusyItems(prev => {
        const next = new Set(prev);
        next.delete(variantId);
        return next;
      });
    }
  };

  const removeItem = (variantId) => updateQuantity(variantId, 0);

  const applyPromo = (e) => {
    e.preventDefault();
    // Backend doesn't support promo codes yet, keeping frontend-only mock for UI
    if (promoCode.toUpperCase() === "AINAI20") {
      setDiscount(0.20);
    } else {
      alert("Invalid promo code");
      setDiscount(0);
    }
  };

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <Header />
        <main className={styles.fullHeightCenter}>
          <LoadingSpinner message="Loading your cart..." />
        </main>
        <Footer />
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const currency = cart?.currency || "EGP";
  // Backend doesn't provide shipping yet, mock 3000+ free rule (300000 piasters)
  const shipping = subtotal > 0 ? (subtotal >= 300000 ? 0 : 10000) : 0;
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
          {items.length > 0 && (
            <span className={styles.itemCount}>
              ({cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'})
            </span>
          )}
        </h1>

        {items.length === 0 ? (
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
              {items.map((item) => {
                const itemPrice = item.effectivePrice || 0;
                const itemTotal = itemPrice * item.quantity;
                const isBusy = busyItems.has(item.variantId);

                return (
                  <div key={item.variantId} className={`${styles.cartItem} ${isBusy ? styles.itemBusy : ''}`}>
                    <Link to={`/products/${item.productId}`} className={styles.itemImageLink}>
                      {item.primaryImageUrl ? (
                        <img src={item.primaryImageUrl} alt={item.productName} className={styles.itemImage} />
                      ) : (
                        <div className={styles.itemPlaceholder}>
                          {item.productName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </Link>

                    <div className={styles.itemDetails}>
                      <div className={styles.itemHeader}>
                        <Link to={`/products/${item.productId}`} className={styles.itemName}>
                          {item.productName}
                        </Link>
                        {/* Backend doesn't provide vtonTried in CartItem yet, omitting or keeping placeholder if desired */}
                      </div>

                      <p className={styles.itemMeta}>
                        {t("cart.size")}: {item.variantSize} | {t("cart.color")}: {item.variantColor}
                      </p>
                      <p className={styles.itemPrice}>{formatPrice(itemPrice, currency)}</p>

                      <div className={styles.itemActions}>
                        <div className={styles.quantityControl}>
                          <button 
                            className={`${styles.qtyBtn} click-bounce`} 
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)} 
                            disabled={isBusy}
                            aria-label="Decrease"
                          >
                            {isBusy ? <Loader2 size={12} className="animate-spin" /> : <Minus size={14} />}
                          </button>
                          <span className={styles.qtyVal}>{item.quantity}</span>
                          <button 
                            className={`${styles.qtyBtn} click-bounce`} 
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)} 
                            disabled={isBusy || item.quantity >= Math.min(item.availableQuantity, 5)}
                            aria-label="Increase"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button 
                          className={`${styles.removeBtn} click-bounce`} 
                          onClick={() => removeItem(item.variantId)}
                          disabled={isBusy}
                        >
                          <Trash2 size={15} /> {t("cart.remove")}
                        </button>
                      </div>
                    </div>

                    <div className={styles.itemTotal}>
                      <span className={styles.totalLabel}>{t("cart.total")}</span>
                      <span className={styles.totalAmount}>{formatPrice(itemTotal, currency)}</span>
                    </div>
                  </div>
                );
              })}
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
                    <span>{formatPrice(subtotal, currency)}</span>
                  </div>
                  {discount > 0 && (
                    <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                      <span>{t("cart.discount")} (20%)</span>
                      <span>- {formatPrice(discountAmount, currency)}</span>
                    </div>
                  )}
                  <div className={styles.summaryRow}>
                    <span>{t("cart.shipping")}</span>
                    <span>{shipping === 0 ? t("cart.free") : formatPrice(shipping, currency)}</span>
                  </div>
                </div>

                <div className={styles.summaryDivider} />

                <div className={styles.totalRow}>
                  <span>{t("cart.total")}</span>
                  <span>{formatPrice(total, currency)}</span>
                </div>

                {subtotal > 0 && subtotal < 300000 && (
                  <div className={styles.shippingNotice}>
                    Spend {formatPrice(300000 - subtotal, currency)} more to unlock Free Shipping
                  </div>
                )}

                <button 
                  className={`${styles.checkoutBtn} click-bounce`} 
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate("/auth", { state: { from: { pathname: "/checkout" } } });
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
