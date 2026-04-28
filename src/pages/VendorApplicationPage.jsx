import { useState, useRef } from "react";
import {
  Store, Mail, Phone, Globe, FileText, Plus, X,
  CheckCircle, Clock, XCircle, Info, Upload, Send, AlertCircle
} from "lucide-react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import styles from "../styles/VendorApplicationPage.module.css";

const CATEGORIES = [
  "Women's Fashion", "Men's Fashion", "Kids' Fashion", "Abayas & Kaftans",
  "Accessories", "Shoes & Footwear", "Sportswear", "Luxury / Designer", "Other",
];

const STATUS_CFG = {
  Pending:  { cls: styles.statusPending, icon: Clock,        label: "Application Pending", desc: "Your application is under review. We'll notify you within 3–5 business days.", color: "#92400e" },
  Approved: { cls: styles.statusApproved, icon: CheckCircle, label: "Application Approved!", desc: "Congratulations! Your vendor account is now active. Visit your vendor dashboard to get started.", color: "#15803d" },
  Rejected: { cls: styles.statusRejected, icon: XCircle,     label: "Application Rejected", desc: "Unfortunately your application was not approved. Please review the feedback and try again.", color: "#dc2626" },
  "Needs More Information": { cls: styles.statusInfo, icon: Info, label: "Additional Information Required", desc: "Our team needs more details. Please review the comments below and update your application.", color: "#1d4ed8" },
};

