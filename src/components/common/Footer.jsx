import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Instagram, Twitter, Facebook, Youtube, ArrowRight, X } from "lucide-react";
import AinaiLogo from "./AinaiLogo";
import styles from "../../styles/Footer.module.css";
import { useLanguage } from "../../context/LanguageContext";
import ContentModal from "./ContentModal";

export default function Footer() {
  const { t, lang } = useLanguage();

  const [showContactModal, setShowContactModal] = useState(false);
  const [showSizeGuideModal, setShowSizeGuideModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showCookiesModal, setShowCookiesModal] = useState(false);

  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("ainai.egy@outlook.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setShowContactModal(false);
        setShowSizeGuideModal(false);
        setShowFAQModal(false);
        setShowPrivacyModal(false);
        setShowTermsModal(false);
        setShowCookiesModal(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

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
          <Link to="/browse?sort=POPULAR&page=1&gender=MEN" className={styles.colLink}>Men</Link>
          <Link to="/browse?sort=POPULAR&page=1&gender=WOMEN" className={styles.colLink}>Women</Link>
          <Link to="/browse?sort=POPULAR&page=1&gender=UNISEX" className={styles.colLink}>Unisex</Link>
        </div>

        <div className={styles.col}>
          <h4 className={styles.colTitle}>{t("footer.account")}</h4>
          <Link to="/profile" className={styles.colLink}>{t("profile.my_profile")}</Link>
          <Link to="/orders" className={styles.colLink}>{t("common.orders")}</Link>
          <Link to="/wishlist" className={styles.colLink}>{t("common.wishlist")}</Link>
        </div>

        <div className={styles.col}>
          <h4 className={styles.colTitle}>{t("footer.help")}</h4>
          <button
            type="button"
            className={styles.footerLinkButton}
            onClick={() => setShowContactModal(true)}
          >
            Contact Us
          </button>
          <Link to="/returns" className={styles.colLink}>{t("footer.returns")}</Link>
          <button
            type="button"
            className={styles.footerLinkButton}
            onClick={() => setShowSizeGuideModal(true)}
          >
            Size Guide
          </button>
          <button
            type="button"
            className={styles.footerLinkButton}
            onClick={() => setShowFAQModal(true)}
          >
            FAQ
          </button>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottom}>
        <p className={styles.copy}>© {new Date().getFullYear()} AINAI Fashion. {t("footer.rights")}</p>
        <div className={styles.legal}>
          <button
            type="button"
            className={styles.footerLinkButton}
            onClick={() => setShowPrivacyModal(true)}
          >
            Privacy Policy
          </button>
          <button
            type="button"
            className={styles.footerLinkButton}
            onClick={() => setShowTermsModal(true)}
          >
            Terms of Service
          </button>
          <button
            type="button"
            className={styles.footerLinkButton}
            onClick={() => setShowCookiesModal(true)}
          >
            Cookies
          </button>
        </div>
      </div>
      {/* Contact Us Modal */}
      {showContactModal && (
        <ContentModal title="Contact Us" onClose={() => setShowContactModal(false)}>
          <div className={styles.contactModalInner}>
            <p className={styles.modalSubtitle}>Reach out to us at:</p>
            <div className={styles.emailBox}>
              ainai.egy@outlook.com
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btnCopy} onClick={handleCopyEmail}>
                {copied ? "Copied!" : "Copy Email"}
              </button>
              <button className={styles.btnDone} onClick={() => setShowContactModal(false)}>
                Done
              </button>
            </div>
          </div>
        </ContentModal>
      )}

      {/* Content Modals */}
      {showSizeGuideModal && (
        <ContentModal title="Size Guide" onClose={() => setShowSizeGuideModal(false)}>
          <div className={styles.modalBody}>
            <h3>Women's Clothing</h3>
            <table className={styles.sizeTable}>
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Chest (cm)</th>
                  <th>Waist (cm)</th>
                  <th>Hips (cm)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>XS</td><td>80-84</td><td>62-66</td><td>86-90</td></tr>
                <tr><td>S</td><td>84-88</td><td>66-70</td><td>90-94</td></tr>
                <tr><td>M</td><td>88-92</td><td>70-74</td><td>94-98</td></tr>
                <tr><td>L</td><td>92-96</td><td>74-78</td><td>98-102</td></tr>
                <tr><td>XL</td><td>96-100</td><td>78-82</td><td>102-106</td></tr>
                <tr><td>XXL</td><td>100-104</td><td>82-86</td><td>106-110</td></tr>
              </tbody>
            </table>

            <h3>Men's Clothing</h3>
            <table className={styles.sizeTable}>
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Chest (cm)</th>
                  <th>Waist (cm)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>XS</td><td>86-90</td><td>74-78</td></tr>
                <tr><td>S</td><td>90-94</td><td>78-82</td></tr>
                <tr><td>M</td><td>94-98</td><td>82-86</td></tr>
                <tr><td>L</td><td>98-102</td><td>86-90</td></tr>
                <tr><td>XL</td><td>102-106</td><td>90-94</td></tr>
                <tr><td>XXL</td><td>106-110</td><td>94-98</td></tr>
              </tbody>
            </table>
            <p><em>If you are between sizes, we recommend sizing up.</em></p>
            <p><em>All measurements are in centimeters (cm).</em></p>
          </div>
        </ContentModal>
      )}

      {showFAQModal && (
        <ContentModal title="Frequently Asked Questions" onClose={() => setShowFAQModal(false)}>
          <div className={styles.modalBody}>
            <h3>How does Virtual Try-On work?</h3>
            <p>Our AI-powered Virtual Try-On lets you upload a photo of yourself and see how any garment looks on your body before purchasing. Simply open a product, click "Try On", upload your photo, and our AI generates a realistic preview within seconds.</p>

            <h3>How long does shipping take?</h3>
            <p>Standard delivery within Egypt takes 3–5 business days. Express delivery options are available at checkout for 1–2 business day delivery.</p>

            <h3>Can I return an item?</h3>
            <p>Yes. You can request a return within 14 days of delivery for most items. Items must be unworn, unwashed, and in original packaging. Visit Returns & Exchanges for full details.</p>

            <h3>How do I track my order?</h3>
            <p>Once your order is shipped, you will receive an email with your tracking number. You can also track your order from the My Orders section in your account.</p>

            <h3>Is my payment information secure?</h3>
            <p>Yes. All payments are processed securely through Stripe. AINAI never stores your card details.</p>

            <h3>How do I become a vendor on AINAI?</h3>
            <p>You can apply to become a vendor from your account settings. Our team reviews applications and responds within 3–5 business days.</p>

            <h3>What payment methods are accepted?</h3>
            <p>We accept all major credit and debit cards via Stripe. Cash on delivery is available for select areas within Egypt.</p>
          </div>
        </ContentModal>
      )}

      {showPrivacyModal && (
        <PrivacyContent onClose={() => setShowPrivacyModal(false)} />
      )}

      {showTermsModal && (
        <TermsContent onClose={() => setShowTermsModal(false)} />
      )}

      {showCookiesModal && (
        <CookiesContent onClose={() => setShowCookiesModal(false)} />
      )}
    </footer>
  );
}

