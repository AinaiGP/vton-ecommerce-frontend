import { Download, Share2, ShoppingBag, Heart } from 'lucide-react';
import styles from '../../styles/TryOnResult.module.css';

export default function TryOnResult({ resultImage, productName, productPrice }) {
  return (
    <div className={styles.resultContainer}>
      {/* Image Section */}
      <div className={styles.resultImageWrapper}>
        <img 
          src={resultImage} 
          alt="Try-on result" 
          className={styles.resultImage}
        />
      </div>

      {/* Info Section */}
      <div className={styles.resultInfo}>
        <h2 className={styles.productTitle}>{productName}</h2>
        <p className={styles.productPrice}>EGP {productPrice.toFixed(2)}</p>
        <p className={styles.resultNote}>
          This is your personalized try-on result. See how this style looks on you!
        </p>
      </div>

      {/* Actions */}
      <div className={styles.resultActions}>
        <button className={styles.actionButton} title="Save to favorites">
          <Heart size={20} />
          <span>Save</span>
        </button>
        <button className={styles.actionButton} title="Download image">
          <Download size={20} />
          <span>Download</span>
        </button>
        <button className={styles.actionButton} title="Share with friends">
          <Share2 size={20} />
          <span>Share</span>
        </button>
      </div>

      {/* Primary Action */}
      <button className={styles.buyNowButton}>
        <ShoppingBag size={20} />
        <span>Buy Now</span>
      </button>

      {/* Secondary Actions */}
      <div className={styles.secondaryActions}>
        <button className={styles.tryAnotherButton}>
          Try Another Style
        </button>
        <button className={styles.continueShoppingButton}>
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
