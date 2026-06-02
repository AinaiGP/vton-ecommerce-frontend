import { useState, useRef, useEffect } from "react";
import {
  Store,
  Mail,
  Phone,
  Globe,
  FileText,
  Plus,
  X,
  CheckCircle,
  Clock,
  XCircle,
  Info,
  Upload,
  Send,
  AlertCircle,
  Check,
} from "lucide-react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import styles from "../styles/VendorApplicationPage.module.css";
import apiClient from "../utils/apiClient";

const CATEGORIES = [
  "Women's Fashion",
  "Men's Fashion",
  "Kids' Fashion",
];

const STATUS_CFG = {
  pending: {
    cls: styles.statusPending,
    icon: Clock,
    label: "Application Pending",
    desc: "Your application is under review. We'll notify you within 3–5 business days.",
    color: "#92400e",
  },
  approved: {
    cls: styles.statusApproved,
    icon: CheckCircle,
    label: "Application Approved!",
    desc: "Congratulations! Your vendor account is now active. Visit your vendor dashboard to get started.",
    color: "#15803d",
  },
  rejected: {
    cls: styles.statusRejected,
    icon: XCircle,
    label: "Application Rejected",
    desc: "Unfortunately your application was not approved. Please review the feedback and try again.",
    color: "#dc2626",
  },
  canceled: {
    cls: styles.statusInfo,
    icon: Info,
    label: "Application Canceled",
    desc: "You have canceled this application.",
    color: "#1d4ed8",
  },
};