function PrivacyContent({ onClose }) {
  return (
    <ContentModal title="Privacy Policy" onClose={onClose}>
      <div className={styles.modalBody}>
        <p><strong>Last updated: January 2026</strong></p>
        <p>At AINAI, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our platform.</p>
        
        <h3>What data we collect</h3>
        <ul>
          <li><strong>Personal Information:</strong> Name, email address, shipping address, and phone number.</li>
          <li><strong>Payment Information:</strong> Processed securely via Stripe; we do not store your card details.</li>
          <li><strong>Browsing Behavior:</strong> Pages viewed, products searched, and interaction data.</li>
          <li><strong>Virtual Try-On Photos:</strong> Photos you upload for the Virtual Try-On feature.</li>
        </ul>

        <h3>How we use your data</h3>
        <p>We use your information to process orders, personalize your shopping experience, improve our AI features, and communicate with you about your account and promotions.</p>

        <h3>Data storage and security</h3>
        <p>Your data is encrypted and stored securely on Amazon Web Services (AWS). We implement industry-standard security measures to prevent unauthorized access.</p>

        <h3>Virtual Try-On Photos</h3>
        <p>Photos uploaded for Virtual Try-On are processed in real-time to generate your preview. These photos are not stored permanently on our servers unless you explicitly choose to save them to your virtual wardrobe.</p>

        <h3>Third party services</h3>
        <p>We use Stripe for secure payment processing and Google for OAuth authentication. These services have their own privacy policies.</p>

        <h3>User rights</h3>
        <p>You have the right to access, correct, or request the deletion of your personal data. For any privacy-related inquiries, please contact us at <a href="mailto:ainai.egy@outlook.com">ainai.egy@outlook.com</a>.</p>

        <h3>Cookies usage</h3>
        <p>We use cookies to enhance your experience. Please refer to our Cookies Policy for more details.</p>
      </div>
    </ContentModal>
  );
}

