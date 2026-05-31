import { useState } from "react";
import { ShoppingBag, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "../../styles/ProductCard.module.css";
import {
  formatPrice,
  getProductImage,
  getVariantImageForColor,
  getUniqueColors,
  getSizeRange,
} from "../../utils/productHelpers";
import { useLanguage } from "../../context/LanguageContext";

/* ─── Mini star row ─── */
function Stars({ value }) {
  return (
    <span className={styles.stars}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={12}
          fill={value >= n ? "var(--gold)" : "none"}
          stroke={value >= n ? "var(--gold)" : "#ccc"}
        />
      ))}
    </span>
  );
}

export default function ProductCard({ product }) {
  const { t } = useLanguage();
  const [activeColorId, setActiveColorId] = useState(null);

  if (!product) return null;

  const defaultImageUrl = getProductImage(product);
  const colors = getUniqueColors(product);
  const sizeRange = getSizeRange(product);
  const rating = parseFloat(product.averageRating) || 0;
  const reviews = product.totalReviews ?? 0;

  // Image changes based on selected color
  let imageUrl = defaultImageUrl;
  if (activeColorId) {
    imageUrl = getVariantImageForColor(product, activeColorId) || imageUrl;
  }

  const maxVisibleColors = 4;
  const visibleColors = colors.slice(0, maxVisibleColors);
  const remainingColorsCount = colors.length - maxVisibleColors;
  const availableQuantities = (product.variants || [])
    .map(
      (variant) =>
        (variant?.physicalQuantity ?? 0) - (variant?.reservedQuantity ?? 0),
    )
    .filter((qty) => Number.isFinite(qty));
  const positiveAvailable = availableQuantities.filter((qty) => qty > 0);
  const availableQty = positiveAvailable.length
    ? Math.min(...positiveAvailable)
    : 0;
  const isLowStock = availableQty > 0 && availableQty < 10;

  return (
    <div className={styles.card}>
      {/* ── Image ── */}
      <Link to={`/product/${product.id}`} className={styles.imageWrapper}>
        {isLowStock && (
          <span className={styles.lowStockBadge}>Only {availableQty} left</span>
        )}
        {/* Product image */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className={styles.productImage}
            loading="lazy"
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span>{product.name?.charAt(0)}</span>
          </div>
        )}
      </Link>

      {/* ── Info ── */}
      <div className={styles.productInfo}>
        {/* Brand */}
        {product.vendor?.brandName && (
          <Link
            to={`/vendors/storefront/${product.vendor.id}`}
            className={styles.brandLink}
          >
            <p className={styles.brandName}>{product.vendor.brandName}</p>
          </Link>
        )}

        {/* Name */}
        <Link to={`/product/${product.id}`} className={styles.productNameLink}>
          <h3 className={styles.productName}>{product.name}</h3>
        </Link>

        {/* Rating row */}
        <div className={styles.ratingRow}>
          {reviews > 0 ? (
            <>
              <Stars value={Math.round(rating)} />
              <span className={styles.ratingValue}>{rating.toFixed(1)}</span>
              <span className={styles.reviewCount}>({reviews})</span>
            </>
          ) : (
            <div className={styles.noReviews}>
              <Stars value={0} />
              <span className={styles.noReviewsText}>? (0)</span>
            </div>
          )}
        </div>

        {/* Summary Info (Colors + Sizes) */}
        <div className={styles.summaryInfo}>
          {colors.length > 0 && (
            <div className={styles.badgeList}>
              {visibleColors.map((c) => (
                <button
                  key={c.id}
                  className={`${styles.badgeItem} ${activeColorId === c.id ? styles.badgeItemActive : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveColorId(c.id);
                  }}
                  aria-label={c.name}
                  title={c.name}
                >
                  {c.name}
                </button>
              ))}
              {remainingColorsCount > 0 && (
                <span className={styles.colorsRemaining}>
                  +{remainingColorsCount}
                </span>
              )}
            </div>
          )}

          {sizeRange && (
            <div className={styles.badgeList}>
              <span className={styles.badgeItem}>{sizeRange}</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className={styles.priceRow}>
          <p className={styles.productPrice}>
            {formatPrice(product.basePrice, product.currency)}
          </p>
        </div>

        {/* Actions */}
        <Link to={`/product/${product.id}`} className={styles.viewDetailsBtn}>
          <span>{t("View Product")}</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
