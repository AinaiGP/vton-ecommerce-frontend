import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  User,
  ShoppingBag,
  Heart,
  RotateCcw,
  MessageSquare,
  Package,
  Shirt,
  Zap,
  Home,
  ChevronRight,
  Star,
  ArrowRight,
  Eye,
  Ticket,
  Loader2,
  Sparkles,
} from "lucide-react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import apiClient from "../utils/apiClient";
import { formatPrice } from "../utils/productHelpers";
import styles from "../styles/CustomerHub.module.css";
import { useAuth } from "../context/AuthContext";
import VtonModal from "../components/vton/VtonModal";

/* ─── Page sections ─── */
import { useSubscription } from "../context/SubscriptionContext";

const CUSTOMER_PAGES = [
  {
    group: "My Account",
    color: "#8B4852",
    bg: "#fdf2f3",
    items: [
      {
        to: "/profile",
        icon: User,
        label: "My Profile",
        desc: "Personal info, addresses & security",
      },
      {
        to: "/orders",
        icon: Package,
        label: "My Orders",
        desc: "Track and manage your orders",
      },
      {
        to: "/wishlist",
        icon: Heart,
        label: "Wishlist",
        desc: "Your saved favourite items",
      },
      {
        to: "/wardrobe",
        icon: Shirt,
        label: "My Wardrobe",
        desc: "AI-powered digital wardrobe",
      },
    ],
  },
  {
    group: "Support & Returns",
    color: "#1d4ed8",
    bg: "#eff6ff",
    items: [
      {
        to: "/tickets",
        icon: MessageSquare,
        label: "Support Tickets",
        desc: "Get help from our support team",
      },
      {
        to: "/returns",
        icon: RotateCcw,
        label: "Returns & Refunds",
        desc: "Request returns and track refunds",
      },
    ],
  },
  {
    group: "Shopping",
    color: "#065f46",
    bg: "#f0fdf9",
    items: [
      {
        to: "/browse",
        icon: ShoppingBag,
        label: "Shop All Products",
        desc: "Browse our full collection",
      },
      {
        to: "/cart",
        icon: ShoppingBag,
        label: "My Cart",
        desc: "Items ready for checkout",
      },
      {
        to: "/checkout",
        icon: ArrowRight,
        label: "Checkout",
        desc: "Complete your purchase",
      },
    ],
  },
];

