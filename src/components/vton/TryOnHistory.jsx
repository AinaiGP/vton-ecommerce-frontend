import { Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../../styles/TryOnHistory.module.css';

export default function TryOnHistory({ items = [] }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📷</div>
        <h2 className={styles.emptyTitle}>No Try-Ons Yet</h2>
        <p className={styles.emptyMessage}>
          Start exploring our collection and create your first virtual try-on!
        </p>
        <Link to="/browse" className={styles.browseButton}>
          Browse Collection
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.historyContainer}>
      <div className={styles.historyHeader}>
        <h2 className={styles.historyTitle}>Your Try-On History</h2>
        <p className={styles.historySubtitle}>
          {items.length} try-on{items.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      <div className={styles.historyGrid}>
        {items.map((item) => (
          <div key={item.id} className={styles.historyCard}>
            {/* Thumbnail */}
            <div className={styles.thumbnailWrapper}>
              <img 
                src={item.image} 
                alt={item.productName}
                className={styles.thumbnail}
              />
              <div className={styles.thumbnailOverlay}>
                <button className={styles.viewButton} title="View details">
                  <Eye size={20} />
                  <span>View</span>
                </button>
              </div>
            </div>

            {/* Info */}
            <div className={styles.cardInfo}>
              <h3 className={styles.cardProductName}>{item.productName}</h3>
              <p className={styles.cardProductPrice}>EGP {item.productPrice.toFixed(2)}</p>
              <p className={styles.cardDate}>{formatDate(item.dateCreated)}</p>
            </div>

            {/* Delete Button */}
            <button 
              className={styles.deleteButton}
              title="Delete try-on"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
