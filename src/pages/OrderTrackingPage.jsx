import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Package, Truck, MapPin, CheckCircle2, Clock, 
  ChevronRight, Sparkles, Phone, RotateCcw, XCircle, 
  Calendar, CreditCard, ShieldCheck, Loader2
} from "lucide-react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { useLanguage } from "../context/LanguageContext";
import styles from "../styles/OrderTrackingPage.module.css";

const TRACKING_STEPS = [
  { key: "placed", icon: Package, time: "Apr 18, 10:30 AM" },
  { key: "processing", icon: Clock, time: "Apr 19, 09:15 AM" },
  { key: "shipped", icon: Truck, time: "Apr 19, 04:45 PM" },
  { key: "delivery", icon: Truck, time: "Apr 20, 08:30 AM" },
  { key: "delivered", icon: CheckCircle2, time: "Apr 20, 02:20 PM" },
];

const MOCK_ORDER = {
  id: "ORD-2842",
  date: "Apr 18, 2026",
  total: 478.00,
  items: [
    { 
      id: 1, 
      name: "Silk Evening Gown", 
      qty: 1, 
      price: 389.00, 
      image: "https://images.unsplash.com/photo-1566479179817-0b6cf9b3888e?w=100&h=120&fit=crop", 
      vtonTried: true 
    },
    { 
      id: 2, 
      name: "Gold Cuff Bracelet", 
      qty: 1, 
      price: 89.00, 
      image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=100&h=120&fit=crop", 
      vtonTried: false 
    },
  ],
  shipping: {
    address: "123 Sheikh Zayed Road, Apartment 402",
    city: "Dubai, UAE",
    estDate: "Apr 21, 2026",
    courier: "Aramex Premium",
    trackingID: "AX-99281102"
  }
};