function TermsContent({ onClose }) {
  return (
    <ContentModal title="Terms of Service" onClose={onClose}>
      <div className={styles.modalBody}>
        <p><strong>Last updated: January 2026</strong></p>
        
        <h3>1. Acceptance of terms</h3>
        <p>By accessing or using the AINAI platform, you agree to be bound by these Terms of Service and all applicable laws in the Arab Republic of Egypt.</p>

        <h3>2. Account responsibilities</h3>
        <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>

        <h3>3. Prohibited conduct</h3>
        <p>Users are prohibited from engaging in fraudulent activities, posting fake reviews, or using automated systems to scrape data from our platform.</p>

        <h3>4. Intellectual property</h3>
        <p>All content on the AINAI platform, including logos, designs, and AI technology, is the property of AINAI and is protected by intellectual property laws.</p>

        <h3>5. Virtual Try-On feature</h3>
        <p>The Virtual Try-On feature is provided for illustrative purposes. Uploaded photos are used solely for generating the try-on preview and are handled according to our Privacy Policy.</p>

        <h3>6. Vendor terms</h3>
        <p>Vendors are responsible for the accuracy of their product listings, including descriptions, pricing, and availability.</p>

        <h3>7. Payment and refunds</h3>
        <p>Payments are processed via Stripe. Refunds are handled in accordance with our Returns & Exchanges policy, subject to Egyptian consumer protection laws.</p>

        <h3>8. Limitation of liability</h3>
        <p>AINAI shall not be liable for any indirect, incidental, or consequential damages arising from the use of our platform.</p>

        <h3>9. Governing law</h3>
        <p>These terms are governed by the laws of the Arab Republic of Egypt. Any disputes shall be resolved in the courts of Cairo.</p>

        <h3>10. Contact</h3>
        <p>For questions regarding these terms, please contact us at <a href="mailto:ainai.egy@outlook.com">ainai.egy@outlook.com</a>.</p>
      </div>
    </ContentModal>
  );
}

function CookiesContent({ onClose }) {
  return (
    <ContentModal title="Cookies Policy" onClose={onClose}>
      <div className={styles.modalBody}>
        <p><strong>Last updated: January 2026</strong></p>
        
        <h3>What are cookies?</h3>
        <p>Cookies are small text files stored on your device that help us provide a better experience by remembering your preferences and session information.</p>

        <h3>Types of cookies we use</h3>
        <ul>
          <li><strong>Essential cookies:</strong> Required for core functionality such as authentication and maintaining your shopping cart.</li>
          <li><strong>Analytics cookies:</strong> Used to understand how visitors interact with our platform, tracking page views and product popularity anonymously.</li>
          <li><strong>Preference cookies:</strong> Remember your settings such as language and filter preferences.</li>
        </ul>

        <p>We do <strong>NOT</strong> use advertising or tracking cookies to follow you across other websites.</p>

        <h3>How to control cookies</h3>
        <p>You can manage or disable cookies through your browser settings. However, disabling essential cookies may affect the functionality of our platform.</p>

        <h3>Contact</h3>
        <p>If you have any questions about our use of cookies, please contact us at <a href="mailto:ainai.egy@outlook.com">ainai.egy@outlook.com</a>.</p>
      </div>
    </ContentModal>
  );
}
