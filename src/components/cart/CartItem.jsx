import { X, Plus, Minus } from 'lucide-react';
import styles from '../../styles/CartItem.module.css';

export default function CartItem({ image, name, price, quantity, onQuantityChange, onRemove }) {
  return (
    <div className={styles.item}>
      {/* Image */}
      <img src={image} alt={name} className={styles.itemImage} />

      {/* Details */}
      <div className={styles.itemDetails}>
        <h3 className={styles.itemName}>{name}</h3>
        <p className={styles.itemPrice}>EGP {price.toFixed(2)}</p>

        {/* Quantity Controls */}
        <div className={styles.quantityControls}>
          <button 
            className={styles.quantityButton}
            onClick={() => onQuantityChange?.(quantity - 1)}
            aria-label="Decrease quantity"
          >
            <Minus size={16} />
          </button>
          <span className={styles.quantity}>{quantity}</span>
          <button 
            className={styles.quantityButton}
            onClick={() => onQuantityChange?.(quantity + 1)}
            aria-label="Increase quantity"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Total & Remove */}
      <div className={styles.itemActions}>
        <p className={styles.itemTotal}>EGP {(price * quantity).toFixed(2)}</p>
        <button
          className={styles.removeButton}
          onClick={onRemove}
          aria-label="Remove from cart"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
