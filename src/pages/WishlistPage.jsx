import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Trash2, X, Loader2 } from "lucide-react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import styles from "../styles/WishlistPage.module.css";
import apiClient from "../utils/apiClient";
import { useCart } from "../context/CartContext";
import { formatPrice, getVariantImage } from "../utils/productHelpers";

export default function WishlistPage() {
  const [items, setItems] = useState([]);
  const [added, setAdded] = useState({});
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/customers/wishlist?limit=100");
      const mapped = res.data.data.map((w) => ({
        id: w.variantId,
        productId: w.productId,
        name: w.product?.name || "Product",
        price: w.variant?.price || w.product?.basePrice || 0,
        image: getVariantImage(w.variant, w.product) || "/placeholder.png",
        category: w.product?.category?.name || "Category",
        badge: w.product?.tags?.[0] || "",
      }));
      setItems(mapped);
    } catch (err) {
      console.error("Failed to fetch wishlist", err);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    try {
      await apiClient.delete(`/customers/wishlist/${id}`);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error("Failed to remove item", err);
    }
  };

  const moveToCart = async (item) => {
    try {
      await addToCart(item.productId, item.id, 1);
      setAdded((prev) => ({ ...prev, [item.id]: true }));
      setTimeout(() => {
        remove(item.id);
        setAdded((prev) => {
          const n = { ...prev };
          delete n[item.id];
          return n;
        });
      }, 1200);
    } catch (err) {
      console.error("Failed to move to cart", err);
    }
  };

  const clearAll = async () => {
    if (!window.confirm("Clear your entire wishlist?")) return;
    setLoading(true);
    for (const item of items) {
      try {
        await apiClient.delete(`/customers/wishlist/${item.id}`);
      } catch (e) {
        console.error(e);
      }
    }
    setItems([]);
    setLoading(false);
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
            <button
              className={styles.clearBtn}
              onClick={clearAll}
              disabled={loading}
            >
              Clear all
            </button>
          )}
        </div>

        {loading && items.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <Loader2
              className={styles.spin}
              size={32}
              style={{ margin: "auto", color: "var(--burgundy)" }}
            />
          </div>
        ) : items.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <Heart size={64} strokeWidth={1} />
            </div>
            <h2>Your wishlist is empty</h2>
            <p>Start browsing to save items.</p>
            <Link to="/browse" className={styles.browseCta}>
              Start Exploring
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {items.map((item) => (
              <div key={item.id} className={styles.card}>
                <Link
                  to={`/product/${item.productId}`}
                  className={styles.imgWrap}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className={styles.img}
                  />
                  {item.badge && (
                    <span className={styles.badge}>{item.badge}</span>
                  )}
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
                  <p className={styles.price}>{formatPrice(item.price)}</p>
                  <div className={styles.cardActions}>
                    <button
                      className={`${styles.cartBtn} ${added[item.id] ? styles.cartBtnAdded : ""}`}
                      onClick={() => moveToCart(item)}
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