export default function VendorApplicationPage() {
  const [submitted, setSubmitted] = useState(false);
  const [appStatus, setAppStatus] = useState("pending");
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [docLinks, setDocLinks] = useState([
    { id: 1, label: "Business License", url: "" },
  ]);
  const [cooldownRemaining, setCooldownRemaining] = useState(-1);

  useEffect(() => {
    const fetchMyApplication = async () => {
      try {
        const res = await apiClient.get("/customers/vendor-applications/my");
        if (res.data) {
          if (res.data.id) {
            setSubmitted(true);
            setAppStatus(res.data.status);
            if (res.data.rejectionReason) setRejectionReason(res.data.rejectionReason);
            
            setForm({
              storeName: res.data.brandName || "",
              brandEmail: res.data.businessEmail || "",
              brandPhone: res.data.businessPhone || "",
              description: res.data.description || "",
              categories: res.data.categories || [],
            });
          }
          if (res.data.cooldownRemaining !== undefined) {
            setCooldownRemaining(res.data.cooldownRemaining);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchMyApplication();
  }, []);

  const [form, setForm] = useState({
    storeName: "",
    brandEmail: "",
    brandPhone: "",
    description: "",
    categories: [],
  });

  const f = (k) => ({
    value: form[k],
    onChange: (e) => setForm({ ...form, [k]: e.target.value }),
  });

  const handleCategoryToggle = (cat) => {
    setForm((prev) => {
      const isSelected = prev.categories.includes(cat);
      if (isSelected) {
        return { ...prev, categories: prev.categories.filter((c) => c !== cat) };
      } else {
        if (prev.categories.length >= 3) {
          alert("You can select up to 3 categories.");
          return prev;
        }
        return { ...prev, categories: [...prev.categories, cat] };
      }
    });
  };

  const addDocLink = () =>
    setDocLinks((prev) => [...prev, { id: Date.now(), label: "", url: "" }]);
  const removeDocLink = (id) =>
    setDocLinks((prev) => prev.filter((d) => d.id !== id));
  const updateDocLink = (id, key, val) =>
    setDocLinks((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [key]: val } : d)),
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.storeName.trim() || !form.brandEmail.trim()) {
      setAlert({ type: "error", text: "Please fill in all required fields." });
      return;
    }
    setLoading(true);
    try {
      // Format as "label|url" to preserve both parts for the backend/admin view
      const documents = docLinks
        .filter(d => d.url.trim() !== "")
        .map(d => `${d.label.trim() || 'Document'}|${d.url.trim()}`);
      
      await apiClient.post("/customers/vendor-applications", {
        brandName: form.storeName,
        businessEmail: form.brandEmail,
        businessPhone: form.brandPhone,
        description: form.description,
        documents: documents,
        categories: form.categories
      });
      
      setSubmitted(true);
      setAppStatus("pending");
      setAlert(null);
    } catch (err) {
      setAlert({ type: "error", text: err?.response?.data?.message || "Failed to submit application." });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main} style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
          Loading...
        </main>
        <Footer />
      </div>
    );
  }

  /* Status view — shown after submission */
  if (submitted) {
    const cfg = STATUS_CFG[appStatus] || STATUS_CFG.pending;
    const Icon = cfg.icon;
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <div className={styles.hero}>
            <div className={styles.heroIcon}>
              <Store size={32} />
            </div>
            <div>
              <h1 className={styles.heroTitle}>Vendor Application</h1>
              <p className={styles.heroSub}>
                Track your application status below.
              </p>
            </div>
          </div>

          <div className={`${styles.statusCard} ${cfg.cls}`}>
            <div
              className={styles.statusIcon}
              style={{ background: cfg.color + "20" }}
            >
              <Icon size={24} style={{ color: cfg.color }} />
            </div>
            <div>
              <p className={styles.statusTitle}>{cfg.label}</p>
              <p className={styles.statusText}>{cfg.desc}</p>
              {appStatus === "rejected" && rejectionReason && (
                 <p style={{ marginTop: 8, color: "#dc2626", fontWeight: "bold" }}>Reason: {rejectionReason}</p>
              )}
              
              {(appStatus === "rejected" || appStatus === "canceled") && (
                <div style={{ marginTop: 16 }}>
                  {cooldownRemaining > 0 ? (
                    <div style={{ padding: "12px", background: "rgba(220, 38, 38, 0.05)", borderRadius: "8px", border: "1px solid rgba(220, 38, 38, 0.1)" }}>
                      <p style={{ margin: 0, fontSize: "13px", color: "var(--charcoal)", fontWeight: 600 }}>
                        You can submit a new application in: 
                        <span style={{ color: "#dc2626", marginLeft: 4 }}>
                          {Math.floor(cooldownRemaining / 86400)} days, {Math.floor((cooldownRemaining % 86400) / 3600)} hours
                        </span>
                      </p>
                    </div>
                  ) : (
                    <button 
                      className={`${styles.btn} ${styles.btnPrimary}`} 
                      onClick={() => setSubmitted(false)}
                      style={{ padding: "10px 20px", fontSize: "13px" }}
                    >
                      Submit New Application
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Application summary */}
          <div className={styles.section}>
            <div className={styles.sectionHead}>
              <div className={styles.sectionIcon}>
                <Store size={17} />
              </div>
              <h2 className={styles.sectionTitle}>Your Application Summary</h2>
            </div>
            <div
              className={styles.sectionBody}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              {[
                ["Store Name", form.storeName],
                ["Brand Email", form.brandEmail],
                ["Phone", form.brandPhone],
                ["Categories", form.categories?.join(", ") || "—"],
              ].map(([l, v]) => (
                <div key={l}>
                  <p
                    style={{
                      fontSize: 11.5,
                      color: "var(--charcoal-muted)",
                      fontWeight: 600,
                      margin: "0 0 2px",
                    }}
                  >
                    {l}
                  </p>
                  <p
                    style={{
                      fontSize: 13.5,
                      color: "var(--charcoal)",
                      fontWeight: 600,
                      margin: 0,
                    }}
                  >
                    {v || "—"}
                  </p>
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
          <div className={styles.heroIcon}>
            <Store size={32} />
          </div>
          <div>
            <h1 className={styles.heroTitle}>Apply as a Vendor</h1>
            <p className={styles.heroSub}>
              Join AINAI's marketplace and reach thousands of fashion-forward
              customers across MENA.
            </p>
          </div>
        </div>

        {alert && (
          <div
            className={`${styles.alert} ${alert.type === "success" ? styles.alertSuccess : styles.alertError}`}
          >
            <AlertCircle size={16} /> {alert.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Brand Info */}
          <div className={styles.section}>
            <div className={styles.sectionHead}>
              <div className={styles.sectionIcon}>
                <Store size={17} />
              </div>
              <h2 className={styles.sectionTitle}>Brand Information</h2>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Brand / Store Name *</label>
                  <input
                    className={styles.input}
                    {...f("storeName")}
                    placeholder="e.g. Urban Threads"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Store Categories (Select up to 3) *</label>
                  <div className={styles.categoryGrid}>
                    {CATEGORIES.map((c) => {
                      const isSelected = form.categories.includes(c);
                      return (
                        <div
                          key={c}
                          className={`${styles.categoryCard} ${isSelected ? styles.selected : ""}`}
                          onClick={() => handleCategoryToggle(c)}
                        >
                          <span>{c}</span>
                          <div className={styles.checkboxCircle}>
                            <Check className={styles.checkboxIcon} size={12} strokeWidth={3} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Brand Email *</label>
                  <input
                    className={styles.input}
                    type="email"
                    {...f("brandEmail")}
                    placeholder="contact@yourbrand.com"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Brand Phone</label>
                  <input
                    className={styles.input}
                    {...f("brandPhone")}
                    placeholder="+20 100 000 0000"
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Store Description *</label>
                <textarea
                  className={styles.textarea}
                  rows={4}
                  {...f("description")}
                  placeholder="Describe your brand, products, and what makes you unique…"
                  required
                />
              </div>
            </div>
          </div>



          {/* Documents */}
          <div className={styles.section}>
            <div className={styles.sectionHead}>
              <div className={styles.sectionIcon}>
                <FileText size={17} />
              </div>
              <h2 className={styles.sectionTitle}>Verification Documents</h2>
            </div>
            <div className={styles.sectionBody}>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--charcoal-muted)",
                  margin: 0,
                }}
              >
                Add links to your business license, portfolio, or other
                verification documents hosted online (Google Drive, Dropbox,
                etc.).
              </p>
              {docLinks.map((doc, i) => (
                <div key={doc.id} className={styles.docLink}>
                  <input
                    className={styles.input}
                    value={doc.label}
                    onChange={(e) =>
                      updateDocLink(doc.id, "label", e.target.value)
                    }
                    placeholder="Document label (e.g. Business License)"
                    style={{ flex: "0 0 200px" }}
                  />
                  <input
                    className={styles.input}
                    value={doc.url}
                    onChange={(e) =>
                      updateDocLink(doc.id, "url", e.target.value)
                    }
                    placeholder="https://drive.google.com/…"
                    style={{ flex: 1 }}
                  />
                  {docLinks.length > 1 && (
                    <button
                      type="button"
                      className={styles.removeDocBtn}
                      onClick={() => removeDocLink(doc.id)}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className={styles.addDocBtn}
                onClick={addDocLink}
              >
                <Plus size={15} /> Add Another Document Link
              </button>
            </div>
          </div>

          <div className={styles.submitRow}>
            <button
              type="submit"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={loading}
            >
              {loading ? (
                "Submitting…"
              ) : (
                <>
                  <Send size={15} /> Submit Application
                </>
              )}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
