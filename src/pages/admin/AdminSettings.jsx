import { useState } from "react";
import { Globe, CreditCard, Check, Save } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import t from "../../styles/AdminTable.module.css";

const TABS = [
  { id: "website", label: "Website", icon: Globe },
  { id: "payment", label: "Payment", icon: CreditCard },
];

function SettingRow({ label, description, children }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 20,
        alignItems: "flex-start",
        padding: "16px 0",
        borderBottom: "1px solid var(--adm-border)",
      }}
    >
      <div style={{ flex: 1 }}>
        <p
          style={{
            margin: "0 0 3px",
            fontWeight: 600,
            fontSize: 14,
            color: "var(--adm-text)",
          }}
        >
          {label}
        </p>
        {description && (
          <p
            style={{
              margin: 0,
              fontSize: 12.5,
              color: "var(--adm-text-muted)",
            }}
          >
            {description}
          </p>
        )}
      </div>
      <div style={{ flexShrink: 0, minWidth: 200 }}>{children}</div>
    </div>
  );
}

function ToggleField({ checked, onChange }) {
  return (
    <label className={t.toggle} style={{ marginTop: 4 }}>
      <input
        type="checkbox"
        className={t.toggleInput}
        checked={checked}
        onChange={onChange}
      />
      <span className={t.toggleSlider} />
    </label>
  );
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("website");
  const [saved, setSaved] = useState(false);

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
    currency: "EGP",
    commissionRate: "8",
  });

  const handleSave = (e) => {
    e?.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <AdminLayout
      pageTitle="Settings"
      pageSubtitle="Configure website and payment preferences."
      breadcrumb="Settings"
    >
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

      {saved && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 18px",
            background: "#dcfce7",
            border: "1px solid #bbf7d0",
            borderRadius: 10,
            color: "#16a34a",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          <Check size={16} /> Settings saved successfully.
        </div>
      )}

      {/* ── Website tab ── */}
      {activeTab === "website" && (
        <form onSubmit={handleSave}>
          <div className={t.settingsPanel}>
            <h3 className={t.settingsSectionTitle}>General</h3>
            <SettingRow
              label="Site Name"
              description="The public name of your platform."
            >
              <input
                className={t.input}
                value={website.siteName}
                onChange={(e) =>
                  setWebsite({ ...website, siteName: e.target.value })
                }
              />
            </SettingRow>
            <SettingRow
              label="Site URL"
              description="Primary domain for the storefront."
            >
              <input
                className={t.input}
                value={website.siteUrl}
                onChange={(e) =>
                  setWebsite({ ...website, siteUrl: e.target.value })
                }
              />
            </SettingRow>
            <SettingRow
              label="Contact Email"
              description="Displayed in emails and footer."
            >
              <input
                className={t.input}
                type="email"
                value={website.contactEmail}
                onChange={(e) =>
                  setWebsite({ ...website, contactEmail: e.target.value })
                }
              />
            </SettingRow>

            <h3 className={t.settingsSectionTitle} style={{ marginTop: 8 }}>
              Features
            </h3>
            <SettingRow
              label="Maintenance Mode"
              description="Puts the site into maintenance mode for all visitors."
            >
              <ToggleField
                checked={website.maintenanceMode}
                onChange={(e) =>
                  setWebsite({ ...website, maintenanceMode: e.target.checked })
                }
              />
            </SettingRow>
            <SettingRow
              label="Allow New Registrations"
              description="Enable public user sign-up."
            >
              <ToggleField
                checked={website.allowRegistrations}
                onChange={(e) =>
                  setWebsite({
                    ...website,
                    allowRegistrations: e.target.checked,
                  })
                }
              />
            </SettingRow>
            <SettingRow
              label="VTON Feature"
              description="Enable Virtual Try-On for all products."
            >
              <ToggleField
                checked={website.vtonEnabled}
                onChange={(e) =>
                  setWebsite({ ...website, vtonEnabled: e.target.checked })
                }
              />
            </SettingRow>
          </div>
          <div
            style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}
          >
            <button type="submit" className={`${t.btn} ${t.btnPrimary}`}>
              <Save size={14} /> Save Website Settings
            </button>
          </div>
        </form>
      )}

      {/* ── Payment tab ── */}
      {activeTab === "payment" && (
        <form onSubmit={handleSave}>
          <div className={t.settingsPanel}>
            <h3 className={t.settingsSectionTitle}>Stripe</h3>
            <SettingRow
              label="Enable Stripe"
              description="Accept payments via Stripe."
            >
              <ToggleField
                checked={payment.stripeEnabled}
                onChange={(e) =>
                  setPayment({ ...payment, stripeEnabled: e.target.checked })
                }
              />
            </SettingRow>

            <h3 className={t.settingsSectionTitle} style={{ marginTop: 8 }}>
              General
            </h3>
            <SettingRow
              label="Default Currency"
              description="Currency for all transactions."
            >
              <select
                className={t.select}
                value={payment.currency}
                onChange={(e) =>
                  setPayment({ ...payment, currency: e.target.value })
                }
              >
                <option value="EGP">EGP — Egyptian Pound</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="SAR">SAR — Saudi Riyal</option>
                <option value="AED">AED — UAE Dirham</option>
              </select>
            </SettingRow>
            <SettingRow
              label="Vendor Commission Rate (%)"
              description="Platform fee deducted from each vendor sale."
            >
              <input
                className={t.input}
                type="number"
                min={0}
                max={50}
                value={payment.commissionRate}
                onChange={(e) =>
                  setPayment({ ...payment, commissionRate: e.target.value })
                }
              />
            </SettingRow>
          </div>
          <div
            style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}
          >
            <button type="submit" className={`${t.btn} ${t.btnPrimary}`}>
              <Save size={14} /> Save Payment Settings
            </button>
          </div>
        </form>
      )}
    </AdminLayout>
  );
}
