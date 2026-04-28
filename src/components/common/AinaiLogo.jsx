import { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import styles from "../../styles/AinaiLogo.module.css";

/* ─────────────────────────────────────────────
  AinaiLogo – Brand logo matching ainai-logo-demo.html
   Two almond-shaped eyes with gold pupils + blink animation
   
   Props:
   - size: 'sm' | 'md' | 'lg' | 'xl'  (default 'md')
   - variant: 'light' | 'dark' | 'colored'  (default 'light')
   - showText: boolean  (default true)
   - showArabic: boolean  (default true)
   - showTagline: boolean  (default false)
   - animated: boolean  (default true)
───────────────────────────────────────────── */

export default function AinaiLogo({
  size = "md",
  variant = "light",
  showText = true,
  showArabic = true,
  showTagline = false,
  animated = true,
}) {
  const [blink, setBlink] = useState(false);
  const [isDark, setIsDark] = useState(
    () => document.documentElement.getAttribute("data-dark") === "1"
  );
  const { lang, dir } = useLanguage();

  // Track dark-mode changes reactively
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute("data-dark") === "1");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-dark"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!animated) return;
    const interval = setInterval(() => {
      setBlink(true);
      const timeout = setTimeout(() => setBlink(false), 200);
      return () => clearTimeout(timeout);
    }, 4000);
    return () => clearInterval(interval);
  }, [animated]);

  // In dark mode: upgrade "light" variant → "dark" (same look as login page)
  // "dark" and "colored" variants already look good on dark backgrounds
  const resolvedVariant = isDark && variant === "light" ? "dark" : variant;

  const sizeClass = styles[`size_${size}`] || styles.size_md;
  const variantClass = styles[`variant_${resolvedVariant}`] || styles.variant_light;


  return (
    <div className={`${styles.logoWrapper} ${sizeClass} ${variantClass}`}>
      {/* Eye Icon */}
      <div className={styles.eyeContainer}>
        <div
          className={`${styles.eye} ${styles.eyeLeft} ${blink ? styles.blink : ""}`}
        >
          <div className={styles.pupil} />
        </div>
        <div
          className={`${styles.eye} ${styles.eyeRight} ${blink ? styles.blinkRight : ""}`}
        >
          <div className={styles.pupil} />
        </div>
      </div>

      {/* Text */}
      {showText && (
        <div className={styles.textGroup} style={{ fontFamily: lang === 'ar' ? "'Amiri', serif" : "'Inter', sans-serif" }}>
          {lang === 'en' ? (
            <span className={styles.brandText} style={{ animation: "fadeIn 0.4s ease-out" }}>AINAI</span>
          ) : (
            <span className={styles.arabicText} style={{ animation: "fadeIn 0.4s ease-out", fontSize: "1.1em", fontWeight: 700 }}>عَيناي</span>
          )}
        </div>
      )}

      {showTagline && (
        <p className={styles.tagline}>See Yourself Differently</p>
      )}
    </div>
  );
}
