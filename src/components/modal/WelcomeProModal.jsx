import React from "react";
import { Sparkles, CheckCircle, X, Zap } from "lucide-react";
import styles from "../../styles/WelcomeProModal.module.css";
import { useLanguage } from "../../context/LanguageContext";

export default function WelcomeProModal({ isOpen, onClose }) {
  const { lang } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className={styles.iconWrapper}>
          <div className={styles.sparkleIcon}>
            <Sparkles size={32} />
          </div>
        </div>

        <h2 className={styles.title}>
          {lang === "ar" ? "أهلاً بك في AINAI برو!" : "Welcome to AINAI Pro!"}
        </h2>
        <p className={styles.subtitle}>
          {lang === "ar"
            ? "لقد تم تفعيل اشتراكك بنجاح. استمتع بتجربة تسوق متطورة."
            : "Your subscription is now active. Enjoy your upgraded shopping experience."}
        </p>

        <div className={styles.benefitsList}>
          <div className={styles.benefitItem}>
            <CheckCircle className={styles.checkIcon} size={20} />
            <div className={styles.benefitText}>
              <strong>{lang === "ar" ? "7 تجارب افتراضية أسبوعياً" : "7 Virtual Try-Ons/week"}</strong>
              <p>{lang === "ar" ? "جرب المزيد من الملابس بضغطة زر" : "Try on more items with a single click"}</p>
            </div>
          </div>
          <div className={styles.benefitItem}>
            <Zap className={styles.checkIcon} size={20} />
            <div className={styles.benefitText}>
              <strong>{lang === "ar" ? "20 رسالة مساعد ذكي أسبوعياً" : "20 AI Chatbot Messages/week"}</strong>
              <p>{lang === "ar" ? "احصل على نصائح وتوصيات مخصصة" : "Get personalized fashion advice and recommendations"}</p>
            </div>
          </div>
          <div className={styles.benefitItem}>
            <Sparkles className={styles.checkIcon} size={20} />
            <div className={styles.benefitText}>
              <strong>{lang === "ar" ? "ميزات حصرية والمزيد" : "Exclusive Features & Priority Support"}</strong>
              <p>{lang === "ar" ? "تجربة تسوق سلسة مع دعم على مدار الساعة" : "A seamless experience with round-the-clock priority support"}</p>
            </div>
          </div>
        </div>

        <button className={styles.actionBtn} onClick={onClose}>
          {lang === "ar" ? "ابدأ الآن" : "Start Exploring"}
        </button>
      </div>
    </div>
  );
}
