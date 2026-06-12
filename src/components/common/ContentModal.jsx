import { X } from "lucide-react";
import { useEffect } from "react";
import styles from "../../styles/ContentModal.module.css";

/* ─────────────────────────────────────────────
   ContentModal – Reusable modal for legal/info
   Receives title, children, and onClose.
   Features a sticky header and scrollable body.
───────────────────────────────────────────── */

export default function ContentModal({ title, children, onClose }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        <div className={styles.body}>
          {children}
        </div>
      </div>
    </div>
  );
}
