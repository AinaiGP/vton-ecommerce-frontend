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
  User,
} from "lucide-react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import ProductCard from "../components/common/ProductCard";
import styles from "../styles/VendorStorefrontPage.module.css";
import apiClient from "../utils/apiClient";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStoreData();
  }, [id]);

  const fetchStoreData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Public endpoint: GET /vendors/:id/store
      const storeRes = await apiClient.get(`/vendors/${id}/store`);
      setStore(storeRes.data);

      // Public endpoint: GET /products?brandIds=:id
      const productsRes = await apiClient.get(`/products?brandIds=${id}&limit=50`);
      const rawProducts = productsRes.data?.data || productsRes.data || [];
      // Normalize product fields to handle backend shape
      setProducts(
        rawProducts.map((p) => ({
          ...p,
          // Price is stored as integer cents/piasters — convert to readable float
          displayPrice: p.basePrice != null ? (p.basePrice / 100).toFixed(2) : p.price ?? 0,
          // Category is a relation object with a name field
          categoryName: p.category?.name ?? p.category ?? "",
          // First image from the images relation array
          mainImageUrl: p.images?.[0]?.url ?? p.mainImage ?? null,
        }))
      );
      // Public endpoint: GET /vendors/:id/reviews
      const reviewsRes = await apiClient.get(`/vendors/${id}/reviews`);
      const rawReviews = reviewsRes.data?.data || [];
      setReviews(
        rawReviews.map((r) => ({
          id: r.id,
          author: r.customerName || "Customer",
          avatar: null, // No customer avatar currently in DB
          date: new Date(r.createdAt).toLocaleDateString(),
          rating: Number(r.rating) || 5,
          comment: r.comment || "",
        }))
      );
    } catch (err) {
      console.error("Failed to fetch store data", err);
      setError("Failed to load storefront.");
    } finally {
      setLoading(false);
    }
  };

  const categories = ["All", ...new Set(products.map((p) => p.categoryName).filter(Boolean))];
  const filtered =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.categoryName === activeCategory);
  const bannerSrc = store?.bannerUrl;
  const storeName = store?.brandName || store?.storeName || "Store";
  const storeRating = store?.averageRating ? parseFloat(store.averageRating) : 5.0;
  const reviewCount = store?.totalRatings ?? 0;

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
        {loading ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Package size={28} style={{ animation: "spin 1s linear infinite" }} />
            </div>
            <h3 className={styles.emptyTitle}>Loading storefront…</h3>
          </div>
        ) : error ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><Package size={28} /></div>
            <h3 className={styles.emptyTitle}>Storefront unavailable</h3>
            <p className={styles.emptyText}>{error}</p>
          </div>
        ) : !store ? (
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
              <div className={styles.storeLogoWrap}>
                {store.logoUrl ? (
                  <img
                    src={store.logoUrl}
                    alt={storeName}
                    className={styles.storeLogo}
                  />
                ) : (
                  <div className={styles.storeLogoFallback} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={48} color="#999" />
                  </div>
                )}
              </div>
              <div className={styles.storeInfo}>
                <h1 className={styles.storeName}>{storeName}</h1>
                <div className={styles.storeMeta}>
                  <div className={styles.ratingRow}>
                    <StarRow value={Math.round(storeRating)} size={16} />
                    <span className={styles.ratingVal}>{storeRating.toFixed(1)}</span>
                    <span className={styles.ratingCount}>
                      ({reviewCount} reviews)
                    </span>
                  </div>
                  <span className={styles.metaDivider}>·</span>
                  <span className={styles.metaItem}>
                    <MapPin size={13} /> {store.country || "UAE"}
                  </span>
                  <span className={styles.metaDivider}>·</span>
                  <span className={styles.metaItem}>
                    Since {new Date(store.createdAt || Date.now()).getFullYear()}
                  </span>
                </div>
                <p className={styles.storeDesc}>{store.description || "Welcome to our store!"}</p>
              </div>
              <div className={styles.storeStats}>
                <div className={styles.statItem}>
                  <span className={styles.statVal}>
                    {(store.totalSold || 0).toLocaleString()}
                  </span>
                  <span className={styles.statLbl}>
                    <Package size={12} /> Total Sold
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statVal}>{storeRating.toFixed(1)}</span>
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
                    <div key={product.id} style={{ minWidth: 220 }}>
                      <ProductCard product={product} />
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
                  <StarRow value={Math.round(storeRating)} size={18} />
                  <strong>{storeRating.toFixed(1)}</strong>
                  <span className={styles.reviewCount}>
                    ({reviewCount} reviews)
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
