import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import styles from "../styles/HomePage.module.css";
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  ArrowRight,
  Play,
  Camera,
  Shirt,
  UserCheck,
  Star,
  Quote,
  ExternalLink,
  ShoppingBag,
  Headphones,
  Lock,
  X,
  HelpCircle,
} from "lucide-react";
import apiClient from "../utils/apiClient";
import ProductCard from "../components/common/ProductCard";

export default function HomePage() {
  const { isAuthenticated, userRole } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [exploreOverlayOpen, setExploreOverlayOpen] = useState(false);
  const [showPromo, setShowPromo] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("ainai_promo_dismissed") !== "true";
    }
    return true;
  });

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const response = await apiClient.get(
          "/products?sort=POPULAR&limit=4&page=1",
        );
        if (response.data?.data) {
          setFeaturedProducts(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch popular products:", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchPopular();
    const interval = setInterval(fetchPopular, 5 * 60 * 1000); // 5 minutes refresh
    return () => clearInterval(interval);
  }, []);





  return (
    <div className={styles.page}>
      {showPromo && (
        <div className={styles.promoBar}>
          <p>
            {lang === "ar"
              ? "استمتع بخصم 20٪ على طلبك الأول وشحن مجاني للطلبات فوق 3000 ج.م"
              : "Enjoy 20% off on your first purchase & Free Shipping on Orders Over EGP 3000.00"}
          </p>
          <button 
            className={styles.promoClose} 
            onClick={() => {
              setShowPromo(false);
              sessionStorage.setItem("ainai_promo_dismissed", "true");
            }}
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <Header />

      <section className={`${styles.heroNew} animate-fade-in`}>
        <div className={styles.heroContainer}>
          <video autoPlay loop muted playsInline className={styles.heroVideo}>
            <source src="/hero-bg.mp4" type="video/mp4" />
          </video>
          <div className={styles.heroVideoOverlay} />
          <div className={styles.heroOverlayContent}>
            <div className={`${styles.heroButtonsNew} stagger-reveal active`}>
              <Link to="/browse" className={styles.btnSolid}>
                {lang === "ar" ? "تسوق الآن" : "Shop Now"}
              </Link>
              <button
                onClick={() => setExploreOverlayOpen(true)}
                className={styles.btnOutline}
              >
                {lang === "ar" ? "اكتشف المجموعة" : "Explore Collection"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── EXPLORE OVERLAY ── */}
      {exploreOverlayOpen && (
        <div className={styles.exploreOverlay}>
          <div className={styles.exploreBlurBg} />
          <button
            className={styles.exploreCloseBtn}
            onClick={() => setExploreOverlayOpen(false)}
          >
            <X size={32} />
          </button>
          <div className={styles.exploreOverlayContent}>
            <h2 className={styles.exploreOverlayTitle}>
              {lang === "ar" ? "اكتشف مجموعتنا" : "Explore Our Collection"}
            </h2>
            <div className={styles.exploreCardsGrid}>
              <Link
                to="/browse?gender=MEN"
                className={styles.exploreCard}
                onClick={() => setExploreOverlayOpen(false)}
              >
                <div className={styles.exploreCardImgWrap}>
                  <img src="/men_collection.png" alt="Men" />
                </div>
                <h3 className={styles.exploreCardTitle}>
                  {lang === "ar" ? "رجال" : "MEN"}
                </h3>
              </Link>
              <Link
                to="/browse?gender=WOMEN"
                className={styles.exploreCard}
                onClick={() => setExploreOverlayOpen(false)}
              >
                <div className={styles.exploreCardImgWrap}>
                  <img src="/women_collection.png" alt="Women" />
                </div>
                <h3 className={styles.exploreCardTitle}>
                  {lang === "ar" ? "نساء" : "WOMEN"}
                </h3>
              </Link>
              <Link
                to="/browse?gender=UNISEX"
                className={styles.exploreCard}
                onClick={() => setExploreOverlayOpen(false)}
              >
                <div className={styles.exploreCardImgWrap}>
                  <div className={styles.unisexPlaceholder}>
                    <HelpCircle size={48} strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className={styles.exploreCardTitle}>
                  {lang === "ar" ? "للجنسين" : "UNISEX"}
                </h3>
              </Link>
            </div>
          </div>
        </div>
      )}


      {/* ── FEATURES BAR ── */}
      <div className={`${styles.featuresStrip} reveal`}>
        <div className={styles.featureItem}>
          <Truck size={24} />
          <div>
            <h4>{lang === "ar" ? "شحن مجاني" : "Free Shipping"}</h4>
            <p>
              {lang === "ar"
                ? "ادخل عالم الأناقة مع شحننا المجاني المتميز"
                : "Step into the realm of style with our unbeatable free shipping."}
            </p>
          </div>
        </div>
        <div className={styles.featureItem}>
          <Headphones size={24} />
          <div>
            <h4>{lang === "ar" ? "دعم 24/7" : "24/7 Support"}</h4>
            <p>
              {lang === "ar"
                ? "نحن هنا لمساعدتك في أي وقت"
                : "We are here to help you anytime you need."}
            </p>
          </div>
        </div>
        <div className={styles.featureItem}>
          <RotateCcw size={24} />
          <div>
            <h4>{lang === "ar" ? "إرجاع سهل" : "Easy Returns"}</h4>
            <p>
              {lang === "ar"
                ? "سياسة إرجاع بسيطة ومريحة"
                : "Simple and convenient return policy."}
            </p>
          </div>
        </div>
        <div className={styles.featureItem}>
          <Lock size={24} />
          <div>
            <h4>{lang === "ar" ? "دفع آمن" : "Secure Checkout"}</h4>
            <p>
              {lang === "ar"
                ? "تسوق بأمان مع نظامنا المشفر"
                : "Shop safely with our encrypted checkout."}
            </p>
          </div>
        </div>
      </div>

      {/* ── EXCLUSIVE OFFERS ── */}
      <section className={`${styles.exclusiveSection} reveal`}>
        <div className={styles.exclusiveText}>
          <h2 className={styles.exclusiveTitle}>
            {lang === "ar"
              ? "عروض حصرية لفترة محدودة"
              : "Exclusive Offers for a Limited Time"}
          </h2>
          <p className={styles.exclusiveSub}>
            {lang === "ar"
              ? "تصميم متجر أزياء عصري وأنيق مع تخطيط نظيف وعرض منتجات رائع."
              : "Modern and stylish fashion store website design with a clean layout and elegant product showcase."}
          </p>
          <div className={styles.exclusiveButtons}>
            <Link
              to="/browse"
              className={`${styles.btnSolidDark} click-bounce`}
            >
              {lang === "ar" ? "تسوق الآن" : "Shop Now"}
            </Link>
            <button
              onClick={() => setExploreOverlayOpen(true)}
              className={`${styles.btnOutlineDark} click-bounce`}
            >
              {lang === "ar" ? "اكتشف المجموعة" : "Explore Collection"}
            </button>
          </div>
        </div>
        <div className={`${styles.exclusiveImg} hover-zoom`}>
          <img src="/sale.jpg" alt="Exclusive Offers" />
        </div>
      </section>

      {/* ── LOGO CLOUD ── */}
      <div className={styles.logoCloud}>
        <span>AINAI</span>
        <span>MODERN</span>
        <span>LUXURY</span>
        <span>ELEGANCE</span>
        <span>BOUTIQUE</span>
        <span>STYLE</span>
      </div>

      {/* ── FEATURED PRODUCTS GRID ── */}
      <section className={`${styles.sectionNew} reveal`}>
        <div className={styles.sectionHeadFlex}>
          <div>
            <h2 className={styles.sectionTitleNew}>
              {lang === "ar" ? "منتجات مختارة" : "Featured Products"}
            </h2>
            <p className={styles.sectionSubtitleNew}>
              {lang === "ar"
                ? "تصميم عصري وأنيق مع عرض متميز للمنتجات."
                : "Modern and stylish fashion store website design with a clean layout and elegant product showcase."}
            </p>
          </div>
          <Link to="/browse" className={`${styles.btnSeeAll} click-bounce`}>
            {lang === "ar" ? "مشاهدة الكل ↗" : "See all ↗"}
          </Link>
        </div>
        <div className={`${styles.featuredGrid} stagger-reveal`}>
          {loadingProducts ? (
            [1, 2, 3, 4].map((n) => (
              <div key={n} className={styles.skeletonCard} />
            ))
          ) : featuredProducts.length === 0 ? (
            <p className={styles.emptyState}>No featured products found.</p>
          ) : (
            featuredProducts.map((p) => <ProductCard key={p.id} product={p} />)
          )}
        </div>
      </section>

      <section className={`${styles.sectionNew} reveal`}>
        <div className={styles.sectionHeadCenteredNew}>
          <h2 className={styles.sectionTitleNew}>
            {lang === "ar" ? "تسوق حسب النوع" : "Shop by Gender"}
          </h2>
          <p className={styles.sectionSubtitleNew}>
            {lang === "ar" ? "اكتشف أحدث صيحات الموضة المصممة لك." : "Explore the latest trends tailored for you."}
          </p>
        </div>
        <div className={styles.genderSplitSection}>
          <div className={`${styles.genderCard} hover-zoom`}>
            <img src="/men_collection.png" alt="Men Collection" />
            <div className={styles.genderContent}>
              <h3 className={styles.genderTitle}>{lang === "ar" ? "ملابس رجالي" : "Men's Collection"}</h3>
              <Link to="/browse?sort=POPULAR&page=1&gender=MEN" className={styles.genderBtn}>
                {lang === "ar" ? "تسوق للرجال" : "Shop Men"}
              </Link>
            </div>
          </div>
          <div className={`${styles.genderCard} hover-zoom`}>
            <img src="/women_collection.png" alt="Women Collection" />
            <div className={styles.genderContent}>
              <h3 className={styles.genderTitle}>{lang === "ar" ? "ملابس حريمي" : "Women's Collection"}</h3>
              <Link to="/browse?sort=POPULAR&page=1&gender=WOMEN" className={styles.genderBtn}>
                {lang === "ar" ? "تسوق للنساء" : "Shop Women"}
              </Link>
            </div>
          </div>
        </div>
      </section>



      <Footer />
    </div>
  );
}

function Heart({ size, className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}
