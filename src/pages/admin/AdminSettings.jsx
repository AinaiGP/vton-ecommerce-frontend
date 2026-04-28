import { useState } from "react";
import { Globe, CreditCard, User, Lock, Check, Eye, EyeOff, Save } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import t from "../../styles/AdminTable.module.css";

const TABS = [
  { id: "website", label: "Website", icon: Globe },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "profile", label: "Admin Profile", icon: User },
  { id: "password", label: "Password", icon: Lock },
];

function SettingRow({ label, description, children }) {
  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start", padding: "16px 0", borderBottom: "1px solid var(--adm-border)" }}>
      <div style={{ flex: 1 }}>
        <p style={{ margin: "0 0 3px", fontWeight: 600, fontSize: 14, color: "var(--adm-text)" }}>{label}</p>
        {description && <p style={{ margin: 0, fontSize: 12.5, color: "var(--adm-text-muted)" }}>{description}</p>}
      </div>
      <div style={{ flexShrink: 0, minWidth: 200 }}>{children}</div>
    </div>
  );
}

function ToggleField({ checked, onChange }) {
  return (
    <label className={t.toggle} style={{ marginTop: 4 }}>
      <input type="checkbox" className={t.toggleInput} checked={checked} onChange={onChange} />
      <span className={t.toggleSlider} />
    </label>
  );
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("website");
  const [saved, setSaved] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const [website, setWebsite] = useState({
    siteName: "AINAI Fashion",
    siteUrl: "https://ainai.fashion",
    contactEmail: "support@ainai.fashion",
    maintenanceMode: false,
    allowRegistrations: true,
    vtonEnabled: true,
  });

  const [payment, setPayment] = useState({
    stripeEnabled: true,
    stripeKey: "pk_live_***************",
    paypalEnabled: false,
    paypalEmail: "",
    currency: "EGP",
    commissionRate: "8",
  });

  const [profile, setProfile] = useState({
    name: "System Admin",
    email: "admin@ainai.fashion",
    phone: "+1 555 000 0000",
    timezone: "UTC+2",
  });

  const [password, setPassword] = useState({ current: "", newPass: "", confirm: "" });

  const handleSave = (e) => {
    e?.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <AdminLayout pageTitle="Settings" pageSubtitle="Configure website, payments, and admin account preferences." breadcrumb="Settings">

      {/* Tabs */}
      <div className={t.settingsTabs}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`${t.settingsTab} ${activeTab === id ? t.active : ""}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Save feedback */}
      {saved && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8, padding: "12px 18px",
          background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: 10, color: "#16a34a", fontWeight: 600, fontSize: 14
        }}>
          <Check size={16} /> Settings saved successfully.
        </div>
      )}

      {/* ── Website tab ── */}
      {activeTab === "website" && (
        <form onSubmit={handleSave}>
          <div className={t.settingsPanel}>
            <h3 className={t.settingsSectionTitle}>General</h3>
            <SettingRow label="Site Name" description="The public name of your platform.">
              <input className={t.input} value={website.siteName} onChange={(e) => setWebsite({ ...website, siteName: e.target.value })} />
            </SettingRow>
            <SettingRow label="Site URL" description="Primary domain for the storefront.">
              <input className={t.input} value={website.siteUrl} onChange={(e) => setWebsite({ ...website, siteUrl: e.target.value })} />
            </SettingRow>
            <SettingRow label="Contact Email" description="Displayed in emails and footer.">
              <input className={t.input} type="email" value={website.contactEmail} onChange={(e) => setWebsite({ ...website, contactEmail: e.target.value })} />
            </SettingRow>

            <h3 className={t.settingsSectionTitle} style={{ marginTop: 8 }}>Features</h3>
            <SettingRow label="Maintenance Mode" description="Puts the site into maintenance mode for all visitors.">
              <ToggleField checked={website.maintenanceMode} onChange={(e) => setWebsite({ ...website, maintenanceMode: e.target.checked })} />
            </SettingRow>
            <SettingRow label="Allow New Registrations" description="Enable public user sign-up.">
              <ToggleField checked={website.allowRegistrations} onChange={(e) => setWebsite({ ...website, allowRegistrations: e.target.checked })} />
            </SettingRow>
            <SettingRow label="VTON Feature" description="Enable Virtual Try-On for all products.">
              <ToggleField checked={website.vtonEnabled} onChange={(e) => setWebsite({ ...website, vtonEnabled: e.target.checked })} />
            </SettingRow>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <button type="submit" className={`${t.btn} ${t.btnPrimary}`}><Save size={14} /> Save Website Settings</button>
          </div>
        </form>
      )}

      {/* ── Payment tab ── */}
      {activeTab === "payment" && (
        <form onSubmit={handleSave}>
          <div className={t.settingsPanel}>
            <h3 className={t.settingsSectionTitle}>Stripe</h3>
            <SettingRow label="Enable Stripe" description="Accept payments via Stripe.">
              <ToggleField checked={payment.stripeEnabled} onChange={(e) => setPayment({ ...payment, stripeEnabled: e.target.checked })} />
            </SettingRow>
            <SettingRow label="Stripe Public Key" description="Your Stripe publishable API key.">
              <input className={t.input} value={payment.stripeKey} onChange={(e) => setPayment({ ...payment, stripeKey: e.target.value })} />
            </SettingRow>

            <h3 className={t.settingsSectionTitle} style={{ marginTop: 8 }}>PayPal</h3>
            <SettingRow label="Enable PayPal" description="Accept payments via PayPal.">
              <ToggleField checked={payment.paypalEnabled} onChange={(e) => setPayment({ ...payment, paypalEnabled: e.target.checked })} />
            </SettingRow>
            <SettingRow label="PayPal Email" description="Business PayPal account email.">
              <input className={t.input} type="email" value={payment.paypalEmail} onChange={(e) => setPayment({ ...payment, paypalEmail: e.target.value })} placeholder="paypal@example.com" />
            </SettingRow>

            <h3 className={t.settingsSectionTitle} style={{ marginTop: 8 }}>General</h3>
            <SettingRow label="Default Currency" description="Currency for all transactions.">
              <select className={t.select} value={payment.currency} onChange={(e) => setPayment({ ...payment, currency: e.target.value })}>
                <option value="EGP">EGP — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="SAR">SAR — Saudi Riyal</option>
                <option value="AED">AED — UAE Dirham</option>
              </select>
            </SettingRow>
            <SettingRow label="Vendor Commission Rate (%)" description="Platform fee deducted from each vendor sale.">
              <input className={t.input} type="number" min={0} max={50} value={payment.commissionRate} onChange={(e) => setPayment({ ...payment, commissionRate: e.target.value })} />
            </SettingRow>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <button type="submit" className={`${t.btn} ${t.btnPrimary}`}><Save size={14} /> Save Payment Settings</button>
          </div>
        </form>
      )}

      {/* ── Profile tab ── */}
      {activeTab === "profile" && (
        <form onSubmit={handleSave}>
          <div className={t.settingsPanel}>
            <h3 className={t.settingsSectionTitle}>Account Information</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--adm-accent)", color: "white", fontSize: 26, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>A</div>
              <div>
                <p style={{ margin: "0 0 4px", fontWeight: 700 }}>{profile.name}</p>
                <p style={{ margin: 0, color: "var(--adm-text-muted)", fontSize: 13 }}>System Administrator</p>
              </div>
            </div>
            <div className={t.formRow}>
              <div className={t.formGroup}>
                <label className={t.label}>Full Name</label>
                <input className={t.input} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              </div>
              <div className={t.formGroup}>
                <label className={t.label}>Email Address</label>
                <input className={t.input} type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
              </div>
              <div className={t.formGroup}>
                <label className={t.label}>Phone Number</label>
                <input className={t.input} value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              </div>
              <div className={t.formGroup}>
                <label className={t.label}>Timezone</label>
                <select className={t.select} value={profile.timezone} onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}>
                  <option>UTC+0</option>
                  <option>UTC+1</option>
                  <option>UTC+2</option>
                  <option>UTC+3</option>
                  <option>UTC+4</option>
                </select>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <button type="submit" className={`${t.btn} ${t.btnPrimary}`}><Save size={14} /> Save Profile</button>
          </div>
        </form>
      )}

      {/* ── Password tab ── */}
      {activeTab === "password" && (
        <form onSubmit={handleSave}>
          <div className={t.settingsPanel} style={{ maxWidth: 480 }}>
            <h3 className={t.settingsSectionTitle}>Change Password</h3>
            <div className={t.formGroup}>
              <label className={t.label}>Current Password</label>
              <div style={{ position: "relative" }}>
                <input className={t.input} type={showPass ? "text" : "password"} value={password.current} onChange={(e) => setPassword({ ...password, current: e.target.value })} placeholder="Enter current password" style={{ paddingRight: 40 }} />
                <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--adm-text-muted)" }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className={t.formGroup}>
              <label className={t.label}>New Password</label>
              <div style={{ position: "relative" }}>
                <input className={t.input} type={showNewPass ? "text" : "password"} value={password.newPass} onChange={(e) => setPassword({ ...password, newPass: e.target.value })} placeholder="Minimum 8 characters" style={{ paddingRight: 40 }} />
                <button type="button" onClick={() => setShowNewPass(v => !v)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--adm-text-muted)" }}>
                  {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className={t.formGroup}>
              <label className={t.label}>Confirm New Password</label>
              <input className={t.input} type="password" value={password.confirm} onChange={(e) => setPassword({ ...password, confirm: e.target.value })} placeholder="Repeat new password" />
            </div>

            {password.newPass && password.confirm && password.newPass !== password.confirm && (
              <div style={{ padding: "10px 14px", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8, color: "#dc2626", fontSize: 13, fontWeight: 500 }}>
                ⚠ Passwords do not match.
              </div>
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <button type="submit" className={`${t.btn} ${t.btnPrimary}`} disabled={!!(password.newPass && password.confirm && password.newPass !== password.confirm)}>
              <Lock size={14} /> Update Password
            </button>
          </div>
        </form>
      )}
    </AdminLayout>
  );
}
