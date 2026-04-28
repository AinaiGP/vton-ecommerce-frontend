import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Trash2, X } from "lucide-react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import styles from "../styles/WishlistPage.module.css";

const SEED = [
  { id: 1, name: "Silk Evening Gown", price: 389, image: "https://images.unsplash.com/photo-1566479179817-0b6cf9b3888e?w=400&h=500&fit=crop", category: "Dresses", badge: "In Stock" },
  { id: 2, name: "Embroidered Kaftan", price: 450, image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=500&fit=crop", category: "Traditional", badge: "Limited" },
  { id: 3, name: "Cashmere Wrap Dress", price: 275, image: "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=400&h=500&fit=crop", category: "Dresses", badge: "In Stock" },
  { id: 4, name: "Gold Cuff Bracelet", price: 89, image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=500&fit=crop", category: "Accessories", badge: "In Stock" },
];

export default function WishlistPage() {
  const [items, setItems] = useState(SEED);
  const [added, setAdded] = useState({});

  const remove = (id) => setItems(prev => prev.filter(i => i.id !== id));

  const moveToCart = (id) => {
    setAdded(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setItems(prev => prev.filter(i => i.id !== id));
      setAdded(prev => { const n = { ...prev }; delete n[id]; return n; });
    }, 1200);
  };

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.pageHead}>
          <div>
            <h1 className={styles.title}><Heart size={24} /> Wishlist</h1>
            <p className={styles.sub}>{items.length} saved item{items.length !== 1 ? "s" : ""}</p>
          </div>
          {items.length > 0 && (
            <button className={styles.clearBtn} onClick={() => setItems([])}>Clear all</button>
          )}
        </div>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}><Heart size={64} strokeWidth={1} /></div>
            <h2>Your wishlist is empty</h2>
            <p>Save items you love to come back to them later.</p>
            <Link to="/browse" className={styles.browseCta}>Start Exploring</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {items.map(item => (
              <div key={item.id} className={styles.card}>
                <Link to={`/product/${item.id}`} className={styles.imgWrap}>
                  <img src={item.image} alt={item.name} className={styles.img} />
                  <span className={styles.badge}>{item.badge}</span>
                  <button className={styles.removeBtn} onClick={e => { e.preventDefault(); remove(item.id); }}>
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
                      {added[item.id] ? "✓ Added!" : <><ShoppingBag size={14} /> Add to Cart</>}
                    </button>
                    <button className={styles.trashBtn} onClick={() => remove(item.id)}><Trash2 size={14} /></button>
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
