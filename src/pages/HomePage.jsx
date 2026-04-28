import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import styles from "../styles/HomePage.module.css";
import { 
  Sparkles, Zap, ShieldCheck, Truck, RotateCcw, 
  ArrowRight, Play, Camera, Shirt, UserCheck, 
  Star, Quote, ExternalLink, ShoppingBag, Headphones, Lock
} from "lucide-react";

export default function HomePage() {
  const { isAuthenticated, userRole } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const CATEGORIES = [
    { label: t("category.dresses"), emoji: "👗", to: "/browse?category=dresses", color: "#fdf2f4", icon: <Shirt size={24} /> },
    { label: t("category.abayas"), emoji: "🕌", to: "/browse?category=abayas", color: "#f3f0ff", icon: <Sparkles size={24} /> },
    { label: t("category.tops"), emoji: "👚", to: "/browse?category=tops", color: "#ecfdf5", icon: <Zap size={24} /> },
    { label: t("category.bottoms"), emoji: "👖", to: "/browse?category=bottoms", color: "#fffbeb", icon: <UserCheck size={24} /> },
    { label: t("category.accessories"), emoji: "💍", to: "/browse?category=accessories", color: "#faf5ff", icon: <Quote size={24} /> },
    { label: t("category.sale"), emoji: "🏷️", to: "/browse?sale=true", color: "#fef2f2", icon: <Zap size={24} /> },
  ];

  const FEATURED = [
    { id: 1, name: lang === "ar" ? "ثوب سهرة حريري" : "Silk Evening Gown", price: 389, image: "/1.jpg", badge: t("badge.new"), category: t("category.dresses") },
    { id: 2, name: lang === "ar" ? "قفطان مطرز" : "Embroidered Kaftan", price: 450, image: "/2.jpg", badge: t("badge.bestseller"), category: lang === "ar" ? "تقليدي" : "Traditional" },
    { id: 3, name: lang === "ar" ? "فستان كشمير ملفوف" : "Cashmere Wrap Dress", price: 275, image: "/3.jpg", badge: t("badge.ainai"), category: t("category.dresses") },
    { id: 4, name: lang === "ar" ? "عباية مخملية" : "Velvet Abaya", price: 320, image: "/4.jpg", badge: t("badge.limited"), category: t("category.abayas") },
  ];

  const HOW_IT_WORKS = [
    { icon: <Camera size={32} />, title: lang === "ar" ? "ارفع صورتك" : "Upload Your Photo", desc: lang === "ar" ? "التقط صورة واضحة لنفسك في إضاءة جيدة." : "Take a clear photo of yourself in good lighting." },
    { icon: <Shirt size={32} />, title: lang === "ar" ? "اختر التصميم" : "Pick Your Style", desc: lang === "ar" ? "تصفح آلاف القطع من أفضل المصممين." : "Browse thousands of pieces from top designers." },
    { icon: <Sparkles size={32} />, title: lang === "ar" ? "جرب افتراضياً" : "Virtual Try-On", desc: lang === "ar" ? "شاهد كيف يبدو الزي عليك بدقة مذهلة." : "See exactly how it looks on you with AI precision." },
    { icon: <ArrowRight size={32} />, title: lang === "ar" ? "تسوق بثقة" : "Shop Confidently", desc: lang === "ar" ? "اشترِ ما يناسبك تماماً في المرة الأولى." : "Buy what fits you perfectly the first time." },
  ];

  const TESTIMONIALS_NEW = [
    { name: "Emma R.", role: "Fashion Designer", text: lang === "ar" ? "أنا مهووسة بمجموعتهم الأخيرة! كل قطعة تبدو عالية الجودة وتناسبني بشكل رائع. كان التسليم سريعاً." : "I'm obsessed with their latest collection! Every piece feels high-quality and fits beautifully. The delivery was quick, and the packaging looked so elegant.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
    { name: "John K.", role: "Web Designer", text: lang === "ar" ? "التصاميم أنيقة وعصرية للغاية - بالضبط ما كنت أبحث عنه! تجربة التسوق كانت سلسة وممتعة." : "The designs are so elegant and trendy — exactly what I was looking for! From browsing to checkout, the whole shopping experience was smooth and enjoyable.", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" },
    { name: "Sarah L.", role: "Civil Engineer", text: lang === "ar" ? "هذه العلامة التجارية لا تخيب ظني أبداً! تبدو المجموعة فاخرة وبأسعار معقولة. فريق الدعم متعاون جداً." : "This brand never disappoints! The collection feels premium yet affordable, and their customer support team is so helpful with sizing and recommendations.", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop" },
  ];

  const BADGE_COLORS = { [t("badge.new")]: "#16a34a", [t("badge.bestseller")]: "#d4af7a", [t("badge.ainai")]: "#8b4852", [t("badge.limited")]: "#7c3aed" };

  return (
    <div className={styles.page}>
      {/* ── PROMO BAR ── */}
      <div className={styles.promoBar}>
        <p>{lang === "ar" ? "استمتع بخصم 20٪ على طلبك الأول وشحن مجاني للطلبات فوق 500 ج.م" : "Enjoy 20% off on your first purchase & Free Shipping on Orders Over EGP 500"}</p>
      </div>

      <Header />

      {/* ── HERO ── */}
      <section className={`${styles.heroNew} animate-fade-in`}>
        <div className={styles.heroContainer}>
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className={styles.heroVideo}
          >
            <source src="/hero-bg.mp4" type="video/mp4" />
          </video>
          <div className={styles.heroVideoOverlay} />
          <div className={styles.heroOverlayContent}>
            <div className={`${styles.heroButtonsNew} stagger-reveal active`}>
              <Link to="/browse" className={styles.btnSolid}>{lang === "ar" ? "تسوق الآن" : "Shop Now"}</Link>
              <Link to="/browse" className={styles.btnOutline}>{lang === "ar" ? "اكتشف المجموعة" : "Explore Collection"}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── LATEST PRODUCTS ── */}
      <section className={`${styles.sectionNew} reveal`}>
        <div className={styles.sectionHeadNew}>
          <h2 className={styles.sectionTitleNew}>{lang === "ar" ? "أحدث المنتجات" : "Latest Products"}</h2>
        </div>
        <div className={`${styles.latestGrid} stagger-reveal`}>
          {FEATURED.slice(0, 3).map(p => (
            <div key={p.id} className={styles.productCardSimple} onClick={() => navigate(`/product/${p.id}`)}>
              <div className={`${styles.productImgSimpleWrap} hover-zoom`}>
                <img src={p.image} alt={p.name} className={styles.productImgSimple} />
              </div>
              <div className={styles.productInfoSimple}>
                <h3 className={styles.productNameSimple}>{p.name}</h3>
                <p className={styles.productPriceSimple}>EGP {p.price.toFixed(2)}</p>
                <button className={`${styles.addToCartLink} click-bounce`}>
                  {t("common.add_to_cart")} <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES BAR ── */}
      <div className={`${styles.featuresStrip} reveal`}>
        <div className={styles.featureItem}>
          <Truck size={24} />
          <div>
            <h4>{lang === "ar" ? "شحن مجاني" : "Free Shipping"}</h4>
            <p>{lang === "ar" ? "ادخل عالم الأناقة مع شحننا المجاني المتميز" : "Step into the realm of style with our unbeatable free shipping."}</p>
          </div>
        </div>
        <div className={styles.featureItem}>
          <Headphones size={24} />
          <div>
            <h4>{lang === "ar" ? "دعم 24/7" : "24/7 Support"}</h4>
            <p>{lang === "ar" ? "نحن هنا لمساعدتك في أي وقت" : "We are here to help you anytime you need."}</p>
          </div>
        </div>
        <div className={styles.featureItem}>
          <RotateCcw size={24} />
          <div>
            <h4>{lang === "ar" ? "إرجاع سهل" : "Easy Returns"}</h4>
            <p>{lang === "ar" ? "سياسة إرجاع بسيطة ومريحة" : "Simple and convenient return policy."}</p>
          </div>
        </div>
        <div className={styles.featureItem}>
          <Lock size={24} />
          <div>
            <h4>{lang === "ar" ? "دفع آمن" : "Secure Checkout"}</h4>
            <p>{lang === "ar" ? "تسوق بأمان مع نظامنا المشفر" : "Shop safely with our encrypted checkout."}</p>
          </div>
        </div>
      </div>

      {/* ── EXCLUSIVE OFFERS ── */}
      <section className={`${styles.exclusiveSection} reveal`}>
        <div className={styles.exclusiveText}>
          <h2 className={styles.exclusiveTitle}>{lang === "ar" ? "عروض حصرية لفترة محدودة" : "Exclusive Offers for a Limited Time"}</h2>
          <p className={styles.exclusiveSub}>
            {lang === "ar" ? "تصميم متجر أزياء عصري وأنيق مع تخطيط نظيف وعرض منتجات رائع." : "Modern and stylish fashion store website design with a clean layout and elegant product showcase."}
          </p>
          <div className={styles.exclusiveButtons}>
            <Link to="/browse" className={`${styles.btnSolidDark} click-bounce`}>{lang === "ar" ? "تسوق الآن" : "Shop Now"}</Link>
            <Link to="/browse" className={`${styles.btnOutlineDark} click-bounce`}>{lang === "ar" ? "اكتشف المجموعة" : "Explore Collection"}</Link>
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
        <span>VIRTUAL</span>
      </div>

      {/* ── FEATURED PRODUCTS GRID ── */}
      <section className={`${styles.sectionNew} reveal`}>
        <div className={styles.sectionHeadFlex}>
          <div>
            <h2 className={styles.sectionTitleNew}>{lang === "ar" ? "منتجات مختارة" : "Featured Products"}</h2>
            <p className={styles.sectionSubtitleNew}>{lang === "ar" ? "تصميم عصري وأنيق مع عرض متميز للمنتجات." : "Modern and stylish fashion store website design with a clean layout and elegant product showcase."}</p>
          </div>
          <Link to="/browse" className={`${styles.btnSeeAll} click-bounce`}>{lang === "ar" ? "مشاهدة الكل ↗" : "See all ↗"}</Link>
        </div>
        <div className={`${styles.lookbookGrid} stagger-reveal`}>
          <div className={`${styles.lookbookItem} hover-zoom`}><img src="/4.jpg" alt="Look 1" /></div>
          <div className={`${styles.lookbookItem} hover-zoom`}><img src="/5.png" alt="Look 2" /></div>
          <div className={`${styles.lookbookItem} hover-zoom`}><img src="/6.jpg" alt="Look 3" /></div>
          <div className={`${styles.lookbookItem} hover-zoom`}><img src="/1.jpg" alt="Look 4" /></div>
        </div>
      </section>

      {/* ── SEASONAL COLLECTION ── */}
      <section className={`${styles.sectionNew} reveal`}>
        <div className={styles.sectionHeadCenteredNew}>
          <h2 className={styles.sectionTitleNew}>{lang === "ar" ? "المجموعة الموسمية" : "Seasonal Collection"}</h2>
          <p className={styles.sectionSubtitleNew}>{lang === "ar" ? "اكتشف أحدث صيحات الموضة لكل فصل." : "Discover the latest fashion trends for every season."}</p>
        </div>
        <div className={`${styles.seasonalGrid} stagger-reveal`}>
          <div className={`${styles.seasonalCard} hover-zoom`}>
            <img src="/winter_collection.png" alt="Winter Collection" />
            <div className={styles.seasonalOverlay}>
              <Link to="/browse?season=winter" className={`${styles.seasonalBtn} click-bounce`}>{lang === "ar" ? "شتاء" : "WINTER"}</Link>
            </div>
          </div>
          <div className={`${styles.seasonalCard} hover-zoom`}>
            <img src="/summer_collection.png" alt="Summer Collection" />
            <div className={styles.seasonalOverlay}>
              <Link to="/browse?season=summer" className={`${styles.seasonalBtn} click-bounce`}>{lang === "ar" ? "صيف" : "SUMMER"}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className={`${styles.sectionNew} reveal`}>
        <div className={styles.sectionHeadFlex}>
          <div>
            <h2 className={styles.sectionTitleNew}>{lang === "ar" ? "أزياء تتحدث عن نفسها" : "Fashion That Speaks for Itself"}</h2>
            <p className={styles.sectionSubtitleNew}>{lang === "ar" ? "استمع إلى ما يقوله عملاؤنا السعداء حول تجربة تسوقهم." : "Hear what our happy customers say about their shopping experience and favorite styles."}</p>
          </div>
          <Link to="/browse" className={`${styles.btnSeeAll} click-bounce`}>{lang === "ar" ? "مشاهدة الكل ↗" : "See all ↗"}</Link>
        </div>
        <div className={`${styles.testimonialGridNew} stagger-reveal`}>
          {TESTIMONIALS_NEW.map((t, i) => (
            <div key={i} className={`${styles.testiCardNew} card`}>
              <div className={styles.testiStars}>{"★".repeat(5)}</div>
              <p className={styles.testiTextNew}>{t.text}</p>
              <div className={styles.testiUserNew}>
                <img src={t.avatar} alt={t.name} className={styles.testiAvatarNew} />
                <div>
                  <h4 className={styles.testiNameNew}>{t.name}</h4>
                  <p className={styles.testiRoleNew}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
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
