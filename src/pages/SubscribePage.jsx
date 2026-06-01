import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import { Check, Zap, Shield, Sparkles } from "lucide-react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { useLanguage } from "../context/LanguageContext";
import { useSubscription } from "../context/SubscriptionContext";
import apiClient from "../utils/apiClient";
import styles from "../styles/SubscribePage.module.css";

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey
  ? loadStripe(stripeKey, {
      developerTools: {
        assistant: {
          enabled: false,
        },
      },
    })
  : null;

function CheckoutForm({ clientSecret, paymentIntentId }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { refreshSubscription } = useSubscription();
  const { lang } = useLanguage();
  
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message);
      setIsProcessing(false);
      return;
    }

    try {
      const { paymentIntent, error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: window.location.origin + "/my-account",
        },
        redirect: "if_required",
      });

      if (confirmError) {
        setError(confirmError.message);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        await apiClient.post("/subscriptions/confirm", {
          paymentIntentId: paymentIntent.id,
        });
        await refreshSubscription();
        navigate("/my-account", { state: { subscriptionSuccess: true } });
      }
    } catch (err) {
      console.error(err);
      setError(
        lang === "ar"
          ? "حدث خطأ أثناء تأكيد الدفع. يرجى المحاولة مرة أخرى."
          : "An error occurred while confirming payment. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.checkoutForm}>
      <PaymentElement className={styles.paymentElement} />
      {error && <div className={styles.errorMsg}>{error}</div>}
      <button 
        type="submit" 
        disabled={isProcessing || !stripe || !elements}
        className={styles.submitBtn}
      >
        {isProcessing 
          ? (lang === "ar" ? "جاري المعالجة..." : "Processing...")
          : (lang === "ar" ? "تأكيد الاشتراك (200 ج.م)" : "Confirm Subscription (200 EGP)")}
      </button>
      <p className={styles.secureText}>
        <Shield size={14} /> {lang === "ar" ? "دفع آمن ومشفر عبر Stripe" : "Secure, encrypted payment via Stripe"}
      </p>
    </form>
  );
}

export default function SubscribePage() {
  const { lang } = useLanguage();
  const { isPro, isLoading } = useSubscription();
  const navigate = useNavigate();

  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [pageError, setPageError] = useState(null);

  useEffect(() => {
    if (!isLoading && isPro) {
      navigate("/my-account");
    }
  }, [isPro, isLoading, navigate]);

  useEffect(() => {
    const initIntent = async () => {
      try {
        const res = await apiClient.post("/subscriptions/intent");
        setClientSecret(res.data.clientSecret);
        setPaymentIntentId(res.data.paymentIntentId);
      } catch (err) {
        console.error(err);
        setPageError(
          err.response?.data?.message || 
          (lang === "ar" ? "فشل تهيئة الدفع" : "Failed to initialize payment")
        );
      }
    };
    initIntent();
  }, [lang]);

  if (isLoading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.page}>
      <Header />
      
      <main className={styles.main}>
        <div className={styles.hero}>
          <div className={styles.badge}>
            <Sparkles size={14} /> {lang === "ar" ? "AINAI برو" : "AINAI Pro"}
          </div>
          <h1 className={styles.title}>
            {lang === "ar" ? "افتح إمكانيات الذكاء الاصطناعي الكاملة" : "Unlock the full potential of AI"}
          </h1>
          <p className={styles.subtitle}>
            {lang === "ar" 
              ? "استمتع بتجربة تسوق متطورة مع خطة برو. الدفع شهرياً، يمكنك الإلغاء في أي وقت."
              : "Experience the ultimate shopping assistant with Pro. Billed monthly, cancel anytime."}
          </p>
        </div>

        <div className={styles.content}>
          {/* Comparison Table */}
          <div className={styles.featuresCard}>
            <h3 className={styles.cardTitle}>
              {lang === "ar" ? "مقارنة الخطط" : "Plan Comparison"}
            </h3>
            
            <div className={styles.table}>
              <div className={`${styles.tableRow} ${styles.tableHeader}`}>
                <div className={styles.featureCol}></div>
                <div className={styles.freeCol}>Free</div>
                <div className={styles.proCol}>
                  Pro <span className={styles.priceTag}>200 EGP/mo</span>
                </div>
              </div>
              
              <div className={styles.tableRow}>
                <div className={styles.featureCol}>{lang === "ar" ? "تجربة الملابس الافتراضية" : "Virtual Try-Ons"}</div>
                <div className={styles.freeCol}>1 / {lang === "ar" ? "أسبوع" : "wk"}</div>
                <div className={styles.proCol}>7 / {lang === "ar" ? "أسبوع" : "wk"}</div>
              </div>
              
              <div className={styles.tableRow}>
                <div className={styles.featureCol}>{lang === "ar" ? "رسائل مساعد الذكاء الاصطناعي" : "AI Chatbot Messages"}</div>
                <div className={styles.freeCol}>3 / {lang === "ar" ? "أسبوع" : "wk"}</div>
                <div className={styles.proCol}>20 / {lang === "ar" ? "أسبوع" : "wk"}</div>
              </div>

              <div className={styles.tableRow}>
                <div className={styles.featureCol}>{lang === "ar" ? "حدود جلسة المحادثة" : "Chat Session Limit"}</div>
                <div className={styles.freeCol}>3 {lang === "ar" ? "رسائل" : "msgs"}</div>
                <div className={styles.proCol}>10 {lang === "ar" ? "رسائل" : "msgs"}</div>
              </div>
              
              <div className={styles.tableRow}>
                <div className={styles.featureCol}>{lang === "ar" ? "دعم ذو أولوية" : "Priority Support"}</div>
                <div className={styles.freeCol}>-</div>
                <div className={styles.proCol}><Check size={16} /></div>
              </div>
            </div>
            
            <ul className={styles.highlights}>
              <li><Check size={16} className={styles.checkIcon} /> {lang === "ar" ? "دفع شهري (200 جنيه مصري)" : "Billed monthly (200 EGP)"}</li>
              <li><Check size={16} className={styles.checkIcon} /> {lang === "ar" ? "يمكنك الإلغاء في أي وقت من لوحة حسابك" : "Cancel anytime from your account hub"}</li>
              <li><Check size={16} className={styles.checkIcon} /> {lang === "ar" ? "يتم تجديد الحصص أسبوعياً (الأحد منتصف الليل)" : "Quotas renew weekly (Sunday midnight)"}</li>
            </ul>
          </div>

          {/* Payment Form */}
          <div className={styles.paymentCard}>
            <div className={styles.paymentHeader}>
              <h2 className={styles.paymentTitle}>
                {lang === "ar" ? "تفاصيل الدفع" : "Payment Details"}
              </h2>
              <div className={styles.amountWrap}>
                <span className={styles.amount}>200.00</span>
                <span className={styles.currency}>EGP</span>
                <span className={styles.period}>/ {lang === "ar" ? "شهر" : "mo"}</span>
              </div>
            </div>
            
            {pageError ? (
              <div className={styles.errorMsg}>{pageError}</div>
            ) : clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                <CheckoutForm clientSecret={clientSecret} paymentIntentId={paymentIntentId} />
              </Elements>
            ) : (
              <div className={styles.loadingSkeleton}>
                <div className={styles.skelRow}></div>
                <div className={styles.skelRow}></div>
                <div className={styles.skelBtn}></div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
