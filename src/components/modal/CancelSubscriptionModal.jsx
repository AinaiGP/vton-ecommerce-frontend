import React from "react";
import { AlertTriangle, X } from "lucide-react";
import styles from "../../styles/CancelSubscriptionModal.module.css";
import { useLanguage } from "../../context/LanguageContext";

export default function CancelSubscriptionModal({ isOpen, onClose, onConfirm, isCancelling, expiryDate }) {
  const { lang } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className={styles.iconWrapper}>
          <div className={styles.warningIcon}>
            <AlertTriangle size={32} />
          </div>
        </div>

        <h2 className={styles.title}>
          {lang === "ar" ? "إلغاء الاشتراك" : "Cancel Subscription"}
        </h2>
        <p className={styles.subtitle}>
          {lang === "ar"
            ? "هل أنت متأكد أنك تريد إلغاء اشتراكك في AINAI برو؟"
            : "Are you sure you want to cancel your AINAI Pro subscription?"}
        </p>

        <div className={styles.noticeBox}>
          <strong>{lang === "ar" ? "ماذا يحدث بعد ذلك؟" : "What happens next?"}</strong>
          <p>
            {lang === "ar"
              ? `ستحتفظ بجميع مزايا برو حتى نهاية دورة الفاتورة الحالية في ${new Date(expiryDate).toLocaleDateString()}. لن يتم تحصيل أي مبالغ منك بعد هذا التاريخ.`
              : `You will retain all Pro benefits until the end of your current billing cycle on ${new Date(expiryDate).toLocaleDateString()}. You will not be charged after this date.`}
          </p>
        </div>

        <div className={styles.actions}>
          <button 
            className={styles.keepBtn} 
            onClick={onClose}
            disabled={isCancelling}
          >
            {lang === "ar" ? "لا، ابقِ اشتراكي" : "No, Keep My Subscription"}
          </button>
          <button 
            className={styles.confirmBtn} 
            onClick={onConfirm}
            disabled={isCancelling}
          >
            {isCancelling 
              ? (lang === "ar" ? "جاري الإلغاء..." : "Cancelling...") 
              : (lang === "ar" ? "نعم، ألغِ الاشتراك" : "Yes, Cancel Subscription")}
          </button>
        </div>
      </div>
    </div>
  );
}
