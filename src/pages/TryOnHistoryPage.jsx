import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import TryOnHistory from "../components/vton/TryOnHistory";
import styles from "../styles/TryOnHistoryPage.module.css";

const mockHistory = [];

export default function TryOnHistoryPage() {
  return (
    <div className={styles.pageWrapper}>
      <Header />

      <main className={styles.mainContent}>
        <TryOnHistory items={mockHistory} />
      </main>

      <Footer />
    </div>
  );
}
