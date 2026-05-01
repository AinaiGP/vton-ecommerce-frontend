import { useEffect, useState } from 'react';
import { X, ShoppingBag, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CartItem from './CartItem';
import apiClient from '../../utils/apiClient';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import styles from '../../styles/CartDrawer.module.css';

/**
 * CartDrawer — slide-in panel showing real cart from GET /cart.
 *
 * Props:
 *   isOpen  — boolean
 *   onClose — callback
 */
export default function CartDrawer({ isOpen, onClose }) {
  const { isAuthenticated } = useAuth();
  const { cartCount, refreshCartCount } = useCart();
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/cart');
      setCart(res.data);
    } catch (err) {
      setError('Could not load cart.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch whenever the drawer opens
  useEffect(() => {
    if (isOpen) {
      fetchCart();
    }
  }, [isOpen]);

  const handleCartChanged = () => {
    fetchCart();
    refreshCartCount();
  };

  const handleCheckout = () => {
    onClose();
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  // Prices come in piasters from the backend — divide by 100 for display
  const subtotal = cart ? cart.subtotal / 100 : 0;
  const currency = cart?.currency ?? 'EGP';

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className={styles.overlay} onClick={onClose} />
      )}

      {/* Drawer */}
      <div className={`${styles.drawer} ${isOpen ? styles.open : ''}`}>
        {/* Header */}
        <div className={styles.drawerHeader}>
          <h2 className={styles.drawerTitle}>
            Shopping Cart
            {cartCount > 0 && (
              <span className={styles.itemBadge}>{cartCount}</span>
            )}
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close cart"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className={styles.loadingState}>
            <Loader2 size={32} className={styles.spin} />
            <p>Loading cart…</p>
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            <p>{error}</p>
            <button className={styles.retryBtn} onClick={fetchCart}>
              Retry
            </button>
          </div>
        ) : cart && cart.items.length > 0 ? (
          <>
            {/* Items */}
            <div className={styles.drawerItems}>
              {cart.items.map((item) => (
                <CartItem
                  key={item.variantId}
                  item={item}
                  onCartChanged={handleCartChanged}
                />
              ))}
            </div>

            {/* Summary */}
            <div className={styles.cartSummary}>
              <div className={styles.summaryRow}>
                <span>Subtotal ({cart.totalItems} items)</span>
                <span>{currency} {subtotal.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className={styles.summaryDivider} />
              <div className={styles.summaryTotal}>
                <span>Subtotal</span>
                <span>{currency} {subtotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button className={styles.checkoutButton} onClick={handleCheckout}>
              Proceed to Checkout <ArrowRight size={16} />
            </button>
            <button className={styles.viewCartBtn} onClick={() => { onClose(); navigate('/cart'); }}>
              View Full Cart
            </button>
          </>
        ) : (
          <div className={styles.emptyCart}>
            <div className={styles.emptyIcon}>
              <ShoppingBag size={52} strokeWidth={1.2} />
            </div>
            <h3 className={styles.emptyTitle}>Your Cart is Empty</h3>
            <p className={styles.emptyMessage}>
              Start shopping to add items to your cart
            </p>
            <button className={styles.continueShopping} onClick={onClose}>
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
