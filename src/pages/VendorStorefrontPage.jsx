import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, ShoppingBag, Eye, ArrowLeft, MapPin, Package, TrendingUp, MessageSquare } from "lucide-react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import styles from "../styles/VendorStorefrontPage.module.css";

/* ── Mock Store Data ── */
const STORE = {
  id: "urban-threads",
  name: "Urban Threads",
  logo: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=120&h=120&fit=crop",
  banner: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&h=350&fit=crop",
  description: "Premium streetwear and urban fashion for the modern generation. Curated pieces that blend contemporary style with timeless elegance.",
  location: "Dubai, UAE",
  totalSold: 1284,
  rating: 4.7,
  reviewCount: 134,
  memberSince: "January 2023",
  categories: ["Dresses", "Sets", "Accessories", "Traditional"],
};

const PRODUCTS = [
  { id: 1, name: "Silk Evening Gown",   price: 389, image: "https://images.unsplash.com/photo-1566479179817-0b6cf9b3888e?w=300&h=400&fit=crop", category: "Dresses",   badge: "Best Seller" },
  { id: 2, name: "Cashmere Wrap Dress", price: 275, image: "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=300&h=400&fit=crop", category: "Dresses",   badge: null },
  { id: 3, name: "Embroidered Kaftan",  price: 450, image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=300&h=400&fit=crop", category: "Traditional", badge: "Limited" },
  { id: 4, name: "Linen Palazzo Set",   price: 195, image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=400&fit=crop", category: "Sets",       badge: "New" },
  { id: 5, name: "Beaded Clutch Bag",   price: 120, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&h=400&fit=crop", category: "Accessories", badge: null },
  { id: 6, name: "Pearl Drop Earrings", price:  89, image: "https://images.unsplash.com/photo-1630350276620-d30b91a09fa8?w=300&h=400&fit=crop", category: "Accessories", badge: null },
];

const REVIEWS = [
  { id: 1, author: "Sara Al-Rashid",   rating: 5, date: "March 2025", comment: "Amazing quality! The fabric is so luxurious. Will definitely order again.", avatar: "https://i.pravatar.cc/48?img=47" },
  { id: 2, author: "Nour Ahmed",       rating: 4, date: "February 2025", comment: "Fast shipping and beautiful packaging. Very happy with my purchase.", avatar: "https://i.pravatar.cc/48?img=32" },
  { id: 3, author: "Layla Hassan",     rating: 5, date: "January 2025", comment: "The embroidery detail is exquisite. Perfect for special occasions.", avatar: null },
];

function StarRow({ value, size = 14 }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1,2,3,4,5].map(n => (
        <Star key={n} size={size} fill={value >= n ? "var(--gold)" : "none"} stroke={value >= n ? "var(--gold)" : "var(--ivory-darker)"} />
      ))}
    </div>
  );
}

export default function VendorStorefrontPage() {
  const { id } = useParams();
  const [activeCategory, setActiveCategory] = useState("All");
  const [cartAdded, setCartAdded] = useState({});

  const categories = ["All", ...STORE.categories];
  const filtered = activeCategory === "All" ? PRODUCTS : PRODUCTS.filter(p => p.category === activeCategory);

  const addToCart = (productId) => {
    setCartAdded(prev => ({ ...prev, [productId]: true }));
    setTimeout(() => setCartAdded(prev => { const c = { ...prev }; delete c[productId]; return c; }), 1800);
  };

  return (
    <div className={styles.page}>
      <Header />

      {/* Banner */}
      <div className={styles.banner}>
        <img src={STORE.banner} alt={STORE.name} className={styles.bannerImg} />
        <div className={styles.bannerOverlay} />
        <Link to="/browse" className={styles.backBtn}>
          <ArrowLeft size={16} /> Back to Shop
        </Link>
      </div>

      <main className={styles.main}>
        {/* Store Header Card */}
        <div className={styles.storeCard}>
          <img src={STORE.logo} alt={STORE.name} className={styles.storeLogo} />
          <div className={styles.storeInfo}>
            <h1 className={styles.storeName}>{STORE.name}</h1>
            <div className={styles.storeMeta}>
              <div className={styles.ratingRow}>
                <StarRow value={Math.round(STORE.rating)} size={16} />
                <span className={styles.ratingVal}>{STORE.rating}</span>
                <span className={styles.ratingCount}>({STORE.reviewCount} reviews)</span>
              </div>
              <span className={styles.metaDivider}>·</span>
              <span className={styles.metaItem}><MapPin size={13} /> {STORE.location}</span>
              <span className={styles.metaDivider}>·</span>
              <span className={styles.metaItem}>Since {STORE.memberSince}</span>
            </div>
            <p className={styles.storeDesc}>{STORE.description}</p>
          </div>
          <div className={styles.storeStats}>
            <div className={styles.statItem}>
              <span className={styles.statVal}>{STORE.totalSold.toLocaleString()}</span>
              <span className={styles.statLbl}><Package size={12} /> Total Sold</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statVal}>{STORE.rating}</span>
              <span className={styles.statLbl}><Star size={12} /> Rating</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statVal}>{PRODUCTS.length}</span>
              <span className={styles.statLbl}><TrendingUp size={12} /> Products</span>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>All Products</h2>
            <div className={styles.categoryFilter}>
              {categories.map(cat => (
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

          <div className={styles.productsGrid}>
            {filtered.map(product => (
              <div key={product.id} className={styles.productCard}>
                <Link to={`/product/${product.id}`} className={styles.productImgWrap}>
                  <img src={product.image} alt={product.name} className={styles.productImg} />
                  {product.badge && <span className={styles.productBadge}>{product.badge}</span>}
                  <div className={styles.productOverlay}>
                    <Link to={`/product/${product.id}`} className={styles.tryOnBtn}>
                      <Eye size={16} /> Try On
                    </Link>
                  </div>
                </Link>
                <div className={styles.productInfo}>
                  <span className={styles.productCat}>{product.category}</span>
                  <Link to={`/product/${product.id}`} className={styles.productNameLink}>
                    <h3 className={styles.productName}>{product.name}</h3>
                  </Link>
                  <p className={styles.productPrice}>EGP {product.price.toLocaleString()}</p>
                  <button
                    className={`${styles.addCartBtn} ${cartAdded[product.id] ? styles.addCartBtnAdded : ""}`}
                    onClick={() => addToCart(product.id)}
                  >
                    {cartAdded[product.id] ? "✓ Added!" : <><ShoppingBag size={14} /> Add to Cart</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Reviews Section */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}><MessageSquare size={20} /> Customer Reviews</h2>
            <div className={styles.reviewSummary}>
              <StarRow value={Math.round(STORE.rating)} size={18} />
              <strong>{STORE.rating}</strong>
              <span style={{ color: "var(--charcoal-muted)", fontSize: 13 }}>({STORE.reviewCount} reviews)</span>
            </div>
          </div>
          <div className={styles.reviewsGrid}>
            {REVIEWS.map(review => (
              <div key={review.id} className={styles.reviewCard}>
                <div className={styles.reviewMeta}>
                  {review.avatar
                    ? <img src={review.avatar} alt={review.author} className={styles.reviewAvatar} />
                    : <div className={styles.reviewAvatarFallback}>{review.author[0]}</div>
                  }
                  <div>
                    <p className={styles.reviewAuthor}>{review.author}</p>
                    <p className={styles.reviewDate}>{review.date}</p>
                  </div>
                  <div style={{ marginLeft: "auto" }}><StarRow value={review.rating} /></div>
                </div>
                <p className={styles.reviewComment}>{review.comment}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