export default function VendorApplicationPage() {
  const [submitted, setSubmitted]   = useState(false);
  const [appStatus, setAppStatus]   = useState("Pending"); // for demo
  const [loading, setLoading]       = useState(false);
  const [alert, setAlert]           = useState(null);
  const logoRef                     = useRef(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [docLinks, setDocLinks]     = useState([{ id: 1, label: "Business License", url: "" }]);

  const [form, setForm] = useState({
    storeName: "", brandEmail: "", brandPhone: "", description: "",
    category: CATEGORIES[0], website: "", instagram: "", facebook: "", tiktok: "",
  });

  const f = (k) => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) });

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) setLogoPreview(URL.createObjectURL(file));
  };

  const addDocLink = () => setDocLinks(prev => [...prev, { id: Date.now(), label: "", url: "" }]);
  const removeDocLink = (id) => setDocLinks(prev => prev.filter(d => d.id !== id));
  const updateDocLink = (id, key, val) => setDocLinks(prev => prev.map(d => d.id === id ? { ...d, [key]: val } : d));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.storeName.trim() || !form.brandEmail.trim()) {
      setAlert({ type: "error", text: "Please fill in all required fields." }); return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1400);
  };

  /* Status view — shown after submission */
  if (submitted) {
    const cfg = STATUS_CFG[appStatus];
    const Icon = cfg.icon;
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <div className={styles.hero}>
            <div className={styles.heroIcon}><Store size={32} /></div>
            <div>
              <h1 className={styles.heroTitle}>Vendor Application</h1>
              <p className={styles.heroSub}>Track your application status below.</p>
            </div>
          </div>

          <div className={`${styles.statusCard} ${cfg.cls}`}>
            <div className={styles.statusIcon} style={{ background: cfg.color + "20" }}>
              <Icon size={24} style={{ color: cfg.color }} />
            </div>
            <div>
              <p className={styles.statusTitle}>{cfg.label}</p>
              <p className={styles.statusText}>{cfg.desc}</p>
            </div>
          </div>

          {/* Demo status switcher — remove in production */}
          <div style={{ background: "#f8fafc", border: "1px solid var(--ivory-dark)", borderRadius: 12, padding: "14px 18px", marginBottom: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--charcoal-muted)", marginBottom: 8 }}>DEMO — Simulate Status Change:</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {Object.keys(STATUS_CFG).map(s => (
                <button key={s} onClick={() => setAppStatus(s)} style={{ padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600, border: "1.5px solid var(--ivory-dark)", background: appStatus === s ? "var(--burgundy)" : "white", color: appStatus === s ? "white" : "var(--charcoal)", cursor: "pointer" }}>{s}</button>
              ))}
            </div>
          </div>

          {/* Application summary */}
          <div className={styles.section}>
            <div className={styles.sectionHead}>
              <div className={styles.sectionIcon}><Store size={17} /></div>
              <h2 className={styles.sectionTitle}>Your Application Summary</h2>
            </div>
            <div className={styles.sectionBody} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[["Store Name", form.storeName], ["Brand Email", form.brandEmail], ["Phone", form.brandPhone], ["Category", form.category], ["Website", form.website || "—"]].map(([l, v]) => (
                <div key={l}>
                  <p style={{ fontSize: 11.5, color: "var(--charcoal-muted)", fontWeight: 600, margin: "0 0 2px" }}>{l}</p>
                  <p style={{ fontSize: 13.5, color: "var(--charcoal)", fontWeight: 600, margin: 0 }}>{v || "—"}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  /* Application form */
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.heroIcon}><Store size={32} /></div>
          <div>
            <h1 className={styles.heroTitle}>Apply as a Vendor</h1>
            <p className={styles.heroSub}>Join AINAI's marketplace and reach thousands of fashion-forward customers across MENA.</p>
          </div>
        </div>

        {alert && (
          <div className={`${styles.alert} ${alert.type === "success" ? styles.alertSuccess : styles.alertError}`}>
            <AlertCircle size={16} /> {alert.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Brand Info */}
          <div className={styles.section}>
            <div className={styles.sectionHead}>
              <div className={styles.sectionIcon}><Store size={17} /></div>
              <h2 className={styles.sectionTitle}>Brand Information</h2>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Brand / Store Name *</label>
                  <input className={styles.input} {...f("storeName")} placeholder="e.g. Urban Threads" required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Store Category *</label>
                  <select className={styles.select} {...f("category")}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Brand Email *</label>
                  <input className={styles.input} type="email" {...f("brandEmail")} placeholder="contact@yourbrand.com" required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Brand Phone</label>
                  <input className={styles.input} {...f("brandPhone")} placeholder="+20 100 000 0000" />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Store Description *</label>
                <textarea className={styles.textarea} rows={4} {...f("description")} placeholder="Describe your brand, products, and what makes you unique…" required />
              </div>
            </div>
          </div>

          {/* Logo Upload */}
          <div className={styles.section}>
            <div className={styles.sectionHead}>
              <div className={styles.sectionIcon}><Upload size={17} /></div>
              <h2 className={styles.sectionTitle}>Store Logo</h2>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.logoUpload} onClick={() => logoRef.current?.click()}>
                {logoPreview
                  ? <img src={logoPreview} alt="Logo preview" className={styles.logoPreview} />
                  : <Upload size={28} style={{ color: "var(--burgundy)" }} />
                }
                <p className={styles.uploadText}>{logoPreview ? "Click to change logo" : "Click to upload store logo"}</p>
                <p className={styles.uploadSub}>PNG, JPG, SVG — Recommended 400×400px, Max 5MB</p>
              </div>
              <input ref={logoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogoChange} />
            </div>
          </div>

          {/* Social / Website */}
          <div className={styles.section}>
            <div className={styles.sectionHead}>
              <div className={styles.sectionIcon}><Globe size={17} /></div>
              <h2 className={styles.sectionTitle}>Website & Social Media</h2>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Website URL</label>
                  <input className={styles.input} {...f("website")} placeholder="https://yourbrand.com" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Instagram</label>
                  <input className={styles.input} {...f("instagram")} placeholder="@yourbrand" />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Facebook</label>
                  <input className={styles.input} {...f("facebook")} placeholder="facebook.com/yourbrand" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>TikTok</label>
                  <input className={styles.input} {...f("tiktok")} placeholder="@yourbrand" />
                </div>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className={styles.section}>
            <div className={styles.sectionHead}>
              <div className={styles.sectionIcon}><FileText size={17} /></div>
              <h2 className={styles.sectionTitle}>Verification Documents</h2>
            </div>
            <div className={styles.sectionBody}>
              <p style={{ fontSize: 13, color: "var(--charcoal-muted)", margin: 0 }}>
                Add links to your business license, portfolio, or other verification documents hosted online (Google Drive, Dropbox, etc.).
              </p>
              {docLinks.map((doc, i) => (
                <div key={doc.id} className={styles.docLink}>
                  <input
                    className={styles.input}
                    value={doc.label}
                    onChange={e => updateDocLink(doc.id, "label", e.target.value)}
                    placeholder="Document label (e.g. Business License)"
                    style={{ flex: "0 0 200px" }}
                  />
                  <input
                    className={styles.input}
                    value={doc.url}
                    onChange={e => updateDocLink(doc.id, "url", e.target.value)}
                    placeholder="https://drive.google.com/…"
                    style={{ flex: 1 }}
                  />
                  {docLinks.length > 1 && (
                    <button type="button" className={styles.removeDocBtn} onClick={() => removeDocLink(doc.id)}>
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className={styles.addDocBtn} onClick={addDocLink}>
                <Plus size={15} /> Add Another Document Link
              </button>
            </div>
          </div>

          <div className={styles.submitRow}>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={loading}>
              {loading ? "Submitting…" : <><Send size={15} /> Submit Application</>}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
