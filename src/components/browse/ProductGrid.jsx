import ProductCard from "../common/ProductCard";
import LoadingSpinner from "../common/LoadingSpinner";
import { useLanguage } from "../../context/LanguageContext";
import styles from "../../styles/ProductGrid.module.css";

export default function ProductGrid({
  products = [],
  loading = false,
  error = null,
  onTryOn,
}) {
  const { t } = useLanguage();

  return (
    <div className={styles.gridWrapper}>
      <div className={styles.gridContainer}>
        {loading ? (
          <div className={styles.loadingState}>
            <LoadingSpinner message={t("browse.loading")} />
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            <h3 className={styles.emptyTitle}>{t("common.error")}</h3>
            <p className={styles.emptyMessage}>{error}</p>
          </div>
        ) : products.length > 0 ? (
          <div className={styles.productsGrid}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onTryOn={() => onTryOn?.(product.id)}
                onAddToCart={() => console.log("Cart Phase 4:", product.id)}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>∅</div>
            <h3 className={styles.emptyTitle}>{t("browse.no_products")}</h3>
            <p className={styles.emptyMessage}>
              {t("browse.try_adjusting")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
