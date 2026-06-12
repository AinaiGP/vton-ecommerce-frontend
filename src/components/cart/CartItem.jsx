import { useState } from 'react';
import { X, Plus, Minus, Loader2 } from 'lucide-react';
import apiClient from '../../utils/apiClient';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatPrice';
import styles from '../../styles/CartItem.module.css';

/**
 * CartItem — renders a single ResolvedCartItem from the backend.
 *
 * Props:
 *   item       — ResolvedCartItem (productId, variantId, productName,
 *                variantColor, variantSize, effectivePrice, quantity,
 *                primaryImageUrl, availableQuantity, isAvailable)
 *   onCartChanged — callback: invoked after a successful update or remove
 */
export default function CartItem({ item, onCartChanged }) {
  const [busy, setBusy] = useState(false);
  const { refreshCartCount } = useCart();

  const price = item.effectivePrice ?? 0;
  const lineTotal = price * item.quantity;

  const updateQuantity = async (newQty) => {
    if (busy) return;
    setBusy(true);
    try {
      if (newQty <= 0) {
        // Remove the item
        await apiClient.delete(`/cart/items/${item.variantId}`);
      } else {
        // Update quantity — body field from UpdateCartItemDto: { quantity }
        await apiClient.patch(`/cart/items/${item.variantId}`, { quantity: newQty });
      }
      await refreshCartCount();
      onCartChanged?.();
    } catch (err) {
      console.error('Cart update failed:', err);
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = () => updateQuantity(0);

  return (
    <div className={`${styles.item} ${busy ? styles.itemBusy : ''}`}>
      {/* Image */}
      {item.primaryImageUrl ? (
        <img
          src={item.primaryImageUrl}
          alt={item.productName}
          className={styles.itemImage}
        />
      ) : (
        <div className={styles.itemImagePlaceholder}>
          {(item.productName || 'PR').slice(0, 2).toUpperCase()}
        </div>
      )}

      {/* Details */}
      <div className={styles.itemDetails}>
        <h3 className={styles.itemName}>{item.productName}</h3>
        <div className={styles.itemMeta}>
          {item.variantColor && <span>{item.variantColor}</span>}
          {item.variantColor && item.variantSize && <span> / </span>}
          {item.variantSize && <span>{item.variantSize}</span>}
        </div>
        {!item.isAvailable && (
          <p className={styles.unavailableNote}>⚠ Item no longer available</p>
        )}
        <p className={styles.itemPrice}>{formatPrice(price, item.currency)}</p>

        {/* Quantity Controls */}
        <div className={styles.quantityControls}>
          <button
            className={styles.quantityButton}
            onClick={() => updateQuantity(item.quantity - 1)}
            disabled={busy}
            aria-label="Decrease quantity"
          >
            {busy ? <Loader2 size={14} className={styles.spin} /> : <Minus size={14} />}
          </button>
          <span className={styles.quantity}>{item.quantity}</span>
          <button
            className={styles.quantityButton}
            onClick={() => updateQuantity(item.quantity + 1)}
            disabled={busy || item.quantity >= item.availableQuantity}
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Total & Remove */}
      <div className={styles.itemActions}>
        <p className={styles.itemTotal}>{formatPrice(lineTotal, item.currency)}</p>
        <button
          className={styles.removeButton}
          onClick={handleRemove}
          disabled={busy}
          aria-label="Remove from cart"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
