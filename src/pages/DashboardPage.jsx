import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import styles from '../styles/DashboardPage.module.css';

export default function DashboardPage() {
  return (
    <div className={styles.pageWrapper}>
      <Header />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Welcome Section */}
          <section className={styles.welcomeSection}>
            <h1 className={styles.welcomeTitle}>Welcome to Your Dashboard</h1>
            <p className={styles.welcomeSubtitle}>Manage your account and explore your style</p>
          </section>

          {/* Dashboard Grid */}
          <div className={styles.dashboardGrid}>
            <div className={styles.card}>
              <div className={styles.cardIcon}>👤</div>
              <h3 className={styles.cardTitle}>My Profile</h3>
              <p className={styles.cardDescription}>Update your name, email, photo, password &amp; addresses</p>
              <Link to="/profile" className={styles.cardLink}>Manage Profile</Link>
            </div>

            <div className={styles.card}>
              <div className={styles.cardIcon}>📦</div>
              <h3 className={styles.cardTitle}>My Orders</h3>
              <p className={styles.cardDescription}>Track orders, cancel or submit return requests</p>
              <Link to="/orders" className={styles.cardLink}>View Orders</Link>
            </div>

            <div className={styles.card}>
              <div className={styles.cardIcon}>❤️</div>
              <h3 className={styles.cardTitle}>Saved Items</h3>
              <p className={styles.cardDescription}>Access your favourite pieces</p>
              <Link to="/wishlist" className={styles.cardLink}>View Saved</Link>
            </div>

            <div className={styles.card}>
              <div className={styles.cardIcon}>📸</div>
              <h3 className={styles.cardTitle}>Try-On History</h3>
              <p className={styles.cardDescription}>Review your virtual try-ons</p>
              <Link to="/try-on-history" className={styles.cardLink}>View History</Link>
            </div>

            <div className={styles.card}>
              <div className={styles.cardIcon}>👗</div>
              <h3 className={styles.cardTitle}>My Wardrobe</h3>
              <p className={styles.cardDescription}>Upload clothes, build outfits &amp; get AI style picks</p>
              <Link to="/wardrobe" className={styles.cardLink}>Open Wardrobe</Link>
            </div>

            <div className={styles.card}>
              <div className={styles.cardIcon}>🎫</div>
              <h3 className={styles.cardTitle}>Support Tickets</h3>
              <p className={styles.cardDescription}>Get help with orders, products or technical issues</p>
              <Link to="/tickets" className={styles.cardLink}>View Tickets</Link>
            </div>

            <div className={styles.card}>
              <div className={styles.cardIcon}>↩️</div>
              <h3 className={styles.cardTitle}>Return Requests</h3>
              <p className={styles.cardDescription}>Message vendors about returns and track refunds</p>
              <Link to="/returns" className={styles.cardLink}>My Returns</Link>
            </div>

            <div className={styles.card}>
              <div className={styles.cardIcon}>🏪</div>
              <h3 className={styles.cardTitle}>Sell on AINAI</h3>
              <p className={styles.cardDescription}>Apply to become a vendor and sell your fashion brand</p>
              <Link to="/apply-vendor" className={styles.cardLink}>Apply as Vendor</Link>
            </div>
          </div>

          {/* Info Sections */}
          <div className={styles.infoSections}>
            {/* Recent Activity */}
            <div className={styles.infoCard}>
              <h2 className={styles.infoTitle}>Recent Activity</h2>
              <div className={styles.activityList}>
                <div className={styles.activityItem}>
                  <span className={styles.activityBadge}>Purchase</span>
                  <span className={styles.activityText}>Silk Jalabiya purchased</span>
                  <span className={styles.activityDate}>Apr 18, 2026</span>
                </div>
                <div className={styles.activityItem}>
                  <span className={styles.activityBadge}>Try-On</span>
                  <span className={styles.activityText}>Tried on Embroidered Kaftan</span>
                  <span className={styles.activityDate}>Apr 17, 2026</span>
                </div>
              </div>
            </div>

            {/* Loyalty Info */}
            <div className={styles.infoCard}>
              <h2 className={styles.infoTitle}>Loyalty Points</h2>
              <div className={styles.loyaltyInfo}>
                <div className={styles.loyaltyPoints}>
                  <span className={styles.pointsValue}>850</span>
                  <span className={styles.pointsLabel}>Points Available</span>
                </div>
                <p className={styles.loyaltyDescription}>
                  Earn points with every purchase and redeem for exclusive rewards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