export default function CustomerHubPage() {
  const { user } = useAuth();
  const { subscription, isPro, refreshSubscription } = useSubscription();
  const [stats, setStats] = useState({ orders: 0, tickets: 0, wardrobe: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vtonOpen, setVtonOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchHubData();
  }, []);

  const fetchHubData = async () => {
    setLoading(true);
    try {
      const [ordersRes, ticketsRes, wardrobeRes] = await Promise.all([
        apiClient.get("/customers/orders", { params: { limit: 3 } }),
        apiClient.get("/customers/support/tickets"),
        apiClient.get("/customers/wardrobe", { params: { limit: 1 } }),
      ]);

      setRecentOrders(ordersRes.data.data || []);
      setStats({
        orders: ordersRes.data.total || ordersRes.data.data?.length || 0,
        tickets:
          ticketsRes.data.data?.filter(
            (t) =>
              t.status !== "CLOSED" &&
              t.status !== "RESOLVED" &&
              t.status !== "CANCELED",
          ).length || 0,
        wardrobe: wardrobeRes.data.total || 0,
      });
    } catch (err) {
      console.error("Failed to fetch hub data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm("Are you sure you want to cancel your Pro subscription? You will keep access until the end of your billing cycle.")) return;
    
    setCancelling(true);
    try {
      await apiClient.post("/subscriptions/cancel");
      await refreshSubscription();
    } catch (err) {
      console.error("Failed to cancel subscription", err);
      alert("An error occurred. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        {/* Welcome Section */}
        <section className={styles.welcomeHero}>
          <div className={styles.welcomeText}>
            <p className={styles.welcomePre}>Welcome back,</p>
            <h1 className={styles.welcomeName}>
              {user?.firstName
                ? `${user.firstName} ${user.lastName || ""}`
                : user?.email}
            </h1>
            <p className={styles.welcomeSub}>
              Everything you need to manage your Ainai experience.
            </p>
          </div>
          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <span className={styles.statVal}>{stats.orders}</span>
              <span className={styles.statLabel}>Orders</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statVal}>{stats.tickets}</span>
              <span className={styles.statLabel}>Active Tickets</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statVal}>{stats.wardrobe}</span>
              <span className={styles.statLabel}>Wardrobe Items</span>
            </div>
          </div>
        </section>

        <div className={styles.hubGrid}>
          {/* Main Quick Links */}
          <div className={styles.linksColumn}>
            {CUSTOMER_PAGES.map((group) => (
              <div key={group.group} className={styles.groupSection}>
                <h3 className={styles.groupTitle}>{group.group}</h3>
                <div className={styles.itemGrid}>
                  {group.items.map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      className={styles.hubItem}
                      style={{ "--hover-bg": group.bg }}
                    >
                      <div
                        className={styles.itemIcon}
                        style={{ color: group.color, background: group.bg }}
                      >
                        <item.icon size={22} />
                      </div>
                      <div className={styles.itemMeta}>
                        <h4 className={styles.itemLabel}>{item.label}</h4>
                        <p className={styles.itemDesc}>{item.desc}</p>
                      </div>
                      <ChevronRight className={styles.itemArrow} size={18} />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Side Info Panel */}
          <aside className={styles.sideColumn}>
            <div className={styles.sidePanel}>
              <div className={styles.panelHead}>
                <h3 className={styles.panelTitle}>Recent Orders</h3>
                <Link to="/orders" className={styles.panelLink}>
                  View all
                </Link>
              </div>
              <div className={styles.panelBody}>
                {loading ? (
                  <div className={styles.sideLoading}>
                    <Loader2 size={24} className={styles.spin} />
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className={styles.panelEmpty}>
                    <Package size={32} />
                    <p>No recent orders found.</p>
                  </div>
                ) : (
                  recentOrders.map((order) => (
                    <div key={order.id} className={styles.miniOrder}>
                      <div className={styles.miniOrderHeader}>
                        <span className={styles.miniOrderId}>
                          #{order.orderNumber}
                        </span>
                        <span className={styles.miniOrderStatus}>
                          {order.status}
                        </span>
                      </div>
                      <p className={styles.miniOrderDate}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <div className={styles.miniOrderPrice}>
                        {formatPrice(order.total || 0)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className={`${styles.sidePanel} ${styles.wardrobeTeaser}`}>
              <div className={styles.teaserIcon}>
                <Shirt size={28} />
              </div>
              <h3 className={styles.teaserTitle}>Virtual Wardrobe</h3>
              <p className={styles.teaserText}>
                Use AI to organize your clothes and see how they look on you.
              </p>
              <Link to="/wardrobe" className={styles.teaserBtn}>
                Explore Wardrobe
              </Link>
            </div>
          </aside>
        </div>

        {/* Subscription Management Section */}
        {subscription && (
          <section className={styles.subSection}>
            <div className={styles.subCard}>
              <div className={styles.subHeader}>
                <div className={styles.subIconWrap}>
                  <Zap size={24} className={styles.subIcon} />
                </div>
                <div className={styles.subTitleWrap}>
                  <h2 className={styles.subTitle}>AINAI Pro Subscription</h2>
                  <span className={`${styles.subBadge} ${isPro ? styles.activeBadge : ""}`}>
                    {isPro ? "ACTIVE" : "EXPIRED"}
                  </span>
                </div>
              </div>

              <div className={styles.subDetails}>
                <div className={styles.subInfoItem}>
                  <span className={styles.subLabel}>Status:</span>
                  <span className={styles.subValue}>
                    {subscription.isCancelled && isPro
                      ? "Cancels at end of billing cycle"
                      : isPro 
                      ? "Active (Renews monthly)"
                      : "Expired"}
                  </span>
                </div>
                <div className={styles.subInfoItem}>
                  <span className={styles.subLabel}>Current Period Ends:</span>
                  <span className={styles.subValue}>
                    {new Date(subscription.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {isPro && !subscription.isCancelled && (
                <div className={styles.subActions}>
                  <button 
                    className={styles.cancelBtn} 
                    onClick={handleCancelSubscription}
                    disabled={cancelling}
                  >
                    {cancelling ? "Cancelling..." : "Cancel Subscription"}
                  </button>
                  <p className={styles.cancelNotice}>
                    You will retain Pro features until {new Date(subscription.expiresAt).toLocaleDateString()}.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* AI Features Section */}
        <section className={styles.aiSection}>
          <div className={styles.aiCard}>
            <div className={styles.aiCardContent}>
              <h2 className={styles.aiCardTitle}>
                <Sparkles size={28} />
                Virtual Try-On
                <span className={styles.aiTag}>AI</span>
              </h2>
              <p className={styles.aiCardDesc}>
                Upload any garment photo and see how it looks on you instantly.
                Our AI blends the item onto your photo for a realistic preview.
              </p>
            </div>
            <div className={styles.aiCardAction}>
              <button 
                className={styles.aiCardBtn}
                onClick={() => setVtonOpen(true)}
              >
                <Sparkles size={20} />
                Try It Now
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Standalone Virtual Try-On Modal */}
      <VtonModal
        isOpen={vtonOpen}
        onClose={() => setVtonOpen(false)}
        mode="standalone"
      />
    </div>
  );
}
