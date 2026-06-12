import React, { useEffect, useState } from "react";
import { X, CheckCircle, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/UpgradeModal.module.css";
import { useLanguage } from "../../context/LanguageContext";

export default function UpgradeModal({ isOpen, onClose, feature = "AI features" }) {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  return (
    <div className={`${styles.overlay} ${isOpen ? styles.open : ""}`}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={20} />
        </button>

        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <Zap size={32} className={styles.icon} />
          </div>
          <h2 className={styles.title}>
            {lang === "ar" ? "لقد وصلت للحد المجاني 🚀" : "You've reached your free limit 🚀"}
          </h2>
          <p className={styles.subtitle}>
            {lang === "ar" 
              ? `اشترك في خطة برو لتستمتع بميزات ${feature} بلا حدود.`
              : `Subscribe to Pro and unlock the full potential of our ${feature}.`}
          </p>
        </div>

        <div className={styles.comparison}>
          <div className={styles.featureRow}>
            <span className={styles.featureName}>{lang === "ar" ? "تجربة الملابس" : "Virtual Try-Ons"}</span>
            <span className={styles.featureFree}>1 / {lang === "ar" ? "أسبوع" : "week"}</span>
            <span className={styles.featurePro}>7 / {lang === "ar" ? "أسبوع" : "week"}</span>
          </div>
          <div className={styles.featureRow}>
            <span className={styles.featureName}>{lang === "ar" ? "رسائل المساعد" : "Chatbot Messages"}</span>
            <span className={styles.featureFree}>3 / {lang === "ar" ? "أسبوع" : "week"}</span>
            <span className={styles.featurePro}>20 / {lang === "ar" ? "أسبوع" : "week"}</span>
          </div>
          <div className={styles.featureRow}>
            <span className={styles.featureName}>{lang === "ar" ? "أولوية الدعم" : "Priority Support"}</span>
            <span className={styles.featureFree}>-</span>
            <span className={styles.featurePro}><CheckCircle size={16} color="var(--success)" /></span>
          </div>
        </div>

        <div className={styles.actions}>
          <button 
            className={styles.primaryBtn}
            onClick={() => {
              onClose();
              navigate("/subscribe");
            }}
          >
            {lang === "ar" ? "اشترك الآن بـ 200 جنيه/شهر" : "Subscribe for 200 EGP/month"}
          </button>
          <button className={styles.secondaryBtn} onClick={onClose}>
            {lang === "ar" ? "ربما لاحقاً" : "Maybe later"}
          </button>
        </div>
      </div>
    </div>
  );
}
