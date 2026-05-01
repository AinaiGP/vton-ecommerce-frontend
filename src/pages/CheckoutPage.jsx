import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Check,
  CreditCard,
  MapPin,
  ShoppingBag,
  Lock,
  Sparkles,
  Loader2,
  ArrowRight,
  Plus,
  Phone,
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import LoadingSpinner from "../components/common/LoadingSpinner";
import apiClient from "../utils/apiClient";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import { formatPrice } from "../utils/formatPrice";
import styles from "../styles/CheckoutPage.module.css";

// Initialize Stripe
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder",
  {
    developerTools: {
      assistant: {
        enabled: false,
      },
    },
  },
);

/**
 * Stripe Payment Form Component
 */
function PaymentForm({ onSuccess, onBack, totalAmount, currency }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      const { error: confirmError, paymentIntent } =
        await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/orders`,
          },
          redirect: "if_required",
        });

      if (confirmError) {
        setError(confirmError.message);
        setProcessing(false);
      } else if (paymentIntent.status === "succeeded") {
        onSuccess(paymentIntent.id);
      }
    } catch (err) {
      console.error("Payment confirmation failed:", err);
      setError(err?.response?.data?.message || "Payment initiation failed.");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.cardForm}>
      <div className={styles.stripeElementContainer}>
        <PaymentElement
          options={{
            layout: "tabs",
            wallets: {
              applePay: "never",
              googlePay: "never",
            },
          }}
        />
      </div>

      {error && (
        <div className={styles.errorText} style={{ marginTop: "12px" }}>
          {error}
        </div>
      )}

      <div className={styles.secureNote} style={{ marginTop: "24px" }}>
        <Lock size={14} /> 256-bit SSL encrypted. We never store your full
        payment details.
      </div>

      <div className={styles.stepActions}>
        <button
          type="button"
          className={styles.btnGhost}
          onClick={onBack}
          disabled={processing}
        >
          ← Back to Payment Method
        </button>
        <button
          type="submit"
          className={styles.btnPrimary}
          disabled={!stripe || processing}
        >
          {processing ? (
            <>
              <Loader2 size={18} className={styles.spin} /> Processing...
            </>
          ) : (
            `Pay ${formatPrice(totalAmount, currency)}`
          )}
        </button>
      </div>
    </form>
  );
}

export default function CheckoutPage() {
  const { t, dir } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const { refreshCartCount } = useCart();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const [step, setStep] = useState(0); // 0: Shipping, 1: Payment, 2: Review/Pay
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);

  const [selectedAddressId, setSelectedAddressId] = useState("");
  // Backend doesn't support phone selection in checkout yet, but we'll show it for completeness
  // as the instructions mentioned phone number selection.
  const [selectedPhoneId, setSelectedPhoneId] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("card"); // card or cod
  const [clientSecret, setClientSecret] = useState(null);

  // 1. Initial Load: Fetch Profile and Session
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth", { state: { from: { pathname: "/checkout" } } });
      return;
    }

    const init = async () => {
      try {
        const [profileRes, sessionRes] = await Promise.all([
          apiClient.get("/customers/profile"),
          apiClient.get("/checkout/session").catch(async (err) => {
            if (err.response?.status === 404) {
              // Create new session if none exists
              const createRes = await apiClient.post("/checkout/sessions");
              return createRes;
            }
            throw err;
          }),
        ]);

        setProfile(profileRes.data);
        setSession(sessionRes.data);

        if (sessionRes.data.shippingAddressId) {
          setSelectedAddressId(sessionRes.data.shippingAddressId);
        } else {
          // Default to primary address
          const primary = profileRes.data.shippingAddresses.find(
            (a) => a.isPrimary,
          );
          if (primary) setSelectedAddressId(primary.id);
        }

        const primaryPhone = profileRes.data.phoneNumbers.find(
          (p) => p.isPrimary,
        );
        if (primaryPhone) setSelectedPhoneId(primaryPhone.id);

        setLoading(false);
      } catch (err) {
        console.error("Checkout init failed:", err);
        setError(
          "Could not initialize checkout. Do you have items in your cart?",
        );
        setLoading(false);
      }
    };

    init();
  }, [isAuthenticated, navigate]);

  const handleNextToPayment = async () => {
    if (!selectedAddressId) {
      alert("Please select a shipping address.");
      return;
    }

    setProcessing(true);
    try {
      // Sync address to backend session
      const res = await apiClient.patch(
        `/checkout/sessions/${session.id}/address`,
        {
          shippingAddressId: selectedAddressId,
        },
      );
      setSession(res.data);
      setStep(1);
    } catch (err) {
      console.error("Failed to set address:", err);
      alert(
        err?.response?.data?.message ||
          "Failed to save shipping address. Please try again.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleNextToReview = async () => {
    if (paymentMethod === "card") {
      setProcessing(true);
      try {
        const res = await apiClient.post(
          `/checkout/sessions/${session.id}/confirm`,
        );
        setClientSecret(res.data.clientSecret);
        setStep(2);
      } catch (err) {
        console.error("Payment initiation failed:", err);
        alert(err?.response?.data?.message || "Payment initiation failed.");
      } finally {
        setProcessing(false);
      }
    } else {
      setStep(2);
    }
  };

  const handleOrderSuccess = async (paymentIntentId) => {
    if (paymentIntentId) {
      setProcessing(true);
      try {
        // Fallback: Verify payment on backend to ensure order is created
        await apiClient.post(`/checkout/sessions/${session.id}/verify`, {
          paymentIntentId,
        });
      } catch (err) {
        console.error("Payment verification failed:", err);
        // We don't block the user here because the webhook might still work
        // but we log it.
      } finally {
        setProcessing(false);
      }
    }

    // Always refresh cart count after order success (clears cart on backend)
    refreshCartCount();

    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConfirmCashOrder = async () => {
    setProcessing(true);
    try {
      await apiClient.post(`/checkout/sessions/${session.id}/cash`);
      handleOrderSuccess();
    } catch (err) {
      console.error("COD confirmation failed:", err);
      alert(err?.response?.data?.message || "Failed to confirm cash order.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <LoadingSpinner message="Setting up your checkout..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <div className={styles.successCard}>
            <h1 className={styles.successTitle}>Oops!</h1>
            <p className={styles.successSub}>{error}</p>
            <Link to="/cart" className={styles.btnPrimary}>
              Back to Cart
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (done) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <div className={styles.successCard}>
            <div className={styles.successIcon}>
              <Check size={40} />
            </div>
            <h1 className={styles.successTitle}>{t("success.title")}</h1>
            <p className={styles.successSub}>{t("success.sub")}</p>
            <div className={styles.successActions}>
              <Link to="/orders" className={styles.btnPrimary}>
                {t("success.track")}
              </Link>
              <Link to="/browse" className={styles.btnOutline}>
                {t("cart.continue")}
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const subtotal = session?.subtotal || 0;
  const shipping = session?.shippingCost || 0;
  const total = subtotal + shipping;
  const currency = session?.currency || "EGP";

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        {/* Progress Bar */}
        <div className={styles.progress}>
          {[
            t("checkout.shipping"),
            t("checkout.payment"),
            t("checkout.review"),
          ].map((s, i) => (
            <div key={s} className={styles.progressItem}>
              <div
                className={`${styles.progressDot} ${i < step ? styles.progressDotPast : ""} ${i === step ? styles.progressDotActive : ""}`}
              >
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span
                className={`${styles.progressLabel} ${i <= step ? styles.progressLabelActive : ""}`}
              >
                {s}
              </span>
              {i < 2 && (
                <div
                  className={`${styles.progressLine} ${i < step ? styles.progressLineActive : ""}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className={styles.layout}>
          {/* Left: Form Flow */}
          <div className={styles.formArea}>
            {/* STEP 0: Shipping Address Selection */}
            {step === 0 && (
              <div className={styles.formCard}>
                <div className={styles.formCardHeader}>
                  <h2 className={styles.formTitle}>
                    <MapPin size={20} /> {t("checkout.shipping")}
                  </h2>
                </div>

                <h3 className={styles.label} style={{ marginBottom: "12px" }}>
                  Select Shipping Address
                </h3>
                {profile?.shippingAddresses.length > 0 ? (
                  <div className={styles.selectionList}>
                    {profile.shippingAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`${styles.selectionItem} ${selectedAddressId === addr.id ? styles.selectionItemActive : ""}`}
                        onClick={() => setSelectedAddressId(addr.id)}
                      >
                        <div
                          className={
                            selectedAddressId === addr.id
                              ? styles.radioChecked
                              : styles.radioUnchecked
                          }
                        >
                          {selectedAddressId === addr.id && <Check size={12} />}
                        </div>
                        <div className={styles.selectionInfo}>
                          <span className={styles.selectionLabel}>
                            {addr.label || "Address"}{" "}
                            {addr.isPrimary && "(Primary)"}
                          </span>
                          <p className={styles.selectionText}>
                            {addr.street}, {addr.city}
                          </p>
                        </div>
                      </div>
                    ))}
                    <Link
                      to="/profile"
                      className={styles.btnGhost}
                      style={{ justifyContent: "flex-start", padding: "8px 0" }}
                    >
                      <Plus size={16} /> Add New Address
                    </Link>
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <p>No addresses found in your profile.</p>
                    <Link to="/profile" className={styles.btnPrimary}>
                      Add Address in Profile
                    </Link>
                  </div>
                )}

                <h3
                  className={styles.label}
                  style={{ marginTop: "24px", marginBottom: "12px" }}
                >
                  Select Contact Phone
                </h3>
                {profile?.phoneNumbers.length > 0 ? (
                  <div className={styles.selectionList}>
                    {profile.phoneNumbers.map((ph) => (
                      <div
                        key={ph.id}
                        className={`${styles.selectionItem} ${selectedPhoneId === ph.id ? styles.selectionItemActive : ""}`}
                        onClick={() => setSelectedPhoneId(ph.id)}
                      >
                        <div
                          className={
                            selectedPhoneId === ph.id
                              ? styles.radioChecked
                              : styles.radioUnchecked
                          }
                        >
                          {selectedPhoneId === ph.id && <Check size={12} />}
                        </div>
                        <div className={styles.selectionInfo}>
                          <span className={styles.selectionLabel}>
                            Phone {ph.isPrimary && "(Primary)"}
                          </span>
                          <p className={styles.selectionText}>
                            {ph.phoneNumber}
                          </p>
                        </div>
                      </div>
                    ))}
                    <Link
                      to="/profile"
                      className={styles.btnGhost}
                      style={{ justifyContent: "flex-start", padding: "8px 0" }}
                    >
                      <Plus size={16} /> Add New Phone
                    </Link>
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <p>No phone numbers found.</p>
                    <Link to="/profile" className={styles.btnPrimary}>
                      Add Phone in Profile
                    </Link>
                  </div>
                )}

                <div
                  className={styles.stepActions}
                  style={{ marginTop: "40px" }}
                >
                  <Link to="/cart" className={styles.btnGhost}>
                    {t("cart.summary")}
                  </Link>
                  <button
                    className={styles.btnPrimary}
                    onClick={handleNextToPayment}
                    disabled={
                      !selectedAddressId || !selectedPhoneId || processing
                    }
                  >
                    {processing ? (
                      <Loader2 size={18} className={styles.spin} />
                    ) : (
                      t("checkout.continuePayment")
                    )}
                    <ArrowRight
                      size={16}
                      style={{
                        transform: dir === "rtl" ? "rotate(180deg)" : "none",
                      }}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 1: Payment Method Selection */}
            {step === 1 && (
              <div className={styles.formCard}>
                <h2 className={styles.formTitle}>
                  <CreditCard size={20} /> {t("checkout.payment")}
                </h2>

                <div
                  className={styles.paymentOptions}
                  style={{ marginTop: "24px" }}
                >
                  <label
                    className={`${styles.payOption} ${paymentMethod === "card" ? styles.payOptionActive : ""}`}
                  >
                    <input
                      type="radio"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className={styles.radioHidden}
                    />
                    <span className={styles.payOptIcon}>💳</span>
                    <span className={styles.payOptLabel}>
                      Credit / Debit Card (Stripe)
                    </span>
                    {paymentMethod === "card" ? (
                      <div className={styles.radioChecked}>
                        <Check size={12} />
                      </div>
                    ) : (
                      <div className={styles.radioUnchecked} />
                    )}
                  </label>

                  <label
                    className={`${styles.payOption} ${paymentMethod === "cod" ? styles.payOptionActive : ""}`}
                  >
                    <input
                      type="radio"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className={styles.radioHidden}
                    />
                    <span className={styles.payOptIcon}>💵</span>
                    <span className={styles.payOptLabel}>Cash on Delivery</span>
                    {paymentMethod === "cod" ? (
                      <div className={styles.radioChecked}>
                        <Check size={12} />
                      </div>
                    ) : (
                      <div className={styles.radioUnchecked} />
                    )}
                  </label>
                </div>

                <div className={styles.stepActions}>
                  <button
                    className={styles.btnGhost}
                    onClick={() => setStep(0)}
                  >
                    ← {t("checkout.backShipping")}
                  </button>
                  <button
                    className={styles.btnPrimary}
                    onClick={handleNextToReview}
                    disabled={processing}
                  >
                    {processing ? (
                      <Loader2 size={18} className={styles.spin} />
                    ) : (
                      t("checkout.reviewOrder")
                    )}
                    {!processing && (
                      <ArrowRight
                        size={16}
                        style={{
                          transform: dir === "rtl" ? "rotate(180deg)" : "none",
                        }}
                      />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Review & Final Payment */}
            {step === 2 && (
              <div className={styles.formCard}>
                <h2 className={styles.formTitle}>
                  <ShoppingBag size={20} /> {t("checkout.review")}
                </h2>

                <div
                  className={styles.summaryBlock}
                  style={{ marginTop: "24px" }}
                >
                  <div className={styles.confirmRow}>
                    <div className={styles.confirmHeader}>
                      <span className={styles.confirmLabel}>
                        Shipping Address
                      </span>
                      <button
                        className={styles.editBtn}
                        onClick={() => setStep(0)}
                      >
                        Edit
                      </button>
                    </div>
                    {session.shippingAddress && (
                      <>
                        <p className={styles.confirmVal}>
                          {session.shippingAddress.shippingName}
                        </p>
                        <p className={styles.confirmVal}>
                          {session.shippingAddress.shippingStreet},{" "}
                          {session.shippingAddress.shippingCity}
                        </p>
                        <p className={styles.confirmVal}>
                          {
                            profile.phoneNumbers.find(
                              (p) => p.id === selectedPhoneId,
                            )?.phoneNumber
                          }
                        </p>
                      </>
                    )}
                  </div>

                  <div className={styles.confirmRow}>
                    <div className={styles.confirmHeader}>
                      <span className={styles.confirmLabel}>
                        Payment Method
                      </span>
                      <button
                        className={styles.editBtn}
                        onClick={() => setStep(1)}
                      >
                        Edit
                      </button>
                    </div>
                    <p className={styles.confirmVal}>
                      {paymentMethod === "card"
                        ? "💳 Credit / Debit Card"
                        : "💵 Cash on Delivery"}
                    </p>
                  </div>
                </div>

                {paymentMethod === "card" && clientSecret ? (
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: {
                        variables: {
                          colorPrimary: "#000000",
                        },
                      },
                    }}
                  >
                    <PaymentForm
                      onSuccess={handleOrderSuccess}
                      onBack={() => setStep(1)}
                      totalAmount={total}
                      currency={currency}
                    />
                  </Elements>
                ) : paymentMethod === "card" ? (
                  <div className={styles.emptyState}>
                    <Loader2 size={24} className={styles.spin} />
                    <p>Initializing secure payment...</p>
                  </div>
                ) : (
                  <div className={styles.stepActionsStack}>
                    <button
                      className={`${styles.btnPrimary} ${styles.btnLarge}`}
                      onClick={handleConfirmCashOrder}
                      disabled={processing}
                    >
                      {processing ? (
                        <>
                          <Loader2 size={18} className={styles.spin} />{" "}
                          Processing...
                        </>
                      ) : (
                        `Confirm COD Order — ${formatPrice(total, currency)}`
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Order Summary Sidebar */}
          <aside className={styles.summarySidebar}>
            <div className={styles.summaryCard}>
              <h3 className={styles.summaryTitle}>{t("checkout.inCart")}</h3>
              <div className={styles.summaryItems}>
                {session?.items.map((i) => (
                  <div key={i.variantId} className={styles.summaryItem}>
                    {i.imageUrl ? (
                      <img
                        src={i.imageUrl}
                        alt={i.productName}
                        className={styles.summaryImg}
                      />
                    ) : (
                      <div
                        className={styles.summaryImg}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "10px",
                        }}
                      >
                        {i.productName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className={styles.summaryItemInfo}>
                      <p className={styles.summaryItemName}>{i.productName}</p>
                      <p className={styles.summaryItemMeta}>
                        Qty: {i.quantity} | {i.variantSize}
                      </p>
                      <span className={styles.summaryItemPrice}>
                        {formatPrice(i.unitPrice, currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.summaryDivider} />
              <div className={styles.summaryRow}>
                <span>{t("cart.subtotal")}</span>
                <span>{formatPrice(subtotal, currency)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>{t("cart.shipping")}</span>
                <span>
                  {shipping === 0
                    ? t("cart.free")
                    : formatPrice(shipping, currency)}
                </span>
              </div>
              <div className={styles.summaryDivider} />
              <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                <span>{t("cart.total")}</span>
                <span>{formatPrice(total, currency)}</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
