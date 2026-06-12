import { useState, useEffect, useMemo } from "react";
import {
  Store,
  Lock,
  Eye,
  EyeOff,
  Save,
  ImageIcon,
  Check,
  AlertTriangle,
  Mail,
  Loader2,
  Package,
} from "lucide-react";
import VendorLayout from "../components/vendor/VendorLayout";
import p from "../styles/VendorPage.module.css";
import OTPVerificationModal from "../components/common/OTPVerificationModal";
import apiClient from "../utils/apiClient";
import { useAuth } from "../context/AuthContext";

const TABS = [
  { id: "store", label: "Store", icon: Store },
  { id: "password", label: "Password", icon: Lock },
];

export default function VendorSettingsPage() {
  const [tab, setTab] = useState("store");
  const [saved, setSaved] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState(null);

  const [store, setStore] = useState({
    brandName: "",
    businessEmail: "",
    businessPhone: "",
    description: "",
    loginEmail: "",
    lowStockThreshold: 10,
  });
  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  const { user, updateUser, logout } = useAuth();
  const [showOTP, setShowOTP] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get("/vendors/profile");
      const v = res.data;
      setStore({
        brandName: v.brandName || "",
        businessEmail: v.businessEmail || "",
        businessPhone: v.businessPhone || "",
        description: v.description || "",
        loginEmail: user?.email || "",
        lowStockThreshold: v.lowStockThreshold ?? 10,
      });
      setLogoPreview(v.logoUrl);
      setPendingEmail(user?.email || "");
    } catch (err) {
      console.error("Failed to fetch vendor profile", err);
    }
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiClient.post("/vendors/profile/logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setLogoPreview(res.data.logoUrl);
      updateUser({ ...user, logoUrl: res.data.logoUrl });
    } catch (err) {
      console.error("Logo upload failed", err);
      setError("Logo upload failed. Please try again.");
    }
  };

  const handleDeleteLogo = async () => {
    try {
      await apiClient.delete("/vendors/profile/logo");
      setLogoPreview(null);
      setLogoFile(null);
      updateUser({ ...user, logoUrl: null });
    } catch (err) {
      console.error("Logo delete failed", err);
    }
  };

  const handleSaveStore = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = { ...store };
      delete payload.loginEmail; // Backend expects 'email', not 'loginEmail'
      payload.lowStockThreshold = parseInt(store.lowStockThreshold) || 10;

      if (store.loginEmail && store.loginEmail !== user?.email) {
        payload.email = store.loginEmail;
      }

      await apiClient.patch("/vendors/profile", payload);
      
      if (payload.email) {
        setPendingEmail(payload.email);
        setShowOTP(true);
      } else {
        setSaved(true);
        updateUser({ 
          ...user, 
          brandName: store.brandName,
          businessEmail: store.businessEmail,
          businessPhone: store.businessPhone,
          description: store.description
        });
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      console.error("Store save failed", err);
      setError(err.response?.data?.message || "Failed to save store settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (code) => {
    try {
      await apiClient.post("/vendors/profile/verify-email", { otp: code });
      setShowOTP(false);
      setSaved(true);
      
      setTimeout(() => {
        logout();
        window.location.href = "/auth";
      }, 1500);
    } catch (err) {
      console.error("OTP verification failed", err);
    }
  };

  const handleSavePassword = async (e) => {
    e?.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await apiClient.patch("/vendors/profile", {
        changePassword: { 
          currentPassword: passwords.current, 
          newPassword: passwords.newPass 
        }
      });
      setSaved(true);
      setPasswords({ current: "", newPass: "", confirm: "" });
      
      setTimeout(() => {
        logout();
        window.location.href = "/auth";
      }, 1500);
    } catch (err) {
      console.error("Password change failed", err);
      setError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <VendorLayout
      pageTitle="Settings"
      pageSubtitle="Manage your brand and security credentials."
      breadcrumb="Settings"
    >
      <div className={p.settingsTabs}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`${p.settingsTab} ${tab === id ? p.active : ""}`}
            onClick={() => setTab(id)}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {error && (
        <div style={{
          padding: "11px 18px",
          background: "#fee2e2",
          border: "1px solid #fecaca",
          borderRadius: 10,
          color: "#dc2626",
          fontWeight: 600,
          fontSize: 13.5,
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {saved && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "11px 18px",
            background: "#dcfce7",
            border: "1px solid #bbf7d0",
            borderRadius: 10,
            color: "#16a34a",
            fontWeight: 600,
            fontSize: 13.5,
            marginBottom: 16
          }}
        >
          <Check size={16} /> Settings saved successfully.
        </div>
      )}

      {tab === "store" && (
        <form onSubmit={handleSaveStore}>
          <div className={p.settingsPanel}>
            <h3 className={p.settingsSectionTitle}>Brand Identity</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
              <div style={{
                width: 80, height: 80, borderRadius: 16, background: "var(--vdr-accent-light)",
                border: "1px solid #c4b5fd", display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden", flexShrink: 0, position: "relative"
              }}>
                {logoPreview ? (
                  <img src={logoPreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="logo" />
                ) : (
                  <Store size={32} style={{ color: "var(--vdr-accent)" }} />
                )}
              </div>
              <div>
                <p style={{ margin: "0 0 8px", fontWeight: 600 }}>Brand Logo</p>
                <div style={{ display: "flex", gap: 10 }}>
                  <label className={`${p.btn} ${p.btnPrimary} ${p.btnSm}`} style={{ cursor: "pointer" }}>
                    <ImageIcon size={13} /> {logoPreview ? "Change Logo" : "Upload Logo"}
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogoChange} />
                  </label>
                  {logoPreview && (
                    <button type="button" className={`${p.btn} ${p.btnOutline} ${p.btnSm}`} onClick={handleDeleteLogo}>
                      Remove
                    </button>
                  )}
                </div>
                <p style={{ fontSize: 12, color: "var(--vdr-text-muted)", marginTop: 6 }}>PNG, JPG or SVG. Max 2MB.</p>
              </div>
            </div>

            <div className={p.formRow}>
              <div className={p.formGroup}>
                <label className={p.label}>Brand Name</label>
                <input className={p.input} value={store.brandName} onChange={(e) => setStore({ ...store, brandName: e.target.value })} placeholder="e.g. Nova Threads" required />
              </div>
              <div className={p.formGroup}>
                <label className={p.label}>Public Business Email</label>
                <input className={p.input} type="email" value={store.businessEmail} onChange={(e) => setStore({ ...store, businessEmail: e.target.value })} placeholder="contact@yourbrand.com" />
              </div>
              <div className={p.formGroup}>
                <label className={p.label}>Business Phone</label>
                <input className={p.input} value={store.businessPhone} onChange={(e) => setStore({ ...store, businessPhone: e.target.value })} placeholder="+966XXXXXXXXX" />
              </div>
            </div>

            <div className={p.formGroup}>
              <label className={p.label}>Brand Description</label>
              <textarea className={p.textarea} rows={4} value={store.description} onChange={(e) => setStore({ ...store, description: e.target.value })} placeholder="Tell customers about your brand story..." />
            </div>

            <div style={{ marginTop: 32, borderTop: "1px solid var(--vdr-border)", paddingTop: 24 }}>
              <h3 className={p.settingsSectionTitle} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Package size={16} /> Inventory
              </h3>
              <p style={{ fontSize: 13, color: "var(--vdr-text-muted)", marginBottom: 16 }}>
                Products with fewer units than this threshold will appear in low-stock alerts.
              </p>
              <div className={p.formGroup} style={{ maxWidth: 240 }}>
                <label className={p.label}>Low Stock Threshold</label>
                <input
                  className={p.input}
                  type="number"
                  min={1}
                  max={1000}
                  value={store.lowStockThreshold}
                  onChange={(e) => setStore({ ...store, lowStockThreshold: e.target.value })}
                />
              </div>
            </div>

            <div style={{ marginTop: 32, borderTop: "1px solid var(--vdr-border)", paddingTop: 24 }}>
              <h3 className={p.settingsSectionTitle} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Mail size={16} /> Login Credentials
              </h3>
              <p style={{ fontSize: 13, color: "var(--vdr-text-muted)", marginBottom: 16 }}>Updating your login email will require verification and will sign you out.</p>
              <div className={p.formGroup} style={{ maxWidth: 400 }}>
                <label className={p.label}>Login Email Address</label>
                <input className={p.input} type="email" value={store.loginEmail} onChange={(e) => setStore({ ...store, loginEmail: e.target.value })} />
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <button type="submit" className={`${p.btn} ${p.btnPrimary}`} disabled={loading}>
              {loading ? <Loader2 size={14} className={p.spin} /> : <Save size={14} />} Save Settings
            </button>
          </div>
        </form>
      )}

      {tab === "password" && (
        <form onSubmit={handleSavePassword}>
          <div className={p.settingsPanel} style={{ maxWidth: 480 }}>
            <h3 className={p.settingsSectionTitle}>Security Update</h3>
            <p style={{ fontSize: 13, color: "var(--vdr-text-muted)", marginBottom: 20 }}>You will be logged out after changing your password.</p>
            <div className={p.formGroup}>
              <label className={p.label}>Current Password</label>
              <div style={{ position: "relative" }}>
                <input className={p.input} type={showCurrent ? "text" : "password"} value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} placeholder="Verify your identity" style={{ paddingRight: 40 }} required />
                <button type="button" onClick={() => setShowCurrent((v) => !v)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--vdr-text-muted)" }}>
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className={p.formGroup}>
              <label className={p.label}>New Password</label>
              <div style={{ position: "relative" }}>
                <input className={p.input} type={showNew ? "text" : "password"} value={passwords.newPass} onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })} placeholder="At least 8 characters" style={{ paddingRight: 40 }} required />
                <button type="button" onClick={() => setShowNew((v) => !v)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--vdr-text-muted)" }}>
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className={p.formGroup}>
              <label className={p.label}>Confirm New Password</label>
              <input className={p.input} type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} placeholder="Repeat new password" required />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <button type="submit" className={`${p.btn} ${p.btnPrimary}`} disabled={loading || (passwords.newPass && passwords.confirm && passwords.newPass !== passwords.confirm)}>
              {loading ? <Loader2 size={14} className={p.spin} /> : <Lock size={14} />} Update Password
            </button>
          </div>
        </form>
      )}

      {showOTP && (
        <OTPVerificationModal email={pendingEmail} onVerify={handleVerifyOTP} onClose={() => setShowOTP(false)} title="Verify Email Change" />
      )}
    </VendorLayout>
  );
}
