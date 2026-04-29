import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Trash2, X } from "lucide-react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import styles from "../styles/WishlistPage.module.css";

export default function WishlistPage() {
  const [items, setItems] = useState([]);
  const [added, setAdded] = useState({});

  useEffect(() => {
    // TODO: wire to real API endpoint — Phase X
    setItems([]);
  }, []);

  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  const moveToCart = (id) => {
    setAdded((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setItems((prev) => prev.filter((i) => i.id !== id));
      setAdded((prev) => {
        const n = { ...prev };
        delete n[id];
        return n;
      });
    }, 1200);
  };

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.pageHead}>
          <div>
            <h1 className={styles.title}>
              <Heart size={24} /> Wishlist
            </h1>
            <p className={styles.sub}>
              {items.length} saved item{items.length !== 1 ? "s" : ""}
            </p>
          </div>
          {items.length > 0 && (
            <button className={styles.clearBtn} onClick={() => setItems([])}>
              Clear all
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <Heart size={64} strokeWidth={1} />
            </div>
            <h2>Your wishlist is empty</h2>
            <p>Save items you love to come back to them later.</p>
            <Link to="/browse" className={styles.browseCta}>
              Start Exploring
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {items.map((item) => (
              <div key={item.id} className={styles.card}>
                <Link to={`/product/${item.id}`} className={styles.imgWrap}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className={styles.img}
                  />
                  <span className={styles.badge}>{item.badge}</span>
                  <button
                    className={styles.removeBtn}
                    onClick={(e) => {
                      e.preventDefault();
                      remove(item.id);
                    }}
                  >
                    <X size={14} />
                  </button>
                </Link>
                <div className={styles.info}>
                  <span className={styles.cat}>{item.category}</span>
                  <h3 className={styles.name}>{item.name}</h3>
                  <p className={styles.price}>EGP {item.price.toFixed(2)}</p>
                  <div className={styles.cardActions}>
                    <button
                      className={`${styles.cartBtn} ${added[item.id] ? styles.cartBtnAdded : ""}`}
                      onClick={() => moveToCart(item.id)}
                    >
                      {added[item.id] ? (
                        "✓ Added!"
                      ) : (
                        <>
                          <ShoppingBag size={14} /> Add to Cart
                        </>
                      )}
                    </button>
                    <button
                      className={styles.trashBtn}
                      onClick={() => remove(item.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