export default function OrderTrackingPage() {
  const { id } = useParams();
  const { t, dir, lang } = useLanguage();
  const [currentStep, setCurrentStep] = useState(2); // Start at Shipped
  const [order, setOrder] = useState(MOCK_ORDER);
  const [isSimulating, setIsSimulating] = useState(false);

  const simulateProgress = () => {
    if (currentStep < 4) {
      setIsSimulating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsSimulating(false);
      }, 1500);
    }
  };

  const getStatusColor = () => {
    if (currentStep === 4) return "#16a34a"; // Green
    if (currentStep >= 2) return "#0891b2"; // Blue
    return "#ca8a04"; // Gold
  };

  return (
    <div className={styles.page}>
      <Header />
      
      <main className={styles.main}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link to="/">{t("common.home")}</Link>
          <ChevronRight size={14} className={styles.breadSep} />
          <Link to="/orders">{t("common.orders")}</Link>
          <ChevronRight size={14} className={styles.breadSep} />
          <span className={styles.breadCurrent}>{order.id}</span>
        </nav>

        {/* Top Header Card */}
        <section className={styles.headerCard}>
          <div className={styles.headerInfo}>
            <div className={styles.headerMeta}>
              <h1 className={styles.orderId}>{t("track.orderId")}: {order.id}</h1>
              <p className={styles.orderDate}>{t("track.date")}: {order.date} • {order.items.length} {t("track.itemsCount")}</p>
            </div>
            <div className={styles.headerStatus}>
              <span className={styles.statusBadge} style={{ background: getStatusColor() + "15", color: getStatusColor() }}>
                {t(`track.status.${TRACKING_STEPS[currentStep].key}`)}
              </span>
              <p className={styles.orderTotal}>EGP {order.total.toFixed(2)}</p>
            </div>
          </div>
        </section>

        <div className={styles.layout}>
          {/* Main Content Area */}
          <div className={styles.contentArea}>
            
            {/* Visual Stepper */}
            <div className={styles.card}>
              <div className={styles.stepperHead}>
                <h2 className={styles.cardTitle}>{t("track.status." + TRACKING_STEPS[currentStep].key)}</h2>
                <p className={styles.cardSub}>{t("track.status." + TRACKING_STEPS[currentStep].key + "_sub")}</p>
              </div>

              <div className={styles.stepperContainer}>
                {TRACKING_STEPS.map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = index <= currentStep;
                
                  return (
                    <div key={step.key} className={`${styles.step} ${isActive ? styles.stepActive : ""}`}>
                      <div className={styles.stepMarker}>
                        <div className={styles.iconCircle}>
                          <StepIcon size={20} />
                        </div>
                        {index < TRACKING_STEPS.length - 1 && (
                          <div className={`${styles.connector} ${index < currentStep ? styles.connectorActive : ""}`} />
                        )}
                      </div>
                      <div className={styles.stepInfo}>
                        <h4 className={styles.stepLabel}>{t("track.status." + step.key)}</h4>
                        <span className={styles.stepTime}>{step.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button 
                className={styles.demoBtn} 
                onClick={simulateProgress}
                disabled={isSimulating || currentStep === 4}
              >
                {isSimulating ? <Loader2 size={16} className={styles.spin} /> : <RotateCcw size={16} />}
                {isSimulating ? "Simulating Update..." : "Simulate Next Status"}
              </button>
            </div>

            {/* Order Items */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>{t("track.items")}</h2>
              <div className={styles.itemsList}>
                {order.items.map(item => (
                  <div key={item.id} className={styles.item}>
                    <img src={item.image} alt={item.name} className={styles.itemImg} />
                    <div className={styles.itemInfoContent}>
                      <div className={styles.itemNameRow}>
                        <span className={styles.itemName}>{item.name}</span>
                        {item.vtonTried && (
                          <span className={styles.vtonBadge}>
                            <Sparkles size={11} /> {t("track.triedBefore")}
                          </span>
                        )}
                      </div>
                      <p className={styles.itemMeta}>{t("cart.qty") || "Qty"}: {item.qty} • {t("cart.size")}: M</p>
                      <p className={styles.itemPrice}>EGP {item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <aside className={styles.sidebar}>
            {/* Delivery Info */}
            <div className={`${styles.card} ${styles.deliveryCard}`}>
              <h3 className={styles.sidebarTitle}>{t("track.address")}</h3>
              <div className={styles.deliveryContent}>
                <div className={styles.deliveryRow}>
                  <MapPin size={18} className={styles.sidebarIcon} />
                  <div>
                    <p className={styles.addressText}>{order.shipping.address}</p>
                    <p className={styles.addressText}>{order.shipping.city}</p>
                  </div>
                </div>
                <hr className={styles.divider} />
                <div className={styles.deliveryRow}>
                  <Calendar size={18} className={styles.sidebarIcon} />
                  <div>
                    <p className={styles.sidebarLabel}>{t("track.estDelivery")}</p>
                    <p className={styles.sidebarVal}>{order.shipping.estDate}</p>
                  </div>
                </div>
                <div className={styles.deliveryRow}>
                  <Truck size={18} className={styles.sidebarIcon} />
                  <div>
                    <p className={styles.sidebarLabel}>{t("track.courier")}</p>
                    <p className={styles.sidebarVal}>{order.shipping.courier}</p>
                  </div>
                </div>
                <div className={styles.deliveryRow}>
                  <ShieldCheck size={18} className={styles.sidebarIcon} />
                  <div>
                    <p className={styles.sidebarLabel}>{t("track.trackingNum")}</p>
                    <p className={styles.sidebarVal}>{order.shipping.trackingID}</p>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className={styles.mapWrap}>
                <img 
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&h=200&fit=crop" 
                  alt={t("track.map_preview")} 
                  className={styles.mapPlaceholder}
                />
                <div className={styles.mapOverlay}>
                  <MapPin size={24} className={styles.mapPinPulse} />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <button className={styles.supportBtn}>
                <Phone size={18} /> {t("track.actions.support")}
              </button>
              <button 
                className={styles.cancelBtn} 
                disabled={currentStep > 1}
              >
                <XCircle size={18} /> {t("track.actions.cancel")}
              </button>
              <Link to="/browse" className={styles.reorderBtn}>
                <RotateCcw size={18} /> {t("track.actions.reorder")}
              </Link>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
