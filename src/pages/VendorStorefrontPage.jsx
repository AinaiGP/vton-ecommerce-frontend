import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Star,
  ShoppingBag,
  Eye,
  ArrowLeft,
  MapPin,
  Package,
  TrendingUp,
  MessageSquare,
} from "lucide-react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import styles from "../styles/VendorStorefrontPage.module.css";

function StarRow({ value, size = 14 }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          fill={value >= n ? "var(--gold)" : "none"}
          stroke={value >= n ? "var(--gold)" : "var(--ivory-darker)"}
        />
      ))}
    </div>
  );
}

export default function VendorStorefrontPage() {
  const { id } = useParams();
  const [activeCategory, setActiveCategory] = useState("All");
  const [cartAdded, setCartAdded] = useState({});
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    // TODO: wire to real API endpoint — Phase X
    setStore(null);
    setProducts([]);
    setReviews([]);
  }, [id]);

  const categories = ["All", ...(store?.categories || [])];
  const filtered =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);
  const bannerSrc = store?.banner;
  const storeName = store?.name || "Store";

  const addToCart = (productId) => {
    setCartAdded((prev) => ({ ...prev, [productId]: true }));
    setTimeout(
      () =>
        setCartAdded((prev) => {
          const c = { ...prev };
          delete c[productId];
          return c;
        }),
      1800,
    );
  };

  return (
    <div className={styles.page}>
      <Header />

      {/* Banner */}
      <div className={styles.banner}>
        {bannerSrc ? (
          <img src={bannerSrc} alt={storeName} className={styles.bannerImg} />
        ) : (
          <div className={styles.bannerFallback} />
        )}
        <div className={styles.bannerOverlay} />
        <Link to="/browse" className={styles.backBtn}>
          <ArrowLeft size={16} /> Back to Shop
        </Link>
      </div>

      <main className={styles.main}>
        {!store ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <StoreIcon />
            </div>
            <h3 className={styles.emptyTitle}>No data yet.</h3>
            <p className={styles.emptyText}>
              Storefront details will appear once this vendor is connected.
            </p>
          </div>
        ) : (
          <>
            {/* Store Header Card */}
            <div className={styles.storeCard}>
              <img
                src={store.logo}
                alt={store.name}
                className={styles.storeLogo}
              />
              <div className={styles.storeInfo}>
                <h1 className={styles.storeName}>{store.name}</h1>
                <div className={styles.storeMeta}>
                  <div className={styles.ratingRow}>
                    <StarRow value={Math.round(store.rating)} size={16} />
                    <span className={styles.ratingVal}>{store.rating}</span>
                    <span className={styles.ratingCount}>
                      ({store.reviewCount} reviews)
                    </span>
                  </div>
                  <span className={styles.metaDivider}>·</span>
                  <span className={styles.metaItem}>
                    <MapPin size={13} /> {store.location}
                  </span>
                  <span className={styles.metaDivider}>·</span>
                  <span className={styles.metaItem}>
                    Since {store.memberSince}
                  </span>
                </div>
                <p className={styles.storeDesc}>{store.description}</p>
              </div>
              <div className={styles.storeStats}>
                <div className={styles.statItem}>
                  <span className={styles.statVal}>
                    {store.totalSold.toLocaleString()}
                  </span>
                  <span className={styles.statLbl}>
                    <Package size={12} /> Total Sold
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statVal}>{store.rating}</span>
                  <span className={styles.statLbl}>
                    <Star size={12} /> Rating
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statVal}>{products.length}</span>
                  <span className={styles.statLbl}>
                    <TrendingUp size={12} /> Products
                  </span>
                </div>
              </div>
            </div>

            {/* Products Section */}
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>All Products</h2>
                <div className={styles.categoryFilter}>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      className={`${styles.catBtn} ${activeCategory === cat ? styles.catBtnActive : ""}`}
                      onClick={() => setActiveCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <Package size={24} />
                  </div>
                  <h3 className={styles.emptyTitle}>No data yet.</h3>
                  <p className={styles.emptyText}>
                    Products will appear once this vendor is connected.
                  </p>
                </div>
              ) : (
                <div className={styles.productsGrid}>
                  {filtered.map((product) => (
                    <div key={product.id} className={styles.productCard}>
                      <Link
                        to={`/product/${product.id}`}
                        className={styles.productImgWrap}
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className={styles.productImg}
                        />
                        {product.badge && (
                          <span className={styles.productBadge}>
                            {product.badge}
                          </span>
                        )}
                        <div className={styles.productOverlay}>
                          <Link
                            to={`/product/${product.id}`}
                            className={styles.tryOnBtn}
                          >
                            <Eye size={16} /> Try On
                          </Link>
                        </div>
                      </Link>
                      <div className={styles.productInfo}>
                        <span className={styles.productCat}>
                          {product.category}
                        </span>
                        <Link
                          to={`/product/${product.id}`}
                          className={styles.productNameLink}
                        >
                          <h3 className={styles.productName}>{product.name}</h3>
                        </Link>
                        <p className={styles.productPrice}>
                          EGP {product.price.toLocaleString()}
                        </p>
                        <button
                          className={`${styles.addCartBtn} ${cartAdded[product.id] ? styles.addCartBtnAdded : ""}`}
                          onClick={() => addToCart(product.id)}
                        >
                          {cartAdded[product.id] ? (
                            "✓ Added!"
                          ) : (
                            <>
                              <ShoppingBag size={14} /> Add to Cart
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Reviews Section */}
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>
                  <MessageSquare size={20} /> Customer Reviews
                </h2>
                <div className={styles.reviewSummary}>
                  <StarRow value={Math.round(store.rating)} size={18} />
                  <strong>{store.rating}</strong>
                  <span className={styles.reviewCount}>
                    ({store.reviewCount} reviews)
                  </span>
                </div>
              </div>
              {reviews.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <MessageSquare size={24} />
                  </div>
                  <h3 className={styles.emptyTitle}>No data yet.</h3>
                  <p className={styles.emptyText}>
                    Reviews will appear once this vendor is connected.
                  </p>
                </div>
              ) : (
                <div className={styles.reviewsGrid}>
                  {reviews.map((review) => (
                    <div key={review.id} className={styles.reviewCard}>
                      <div className={styles.reviewMeta}>
                        {review.avatar ? (
                          <img
                            src={review.avatar}
                            alt={review.author}
                            className={styles.reviewAvatar}
                          />
                        ) : (
                          <div className={styles.reviewAvatarFallback}>
                            {review.author[0]}
                          </div>
                        )}
                        <div>
                          <p className={styles.reviewAuthor}>{review.author}</p>
                          <p className={styles.reviewDate}>{review.date}</p>
                        </div>
                        <div className={styles.reviewStars}>
                          <StarRow value={review.rating} />
                        </div>
                      </div>
                      <p className={styles.reviewComment}>{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function StoreIcon() {
  return <Package size={28} />;
}
