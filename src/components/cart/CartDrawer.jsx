import { X } from 'lucide-react';
import CartItem from './CartItem';
import styles from '../../styles/CartDrawer.module.css';

export default function CartDrawer({ isOpen, onClose, items = [] }) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

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
          <h2 className={styles.drawerTitle}>Shopping Cart</h2>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close cart"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        {items.length > 0 ? (
          <>
            {/* Items */}
            <div className={styles.drawerItems}>
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  image={item.image}
                  name={item.name}
                  price={item.price}
                  quantity={item.quantity}
                  onQuantityChange={(qty) => console.log('Update qty:', item.id, qty)}
                  onRemove={() => console.log('Remove:', item.id)}
                />
              ))}
            </div>

            {/* Summary */}
            <div className={styles.cartSummary}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>EGP {subtotal.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Tax</span>
                <span>EGP {tax.toFixed(2)}</span>
              </div>
              <div className={styles.summaryDivider} />
              <div className={styles.summaryTotal}>
                <span>Total</span>
                <span>EGP {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button className={styles.checkoutButton}>
              Proceed to Checkout
            </button>
          </>
        ) : (
          <div className={styles.emptyCart}>
            <div className={styles.emptyIcon}>🛍</div>
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
