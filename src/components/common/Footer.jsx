import { Link } from "react-router-dom";
import { Instagram, Twitter, Facebook, Youtube, ArrowRight } from "lucide-react";
import AinaiLogo from "./AinaiLogo";
import styles from "../../styles/Footer.module.css";
import { useLanguage } from "../../context/LanguageContext";

export default function Footer() {
  const { t, lang } = useLanguage();

  return (
    <footer className={styles.footer}>
      {/* Newsletter strip */}
      <div className={styles.newsletter}>
        <div className={styles.newsletterInner}>
          <div>
            <h3 className={styles.newsletterTitle}>{t("footer.newsletter_title")}</h3>
            <p className={styles.newsletterSub}>{t("footer.newsletter_sub")}</p>
          </div>
          <form className={styles.newsletterForm} onSubmit={e => e.preventDefault()}>
            <input type="email" placeholder="your@email.com" className={styles.newsletterInput} />
            <button type="submit" className={styles.newsletterBtn}><ArrowRight size={18} style={{ transform: lang === "ar" ? "rotate(180deg)" : "none" }} /></button>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div className={styles.main}>
        <div className={styles.brand}>
          <Link to="/"><AinaiLogo size="sm" variant="dark" showTagline={false} /></Link>
          <p className={styles.tagline}>{t("footer.tagline")}</p>
          <div className={styles.socials}>
            <a href="#" className={styles.socialIcon} aria-label="Instagram"><Instagram size={18} /></a>
            <a href="#" className={styles.socialIcon} aria-label="Twitter"><Twitter size={18} /></a>
            <a href="#" className={styles.socialIcon} aria-label="Facebook"><Facebook size={18} /></a>
            <a href="#" className={styles.socialIcon} aria-label="Youtube"><Youtube size={18} /></a>
          </div>
        </div>

        <div className={styles.col}>
          <h4 className={styles.colTitle}>{t("footer.shop")}</h4>
          <Link to="/browse?category=dresses" className={styles.colLink}>{t("category.dresses")}</Link>
          <Link to="/browse?category=abayas" className={styles.colLink}>{t("category.abayas")}</Link>
          <Link to="/browse?category=tops" className={styles.colLink}>{t("category.tops")}</Link>
          <Link to="/browse?sort=NEWEST" className={styles.colLink}>{t("category.new_arrivals")}</Link>
          <Link to="/browse?sale=true" className={styles.colLink}>{t("category.sale")}</Link>
        </div>

        <div className={styles.col}>
          <h4 className={styles.colTitle}>{t("footer.account")}</h4>
          <Link to="/profile" className={styles.colLink}>{t("profile.my_profile")}</Link>
          <Link to="/orders" className={styles.colLink}>{t("common.orders")}</Link>
          <Link to="/wishlist" className={styles.colLink}>{t("common.wishlist")}</Link>
          <Link to="/ai-try-on" className={styles.colLink}>{lang === "ar" ? "القياس الافتراضي" : "Virtual Try-On"}</Link>
        </div>

        <div className={styles.col}>
          <h4 className={styles.colTitle}>{t("footer.help")}</h4>
          <Link to="/support" className={styles.colLink}>{t("footer.contact")}</Link>
          <Link to="#" className={styles.colLink}>{t("footer.shipping")}</Link>
          <Link to="#" className={styles.colLink}>{t("footer.returns")}</Link>
          <Link to="#" className={styles.colLink}>{t("footer.size_guide")}</Link>
          <Link to="#" className={styles.colLink}>{t("footer.faq")}</Link>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottom}>
        <p className={styles.copy}>© {new Date().getFullYear()} AINAI Fashion. {t("footer.rights")}</p>
        <div className={styles.legal}>
          <Link to="#" className={styles.legalLink}>{t("footer.privacy")}</Link>
          <Link to="#" className={styles.legalLink}>{t("footer.terms")}</Link>
          <Link to="#" className={styles.legalLink}>{t("footer.cookies")}</Link>
        </div>
      </div>
    </footer>
  );
}
