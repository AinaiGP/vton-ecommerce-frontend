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
} from "lucide-react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import VtonModal from "../components/vton/VtonModal";
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
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [vtonOpen, setVtonOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState('');

  useEffect(() => {
    if (location.state?.autoTriggerTryOn === true) {
      setVtonOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

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
      } catch (err) {
        setError(err?.response?.status === 404 ? "not_found" : "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, retryKey]);

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

  const handleAddToCart = async () => {
    if (!selectedVariant || isOutOfStock || addingToCart) {
      return;
    }

    setAddingToCart(true);
    setCartMessage('');
    try {
      // POST /cart/items — body from AddToCartDto: { productId, variantId, quantity }
      await apiClient.post('/cart/items', {
        productId: product.id,
        variantId: selectedVariant.id,
        quantity: 1,
      });
      setCartMessage('Added to cart!');
      await refreshCartCount();
      window.setTimeout(() => setCartMessage(''), 2000);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to add to cart.';
      setCartMessage(Array.isArray(msg) ? msg[0] : msg);
      window.setTimeout(() => setCartMessage(''), 3000);
    } finally {
      setAddingToCart(false);
    }
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
                />
              ) : (
                <div className={styles.imagePlaceholder}>
                  {getInitials(product.name)}
                </div>
              )}
              <span className={styles.vtonBadge}>VTON Ready</span>
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
                    <img src={img.s3Url} alt={`View ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.productInfo}>
            <p className={styles.brand}>{product.vendor?.brandName || ""}</p>
            <Link
              to={`/vendors/storefront/${product.vendor?.id || ""}`}
              className={styles.vendorLink}
            >
              View brand
            </Link>

            <h1 className={styles.productName}>{product.name}</h1>
            <p className={styles.reviewHint}>Be the first to review</p>

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

            <div className={styles.actions}>
              <button
                className={styles.addToCartButton}
                onClick={handleAddToCart}
                disabled={isAddToCartDisabled || addingToCart}
              >
                <ShoppingBag size={20} />
                <span>{addingToCart ? 'Adding...' : 'Add to Cart'}</span>
              </button>

              <button
                className={styles.wishlistButton}
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate("/auth", { state: { from: location } });
                    return;
                  }
                  setIsWishlisted(!isWishlisted);
                }}
                aria-label="Add to wishlist"
              >
                <Heart
                  size={22}
                  fill={isWishlisted ? "var(--burgundy)" : "none"}
                  stroke="var(--burgundy)"
                />
              </button>
            </div>

            {cartMessage && (
              <p className={styles.cartMessage
                ? `${styles.cartMessage} ${cartMessage.includes('Failed') || cartMessage.includes('Error') ? styles.cartMessageError : ''}`
                : styles.cartMessageError
              }>
                {cartMessage}
              </p>
            )}

            <button
              className={styles.tryOnButton}
              onClick={() => {
                if (!isAuthenticated) {
                  navigate("/auth", { state: { from: location } });
                  return;
                }
                setVtonOpen(true);
              }}
            >
              <Eye size={22} />
              <span>Virtual Try-On</span>
              <span className={styles.tryOnTag}>AI Powered</span>
            </button>

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
          </div>
        </div>
      </main>

      <Footer />
      <VtonModal
        isOpen={vtonOpen}
        onClose={() => setVtonOpen(false)}
        productMainImageUrl={selectedImageUrl}
        productName={product.name}
      />
    </div>
  );
}
