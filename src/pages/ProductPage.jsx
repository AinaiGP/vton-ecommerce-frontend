import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Eye,
  Heart,
  ArrowLeft,
  Truck,
  RotateCcw,
  Shield,
  Plus,
  Minus,
  MessageSquare,
  Star,
} from "lucide-react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import apiClient from "../utils/apiClient";
import {
  formatPrice,
  getProductImage,
  getUniqueColors,
  getUniqueSizes,
} from "../utils/productHelpers";
import styles from "../styles/ProductPage.module.css";

function getInitials(name) {
  return (name || "PR")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function StarRow({ value, size = 16 }) {
  return (
    <span className={styles.starRow}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          fill={value >= n ? "var(--gold)" : "none"}
          stroke={value >= n ? "var(--gold)" : "#ccc"}
        />
      ))}
    </span>
  );
}

export default function ProductPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { isAuthenticated } = useAuth();
  const { refreshCartCount } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [wishlistItems, setWishlistItems] = useState([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [averageRating, setAverageRating] = useState(5.0);


  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.get(`/products/${id}`);
        const nextProduct = response.data;
        setProduct(nextProduct);

        const firstColorId = nextProduct?.variants?.[0]?.color?.id ?? "";
        setSelectedColor(firstColorId);
        setSelectedSize("");
        setSelectedImage(0);
        setQuantity(1);

        try {
          const reviewsRes = await apiClient.get(`/products/${id}/reviews`);
          const rData = reviewsRes.data;
          setReviewsTotal(rData.totalReviews || 0);
          setAverageRating(rData.averageRating || 5.0);
          setReviews(
            (rData.data || []).map((r) => ({
              id: r.id,
              author: r.customerName || "Customer",
              avatar: null,
              date: new Date(r.createdAt).toLocaleDateString(),
              rating: Number(r.rating) || 5,
              comment: r.comment || "",
            }))
          );
        } catch (rErr) {
          console.error("Failed to fetch product reviews:", rErr);
        }
      } catch (err) {
        setError(err?.response?.status === 404 ? "not_found" : "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, retryKey]);

  useEffect(() => {
    if (isAuthenticated) {
      apiClient
        .get("/customers/wishlist?limit=100")
        .then((res) => setWishlistItems(res.data.data.map((w) => w.variantId)))
        .catch(console.error);
    }
  }, [isAuthenticated]);

  const sortedImages = useMemo(() => {
    if (!product?.images?.length) return [];
    return [...product.images].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    );
  }, [product]);

  const colors = useMemo(() => getUniqueColors(product), [product]);
  const allSizes = useMemo(() => getUniqueSizes(product), [product]);

  const variantsForSelectedColor = useMemo(() => {
    if (!product?.variants?.length || !selectedColor) return [];
    return product.variants.filter(
      (variant) => variant?.color?.id === selectedColor,
    );
  }, [product, selectedColor]);

  const sizesForSelectedColor = useMemo(() => {
    if (!variantsForSelectedColor.length) return [];

    const ids = new Set(
      variantsForSelectedColor.map((variant) => variant?.size?.id),
    );
    return allSizes.filter((size) => ids.has(size.id));
  }, [allSizes, variantsForSelectedColor]);

  const selectedColorName =
    colors.find((color) => color.id === selectedColor)?.name ??
    "Select a color";

  const selectedVariant = useMemo(() => {
    if (!selectedColor || !selectedSize || !product?.variants?.length)
      return null;
    return (
      product.variants.find(
        (variant) =>
          variant?.color?.id === selectedColor &&
          variant?.size?.id === selectedSize,
      ) ?? null
    );
  }, [product, selectedColor, selectedSize]);

  const hasSelectedVariant = Boolean(selectedVariant);
  const availableQty = hasSelectedVariant
    ? (selectedVariant.physicalQuantity ?? 0) -
      (selectedVariant.reservedQuantity ?? 0)
    : 0;
  const isLowStock =
    hasSelectedVariant && availableQty > 0 && availableQty < 10;
  const isOutOfStock = hasSelectedVariant && availableQty <= 0;
  const isAddToCartDisabled = !hasSelectedVariant || isOutOfStock;

  const isWishlisted = selectedVariant
    ? wishlistItems.includes(selectedVariant.id)
    : false;

  const incrementQty = () => {
    const max = Math.min(availableQty, 5);
    if (quantity < max) setQuantity((prev) => prev + 1);
  };

  const decrementQty = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  const handleAddToCart = async () => {
    if (!selectedVariant || isOutOfStock || addingToCart) {
      return;
    }

    setAddingToCart(true);
    setCartMessage("");
    try {
      // POST /cart/items — body from AddToCartDto: { productId, variantId, quantity }
      await apiClient.post("/cart/items", {
        productId: product.id,
        variantId: selectedVariant.id,
        quantity: quantity,
      });
      setCartMessage("Added to cart!");
      await refreshCartCount();
      window.setTimeout(() => setCartMessage(""), 2000);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to add to cart.";
      setCartMessage(Array.isArray(msg) ? msg[0] : msg);
      window.setTimeout(() => setCartMessage(""), 3000);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate("/auth", { state: { from: location } });
      return;
    }
    if (!selectedVariant) {
      setCartMessage("Please select a color and size to add to your wishlist");
      setTimeout(() => setCartMessage(""), 3000);
      return;
    }

    setWishlistLoading(true);
    if (isWishlisted) {
      setWishlistItems((prev) =>
        prev.filter((vid) => vid !== selectedVariant.id),
      );
      try {
        await apiClient.delete(`/customers/wishlist/${selectedVariant.id}`);
      } catch (err) {
        setWishlistItems((prev) => [...prev, selectedVariant.id]); // rollback
      }
    } else {
      setWishlistItems((prev) => [...prev, selectedVariant.id]);
      try {
        await apiClient.post("/customers/wishlist", {
          productId: product.id,
          variantId: selectedVariant.id,
        });
      } catch (err) {
        setWishlistItems((prev) =>
          prev.filter((vid) => vid !== selectedVariant.id),
        ); // rollback
      }
    }
    setWishlistLoading(false);
  };

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <Header />
        <main className={styles.fullHeightCenter}>
          <LoadingSpinner message="Loading product..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (error === "not_found") {
    return (
      <div className={styles.pageWrapper}>
        <Header />
        <main className={styles.notFound}>
          <h2>Product Not Found</h2>
          <p>Sorry, we couldn't find the product you're looking for.</p>
          <Link to="/browse" className={styles.backLink}>
            <ArrowLeft size={18} />
            Back to Browse
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  if (error === "error") {
    return (
      <div className={styles.pageWrapper}>
        <Header />
        <main className={styles.errorState}>
          <h2 className={styles.errorTitle}>Unable to Load Product</h2>
          <p className={styles.errorMessage}>
            Something went wrong while loading this product. Please try again.
          </p>
          <button
            className={styles.retryButton}
            onClick={() => setRetryKey((prev) => prev + 1)}
          >
            Retry
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const selectedImageUrl =
    sortedImages[selectedImage]?.s3Url || getProductImage(product);

  return (
    <div className={styles.pageWrapper}>
      <Header />

      <main className={styles.mainContent}>
        <nav className={styles.breadcrumb}>
          <Link to="/">Home</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <Link to="/browse">Browse</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>{product.name}</span>
        </nav>

        <div className={styles.productLayout}>
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
              {selectedImageUrl ? (
                <img
                  src={selectedImageUrl}
                  alt={product.name}
                  className={styles.heroImage}
                  loading="lazy"
                />
              ) : (
                <div className={styles.imagePlaceholder}>
                  {getInitials(product.name)}
                </div>
              )}
            </div>

            {sortedImages.length > 0 && (
              <div className={styles.thumbnails}>
                {sortedImages.map((img, index) => (
                  <button
                    key={img.id}
                    className={`${styles.thumbnail} ${
                      index === selectedImage ? styles.thumbnailActive : ""
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={img.s3Url} alt={`View ${index + 1}`} loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.productInfo}>
            {/* Brand Link */}
            <Link 
              to={`/vendors/storefront/${product.vendor?.id || ""}`} 
              className={styles.brand}
            >
              {product.vendor?.brandName || ""}
            </Link>

            <h1 className={styles.productName}>{product.name}</h1>
            {reviewsTotal > 0 ? (
              <div className={styles.productRatingSummary}>
                <StarRow value={Math.round(averageRating)} size={16} />
                <span className={styles.ratingNumber}>{averageRating.toFixed(1)}</span>
                <span className={styles.reviewCount}>({reviewsTotal} reviews)</span>
              </div>
            ) : (
              <p className={styles.reviewHint}>Be the first to review</p>
            )}

            <p className={styles.price}>
              {formatPrice(product.basePrice, product.currency)}
            </p>
            <p className={styles.description}>{product.description}</p>

            <div className={styles.optionGroup}>
              <h4 className={styles.optionLabel}>
                Color: <span>{selectedColorName}</span>
              </h4>
              <div className={styles.colorOptions}>
                {colors.map((color) => (
                  <button
                    key={color.id}
                    className={`${styles.colorSwatch} ${
                      selectedColor === color.id ? styles.colorActive : ""
                    }`}
                    style={{ background: color.hexCode }}
                    onClick={() => {
                      setSelectedColor(color.id);
                      setSelectedSize("");
                    }}
                    aria-label={color.name}
                  />
                ))}
              </div>
            </div>

            <div className={styles.optionGroup}>
              <h4 className={styles.optionLabel}>Size</h4>
              <div className={styles.sizeOptions}>
                {sizesForSelectedColor.map((size) => {
                  const variantForSize = variantsForSelectedColor.find(
                    (variant) => variant?.size?.id === size.id,
                  );
                  const sizeAvailableQty =
                    (variantForSize?.physicalQuantity ?? 0) -
                    (variantForSize?.reservedQuantity ?? 0);
                  const outOfStock = sizeAvailableQty <= 0;
                  return (
                    <button
                      key={size.id}
                      className={`${styles.sizeButton} ${
                        selectedSize === size.id ? styles.sizeActive : ""
                      } ${outOfStock ? styles.sizeDisabled : ""}`}
                      onClick={() => setSelectedSize(size.id)}
                      disabled={outOfStock}
                    >
                      {size.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {isLowStock && (
              <p className={styles.lowStockNotice}>Only {availableQty} left</p>
            )}
            {isOutOfStock && (
              <p className={styles.outOfStockNotice}>Out of Stock</p>
            )}

            {/* Quantity Selector */}
            {!isOutOfStock && hasSelectedVariant && (
              <div className={styles.quantitySection}>
                <h4 className={styles.optionLabel}>Quantity</h4>
                <div className={styles.quantityControl}>
                  <button
                    className={styles.qtyBtn}
                    onClick={decrementQty}
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className={styles.qtyVal}>{quantity}</span>
                  <button
                    className={styles.qtyBtn}
                    onClick={incrementQty}
                    disabled={quantity >= Math.min(availableQty, 5)}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {quantity >= 5 && (
                  <p className={styles.limitNote}>Limit: 5 per item</p>
                )}
              </div>
            )}

            <div className={styles.actions}>
              <button
                className={styles.addToCartButton}
                onClick={handleAddToCart}
                disabled={isAddToCartDisabled || addingToCart}
              >
                <ShoppingBag size={20} />
                <span>{addingToCart ? "Adding..." : "Add to Cart"}</span>
              </button>

              <button
                className={styles.wishlistButton}
                onClick={handleWishlistToggle}
                aria-label="Add to wishlist"
                disabled={wishlistLoading}
              >
                <Heart
                  size={22}
                  fill={isWishlisted ? "var(--burgundy)" : "none"}
                  stroke="var(--burgundy)"
                />
              </button>
            </div>

            {cartMessage && (
              <p
                className={`${styles.cartMessage} ${
                  cartMessage.includes("Failed") || 
                  cartMessage.includes("Error") || 
                  cartMessage.includes("select") 
                    ? styles.cartMessageError : ""
                }`}
              >
                {cartMessage}
              </p>
            )}


            <div className={styles.trustBadges}>
              <div className={styles.trustItem}>
                <Truck size={18} />
                <span>Free Shipping</span>
              </div>
              <div className={styles.trustItem}>
                <RotateCcw size={18} />
                <span>30-Day Returns</span>
              </div>
              <div className={styles.trustItem}>
                <Shield size={18} />
                <span>Authenticity Guaranteed</span>
              </div>
            </div>

            <div className={styles.detailsSection}>
              <h4 className={styles.detailsTitle}>Product Details</h4>
              <ul className={styles.detailsList}>
                <li>Category: {product.category?.name || "N/A"}</li>
                <li>Gender: {product.gender || "N/A"}</li>
                {selectedVariant?.sku && <li>SKU: {selectedVariant.sku}</li>}
              </ul>
            </div>
            
            {/* Reviews Section */}
            <div className={styles.detailsSection} style={{ marginTop: 40 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h4 className={styles.detailsTitle} style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <MessageSquare size={20} /> Customer Reviews
                </h4>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <StarRow value={Math.round(averageRating)} size={18} />
                  <strong>{averageRating.toFixed(1)}</strong>
                  <span style={{ color: "var(--charcoal-muted)", fontSize: 14 }}>
                    ({reviewsTotal} reviews)
                  </span>
                </div>
              </div>
              {reviews.length === 0 ? (
                <div style={{ padding: "30px 0", textAlign: "center", color: "var(--charcoal-muted)" }}>
                  <MessageSquare size={24} style={{ marginBottom: 12, opacity: 0.5 }} />
                  <p>No reviews yet.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {reviews.map((review) => (
                    <div key={review.id} style={{ padding: 16, background: "var(--ivory)", borderRadius: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          {review.avatar ? (
                            <img src={review.avatar} alt={review.author} style={{ width: 40, height: 40, borderRadius: "50%" }} />
                          ) : (
                            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--charcoal)", color: "var(--ivory)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                              {review.author[0]}
                            </div>
                          )}
                          <div>
                            <p style={{ margin: 0, fontWeight: "600", color: "var(--charcoal)" }}>{review.author}</p>
                            <p style={{ margin: 0, fontSize: 12, color: "var(--charcoal-muted)" }}>{review.date}</p>
                          </div>
                        </div>
                        <StarRow value={review.rating} />
                      </div>
                      <p style={{ margin: 0, color: "var(--charcoal-muted)", lineHeight: 1.5, fontSize: 14 }}>{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
