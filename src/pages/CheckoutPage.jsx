import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, CreditCard, MapPin, ShoppingBag, Lock, Sparkles, Loader2, ArrowRight } from "lucide-react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { useLanguage } from "../context/LanguageContext";
import styles from "../styles/CheckoutPage.module.css";

const STEPS = ["Shipping", "Payment", "Confirm"];

// Mock dataset with VTON history flag included
const ITEMS = [
  { id: 1, name: "Silk Evening Gown", size: "M", price: 389, qty: 1, image: "https://images.unsplash.com/photo-1566479179817-0b6cf9b3888e?w=80&h=100&fit=crop", vtonTried: true },
  { id: 2, name: "Gold Cuff Bracelet", size: "One size", price: 89, qty: 1, image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=80&h=100&fit=crop", vtonTried: false },
];

export default function CheckoutPage() {
  const { t, dir } = useLanguage();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ 
    first: "", last: "", email: "", phone: "", 
    address: "", city: "", country: "UAE", payment: "card", savedAddress: false 
  });
  
  const [errors, setErrors] = useState({});

  // Auto-fill logic mock
  useEffect(() => {
    if (form.savedAddress) {
      setForm(prev => ({ 
        ...prev, 
        first: "Sara", last: "Al-Rashid", email: "sara@example.com", 
        phone: "+971 50 123 4567", address: "123 Sheikh Zayed Road", city: "Dubai"
      }));
      setErrors({});
    } else {
      setForm(prev => ({ 
        ...prev, 
        first: "", last: "", email: "", phone: "", address: "", city: ""
      }));
    }
  }, [form.savedAddress]);

  const subtotal = ITEMS.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal >= 500 ? 0 : 25;
  const total = subtotal + shipping;

  const updateForm = (k, v) => {
    setForm(prev => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: null })); // Clear error on typing
  };

  const validateStep0 = () => {
    const errs = {};
    if (!form.first.trim()) errs.first = "First name is required";
    if (!form.last.trim()) errs.last = "Last name is required";
    if (!form.email.includes("@")) errs.email = "Valid email is required";
    if (!form.address.trim()) errs.address = "Address is required";
    if (!form.city.trim()) errs.city = "City is required";
    
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 0) {
      if (validateStep0()) setStep(1);
    } else if (step === 1) {
      setStep(2);
    }
  };

  const placeOrder = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 2000);
  };

  if (done) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <div className={styles.successCard}>
            <div className={styles.successIcon}><Check size={40} /></div>
            <h1 className={styles.successTitle}>{t("success.title")}</h1>
            <p className={styles.successSub}>
              {t("success.sub")}
            </p>
            <div className={styles.successActions}>
              <Link to="/orders" className={styles.btnPrimary}>{t("success.track")}</Link>
              <Link to="/browse" className={styles.btnOutline}>{t("cart.continue")}</Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        {/* Progress Bar */}
        <div className={styles.progress}>
          {[t("checkout.shipping"), t("checkout.payment"), t("checkout.review")].map((s, i) => (
            <div key={s} className={styles.progressItem}>
              <div className={`${styles.progressDot} ${i < step ? styles.progressDotPast : ""} ${i === step ? styles.progressDotActive : ""}`}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className={`${styles.progressLabel} ${i <= step ? styles.progressLabelActive : ""}`}>{s}</span>
              {i < 2 && <div className={`${styles.progressLine} ${i < step ? styles.progressLineActive : ""}`} />}
            </div>
          ))}
        </div>

        <div className={styles.layout}>
          {/* Left: Form Flow */}
          <div className={styles.formArea}>
            {step === 0 && (
              <div className={styles.formCard}>
                <div className={styles.formCardHeader}>
                  <h2 className={styles.formTitle}><MapPin size={20} /> {t("checkout.shipping")}</h2>
                  <label className={styles.switchLabel} style={{ flexDirection: dir === 'rtl' ? 'row-reverse' : 'row' }}>
                    <input 
                      type="checkbox" 
                      className={styles.switchInput} 
                      checked={form.savedAddress} 
                      onChange={e => updateForm("savedAddress", e.target.checked)} 
                    />
                    {t("checkout.savedAddress")}
                  </label>
                </div>
                
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("checkout.firstName")}</label>
                    <input className={`${styles.input} ${errors.first ? styles.inputError : ""}`} value={form.first} onChange={e => updateForm("first", e.target.value)} placeholder="Sara" />
                    {errors.first && <span className={styles.errorText}>{errors.first}</span>}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("checkout.lastName")}</label>
                    <input className={`${styles.input} ${errors.last ? styles.inputError : ""}`} value={form.last} onChange={e => updateForm("last", e.target.value)} placeholder="Al-Rashid" />
                    {errors.last && <span className={styles.errorText}>{errors.last}</span>}
                  </div>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>{t("checkout.email")}</label>
                    <input type="email" className={`${styles.input} ${errors.email ? styles.inputError : ""}`} value={form.email} onChange={e => updateForm("email", e.target.value)} placeholder="sara@example.com" />
                    {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                  </div>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>{t("checkout.phone")}</label>
                    <input type="tel" className={styles.input} value={form.phone} onChange={e => updateForm("phone", e.target.value)} placeholder="+971 50 000 0000" />
                  </div>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>{t("checkout.address")}</label>
                    <input className={`${styles.input} ${errors.address ? styles.inputError : ""}`} value={form.address} onChange={e => updateForm("address", e.target.value)} placeholder="123 Sheikh Zayed Road" />
                    {errors.address && <span className={styles.errorText}>{errors.address}</span>}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("checkout.city")}</label>
                    <input className={`${styles.input} ${errors.city ? styles.inputError : ""}`} value={form.city} onChange={e => updateForm("city", e.target.value)} placeholder="Dubai" />
                    {errors.city && <span className={styles.errorText}>{errors.city}</span>}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t("checkout.country")}</label>
                    <select className={styles.input} value={form.country} onChange={e => updateForm("country", e.target.value)}>
                      <option>UAE</option><option>Saudi Arabia</option><option>Qatar</option><option>Egypt</option><option>Jordan</option>
                    </select>
                  </div>
                </div>

                <div className={styles.stepActions}>
                  <Link to="/cart" className={styles.btnGhost}>{t("cart.summary")}</Link>
                  <button className={styles.btnPrimary} onClick={handleNext}>{t("checkout.continuePayment")} <ArrowRight size={16} style={{ transform: dir === 'rtl' ? 'rotate(180deg)' : 'none' }} /></button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className={styles.formCard}>
                <h2 className={styles.formTitle}><CreditCard size={20} /> {t("checkout.payment")}</h2>
                
                <div className={styles.paymentOptions}>
                  {[
                    { id: "card", label: "Credit / Debit Card", icon: "💳" },
                    { id: "applepay", label: "Apple Pay", icon: "🍏" },
                    { id: "cod", label: "Cash on Delivery", icon: "💵" },
                  ].map(opt => (
                    <label key={opt.id} className={`${styles.payOption} ${form.payment === opt.id ? styles.payOptionActive : ""}`}>
                      <input type="radio" name="payment" value={opt.id} checked={form.payment === opt.id} onChange={() => updateForm("payment", opt.id)} className={styles.radioHidden} />
                      <span className={styles.payOptIcon}>{opt.icon}</span>
                      <span className={styles.payOptLabel}>{opt.label}</span>
                      {form.payment === opt.id && <div className={styles.radioChecked}><Check size={12} /></div>}
                      {form.payment !== opt.id && <div className={styles.radioUnchecked} />}
                    </label>
                  ))}
                </div>

                {form.payment === "card" && (
                  <div className={styles.cardFields}>
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                      <label className={styles.label}>Card Number</label>
                      <input className={styles.input} placeholder="4242 4242 4242 4242" maxLength={19} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Expiry Date</label>
                      <input className={styles.input} placeholder="MM / YY" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>CVV</label>
                      <input className={styles.input} placeholder="•••" maxLength={4} type="password" />
                    </div>
                  </div>
                )}

                <div className={styles.secureNote}>
                  <Lock size={14} /> 256-bit SSL encrypted. We never store your full payment details.
                </div>

                <div className={styles.stepActions}>
                  <button className={styles.btnGhost} onClick={() => setStep(0)}>← {t("checkout.backShipping")}</button>
                  <button className={styles.btnPrimary} onClick={handleNext}>{t("checkout.reviewOrder")} <ArrowRight size={16} style={{ transform: dir === 'rtl' ? 'rotate(180deg)' : 'none' }} /></button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className={styles.formCard}>
                <h2 className={styles.formTitle}><ShoppingBag size={20} /> {t("checkout.review")}</h2>
                
                <div className={styles.summaryBlock}>
                  <div className={styles.confirmRow}>
                    <div className={styles.confirmHeader}>
                      <span className={styles.confirmLabel}>Shipping Address</span>
                      <button className={styles.editBtn} onClick={() => setStep(0)}>Edit</button>
                    </div>
                    <p className={styles.confirmVal}>{form.first} {form.last}</p>
                    <p className={styles.confirmVal}>{form.address}, {form.city}, {form.country}</p>
                    <p className={styles.confirmVal}>{form.phone} | {form.email}</p>
                  </div>

                  <div className={styles.confirmRow}>
                    <div className={styles.confirmHeader}>
                      <span className={styles.confirmLabel}>Payment Method</span>
                      <button className={styles.editBtn} onClick={() => setStep(1)}>Edit</button>
                    </div>
                    <p className={styles.confirmVal}>
                      {form.payment === "card" ? "💳 Credit / Debit Card" : form.payment === "applepay" ? "🍏 Apple Pay" : "💵 Cash on Delivery"}
                    </p>
                  </div>
                </div>

                <div className={styles.stepActionsStack}>
                  <button className={`${styles.btnPrimary} ${styles.btnLarge}`} onClick={placeOrder} disabled={loading}>
                    {loading ? <><Loader2 size={18} className={styles.spin} /> {t("checkout.processing")}</> : `${t("checkout.confirmOrder")} — EGP ${total.toFixed(2)}`}
                  </button>
                  <p className={styles.termsNote}>{t("checkout.terms")}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Order Summary Sidebar */}
          <aside className={styles.summarySidebar}>
            <div className={styles.summaryCard}>
              <h3 className={styles.summaryTitle}>{t("checkout.inCart")}</h3>
              <div className={styles.summaryItems}>
                {ITEMS.map(i => (
                  <div key={i.id} className={styles.summaryItem}>
                    <img src={i.image} alt={i.name} className={styles.summaryImg} />
                    <div className={styles.summaryItemInfo}>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "2px" }}>
                        <p className={styles.summaryItemName}>{i.name}</p>
                        {i.vtonTried && (
                          <div className={styles.vtonBadgeSmall} title="Tried virtually">
                            <Sparkles size={10} />
                          </div>
                        )}
                      </div>
                      <p className={styles.summaryItemMeta}>Qty: {i.qty} | Size: {i.size}</p>
                      <span className={styles.summaryItemPrice}>EGP {i.price.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.summaryDivider} />
              <div className={styles.summaryRow}><span>{t("cart.subtotal")}</span><span>EGP {subtotal.toFixed(2)}</span></div>
              <div className={styles.summaryRow}><span>{t("cart.shipping")}</span><span>{shipping === 0 ? t("cart.free") : `EGP ${shipping.toFixed(2)}`}</span></div>
              <div className={styles.summaryDivider} />
              <div className={`${styles.summaryRow} ${styles.summaryTotal}`}><span>{t("cart.total")}</span><span>EGP {total.toFixed(2)}</span></div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
